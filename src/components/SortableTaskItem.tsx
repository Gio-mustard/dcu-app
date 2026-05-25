import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Atom, FileText, Lock, GripVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SortableTaskItemProps {
  task: any
  goalId: string
  isNextStep: boolean
  onStart: (task: any) => void
  onComplete: (task: any) => void
}

export default function SortableTaskItem({ task, goalId, isNextStep, onStart, onComplete }: SortableTaskItemProps) {
  const router = useRouter()
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="w-full flex flex-col text-left mb-3 relative"
    >
      {!isNextStep && (
        <span className="text-[10px] font-extrabold text-slate-400 px-1 mb-1 leading-snug">
          Harás esto cuando estés lista (termina con tus micro tareas anteriores)
        </span>
      )}
      
      <div 
        onClick={() => router.push(`/objetivos/${goalId}/tareas/${task.id}`)}
        className={`w-full flex items-center justify-between p-4 bg-white border ${isNextStep ? 'border-slate-100/60 shadow-sm' : 'border-slate-100/60 shadow-sm opacity-65'} hover:border-slate-200 rounded-3xl cursor-pointer transition-colors duration-300 active:scale-[0.99]`}
      >
        <div className="flex items-center gap-3.5 overflow-hidden mr-2">
          {/* Drag Handle — only this area blocks touch for drag */}
          <div 
            {...attributes} 
            {...listeners}
            className="p-1.5 -ml-2 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing rounded-lg hover:bg-slate-50 touch-none"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-5 h-5" />
          </div>

          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100/20">
            {isNextStep ? <Atom className="w-5 h-5 text-indigo-950" /> : <FileText className="w-5 h-5 text-indigo-950" />}
          </div>
          <div className="truncate">
            <h4 className="text-sm font-black text-indigo-950 leading-tight truncate">
              {task.title}
            </h4>
            <span className="text-[10px] text-slate-400 font-extrabold block mt-0.5 uppercase tracking-wide">
              {task.scheduled_time ? `⏱ ${task.scheduled_time} - ` : ''}{task.estimated_time} min
            </span>
          </div>
        </div>

        {isNextStep ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (task.status === 'en_enfoque') {
                onComplete(task)
              } else {
                onStart(task)
              }
            }}
            className="shrink-0 text-xs font-black px-4 py-2 bg-[#34e8ac] hover:bg-[#2bd49c] text-indigo-950 rounded-xl cursor-pointer transition-all active:scale-[0.98]"
          >
            {task.status === 'en_enfoque' ? 'Completar' : 'Empezar'}
          </button>
        ) : (
          <button
            disabled
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 text-xs font-bold px-4 py-2 bg-emerald-50 text-slate-400 border border-slate-200/50 rounded-xl flex items-center gap-1 cursor-not-allowed"
          >
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Empezar</span>
          </button>
        )}
      </div>
    </div>
  )
}
