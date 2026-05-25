'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Play, 
  Check, 
  Clock, 
  Link as LinkIcon, 
  Plus, 
  Loader, 
  Sparkles, 
  AlertTriangle, 
  ExternalLink,
  Compass,
  FileText,
  X,
  Edit2
} from 'lucide-react'
import BottomNav from './BottomNav'

interface MicroTaskDetailClientProps {
  task: {
    id: string
    objetivo_id: string
    title: string
    complexity: 'Baja' | 'Media' | 'Alta'
    estimated_time: number
    scheduled_time: string | null
    status: 'pendiente' | 'en_enfoque' | 'completada'
    badge_title: string | null
    badge_description: string | null
    guide_steps: string[]
    video_url: string | null
    notes: string | null
    notes_updated_at: string | null
  }
  goal: {
    id: string
    title: string
    category: 'Académico' | 'Salud' | 'Salud Mental' | 'Personal'
  }
  resources: any[]
}

export default function MicroTaskDetailClient({
  task,
  goal,
  resources = [],
}: MicroTaskDetailClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'inicio' | 'objetivos' | 'social' | 'progreso'>('objetivos')

  // Notes state
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesText, setNotesText] = useState(task.notes || '')
  const [savingNotes, setSavingNotes] = useState(false)

  // Complete state
  const [completingTask, setCompletingTask] = useState(false)

  // Save notes handler
  const handleSaveNotes = async () => {
    setSavingNotes(true)
    try {
      const response = await fetch('/api/sesiones/completar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          micro_tarea_id: task.id,
          notes: notesText,
        }),
      })

      if (response.ok) {
        setEditingNotes(false)
        router.refresh()
      }
    } catch (err) {
      console.error('Error saving notes:', err)
    } finally {
      setSavingNotes(false)
    }
  }

  // Handle instant completion (redirect to enfoque with complete flag to trigger completion feedback flow)
  const handleInstantComplete = () => {
    router.push(`/enfoque?taskId=${task.id}&instantComplete=true`)
  }

  // Default guide steps fallback if none are generated
  const defaultGuideSteps = [
    'Identifica lógica repetitiva en tus componentes, especialmente peticiones API o estados de formularios.',
    'Crea una nueva carpeta /hooks y define una función que comience con el prefijo "use".',
    'Extrae los useState y useEffect necesarios y retorna solo los datos y funciones de acción esenciales.'
  ]

  const displaySteps = task.guide_steps && task.guide_steps.length > 0 
    ? task.guide_steps 
    : defaultGuideSteps

  const timeFormatted = `${task.scheduled_time || '16:00'} - ${task.estimated_time} min`

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

  return (
    <div className="w-full min-h-screen bg-slate-50/50 pb-28 text-slate-800 relative">
      
      {/* TOP HEADER */}
      <header className="px-6 py-4 bg-white border-b border-slate-100 flex items-center gap-3 sticky top-0 z-40 text-left">
        <button
          onClick={() => router.back()}
          className="p-1.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-indigo-950"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
            Micro-tarea
          </span>
          <span className="text-xs font-black text-indigo-950 uppercase tracking-wider mt-0.5 leading-none">
            {goal.title}
          </span>
        </div>
      </header>

      <div className="px-6 pt-6">
        
        {/* TASK TITLE & BADGES */}
        <div className="text-left mb-6">
          <h1 className="text-3xl font-black text-indigo-950 tracking-tight leading-tight mb-4">
            {task.title}
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-extrabold text-white bg-indigo-950 px-3.5 py-1 rounded-full uppercase tracking-wider">
              Complejidad: {task.complexity}
            </span>
            <span className="text-xs text-slate-400 font-extrabold">
              Tiempo estimado {task.estimated_time} minutos
            </span>
          </div>
        </div>

        {/* PRIMARY ACTIONS BUTTONS */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={() => router.push(`/enfoque?taskId=${task.id}`)}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-950 hover:bg-indigo-900 text-white rounded-2xl text-xs font-extrabold tracking-wider transition-all duration-300 shadow-md cursor-pointer active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Iniciar Enfoque</span>
          </button>

          {task.status !== 'completada' ? (
            <button
              onClick={handleInstantComplete}
              className="w-full py-3.5 px-4 bg-green-700 hover:bg-green-800 text-white rounded-2xl text-xs font-extrabold tracking-wider transition-all duration-300 shadow-sm cursor-pointer active:scale-[0.98]"
            >
              Marcar como completado
            </button>
          ) : (
            <div className="w-full py-3 px-4 bg-slate-100 border border-slate-200 text-slate-400 rounded-2xl text-xs font-bold text-center">
              Esta micro-tarea ya está completada
            </div>
          )}
        </div>

        {/* LOGRO CARD */}
        {task.badge_title && (
          <div className="bg-white rounded-3xl p-5 border border-slate-100/60 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.03)] flex items-center gap-5 text-left mb-8">
            <div className="w-14 h-14 rounded-full bg-purple-100/60 flex items-center justify-center shrink-0 border border-purple-100/30">
              <Compass className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-extrabold text-purple-600 uppercase tracking-widest">
                Logro por completar
              </span>
              <h4 className="text-base font-black text-indigo-950 tracking-tight leading-tight mt-0.5">
                Logro: {task.badge_title}
              </h4>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed mt-1">
                {task.badge_description}
              </p>
            </div>
          </div>
        )}

        {/* GUIA DE EJECUCION */}
        <div className="text-left mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-black text-indigo-950 tracking-tight">
              Guía de Ejecución
            </h3>
            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Guía automática
            </span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100/60 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-5">
            {displaySteps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-indigo-950 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SUGGESTED VIDEO LINK */}
        {task.video_url && (
          <div className="mb-8 text-left">
            <a
              href={task.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-slate-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <Play className="w-4 h-4 fill-rose-500 ml-0.5" />
                </div>
                <div>
                  <div className="inline-block text-[9px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md uppercase tracking-wider mb-1">
                    Recomendación para empezar
                  </div>
                  <h5 className="text-xs font-bold text-slate-800 leading-none group-hover:text-indigo-950">
                    Video informativo
                  </h5>
                  <span className="text-[9px] text-slate-400 block mt-1 truncate max-w-[200px]">
                    {task.video_url}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
            </a>
          </div>
        )}

        {/* BOTTOM ACTION BUTTON */}
        <button
          onClick={() => router.push(`/enfoque?taskId=${task.id}`)}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-950 hover:bg-indigo-900 text-white rounded-2xl text-xs font-extrabold tracking-wider transition-all mb-8 shadow-sm cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Iniciar Enfoque</span>
        </button>

        {/* USER NOTES SECTION */}
        <div className="text-left mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-lg font-black text-indigo-950 tracking-tight">
              Notas
            </h3>
            {!editingNotes ? (
              <button
                onClick={() => setEditingNotes(true)}
                className="text-[10px] font-extrabold text-indigo-950 hover:text-indigo-800 flex items-center gap-1 uppercase tracking-wider cursor-pointer"
              >
                <Edit2 className="w-3 h-3 text-indigo-950" />
                <span>Añadir nota</span>
              </button>
            ) : null}
          </div>

          {editingNotes ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3.5">
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Escribe tus notas, recordatorios o puntos clave aprendidos..."
                className="w-full h-28 bg-slate-50 border-none rounded-2xl p-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600/10 placeholder-slate-400 text-slate-800"
              />
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setNotesText(task.notes || '')
                    setEditingNotes(false)
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="px-4 py-2 bg-indigo-950 text-white hover:bg-indigo-900 rounded-xl text-xs font-extrabold tracking-wide flex items-center justify-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingNotes ? (
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Guardar'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100/50 border border-slate-100 rounded-3xl p-5 shadow-inner flex flex-col relative">
              {notesText ? (
                <>
                  <p className="text-xs text-slate-600 font-semibold italic leading-relaxed">
                    "{notesText}"
                  </p>
                  <div className="flex items-center gap-1.5 mt-4 text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                    <Edit2 className="w-3 h-3 text-slate-400" />
                    <span>
                      {task.notes_updated_at 
                        ? `Editado el ${new Date(task.notes_updated_at).toLocaleDateString()}` 
                        : 'Editado recientemente'}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 font-medium italic text-center py-2">
                  No has registrado notas para esta tarea. Añade una para registrar tus descubrimientos.
                </p>
              )}
            </div>
          )}
        </div>

        {/* RECURSOS ADJUNTOS SECTION */}
        <div className="text-left mb-6">
          <h3 className="text-lg font-black text-indigo-950 tracking-tight mb-4 px-1">
            Recursos Adjuntos
          </h3>

          <div className="space-y-2.5">
            {/* Display parent goal resources */}
            {resources.length > 0 ? (
              resources.map((res) => (
                <a
                  key={res.id}
                  href={res.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-4 bg-white hover:bg-slate-50/50 rounded-2xl flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-slate-100/40 transition-all group"
                >
                  <div className="flex items-center gap-3.5 overflow-hidden mr-2">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-950 flex items-center justify-center shrink-0">
                      {res.title.toLowerCase().endsWith('.pdf') ? (
                        <FileText className="w-4.5 h-4.5 text-indigo-950" />
                      ) : (
                        <LinkIcon className="w-4.5 h-4.5 text-indigo-950" />
                      )}
                    </div>
                    <div className="truncate">
                      <h5 className="text-xs font-bold text-slate-700 leading-snug group-hover:text-indigo-950 transition-colors truncate">
                        {res.title}
                      </h5>
                      <span className="text-[9px] text-slate-400 font-extrabold block mt-0.5 uppercase tracking-wide">
                        {res.title.toLowerCase().endsWith('.pdf') ? 'PDF • 2.4 MB' : 'URL EXTERNA'}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                </a>
              ))
            ) : (
              <div className="p-4 bg-white/50 border border-slate-100/60 rounded-2xl text-center text-xs text-slate-400 italic">
                No hay recursos adjuntos disponibles.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* BOTTOM NAV BAR */}
      <BottomNav activeTab="objetivos" />

    </div>
  )
}
