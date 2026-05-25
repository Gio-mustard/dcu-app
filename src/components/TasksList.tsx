'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Clock, CheckCircle2, GraduationCap, Heart, Sparkles, User } from 'lucide-react'
import { MicroTask } from '@/repositories/MicroTaskRepository'

interface TasksListProps {
  tasks: any[]
  categoriesMap?: Record<string, string> // To map goal ID to goal category
  onStartTask?: (task: any) => void
  onCompleteTask?: (task: any) => void
}

export default function TasksList({
  tasks = [],
  categoriesMap = {},
  onStartTask,
  onCompleteTask,
}: TasksListProps) {
  const router = useRouter()
  
  // Icon mapper based on goal category
  const getTaskIcon = (goalId: string) => {
    const category = categoriesMap[goalId] || 'PERSONAL'
    switch (category.toUpperCase()) {
      case 'ACADÉMICO':
        return { icon: GraduationCap, colors: 'bg-indigo-100 text-indigo-500 shadow-indigo-100/30' }
      case 'SALUD':
        return { icon: Heart, colors: 'bg-emerald-100 text-emerald-500 shadow-emerald-100/30' }
      case 'SALUD MENTAL':
        return { icon: Sparkles, colors: 'bg-purple-100 text-purple-500 shadow-purple-100/30' }
      case 'PERSONAL':
      default:
        return { icon: User, colors: 'bg-slate-100 text-slate-500 shadow-slate-100/30' }
    }
  }

  // Calculate total estimated time of pending tasks
  const totalPendingMinutes = tasks
    .filter((t) => t.status !== 'completada')
    .reduce((acc, t) => acc + (t.estimated_time || 0), 0)

  return (
    <div className="px-6 w-full mb-8">
      {/* Title */}
      <h3 className="text-base font-bold text-slate-800 mb-4 text-left">
        Micro-tareas {totalPendingMinutes > 0 ? `(${totalPendingMinutes} min total)` : ''}
      </h3>

      <div className="flex flex-col gap-3 text-left">
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const { icon: Icon, colors: iconColors } = getTaskIcon(task.objetivo_id)
            const isCompleted = task.status === 'completada'
            const isFocused = task.status === 'en_enfoque'

            return (
              <div
                key={task.id}
                onClick={() => router.push(`/objetivos/${task.objetivo_id}/tareas/${task.id}`)}
                className="w-full flex items-center justify-between p-4 bg-white border border-slate-100/60 hover:border-slate-200 rounded-3xl text-left shadow-sm transition-all duration-300 cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5 mr-2 overflow-hidden">
                  {/* Category icon */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${iconColors}`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  {/* Task details */}
                  <div className="flex flex-col truncate">
                    <h4 className={`text-sm font-bold text-slate-800 leading-tight truncate ${isCompleted ? 'line-through text-slate-400 font-medium' : ''}`}>
                      {task.title}
                    </h4>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {task.scheduled_time || 'Hoy'} {task.estimated_time ? `• ${task.estimated_time} min` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right interactive button */}
                {!isCompleted ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isFocused) {
                        onCompleteTask?.(task)
                      } else {
                        onStartTask?.(task)
                      }
                    }}
                    className={`shrink-0 text-xs font-extrabold px-5 py-2.5 rounded-2xl cursor-pointer transition-all duration-300 active:scale-[0.98] ${
                      isFocused
                        ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-md shadow-purple-500/10'
                        : 'bg-emerald-400 hover:bg-emerald-300 text-indigo-950 shadow-md shadow-emerald-400/10'
                    }`}
                  >
                    {isFocused ? 'Completar' : 'Empezar'}
                  </button>
                ) : (
                  <span className="shrink-0 text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100/50 px-3 py-1.5 rounded-xl">
                    Completada
                  </span>
                )}
              </div>
            )
          })
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-3xl text-center text-xs text-slate-400 italic">
            No hay micro-tareas pendientes.
          </div>
        )}
      </div>
    </div>
  )
}
