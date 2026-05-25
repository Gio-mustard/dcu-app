'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Sparkles, FolderOpen } from 'lucide-react'
import GoalCardCarousel from './GoalCardCarousel'
import CategoryFilters from './CategoryFilters'
import TasksList from './TasksList'
import FocusTemplatesGrid from './FocusTemplatesGrid'
import TimerModal from './TimerModal'
import BottomNav from './BottomNav'
import InsigniaAwardedModal from './InsigniaAwardedModal'

interface ObjetivosClientProps {
  email: string
  userName: string
  dbGoals: any[]
  dbEnfoques: any[]
  dbTasks: any[]
  avatarUrl?: string | null
}

export default function ObjetivosClient({
  email,
  userName,
  dbGoals = [],
  dbEnfoques = [],
  dbTasks = [],
  avatarUrl = null,
}: ObjetivosClientProps) {
  const router = useRouter()
  const supabase = createClient()

  // States
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas')
  
  // Timer modal state
  const [activeTimer, setActiveTimer] = useState<{
    title: string
    category: string
    durationMinutes: number
    microTaskId: string | null
    enfoqueId: string | null
  } | null>(null)

  // Insignia Awarded Modal states
  const [isInsigniaModalOpen, setIsInsigniaModalOpen] = useState(false)
  const [awardedInsignia, setAwardedInsignia] = useState<{ title: string; description?: string } | null>(null)



  // Map of goal ID to category
  const categoriesMap = dbGoals.reduce((acc, goal) => {
    acc[goal.id] = goal.category
    return acc
  }, {} as Record<string, string>)

  // 1. Filter goals (only active/en_curso)
  const activeGoals = dbGoals.filter((g) => g.status === 'en_curso')

  // Find the first pending task for each active goal (so we filter out completed & locked tasks)
  const availableTasks = activeGoals.flatMap((goal) => {
    const goalTasks = dbTasks.filter((t) => t.objetivo_id === goal.id)
    const firstPending = goalTasks.find((t) => t.status !== 'completada')
    return firstPending ? [firstPending] : []
  })

  // 2. Filter available tasks based on category selector
  const filteredTasks = availableTasks.filter((task) => {
    const taskCategory = categoriesMap[task.objetivo_id] || 'Personal'
    if (selectedCategory === 'Todas') return true
    return taskCategory.toLowerCase() === selectedCategory.toLowerCase()
  })

  // 3. Filter enfoques based on category selector
  const filteredEnfoques = dbEnfoques.filter((enfoque) => {
    if (selectedCategory === 'Todas') return true
    return enfoque.category.toLowerCase() === selectedCategory.toLowerCase()
  })

  // Start microtask -> set to 'en_enfoque' in Supabase, then open timer page
  const handleStartTask = async (task: any) => {
    try {
      const response = await fetch('/api/sesiones/completar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          micro_tarea_id: task.id,
          status: 'en_enfoque',
        }),
      })

      if (!response.ok) {
        throw new Error('Fallo al actualizar estado')
      }

      router.push(`/enfoque?taskId=${task.id}`)
    } catch (err) {
      console.error('Error starting microtask:', err)
    }
  }

  // Complete microtask directly (if user wants to log completion of 'en_enfoque' task from the list)
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)
  const handleCompleteTask = async (task: any) => {
    try {
      setCompletingTaskId(task.id)
      const response = await fetch('/api/sesiones/completar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          micro_tarea_id: task.id,
          duration_minutes: task.estimated_time || 25,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.insigniaAwarded) {
          setAwardedInsignia({
            title: data.insigniaAwarded.title,
            description: data.insigniaAwarded.description,
          })
          setIsInsigniaModalOpen(true)
        }
        router.refresh()
      }
    } catch (err) {
      console.error('Error completing microtask:', err)
    } finally {
      setCompletingTaskId(null)
    }
  }

  // Start free focus template -> redirect to enfoque page
  const handleStartFocus = (enfoque: any) => {
    router.push(`/enfoque?enfoqueId=${enfoque.id}`)
  }

  const handleTabChange = (tab: 'inicio' | 'objetivos' | 'social' | 'progreso') => {
    if (tab === 'inicio') {
      router.push('/')
    } else if (tab === 'objetivos') {
      // already here
    } else if (tab === 'social') {
      router.push('/social')
    } else {
      // Social/progreso mock routes can redirect to home client mock tab
      router.push(`/?tab=${tab}`)
    }
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-24 relative">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 sticky top-0 z-40 w-full">
        <h1 className="text-lg font-bold text-slate-800 text-left">Objetivos</h1>

        {/* Clickable profile photo on the right */}
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

      {/* CONTENT LIST */}
      <div className="pt-6 animate-fade-in">
        {/* Active Goals Carousel */}
        <GoalCardCarousel goals={activeGoals} />

        {/* Category Filters */}
        <CategoryFilters
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Tasks List */}
        <TasksList
          tasks={filteredTasks}
          categoriesMap={categoriesMap}
          onStartTask={handleStartTask}
          onCompleteTask={handleCompleteTask}
        />

        {/* Quick Focus Button (MODO ENFOQUE) */}
        <div className="flex flex-col items-center justify-center my-10 px-6 text-center select-none">
          <p className="text-[11px] text-slate-500 font-bold italic tracking-wide leading-relaxed mb-5 max-w-[240px] whitespace-pre-line">
            {"enfoque rapido, bloquea\ntus distracciones, avanza\nen lo importante"}
          </p>

          <div className="relative flex items-center justify-center">
            {/* Ambient background glow matching mockup style */}
            <div className="absolute w-60 h-60 rounded-full bg-gradient-to-tr from-teal-200/20 via-indigo-100/10 to-purple-300/30 blur-2xl pointer-events-none" />

            <button
              onClick={() => router.push('/enfoque?quick=true')}
              className="w-52 h-52 rounded-full bg-gradient-to-b from-white to-indigo-50/20 border-[12px] border-white shadow-[0_15px_35px_rgba(99,102,241,0.08),_0_0_20px_rgba(20,184,166,0.05)] hover:shadow-[0_20px_45px_rgba(99,102,241,0.14),_0_0_30px_rgba(20,184,166,0.08)] flex flex-col items-center justify-center p-6 transition-all duration-300 active:scale-[0.96] hover:scale-[1.01] cursor-pointer relative z-10 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#E0E7FF] flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform duration-500">
                <Sparkles className="w-5 h-5 text-indigo-800 fill-indigo-800/10" />
              </div>

              <span className="text-[14px] font-black tracking-widest text-[#1E1B4B] uppercase mb-1">
                MODO ENFOQUE
              </span>
              
              <span className="text-[10px] text-indigo-900/60 font-bold max-w-[130px] leading-tight">
                Sin distracciones, solo tu y tus metas
              </span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 font-bold italic mt-5">
            *El secreto de avanzar es comenzar.*
          </p>
        </div>

        {/* Focus Templates Grid */}
        <FocusTemplatesGrid
          enfoques={filteredEnfoques}
          onStartFocus={handleStartFocus}
        />

        {/* View All Goals Button */}
        <div className="flex justify-center mt-10 mb-6 px-6">
          <button
            onClick={() => router.push('/objetivos/todos')}
            className="w-full max-w-sm py-4 bg-white text-indigo-950 hover:bg-indigo-50/20 active:scale-[0.98] border border-slate-200 shadow-sm rounded-2xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FolderOpen className="w-4 h-4 text-indigo-600" />
            Ver todos mis objetivos
          </button>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <BottomNav activeTab="objetivos" />


      {/* INSIGNIA AWARDED MODAL */}
      {awardedInsignia && (
        <InsigniaAwardedModal
          isOpen={isInsigniaModalOpen}
          onClose={() => {
            setIsInsigniaModalOpen(false)
            setAwardedInsignia(null)
          }}
          insigniaTitle={awardedInsignia.title}
          insigniaDescription={awardedInsignia.description}
        />
      )}
    </div>
  )
}
