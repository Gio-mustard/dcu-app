import { createClient } from '@/lib/supabase/server'
import { GoalRepository } from '@/repositories/GoalRepository'
import { MicroTaskRepository } from '@/repositories/MicroTaskRepository'
import { FocusSessionRepository } from '@/repositories/FocusSessionRepository'
import { redirect } from 'next/navigation'
import ProgresoClient from '@/components/ProgresoClient'

export const dynamic = 'force-dynamic'

export default async function ProgresoPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const goalRepo = new GoalRepository(supabase)
  const taskRepo = new MicroTaskRepository(supabase)
  const sessionRepo = new FocusSessionRepository(supabase)

  // Fetch goals first (needed for task IDs)
  const allGoals = await goalRepo.getGoalsByUserId(user.id)
  const allGoalIds = allGoals.map(g => g.id)

  // ─── Parallel data fetching ───────────────────────────────────────────────
  const [
    allTasks,
    todaySessions,
    weeklyData,
    allSessions,
    rankPercentile,
    perfil,
    dbLogros,
    dbInsignias,
  ] = await Promise.all([
    allGoalIds.length > 0 ? taskRepo.getMicroTasksByGoalIds(allGoalIds) : Promise.resolve([]),
    sessionRepo.getSessionsCompletedToday(user.id),
    sessionRepo.getSessionsForCurrentWeek(user.id),
    sessionRepo.getAllSessions(user.id),
    sessionRepo.getUserRankPercentile(user.id),
    supabase.from('perfiles').select('*').eq('id', user.id).single().then(r => r.data),
    supabase.from('logros').select('*').eq('user_id', user.id).then(r => r.data || []),
    supabase.from('insignias_usuario').select('*').eq('user_id', user.id).then(r => r.data || []),
  ])

  // ─── TODAY analytics ─────────────────────────────────────────────────────

  // Get current day of the week in Spanish capitalized (e.g. "Lunes", "Martes")
  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const todayIndex = new Date().getDay()
  const todayDayName = daysOfWeek[todayIndex]

  // Filter goals active today
  const activeGoalsToday = allGoals.filter((goal) => {
    if (goal.status !== 'en_curso') return false
    if (!goal.rhythm_days || goal.rhythm_days.length === 0) return true
    const normalizedDays = goal.rhythm_days.map((d: string) => d.toLowerCase())
    const todayLower = todayDayName.toLowerCase()
    return (
      normalizedDays.includes(todayLower) ||
      normalizedDays.includes('todos') ||
      normalizedDays.includes('diario') ||
      normalizedDays.includes('daily')
    )
  })

  // Total minutes focused today
  const totalMinutesToday = todaySessions.reduce((s, se) => s + se.duration_minutes, 0)

  // Daily goal target: sum of target_time for active goals today
  const totalDailyTarget = activeGoalsToday.reduce((acc, goal) => acc + (goal.target_time || 0), 0)

  // Focus percentage (capped at 100)
  const focusPercent = totalDailyTarget > 0
    ? Math.min(100, Math.round((totalMinutesToday / totalDailyTarget) * 100))
    : 0
  const remainingMinutes = Math.max(0, totalDailyTarget - totalMinutesToday)

  // Minutes by category today — join session → micro_tarea → objetivo.category
  const categoryMap: Record<string, { done: number; target: number }> = {}
  for (const goal of activeGoalsToday) {
    if (!categoryMap[goal.category]) {
      categoryMap[goal.category] = { done: 0, target: goal.target_time || 60 }
    } else {
      categoryMap[goal.category].target += goal.target_time || 60
    }
  }
  for (const session of todaySessions) {
    if (!session.micro_tarea_id) continue
    const task = allTasks.find(t => t.id === session.micro_tarea_id)
    if (!task) continue
    const goal = allGoals.find(g => g.id === task.objetivo_id)
    if (!goal) continue
    if (!categoryMap[goal.category]) categoryMap[goal.category] = { done: 0, target: 60 }
    categoryMap[goal.category].done += session.duration_minutes
  }
  const categoryStats = Object.entries(categoryMap).map(([cat, { done, target }]) => ({
    category: cat,
    doneMin: done,
    targetMin: target,
    percent: target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0,
  }))

  // Next pending task suggestion for today
  const pendingTasks = allTasks.filter(t => t.status === 'pendiente')
  const nextTask = pendingTasks[0] ?? null
  const nextTaskGoal = nextTask ? allGoals.find(g => g.id === nextTask.objetivo_id) : null

  // ─── HISTORICAL analytics ─────────────────────────────────────────────────

  // Weekly trend: this week vs last week total minutes
  const thisWeekMin = weeklyData.reduce((s, d) => s + d.minutes, 0)

  // Last week range
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const thisMonday = new Date(now)
  thisMonday.setDate(now.getDate() + diffToMonday)
  thisMonday.setHours(0, 0, 0, 0)
  const lastMonday = new Date(thisMonday)
  lastMonday.setDate(thisMonday.getDate() - 7)
  const lastSunday = new Date(thisMonday)
  lastSunday.setSeconds(-1) // just before this Monday

  const lastWeekMin = allSessions
    .filter(s => {
      const d = new Date(s.created_at)
      return d >= lastMonday && d < thisMonday
    })
    .reduce((s, se) => s + se.duration_minutes, 0)

  const weekTrend = lastWeekMin === 0
    ? 100
    : Math.round(((thisWeekMin - lastWeekMin) / lastWeekMin) * 100)

  // Process real earned insignias from Supabase
  const earnedInsignias = (dbInsignias || []).map((ins: any) => ({
    id: ins.id,
    title: ins.title,
    description: ins.description || '',
  }))

  // Process real earned logros from Supabase
  const earnedLogros = (dbLogros || []).map((log: any) => ({
    id: log.id,
    title: log.title,
    description: log.description || '',
    category: log.category || 'Personal',
  }))

  // Completed tasks count (total ever)
  const completedTasksCount = allTasks.filter(t => t.status === 'completada').length

  // Category progress (all-time, based on goal.progress)
  const historicCategoryStats = Object.values(
    allGoals.reduce((acc, g) => {
      if (!acc[g.category]) acc[g.category] = { category: g.category, total: 0, count: 0 }
      acc[g.category].total += g.progress
      acc[g.category].count += 1
      return acc
    }, {} as Record<string, { category: string; total: number; count: number }>)
  ).map(c => ({
    category: c.category,
    avgProgress: Math.round(c.total / c.count),
  }))

  const userName = perfil?.full_name || user.email?.split('@')[0] || 'Usuario'
  const avatarUrl = perfil?.avatar_url || null
  const rachadays = perfil?.racha_days || 0
  const focusHours = perfil?.focus_hours || 0
  const level = perfil?.level || 1

  return (
    <ProgresoClient
      // identity
      userName={userName}
      avatarUrl={avatarUrl}
      // today
      focusPercent={focusPercent}
      totalMinutesToday={totalMinutesToday}
      totalDailyTarget={totalDailyTarget}
      remainingMinutes={remainingMinutes}
      categoryStats={categoryStats}
      nextTask={nextTask ? { id: nextTask.id, title: nextTask.title, goalId: nextTask.objetivo_id, scheduledTime: nextTask.scheduled_time, estimatedTime: nextTask.estimated_time } : null}
      nextTaskGoalTitle={nextTaskGoal?.title ?? null}
      rachadays={rachadays}
      completedTasksCount={completedTasksCount}
      // historical
      weeklyData={weeklyData}
      weekTrend={weekTrend}
      thisWeekMin={thisWeekMin}
      rankPercentile={rankPercentile}
      earnedInsignias={earnedInsignias}
      earnedLogros={earnedLogros}
      historicCategoryStats={historicCategoryStats}
      focusHours={focusHours}
      level={level}
    />
  )
}
