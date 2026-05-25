'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Settings, 
  Play, 
  Check, 
  Clock, 
  Link as LinkIcon, 
  Plus, 
  Loader, 
  Sparkles, 
  AlertTriangle, 
  ExternalLink, 
  Atom,
  Lock,
  FileText,
  X,
  Upload,
  Brain,
  ChevronLeft
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import TimerModal from './TimerModal'
import BottomNav from './BottomNav'
import InsigniaAwardedModal from './InsigniaAwardedModal'
import { Drawer } from 'vaul'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import SortableTaskItem from './SortableTaskItem'

interface GoalDetailClientProps {
  goal: {
    id: string
    title: string
    category: 'Académico' | 'Salud' | 'Salud Mental' | 'Personal'
    progress: number
    description: string | null
    target_time?: number | null
    insignia_title?: string | null
    insignia_description?: string | null
  }
  tasks: any[]
  resources: any[]
  todaySessions?: any[]
}

export default function GoalDetailClient({
  goal,
  tasks = [],
  resources = [],
  todaySessions = [],
}: GoalDetailClientProps) {
  const router = useRouter()
  
  // Toggle states matching mockup links
  const [showPendingTasks, setShowPendingTasks] = useState(true)
  const [showCompletedTasks, setShowCompletedTasks] = useState(true)
  
  // Resource Modal Form State
  const [showAddResourceModal, setShowAddResourceModal] = useState(false)
  const [resourceTitle, setResourceTitle] = useState('')
  const [resourceUrl, setResourceUrl] = useState('')
  const [addingResource, setAddingResource] = useState(false)
  const [generatingAiResource, setGeneratingAiResource] = useState(false)
  const [resourceError, setResourceError] = useState<string | null>(null)

  // Timer state
  const [activeTimer, setActiveTimer] = useState<{
    title: string
    taskId?: string
    enfoqueId?: string
    duration: number
  } | null>(null)

  // Insignia Awarded Modal states
  const [isInsigniaModalOpen, setIsInsigniaModalOpen] = useState(false)
  const [awardedInsignia, setAwardedInsignia] = useState<{ title: string; description?: string } | null>(null)

  // FAB Actions Drawer step state
  const [fabDrawerStep, setFabDrawerStep] = useState<'menu' | 'create_task' | 'add_resource' | 'quiz_step_1' | 'quiz_step_2' | 'quiz_step_3'>('menu')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [savingTask, setSavingTask] = useState(false)

  // Drag and Drop Local State
  const [localPendingTasks, setLocalPendingTasks] = useState<any[]>([])

  React.useEffect(() => {
    setLocalPendingTasks(tasks.filter((t: any) => t.status !== 'completada'))
  }, [tasks])

  // Drag and Drop Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (active.id !== over?.id && over) {
      setLocalPendingTasks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        
        const newArray = arrayMove(items, oldIndex, newIndex)
        
        // Update Supabase in background
        const supabase = createClient()
        newArray.forEach((task, idx) => {
          const hour = 16 + Math.floor(idx / 2)
          const min = (idx % 2 === 0) ? '00' : '30'
          const scheduled_time = `${hour}:${min}`
          
          task.scheduled_time = scheduled_time

          supabase
            .from('micro_tareas')
            .update({ scheduled_time })
            .eq('id', task.id)
            .then()
        })

        return newArray
      })
    }
  }

  // Handler for creating manual microtask in drawer
  const handleCreateMicroTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    setSavingTask(true)
    setResourceError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('micro_tareas').insert({
        objetivo_id: goal.id,
        title: newTaskTitle,
        complexity: 'Baja',
        estimated_time: 15,
        status: 'pendiente',
        guide_steps: [
          'Identifica el alcance de esta micro-tarea.',
          'Divide los componentes e implementa incrementalmente.',
          'Comprueba que el funcionamiento sea satisfactorio y finaliza la sesión.'
        ]
      })

      if (error) throw error

      setNewTaskTitle('')
      setShowAddResourceModal(false)
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setResourceError(err.message || 'Error al guardar la micro tarea')
    } finally {
      setSavingTask(false)
    }
  }

  // Handler for AI diagnostic quiz
  const handleRunQuiz = async (blocker: string) => {
    setFabDrawerStep('quiz_step_2')
    setResourceError(null)

    try {
      const response = await fetch('/api/recursos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objetivo_id: goal.id,
          generate_ai: true,
          blocker_type: blocker
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar sugerencia de IA')
      }

      setFabDrawerStep('quiz_step_3')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setResourceError(err.message || 'Error de conexión')
      setFabDrawerStep('menu')
    }
  }

  // Filter tasks
  const pendingTasks = tasks.filter((t) => t.status !== 'completada')
  const completedTasks = tasks.filter((t) => t.status === 'completada')

  // Calculate completed minutes today for this goal
  const goalTaskIds = tasks.map((t) => t.id)
  const completedMinutesToday = todaySessions
    .filter((s) => s.micro_tarea_id && goalTaskIds.includes(s.micro_tarea_id))
    .reduce((acc, s) => acc + (s.duration_minutes || 0), 0)

  const remainingGoalMinutesToday = Math.max(0, (goal.target_time || 0) - completedMinutesToday)
  const isGoalTargetMetToday = remainingGoalMinutesToday <= 0 && (goal.target_time || 0) > 0

  // Siguiente paso is the FIRST pending task
  const nextStepTask = localPendingTasks[0] || null

  // All other pending tasks after the first one are considered locked/future tasks
  const lockedTasks = localPendingTasks.slice(1)

  // Start microtask -> set to 'en_enfoque' in Supabase, then open timer page
  const handleStartTask = async (task: any) => {
    try {
      await fetch('/api/sesiones/completar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          micro_tarea_id: task.id,
          status: 'en_enfoque',
        }),
      })

      router.push(`/enfoque?taskId=${task.id}`)
    } catch (err) {
      console.error('Error starting microtask:', err)
    }
  }

  // Complete microtask directly
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

  // Handle Manual Resource upload
  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resourceTitle.trim() || !resourceUrl.trim()) {
      setResourceError('Ambos campos son requeridos')
      return
    }

    setAddingResource(true)
    setResourceError(null)

    try {
      const response = await fetch('/api/recursos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objetivo_id: goal.id,
          title: resourceTitle,
          url: resourceUrl,
          generate_ai: false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fallo al guardar el recurso')
      }

      setResourceTitle('')
      setResourceUrl('')
      setShowAddResourceModal(false)
      router.refresh()
    } catch (err: any) {
      setResourceError(err.message || 'Error de conexión')
    } finally {
      setAddingResource(false)
    }
  }

  // Handle AI Resource generation
  const handleGenerateAiResource = async () => {
    setGeneratingAiResource(true)
    setResourceError(null)

    try {
      const response = await fetch('/api/recursos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objetivo_id: goal.id,
          generate_ai: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fallo al generar recurso con IA')
      }

      setShowAddResourceModal(false)
      router.refresh()
    } catch (err: any) {
      setResourceError(err.message || 'Error de conexión')
    } finally {
      setGeneratingAiResource(false)
    }
  }

  const handleTabChange = (tab: 'inicio' | 'objetivos' | 'social' | 'progreso') => {
    if (tab === 'inicio') {
      router.push('/')
    } else if (tab === 'objetivos') {
      router.push('/objetivos')
    } else if (tab === 'social') {
      router.push('/social')
    } else {
      router.push(`/?tab=${tab}`)
    }
  }

  // Circular Progress variables
  const radius = 80
  const strokeWidth = 8
  const circumference = 2 * Math.PI * radius
  const progressPercent = Math.min(Math.max(goal.progress || 0, 0), 100)
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  // Stacked title parsing (e.g. Aprender \n React)
  const renderStackedTitle = (titleText: string) => {
    const words = titleText.split(' ')
    if (words.length > 1) {
      return (
        <>
          {words[0]}
          <br />
          {words.slice(1).join(' ')}
        </>
      )
    }
    return titleText
  }

  return (
    <div className="w-full min-h-screen bg-slate-50/50 pb-28 text-slate-800 relative">
      
      {/* HEADER SECTION (Avatar, Title, Settings) */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100/80 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/perfil')}
            className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-200 shadow-sm flex items-center justify-center font-bold text-indigo-950 text-xs active:scale-95 transition-transform cursor-pointer"
          >
            {/* Mock profile photo avatar matching mockup */}
            <div className="w-full h-full bg-slate-400 flex items-center justify-center text-white text-xs font-black">
              U
            </div>
          </button>
          <span className="text-[17px] font-black text-indigo-950 tracking-tight">
            Objetivos
          </span>
        </div>

        <button
          onClick={() => router.push('/')}
          className="p-1.5 text-indigo-950 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
        >
          <Settings className="w-5 h-5 text-indigo-950" />
        </button>
      </header>

      <div className="px-6 pt-6">
        
        {/* CIRCULAR PROGRESS DISPLAY */}
        <div className="flex justify-center mb-8">
          <div className="relative w-56 h-56 flex items-center justify-center bg-white rounded-full shadow-[0_12px_36px_-6px_rgba(0,0,0,0.06)] border border-slate-100/50">
            {/* Background aura glow */}
            <div className="absolute w-44 h-44 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />

            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r={radius}
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx="96"
                cy="96"
                r={radius}
                stroke="#34e8ac" // Neon mint green stroke matching mockup
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[44px] font-black text-indigo-950 leading-none tracking-tighter">
                {Math.round(progressPercent)}%
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                Progreso
              </span>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wide mt-0.5">
                Vas Bien
              </span>
            </div>
          </div>
        </div>

        {/* GOAL BADGES & DESCRIPTION */}
        <div className="text-left mb-6">
          <div className="flex items-center gap-2 mb-3.5">
            <span className="text-[9px] font-bold text-white bg-indigo-950 px-3 py-1 rounded-full uppercase tracking-wider">
              En Curso
            </span>
            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Optimizada automáticamente
            </span>
          </div>

          <h1 className="text-[34px] font-black text-indigo-950 tracking-tight leading-[1.05] mb-4">
            {renderStackedTitle(goal.title)}
          </h1>

          <div className="inline-block text-[9px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full uppercase tracking-wider mb-2.5 flex items-center gap-1 w-max">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Descripción automática
          </div>
          
          <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[95%]">
            {goal.description || 'Cumple tus metas paso a paso.'}
          </p>
        </div>

        {/* INSIGNIA COMPONENT */}
        <div 
          title={goal.insignia_description || ''}
          className="mb-6 w-full bg-gradient-to-r from-[#E2DCFF] via-[#E4DFFF] to-[#E9E6FF] border border-[#D5C9FF] rounded-[28px] p-5 flex items-center gap-4 relative overflow-hidden shadow-[0_8px_30px_rgba(202,191,255,0.2)] text-left cursor-help group"
        >
          {/* Background watermark trophy */}
          <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 pointer-events-none opacity-20 text-[#9E86FF]">
            <svg className="w-28 h-28 stroke-current fill-none" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9H4.5A2.5 2.5 0 0 1 2 6.5v0A2.5 2.5 0 0 1 4.5 4H6" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9h1.5a2.5 2.5 0 0 0 2.5-2.5v0A2.5 2.5 0 0 0 19.5 4H18" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12v8a6 6 0 0 1-12 0V4Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v4M8 20h8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="m12 7 .6 1.2 1.4.2-1 1 .2 1.4-1.2-.6-1.2.6.2-1.4-1-1 1.4-.2.6-1.2Z" />
            </svg>
          </div>

          {/* Icon circle */}
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(202,191,255,0.15)] relative z-10">
            <svg className="w-6 h-6 text-[#3E1B9B] fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" />
              <line x1="12" y1="6.5" x2="12" y2="8" />
              <path d="M12 8L8 20" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 8L16 20" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="9.5" y1="16" x2="14.5" y2="16" strokeLinecap="round" />
            </svg>
          </div>

          {/* Insignia texts */}
          <div className="flex flex-col relative z-10">
            <span className="text-[10px] font-black text-[#5E3BB8] uppercase tracking-wider leading-none">
              INSIGNIA
            </span>
            <span className="text-base font-black text-[#1E1B4B] tracking-tight mt-1 leading-snug">
              {goal.insignia_title || (() => {
                const t = (goal.title || '').toLowerCase()
                if (t.includes('react')) return 'El mero mero de React'
                return `Aprendiz de ${goal.title}`
              })()}
            </span>
          </div>
        </div>

        {/* SIGUIENTE PASO CARD */}
        <div className="mb-8 text-left">
          {nextStepTask ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-100/60 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.03)] flex flex-col relative overflow-hidden">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-950" />
                <span className="text-[9px] font-extrabold text-indigo-950 uppercase tracking-widest">
                  Siguiente paso
                </span>
              </div>

              <h4 className="text-lg font-black text-indigo-950 tracking-tight leading-snug">
                {nextStepTask.title}
              </h4>
              
              <p className="text-xs text-slate-400 font-semibold leading-relaxed mt-1 mb-4">
                {nextStepTask.badge_description || 'Completa esta tarea para avanzar con tu objetivo.'}
              </p>

              <button
                onClick={() => {
                  if (nextStepTask.status === 'en_enfoque') {
                    handleCompleteTask(nextStepTask)
                  } else {
                    handleStartTask(nextStepTask)
                  }
                }}
                className="w-max flex items-center gap-2 py-2.5 px-5 bg-[#34e8ac] hover:bg-[#2bd49c] text-indigo-950 rounded-2xl text-xs font-black tracking-wide transition-all shadow-md shadow-emerald-400/10 cursor-pointer active:scale-95"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-950" />
                <span>{nextStepTask.status === 'en_enfoque' ? 'Completar Micro-tarea' : 'Iniciar Micro-tarea'}</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-5 border border-slate-100/60 text-center text-xs text-slate-400 font-bold shadow-sm">
              ¡Has completado todas las micro-tareas! No hay pasos pendientes.
            </div>
          )}
        </div>

        {/* MICRO-TAREAS HEADER & TOGGLE */}
        <div className="text-left mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-[20px] font-black text-indigo-950 tracking-tight">
              Micro-tareas
            </h3>
            <span className="text-xs font-extrabold text-slate-400 tracking-tight">
              {completedTasks.length}/{tasks.length} completadas
            </span>
          </div>

          <button
            onClick={() => setShowPendingTasks(!showPendingTasks)}
            className="text-xs font-extrabold text-indigo-950 hover:text-indigo-800 transition-colors uppercase tracking-wider cursor-pointer"
          >
            {showPendingTasks ? 'ocultar micro tareas' : 'mostrar micro tareas'}
          </button>
        </div>

        {/* MICRO-TAREAS LIST */}
        {showPendingTasks && (
          <div className="space-y-3 mb-6 text-left">
            {pendingTasks.length > 0 ? (
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={localPendingTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {localPendingTasks.map((task, index) => (
                    <SortableTaskItem 
                      key={task.id} 
                      task={task} 
                      goalId={goal.id}
                      isNextStep={index === 0} 
                      onStart={handleStartTask}
                      onComplete={handleCompleteTask}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              <div className="p-4 bg-white border border-slate-100/60 rounded-3xl text-center text-xs text-slate-400 italic">
                No hay tareas pendientes.
              </div>
            )}
          </div>
        )}

        {/* COMPLETED TASKS TOGGLE */}
        <div className="text-left mb-4">
          <button
            onClick={() => setShowCompletedTasks(!showCompletedTasks)}
            className="text-xs font-extrabold text-indigo-950 hover:text-indigo-800 transition-colors uppercase tracking-wider cursor-pointer"
          >
            {showCompletedTasks ? 'ocultar completadas' : 'mostrar completadas'}
          </button>
        </div>

        {/* COMPLETED TASKS LIST */}
        {showCompletedTasks && completedTasks.length > 0 && (
          <div className="space-y-3 mb-8 text-left animate-fade-in">
            {completedTasks.map((task) => (
              <div 
                key={task.id} 
                onClick={() => router.push(`/objetivos/${goal.id}/tareas/${task.id}`)}
                className="w-full flex items-center justify-between p-4 bg-indigo-50/20 border border-indigo-100/50 hover:border-indigo-200 rounded-3xl shadow-sm cursor-pointer transition-all duration-300 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5 overflow-hidden mr-2">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-100/30 flex items-center justify-center shrink-0 border border-indigo-100/50">
                    <Atom className="w-5 h-5 text-indigo-950" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-sm font-bold text-slate-400 line-through leading-tight truncate">
                      {task.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-extrabold block mt-0.5 uppercase tracking-wide">
                      ⏱ {task.scheduled_time || '16:00'} - {task.estimated_time} min
                    </span>
                  </div>
                </div>

                <span 
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 text-xs font-black px-4 py-2 bg-indigo-950 text-white rounded-xl flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Completada</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* RECURSOS GENERADOS BLOCK */}
        <div className="bg-slate-100/50 border border-slate-100 rounded-3xl p-5 text-left mb-6 relative">
          <h3 className="text-base font-black text-indigo-950 tracking-tight mb-4">
            Recursos Generados
          </h3>

          <div className="space-y-2.5">
            {resources.length > 0 ? (
              resources.map((res) => (
                <a
                  key={res.id}
                  href={res.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-4 bg-white hover:bg-slate-50/50 rounded-2xl flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-slate-100/40 transition-all group"
                >
                  <div className="flex items-center gap-3 overflow-hidden mr-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-950 flex items-center justify-center shrink-0">
                      {res.title.toLowerCase().endsWith('.pdf') ? (
                        <FileText className="w-4 h-4 text-indigo-950" />
                      ) : (
                        <LinkIcon className="w-4 h-4 text-indigo-950" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-700 truncate group-hover:text-indigo-950 transition-colors">
                      {res.title}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                </a>
              ))
            ) : (
              <div className="p-4 bg-white/50 border border-slate-100/60 rounded-2xl text-center text-xs text-slate-400 italic">
                No hay recursos recomendados disponibles.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* FLOATING ACTION BUTTON (FAB) -> OPEN ADD RESOURCE DIALOG/DRAWER */}
      <div className="fixed bottom-20 right-6 z-40">
        <button
          onClick={() => {
            setFabDrawerStep('menu')
            setShowAddResourceModal(true)
          }}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-950 text-white shadow-xl hover:bg-indigo-900 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* ADD RESOURCE MODAL (VAUL DRAWER) */}
      {/* ADD/ACTION DRAWER MODAL (VAUL DRAWER WITH MOCKUP STYLING) */}
      <Drawer.Root
        open={showAddResourceModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddResourceModal(false)
            setResourceError(null)
          }
        }}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-indigo-950/20 backdrop-blur-sm z-50 animate-fade-in" />
          <Drawer.Content className="w-full max-h-[85vh] bg-white rounded-t-[32px] overflow-hidden flex flex-col fixed bottom-0 left-0 right-0 outline-none z-50 max-w-md mx-auto shadow-2xl">
            <div className="p-6 bg-white rounded-t-[32px] flex-1 overflow-y-auto relative text-left">
              
              {/* Handle */}
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

              {/* Close button */}
              <button
                onClick={() => {
                  setShowAddResourceModal(false)
                  setResourceError(null)
                }}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Back button (Only shown when not on the main menu) */}
              {fabDrawerStep !== 'menu' && fabDrawerStep !== 'quiz_step_2' && fabDrawerStep !== 'quiz_step_3' && (
                <button
                  onClick={() => setFabDrawerStep('menu')}
                  className="absolute top-4 left-4 p-1.5 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {resourceError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-[11px] text-rose-600 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{resourceError}</span>
                </div>
              )}

              {/* STEP 1: MAIN MENU (MATCHES USER MOCKUP PERFECTLY) */}
              {fabDrawerStep === 'menu' && (
                <div className="flex flex-col gap-4 py-4 px-2 max-w-sm mx-auto">
                  
                  {/* Button 1: Crear micro tarea */}
                  <button
                    onClick={() => setFabDrawerStep('create_task')}
                    className="w-full py-4 bg-[#6FFBBE] hover:bg-[#5ce1ab] text-emerald-950 text-sm font-extrabold rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-[#6FFBBE]/15"
                  >
                    <Plus className="w-5 h-5 text-emerald-950 stroke-[3]" />
                    <span>Crear micro tarea</span>
                  </button>

                  {/* Button 2: Subir recurso */}
                  <button
                    onClick={() => setFabDrawerStep('add_resource')}
                    className="w-full py-4 bg-[#6FFBBE] hover:bg-[#5ce1ab] text-emerald-950 text-sm font-extrabold rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-[#6FFBBE]/15"
                  >
                    <Upload className="w-5 h-5 text-emerald-950 stroke-[2.5]" />
                    <span>Subir recurso</span>
                  </button>

                  {/* Divider / Blocker Helper Question */}
                  <div className="text-center mt-6 mb-2">
                    <p className="text-sm font-black text-[#110B3B] leading-relaxed max-w-[260px] mx-auto">
                      ¿Necesitas asistencia para mejorar tu progreso?
                    </p>
                  </div>

                  {/* Button 3: Hacer cuestionario */}
                  <button
                    onClick={() => setFabDrawerStep('quiz_step_1')}
                    className="w-full py-4 bg-[#18125C] hover:bg-[#120d47] text-white text-sm font-extrabold rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-indigo-950/15"
                  >
                    <Brain className="w-5 h-5 text-indigo-200 fill-indigo-200/10 stroke-[2]" />
                    <span>Hacer cuestionario</span>
                  </button>
                </div>
              )}

              {/* STEP 2: CREATE MICRO TASK FORM */}
              {fabDrawerStep === 'create_task' && (
                <div className="py-2 px-1 text-left">
                  <h3 className="text-base font-black text-indigo-950 tracking-tight mb-4 pl-1">
                    Crear Nueva Micro Tarea
                  </h3>
                  <form onSubmit={handleCreateMicroTask} className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 pl-1">
                        Título de la micro tarea
                      </label>
                      <input
                        type="text"
                        required
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Ej. Programar interfaz de la cabecera"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600/10 placeholder-slate-400 text-slate-800"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={savingTask}
                      className="w-full py-3 bg-indigo-950 text-white hover:bg-indigo-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {savingTask ? <Loader className="w-4 h-4 animate-spin text-white" /> : 'Crear Tarea'}
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 3: SUBMIT RESOURCE FORM */}
              {fabDrawerStep === 'add_resource' && (
                <div className="py-2 px-1 text-left">
                  <h3 className="text-base font-black text-indigo-950 tracking-tight mb-4 pl-1">
                    Añadir Enlace / Recurso
                  </h3>

                  <form onSubmit={handleAddResource} className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 pl-1">
                        Título del recurso
                      </label>
                      <input
                        type="text"
                        required
                        value={resourceTitle}
                        onChange={(e) => setResourceTitle(e.target.value)}
                        placeholder="Ej. Guía Oficial de React Native"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600/10 placeholder-slate-400 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 pl-1">
                        Enlace web (URL)
                      </label>
                      <input
                        type="url"
                        required
                        value={resourceUrl}
                        onChange={(e) => setResourceUrl(e.target.value)}
                        placeholder="https://react.dev/..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600/10 placeholder-slate-400 text-slate-800"
                      />
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={addingResource}
                        className="w-full py-3 bg-indigo-950 text-white hover:bg-indigo-900 rounded-xl text-xs font-black tracking-wide flex items-center justify-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {addingResource ? (
                          <Loader className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          'Guardar Enlace'
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleGenerateAiResource}
                        disabled={generatingAiResource}
                        className="w-full py-3 border border-dashed border-purple-300 bg-purple-50 hover:bg-purple-100/50 text-purple-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {generatingAiResource ? (
                          <Loader className="w-4 h-4 animate-spin text-purple-700" />
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>Sugerir con IA (Groq)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 4: QUIZ DIAGNOSTIC QUESTIONNAIRE (BLOCKER SELECTOR) */}
              {fabDrawerStep === 'quiz_step_1' && (
                <div className="py-2 px-1 text-left">
                  <h3 className="text-base font-black text-indigo-950 tracking-tight mb-2 pl-1">
                    Asistencia de Enfoque con IA
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-6 pl-1">
                    Identificaremos tu mayor obstáculo y te recomendaremos un recurso de aprendizaje al instante.
                  </p>

                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-3 pl-1">
                    ¿Cuál es tu mayor obstáculo hoy?
                  </span>

                  <div className="flex flex-col gap-2.5">
                    {[
                      { text: 'Falta de tiempo / Organización', val: 'tiempo' },
                      { text: 'Falta de motivación / Enfoque', val: 'enfoque' },
                      { text: 'Dificultad técnica o teórica', val: 'tecnica' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        onClick={() => handleRunQuiz(item.val)}
                        className="w-full p-4 text-left border-2 border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 rounded-2xl text-xs font-bold text-slate-800 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-between"
                      >
                        <span>{item.text}</span>
                        <ChevronLeft className="w-4 h-4 text-slate-400 rotate-180 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: QUIZ PROCESSING (AI LOADER) */}
              {fabDrawerStep === 'quiz_step_2' && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center relative">
                    <Brain className="w-8 h-8 text-indigo-600 animate-pulse" />
                    <Sparkles className="w-5 h-5 text-purple-500 absolute -top-1 -right-1 animate-bounce" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800">Analizando Obstáculo con Groq...</h4>
                  <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">
                    Estamos consultando nuestra base de conocimiento para entregarte el recurso de apoyo ideal.
                  </p>
                </div>
              )}

              {/* STEP 6: QUIZ SUCCESS */}
              {fabDrawerStep === 'quiz_step_3' && (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center animate-bounce-once">
                    <Check className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800">¡Sugerencia de IA generada!</h4>
                  <p className="text-xs text-slate-400 max-w-[250px] leading-relaxed">
                    Encuentra tu nuevo material en la sección inferior de **Recursos Recomendados**.
                  </p>
                  
                  <button
                    onClick={() => setShowAddResourceModal(false)}
                    className="mt-4 px-6 py-2.5 bg-indigo-950 text-white rounded-xl text-xs font-bold cursor-pointer transition-all hover:bg-indigo-900 active:scale-[0.98]"
                  >
                    Entendido
                  </button>
                </div>
              )}

            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* BOTTOM NAV BAR */}
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
