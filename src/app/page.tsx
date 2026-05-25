import { createClient } from '@/lib/supabase/server'
import { GoalRepository } from '@/repositories/GoalRepository'
import { MicroTaskRepository } from '@/repositories/MicroTaskRepository'
import { FocusSessionRepository } from '@/repositories/FocusSessionRepository'
import HomeClient from '@/components/HomeClient'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()

  // Verify auth session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get current day of the week in Spanish capitalized (e.g. "Lunes", "Martes")
  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const todayIndex = new Date().getDay()
  const dayOfWeekSpanish = daysOfWeek[todayIndex]

  // Initialize Repositories
  const goalRepo = new GoalRepository(supabase)
  const taskRepo = new MicroTaskRepository(supabase)
  const sessionRepo = new FocusSessionRepository(supabase)

  let dbGoals: any[] = []
  let dbSessions: any[] = []
  let dbTasks: any[] = []
  let dbEnfoques: any[] = []

  try {
    // 1. Fetch user's goals
    dbGoals = await goalRepo.getGoalsByUserId(user.id)

    // 2. Fetch completed focus sessions log for today
    dbSessions = await sessionRepo.getSessionsCompletedToday(user.id)

    // 3. Fetch all tasks for the user's goals (to properly map all session achievements today)
    const allGoalIds = dbGoals.map((g) => g.id)
    if (allGoalIds.length > 0) {
      dbTasks = await taskRepo.getMicroTasksByGoalIds(allGoalIds)
    }

    // 4. Fetch free focus templates (enfoques)
    dbEnfoques = await sessionRepo.getFreeFocusSessions(user.id)
  } catch (err) {
    console.error('Error fetching dashboard data from Supabase repositories:', err)
  }

  let avatarUrl: string | null = null
  try {
    const { data: profile } = await supabase
      .from('perfiles')
      .select('avatar_url')
      .eq('id', user.id)
      .maybeSingle()
    avatarUrl = profile?.avatar_url || null
  } catch (e) {
    console.error('Error fetching avatar_url:', e)
  }

  const email = user.email || ''
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'

  return (
    <HomeClient
      email={email}
      userName={userName}
      dbGoals={dbGoals}
      dbSessions={dbSessions}
      dbTasks={dbTasks}
      dbEnfoques={dbEnfoques}
      todayDayName={dayOfWeekSpanish}
      avatarUrl={avatarUrl}
    />
  )
}
