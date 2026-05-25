'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search } from 'lucide-react'
import CircularProgress from './CircularProgress'
import EncouragementBanner from './EncouragementBanner'
import QuickAccessList, { QuickAccessItemData } from './QuickAccessList'
import GoalCategoryList, { GoalCategoryProgress } from './GoalCategoryList'
import LiveFocusCard from './LiveFocusCard'
import BottomNav from './BottomNav'
import SocialTab from './SocialTab'

interface HomeClientProps {
  email: string
  userName: string
  dbGoals: any[]
  dbSessions: any[]
  dbTasks: any[]
  dbEnfoques: any[]
  todayDayName: string
  avatarUrl?: string | null
}

export default function HomeClient({
  email,
  userName,
  dbGoals = [],
  dbSessions = [],
  dbTasks = [],
  dbEnfoques = [],
  todayDayName,
  avatarUrl = null,
}: HomeClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'inicio' | 'objetivos' | 'social' | 'progreso'>('inicio')
  const [loggingOut, setLoggingOut] = useState(false)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab') as any
      if (tabParam && ['inicio', 'objetivos', 'social', 'progreso'].includes(tabParam)) {
        setActiveTab(tabParam)
      }
    }
  }, [])


  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // --- STATS AND LOGIC CALCULATIONS ---
  // 2. Active goals today (goals containing current day of the week in rhythm_days)
  const activeGoalsToday = dbGoals.filter((goal) => {
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

  // 3. Daily Progress based on actual completed sessions (capped by category targets)
  const homeCategoryMap: Record<string, { done: number; target: number }> = {}
  for (const goal of activeGoalsToday) {
    if (!homeCategoryMap[goal.category]) {
      homeCategoryMap[goal.category] = { done: 0, target: goal.target_time || 60 }
    } else {
      homeCategoryMap[goal.category].target += goal.target_time || 60
    }
  }
  for (const session of dbSessions) {
    if (!session.micro_tarea_id) continue
    const task = dbTasks.find((t) => t.id === session.micro_tarea_id)
    if (!task) continue
    const goal = dbGoals.find((g) => g.id === task.objetivo_id)
    if (!goal) continue
    if (!homeCategoryMap[goal.category]) {
      homeCategoryMap[goal.category] = { done: 0, target: goal.target_time || 60 }
    }
    homeCategoryMap[goal.category].done += session.duration_minutes || 0
  }

  // Sum capped done minutes and target minutes across categories today
  let totalCappedMinutesToday = 0
  let totalTargetMinutesToday = 0
  for (const cat of Object.keys(homeCategoryMap)) {
    const { done, target } = homeCategoryMap[cat]
    totalCappedMinutesToday += Math.min(done, target)
    totalTargetMinutesToday += target
  }

  let dailyProgress = 0
  if (totalTargetMinutesToday > 0) {
    dailyProgress = Math.round((totalCappedMinutesToday / totalTargetMinutesToday) * 100)
    if (dailyProgress > 100) dailyProgress = 100
  }

  const completedMinutesToday = totalCappedMinutesToday

  // 4. Remaining time for Academic category today
  const academicGoalsToday = activeGoalsToday.filter((g) => g.category === 'Académico')
  const academicData = homeCategoryMap['Académico']
  const remainingAcademicMinutes = academicData
    ? Math.max(0, academicData.target - academicData.done)
    : 0

  const getCategoryDailyPercent = (catName: string): number => {
    const catData = homeCategoryMap[catName]
    if (!catData || catData.target === 0) return 0
    return Math.min(100, Math.round((catData.done / catData.target) * 100))
  }

  const categoryProgress: GoalCategoryProgress = {
    academic: getCategoryDailyPercent('Académico'),
    health: getCategoryDailyPercent('Salud'),
    mentalHealth: getCategoryDailyPercent('Salud Mental'),
    personal: getCategoryDailyPercent('Personal'),
  }

  // 5. Dynamic Quick Access list from database items (Objetivos, Micro-tareas, Enfoques)
  const quickAccessItems: QuickAccessItemData[] = []
  
  // 5a. Add active goal today (type: OBJETIVO) - limit to 1 to match mockup variety
  activeGoalsToday.slice(0, 1).forEach((goal) => {
    quickAccessItems.push({
      id: goal.id,
      title: goal.title,
      type: 'OBJETIVO',
      category: goal.category.toUpperCase() as any,
      schedule: 'AHORA',
      description: goal.description || '',
    })
  })

  // 5b. Add pending tasks under active goals (type: MICRO - TAREA) - limit to 1
  const activeGoalIds = activeGoalsToday.map((g) => g.id)
  
  // Calculate remaining target time for each goal today
  const goalRemainingTimes = activeGoalsToday.map((goal) => {
    const goalTasks = dbTasks.filter((t) => t.objetivo_id === goal.id)
    const goalTaskIds = goalTasks.map((t) => t.id)
    const goalSessions = dbSessions.filter((s) => s.micro_tarea_id && goalTaskIds.includes(s.micro_tarea_id))
    const completedMinutes = goalSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
    const remaining = Math.max(0, (goal.target_time || 0) - completedMinutes)
    return { goalId: goal.id, remaining }
  })

  const pendingTasksToday: any[] = []
  activeGoalIds.forEach((goalId) => {
    const goalTasks = dbTasks.filter((t) => t.objetivo_id === goalId)
    const firstPending = goalTasks.find((t) => t.status !== 'completada')
    if (firstPending) {
      pendingTasksToday.push(firstPending)
    }
  })

  // Sort pending tasks: prioritize tasks where estimated_time <= remaining time of parent goal
  const sortedPendingTasks = [...pendingTasksToday].sort((a, b) => {
    const remainingA = goalRemainingTimes.find((g) => g.goalId === a.objetivo_id)?.remaining || 0
    const remainingB = goalRemainingTimes.find((g) => g.goalId === b.objetivo_id)?.remaining || 0
    
    const fitsA = a.estimated_time <= remainingA
    const fitsB = b.estimated_time <= remainingB

    if (fitsA && !fitsB) return -1
    if (!fitsA && fitsB) return 1
    // Fallback: sort by duration ascending (shortest first)
    return (a.estimated_time || 0) - (b.estimated_time || 0)
  })

  const suggestedTask = sortedPendingTasks[0] || null

  if (suggestedTask) {
    const parentGoal = dbGoals.find((g) => g.id === suggestedTask.objetivo_id)
    const category = parentGoal ? parentGoal.category.toUpperCase() : 'PERSONAL'
    const scheduleText = suggestedTask.scheduled_time ? `A LAS ${suggestedTask.scheduled_time}` : 'HOY'
    quickAccessItems.push({
      id: suggestedTask.id,
      title: suggestedTask.title,
      type: 'MICRO - TAREA',
      category: category as any,
      schedule: scheduleText,
      durationMinutes: suggestedTask.estimated_time,
      goalId: suggestedTask.objetivo_id,
    })
  }

  // 5c. Add focus templates (type: ENFOQUE) - limit to 1
  const remainingDailyMinutes = Math.max(0, totalTargetMinutesToday - completedMinutesToday)
  
  const completedEnfoqueIdsToday = new Set(
    dbSessions
      .filter((s) => s.enfoque_id !== null)
      .map((s) => s.enfoque_id)
  )

  const availableEnfoques = dbEnfoques.filter((e) => !completedEnfoqueIdsToday.has(e.id))

  // Sort enfoques: prioritize those with duration <= remainingDailyMinutes, then by duration ascending
  const sortedEnfoques = [...availableEnfoques].sort((a, b) => {
    const fitsA = a.duration <= remainingDailyMinutes
    const fitsB = b.duration <= remainingDailyMinutes

    if (fitsA && !fitsB) return -1
    if (!fitsA && fitsB) return 1
    return (a.duration || 0) - (b.duration || 0)
  })

  const suggestedEnfoque = sortedEnfoques[0] || null

  if (suggestedEnfoque) {
    quickAccessItems.push({
      id: suggestedEnfoque.id,
      title: suggestedEnfoque.title,
      type: 'ENFOQUE',
      category: suggestedEnfoque.category.toUpperCase() as any,
      durationMinutes: suggestedEnfoque.duration,
    })
  }

  // --- RENDERING VIEWS BASED ON TAB ---
  const renderTabContent = () => {
    switch (activeTab) {
      case 'inicio':
        return (
          <>
            

            {/* Circular Progress Widget */}
            <CircularProgress progress={dailyProgress} />

            {/* Encouragement message */}
            <EncouragementBanner
              userName={userName}
              remainingAcademicMinutes={remainingAcademicMinutes}
              hasActiveGoals={academicGoalsToday.length > 0}
              todayDayName={todayDayName}
            />

            {/* Quick Access items */}
            <QuickAccessList
              items={quickAccessItems}
              onItemClick={(item) => {
                if (item.type === 'OBJETIVO') {
                  router.push(`/objetivos/${item.id}`)
                } else if (item.type === 'MICRO - TAREA') {
                  if (item.goalId) {
                    router.push(`/objetivos/${item.goalId}/tareas/${item.id}`)
                  }
                } else if (item.type === 'ENFOQUE') {
                  router.push(`/enfoque?enfoqueId=${item.id}`)
                }
              }}
            />

            {/* Category Goals progresses */}
            <GoalCategoryList progress={categoryProgress} />

            {/* Live Collaborative Session mockup */}
            <LiveFocusCard />
          </>
        )
      case 'objetivos':
        return (
          <div className="p-8 text-center text-slate-500">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Mis Objetivos</h3>
            <p className="text-sm">Pantalla en construcción. Esta sección detallará tus objetivos a mediano y largo plazo.</p>
          </div>
        )
      case 'social':
        return <SocialTab />
      case 'progreso':
        return (
          <div className="p-8 text-center text-slate-500">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Estadísticas de Progreso</h3>
            <p className="text-sm">Pantalla en construcción. Aquí verás analíticas detalladas e historial de enfoque diario.</p>
          </div>
        )
    }
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-20 relative">
      
      {/* HEADER SECTION */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 sticky top-0 z-40">
        <h1 className="text-lg font-bold text-slate-800 text-left">
          {activeTab === 'inicio' 
            ? 'Inicio' 
            : activeTab === 'social' 
            ? 'Social' 
            : activeTab.toUpperCase()}
        </h1>

        {/* Clickable profile photo opening profile view on the right */}
        <button
          onClick={() => router.push('/perfil')}
          className="w-9 h-9 rounded-full overflow-hidden border-2 border-indigo-100 bg-slate-200 shadow-sm flex items-center justify-center font-bold text-indigo-900 text-sm active:scale-95 transition-transform cursor-pointer shrink-0"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
          ) : (
            userName.charAt(0)
          )}
        </button>
      </header>

      {/* BODY CONTENT */}
      <div className="animate-fade-in">
        {renderTabContent()}
      </div>

      {/* BOTTOM TAB NAVIGATION */}
      <BottomNav activeTab={activeTab} />
    </div>
  )
}
