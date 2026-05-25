'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Lock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  Link as LinkIcon,
  FileText,
  ExternalLink,
  AlertCircle,
  Trophy,
  Award,
  X,
  Compass,
  Dumbbell,
  Leaf,
  Atom
} from 'lucide-react'
import { Drawer } from 'vaul'

// Icon helper for badges
const getBadgeIcon = (title: string) => {
  const t = (title || '').toLowerCase()
  if (t.includes('logica') || t.includes('lógica') || t.includes('arquitect')) return Compass
  if (t.includes('entrenamiento') || t.includes('ejercicio') || t.includes('deporte') || t.includes('fuerza')) return Dumbbell
  if (t.includes('foco') || t.includes('natural') || t.includes('hoja') || t.includes('planta')) return Leaf
  if (t.includes('react') || t.includes('programación') || t.includes('académic') || t.includes('código')) return Atom
  return Award
}

interface EnfoqueClientProps {
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
  } | null
  goal: {
    id: string
    title: string
    category: 'Académico' | 'Salud' | 'Salud Mental' | 'Personal'
  } | null
  resources: any[]
  enfoque: {
    id: string
    title: string
    duration: number
    category: 'Académico' | 'Salud' | 'Salud Mental' | 'Personal'
    icon: string
  } | null
  instantComplete?: boolean
  isQuickFocus?: boolean
}

const MOTIVATIONAL_QUOTES = [
  "El secreto para avanzar es comenzar.",
  "Hazlo hoy, no mañana.",
  "Tu única limitación es tu mente.",
  "Pequeños pasos todos los días llevan a grandes resultados.",
  "Mantén el enfoque en tu meta, no en el obstáculo.",
  "Trabaja en silencio, deja que tu éxito haga el ruido.",
  "La concentración es la clave para la maestría."
]

export default function EnfoqueClient({
  task,
  goal,
  resources = [],
  enfoque,
  instantComplete = false,
  isQuickFocus = false
}: EnfoqueClientProps) {
  const router = useRouter()

  // Determine session properties
  const sessionTitle = isQuickFocus ? 'Enfoque Rápido' : (task?.title || enfoque?.title || 'Sesión de Enfoque Libre')
  const sessionCategory = isQuickFocus ? 'Personal' : (goal?.category || enfoque?.category || 'Personal')
  const sessionDurationMinutes = isQuickFocus ? 25 : (task?.estimated_time || enfoque?.duration || 25)
  const isMicroTask = isQuickFocus ? false : !!task

  // Navigation Steps: 'timer' | 'completed-form' | 'achievements' | 'quick-completed'
  const [currentStep, setCurrentStep] = useState<'timer' | 'completed-form' | 'achievements' | 'quick-completed'>(
    instantComplete ? 'completed-form' : 'timer'
  )

  // Timer States
  const [timeLeft, setTimeLeft] = useState(sessionDurationMinutes * 60)
  const [isRunning, setIsRunning] = useState(!instantComplete)
  const [quoteIndex, setQuoteIndex] = useState(0)

  // Questionnaire States
  const [completedStatus, setCompletedStatus] = useState<'si' | 'no'>('si')
  const [reflectionNotes, setReflectionNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Drawer (Guide & Resources) State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerTab, setDrawerTab] = useState<'guide' | 'resources'>('guide')

  // Emergency Exit State
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false)

  // Awarded achievements
  const [achievementsAwarded, setAchievementsAwarded] = useState<{
    logro: any | null
    insignia: any | null
  }>({ logro: null, insignia: null })

  // Experience (XP) State
  const [xpState, setXpState] = useState<{
    xpEarned: number
    newXp: number
    newLevel: number
    leveledUp: boolean
    xpNeededForNext: number
  } | null>(null)

  // Active achievement slide inside Step 3
  const [activeAchievementStep, setActiveAchievementStep] = useState<'logro' | 'insignia'>('logro')

  // Quote Rotator
  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length))
    const interval = setInterval(() => {
      setQuoteIndex(Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length))
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // Timer Tick
  useEffect(() => {
    if (currentStep !== 'timer' || !isRunning) return

    if (timeLeft <= 0) {
      setIsRunning(false)
      playCompletionSound()
      if (isQuickFocus) {
        setCurrentStep('quick-completed')
      } else {
        setCurrentStep('completed-form')
      }
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, isRunning, currentStep, isQuickFocus])

  // Redirect to inicio after completing quick focus
  useEffect(() => {
    if (currentStep === 'quick-completed') {
      const timer = setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [currentStep, router])

  // Play browser synthesizer completion sound
  const playCompletionSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const now = ctx.currentTime
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, start)
        
        gain.gain.setValueAtTime(0, start)
        gain.gain.linearRampToValueAtTime(0.15, start + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
        
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(start)
        osc.stop(start + duration)
      }
      
      playTone(523.25, now, 0.8) // C5
      playTone(659.25, now + 0.15, 0.8) // E5
      playTone(783.99, now + 0.3, 1.2) // G5
      playTone(1046.50, now + 0.45, 1.5) // C6
    } catch (e) {
      console.error(e)
    }
  }

  // Timer Formatter
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const totalSeconds = sessionDurationMinutes * 60
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100

  // Category Color Class Picker
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Académico':
        return {
          bg: 'bg-indigo-600',
          text: 'text-indigo-400',
          border: 'border-indigo-500/30',
          glow: 'shadow-[0_0_30px_rgba(99,102,241,0.25)]',
          badgeText: 'text-indigo-600',
          badgeBg: 'bg-indigo-50'
        }
      case 'Salud':
        return {
          bg: 'bg-emerald-600',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
          glow: 'shadow-[0_0_30px_rgba(16,185,129,0.25)]',
          badgeText: 'text-emerald-600',
          badgeBg: 'bg-emerald-50'
        }
      case 'Salud Mental':
        return {
          bg: 'bg-purple-600',
          text: 'text-purple-400',
          border: 'border-purple-500/30',
          glow: 'shadow-[0_0_30px_rgba(168,85,247,0.25)]',
          badgeText: 'text-purple-600',
          badgeBg: 'bg-purple-50'
        }
      default:
        return {
          bg: 'bg-amber-600',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
          glow: 'shadow-[0_0_30px_rgba(245,158,11,0.25)]',
          badgeText: 'text-amber-600',
          badgeBg: 'bg-amber-50'
        }
    }
  }

  const categoryColors = getCategoryColor(sessionCategory)

  // Submit focus session logic
  const handleSubmitSession = async () => {
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      // 1. Submit session completion (POST)
      const postResponse = await fetch('/api/sesiones/completar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          micro_tarea_id: isMicroTask ? task?.id : null,
          enfoque_id: !isMicroTask ? enfoque?.id : null,
          duration_minutes: sessionDurationMinutes,
          task_completed: completedStatus === 'si'
        })
      })

      if (!postResponse.ok) {
        throw new Error('Error al registrar la sesión.')
      }

      const postData = await postResponse.json()

      // 2. If reflection notes are provided and it's a micro-task, update them (PUT)
      if (isMicroTask && reflectionNotes.trim()) {
        const putResponse = await fetch('/api/sesiones/completar', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            micro_tarea_id: task?.id,
            notes: reflectionNotes
          })
        })
        if (!putResponse.ok) {
          console.error('Error saving reflection notes')
        }
      }

      const logoWon = postData.logroAwarded
      const insigniaWon = postData.insigniaAwarded

      setAchievementsAwarded({
        logro: logoWon || null,
        insignia: insigniaWon || null
      })

      if (postData.xpEarned) {
        setXpState({
          xpEarned: postData.xpEarned,
          newXp: postData.newXp,
          newLevel: postData.newLevel,
          leveledUp: postData.leveledUp,
          xpNeededForNext: postData.xpNeededForNext
        })
      }

      // 3. Always show the achievements/XP screen to give positive feedback on leveling up and XP!
      if (insigniaWon) {
        setActiveAchievementStep('insignia')
      } else {
        setActiveAchievementStep('logro')
      }
      setCurrentStep('achievements')
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Ocurrió un error al procesar el guardado.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle emergency unlock exit
  const handleEmergencyExit = () => {
    if (isQuickFocus) {
      router.push('/objetivos')
    } else if (isMicroTask && goal) {
      router.push(`/objetivos/${goal.id}/tareas/${task?.id}`)
    } else {
      router.push('/objetivos')
    }
  }

  return (
    <div className={`w-full min-h-screen overflow-x-hidden flex flex-col relative select-none font-sans transition-colors duration-500 ${
      currentStep === 'timer'
        ? 'bg-[#090A15] text-white'
        : currentStep === 'completed-form'
        ? 'bg-gradient-to-b from-[#F3F2FB] to-[#EAE9F5] text-slate-800'
        : currentStep === 'quick-completed'
        ? 'bg-[#090A15] text-white'
        : activeAchievementStep === 'insignia'
        ? 'bg-gradient-to-b from-[#F0FDF4] to-[#E6FFF6] text-slate-800'
        : 'bg-gradient-to-b from-[#F5F3FF] to-[#EBE9FE] text-slate-800'
    }`}>
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.92); opacity: 0; }
          50% { opacity: 0.45; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .pulse-ring-1 {
          animation: pulse-ring 3.5s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
        }
        .pulse-ring-2 {
          animation: pulse-ring 3.5s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
          animation-delay: 1.1s;
        }
        .pulse-ring-3 {
          animation: pulse-ring 3.5s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
          animation-delay: 2.2s;
        }
      `}</style>

      {/* ==========================================
          STEP 1: IMMERSIVE ACTIVE TIMER
          ========================================== */}
      {currentStep === 'timer' && (
        <div className="flex-1 flex flex-col justify-between px-6 py-8 relative">
          {/* Header pill lock status */}
          <div className="flex justify-center items-center mt-3">
            <div className="bg-white/5 border border-white/10 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                ENFOQUE ACTIVO
              </span>
            </div>
          </div>

          {/* Active task details */}
          <div className="text-center my-6 flex flex-col items-center">
            {goal && (
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400/80 mb-1">
                {goal.title}
              </span>
            )}
            <h1 className="text-2xl font-black tracking-tight max-w-[280px] leading-tight text-white/95 text-center">
              {sessionTitle}
            </h1>
          </div>

          {/* Glowing Neon Mint Countdown Timer Capsule */}
          <div className="flex justify-center my-4 relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[230px] h-[230px] rounded-full border-2 border-emerald-400/20 pulse-ring-1"></div>
              <div className="w-[230px] h-[230px] rounded-full border-2 border-purple-400/20 pulse-ring-2"></div>
              <div className="w-[230px] h-[230px] rounded-full border-2 border-indigo-400/10 pulse-ring-3"></div>
            </div>

            <div className="w-56 h-56 rounded-full bg-slate-950/80 border-4 border-emerald-500/25 flex flex-col items-center justify-center relative shadow-[0_0_50px_rgba(16,185,129,0.15)] z-10">
              <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[1.03]">
                <circle
                  cx="112"
                  cy="112"
                  r="108"
                  className="stroke-emerald-400 fill-none"
                  strokeWidth="4"
                  strokeDasharray="678"
                  strokeDashoffset={678 - (678 * progressPercent) / 100}
                  strokeLinecap="round"
                />
              </svg>

              <span className="text-5xl font-black tracking-tighter text-white font-mono z-20">
                {formatTime(timeLeft)}
              </span>

              <div className="flex items-center gap-4 mt-3.5 z-20">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
                >
                  {isRunning ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
                <button
                  onClick={() => setTimeLeft(sessionDurationMinutes * 60)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Motivational quote display */}
          <div className="text-center px-4 my-2 min-h-[50px] flex items-center justify-center">
            <p className="text-xs text-slate-400/90 font-semibold italic max-w-xs transition-opacity duration-500 leading-relaxed text-center">
              "{MOTIVATIONAL_QUOTES[quoteIndex]}"
            </p>
          </div>

          {/* Buttons panel */}
          <div className="flex flex-col gap-4 mt-6">
            {(isMicroTask || resources.length > 0) && (
              <div className="bg-white/5 border border-white/10 p-1.5 rounded-2xl flex items-center justify-between">
                {isMicroTask && (
                  <button
                    onClick={() => {
                      setDrawerTab('guide')
                      setIsDrawerOpen(true)
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 hover:bg-white/5 rounded-xl text-xs font-black tracking-wide text-indigo-200 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Ver Guía</span>
                  </button>
                )}
                {resources.length > 0 && (
                  <button
                    onClick={() => {
                      setDrawerTab('resources')
                      setIsDrawerOpen(true)
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 hover:bg-white/5 rounded-xl text-xs font-black tracking-wide text-indigo-200 transition-all cursor-pointer"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>Recursos</span>
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => {
                setIsRunning(false)
                playCompletionSound()
                if (isQuickFocus) {
                  setCurrentStep('quick-completed')
                } else {
                  setCurrentStep('completed-form')
                }
              }}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-extrabold tracking-widest uppercase transition-all duration-300 shadow-lg shadow-emerald-950/20 active:scale-[0.98] cursor-pointer"
            >
              Completar sesión
            </button>

            <div className="text-center">
              {!showEmergencyConfirm ? (
                <button
                  onClick={() => setShowEmergencyConfirm(true)}
                  className="text-[10px] font-black tracking-widest text-rose-500/80 hover:text-rose-400 uppercase py-2.5 cursor-pointer"
                >
                  DESBLOQUEO DE EMERGENCIA
                </button>
              ) : (
                <div className="bg-rose-950/40 border border-rose-900/40 rounded-2xl p-3 flex flex-col items-center gap-2.5">
                  <span className="text-[10px] text-rose-300 font-extrabold text-center">
                    ¿Seguro que deseas salir del enfoque? No se guardará el progreso.
                  </span>
                  <div className="flex items-center gap-3 w-full">
                    <button
                      onClick={() => setShowEmergencyConfirm(false)}
                      className="flex-1 py-1.5 bg-slate-900 border border-white/10 hover:bg-slate-800 text-[10px] font-extrabold rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleEmergencyExit}
                      className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-[10px] font-extrabold text-white rounded-lg cursor-pointer"
                    >
                      Salir ahora
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          STEP 2: SESIÓN COMPLETADA FEEDBACK FORM
          ========================================== */}
      {currentStep === 'completed-form' && (
        <div className="flex-1 flex flex-col px-6 py-8 justify-between max-w-md mx-auto w-full">
          <div className="flex flex-col items-center mt-8">
            <h2 className="text-[34px] font-black text-[#1E1B4B] tracking-tight leading-none text-center mb-2 animate-fade-in">
              Sesión completa
            </h2>
            <p className="text-xs font-black tracking-wide text-slate-400 text-center uppercase">
              Avanzaste con tu objetivo
            </p>
          </div>

          {/* Enfoque Total white rounded card */}
          <div className="w-full bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100/50 flex flex-col items-center justify-center my-6">
            <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
              ENFOQUE TOTAL
            </span>
            <span className="text-3xl font-black text-[#1E1B4B] mt-1">
              {sessionDurationMinutes} min
            </span>
          </div>

          {/* Option card list */}
          <div className="w-full mb-6 text-left">
            <h3 className="text-[13px] font-black tracking-wider uppercase text-[#1E1B4B] text-center mb-4">
              ¿Lograste terminar tu tarea?
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Option SÍ */}
              <button
                type="button"
                onClick={() => setCompletedStatus('si')}
                className={`flex flex-col items-center p-5 rounded-[24px] border transition-all duration-300 text-center cursor-pointer ${
                  completedStatus === 'si'
                    ? 'bg-white border-[#10B981] shadow-[0_8px_30px_rgba(16,185,129,0.08)] scale-[1.02]'
                    : 'bg-white/40 border-slate-200/50 opacity-60 hover:opacity-80'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${
                  completedStatus === 'si' ? 'bg-[#D1FAE5] text-[#10B981]' : 'bg-slate-100 text-slate-400'
                }`}>
                  <svg className="w-4.5 h-4.5 fill-none stroke-current" strokeWidth="3" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-sm font-black text-[#1E1B4B]">
                  Sí
                </span>
                <span className="text-[9px] text-slate-400 font-extrabold mt-1 uppercase tracking-wide">
                  Meta alcanzada
                </span>
              </button>

              {/* Option NO DEL TODO */}
              <button
                type="button"
                onClick={() => setCompletedStatus('no')}
                className={`flex flex-col items-center p-5 rounded-[24px] border transition-all duration-300 text-center cursor-pointer ${
                  completedStatus === 'no'
                    ? 'bg-white border-[#4F46E5] shadow-[0_8px_30px_rgba(79,70,229,0.08)] scale-[1.02]'
                    : 'bg-white/40 border-slate-200/50 opacity-60 hover:opacity-80'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${
                  completedStatus === 'no' ? 'bg-[#E0E7FF] text-[#4F46E5]' : 'bg-slate-100 text-slate-400'
                }`}>
                  <svg className="w-4.5 h-4.5 fill-none stroke-current" strokeWidth="3" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
                <span className="text-sm font-black text-[#1E1B4B] whitespace-nowrap">
                  No del todo
                </span>
                <span className="text-[9px] text-slate-400 font-extrabold mt-1 uppercase tracking-wide">
                  Hay pendientes
                </span>
              </button>
            </div>
          </div>

          {/* Reflection box */}
          <div className="w-full mb-8 text-left">
            <h3 className="text-[13px] font-black tracking-wider uppercase text-[#1E1B4B] text-center mb-3">
              ¿Qué aprendiste o qué lograste en esta sesión?
            </h3>
            
            <div className="relative bg-[#EAE9F2] rounded-[24px] p-5 shadow-inner">
              <textarea
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                placeholder="(opcional) Escribe un pensamiento breve..."
                className="w-full h-24 bg-transparent border-none text-slate-800 placeholder-slate-400 text-xs font-semibold focus:outline-none resize-none leading-relaxed"
              />
              <div className="absolute bottom-4 right-4">
                <svg className="w-4.5 h-4.5 text-slate-400 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-rose-100 border border-rose-200 p-3.5 rounded-2xl flex items-start gap-2.5 mb-5 text-left">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="text-xs text-rose-700 font-bold">{errorMsg}</span>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={handleSubmitSession}
            disabled={isSubmitting}
            className="w-full py-4 bg-[#312E81] hover:bg-[#252361] disabled:opacity-50 text-white rounded-2xl text-xs font-black tracking-widest uppercase transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            {isSubmitting ? 'Guardando...' : 'Continuar'}
          </button>
        </div>
      )}

      {/* ==========================================
          STEP 3: LOGRO O INSIGNIA OBTENIDA SHOWCASE
          ========================================== */}
      {currentStep === 'achievements' && (() => {
        const BadgeIcon = getBadgeIcon(achievementsAwarded.insignia?.title || '')
        const isBadge = activeAchievementStep === 'insignia'
        const hasLogro = !!achievementsAwarded.logro
        
        return (
          <div className="flex-1 flex flex-col justify-between px-6 py-12 relative">
            {/* Particles */}
            {isBadge ? (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-[#6FFBBE] rounded-full opacity-40 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-emerald-400 rounded-full opacity-50 animate-ping" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-teal-400 rounded-full opacity-40 animate-ping" style={{ animationDuration: '5s' }} />
              </div>
            ) : (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-indigo-400 rounded-full opacity-40 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-purple-400 rounded-full opacity-50 animate-ping" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-indigo-300 rounded-full opacity-40 animate-ping" style={{ animationDuration: '5s' }} />
              </div>
            )}

            <div className="text-center mt-4">
              {isBadge ? (
                <span className="inline-block text-[10px] font-black text-emerald-950 bg-[#6FFBBE] px-4 py-1.5 rounded-full border border-emerald-300 uppercase tracking-widest animate-bounce">
                  🌟 ¡RECOMPENSA OBTENIDA!
                </span>
              ) : (
                <span className="inline-block text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-200/50 uppercase tracking-widest animate-bounce">
                  🌟 ¡SESIÓN FINALIZADA!
                </span>
              )}
            </div>

            {/* Glowing Rings and Center Icon */}
            <div className="flex justify-center items-center my-6 relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {isBadge ? (
                  <>
                    <div className="w-[280px] h-[280px] rounded-full bg-[#6FFBBE]/5 border border-[#6FFBBE]/20 pulse-ring-1"></div>
                    <div className="w-[230px] h-[230px] rounded-full bg-[#6FFBBE]/10 border border-[#6FFBBE]/30 pulse-ring-2"></div>
                    <div className="w-[180px] h-[180px] rounded-full bg-[#6FFBBE]/25 border border-[#6FFBBE]/40 pulse-ring-3"></div>
                  </>
                ) : (
                  <>
                    <div className="w-[280px] h-[280px] rounded-full bg-indigo-500/5 border border-indigo-400/15 pulse-ring-1"></div>
                    <div className="w-[230px] h-[230px] rounded-full bg-indigo-500/10 border border-indigo-400/20 pulse-ring-2"></div>
                    <div className="w-[180px] h-[180px] rounded-full bg-indigo-500/15 border border-indigo-400/25 pulse-ring-3"></div>
                  </>
                )}
              </div>

              {isBadge ? (
                <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-emerald-600 to-[#6FFBBE] flex flex-col items-center justify-center relative shadow-[0_12px_45px_rgba(110,251,190,0.45)] z-10 border border-[#6FFBBE]/40 animate-pulse">
                  <div className="bg-emerald-950/30 p-5 rounded-full border border-[#6FFBBE]/40 shadow-inner">
                    <BadgeIcon className="w-14 h-14 text-white animate-bounce" style={{ animationDuration: '3s' }} />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
                  </div>
                </div>
              ) : (
                <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex flex-col items-center justify-center relative shadow-[0_12px_40px_rgba(99,102,241,0.25)] z-10 border border-indigo-300/30 animate-pulse">
                  <div className="bg-indigo-950/20 p-5 rounded-full border border-indigo-300/20 shadow-inner">
                    {hasLogro ? (
                      <Trophy className="w-14 h-14 text-yellow-300 animate-bounce" style={{ animationDuration: '3s' }} />
                    ) : (
                      <Sparkles className="w-14 h-14 text-indigo-200 animate-pulse" />
                    )}
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Texts */}
            <div className="text-center px-4 max-w-sm mx-auto">
              <h3 className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${isBadge ? 'text-emerald-700' : 'text-indigo-600'}`}>
                {isBadge 
                  ? 'Insignia de Objetivo' 
                  : hasLogro 
                  ? 'Logro de Micro-tarea' 
                  : 'Foco Diario'}
              </h3>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight mb-3">
                {isBadge
                  ? achievementsAwarded.insignia?.title || 'Insignia de Objetivo'
                  : hasLogro
                  ? achievementsAwarded.logro?.title || 'Logro Obtenido'
                  : sessionTitle}
              </h1>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-6">
                {isBadge
                  ? achievementsAwarded.insignia?.description || '¡Completaste el 100% de las tareas de tu objetivo!'
                  : hasLogro
                  ? achievementsAwarded.logro?.description || 'Has completado con éxito la micro-tarea y obtenido esta recompensa.'
                  : '¡Sesión de enfoque completada con éxito! Has acumulado valiosos minutos de concentración.'}
              </p>

              {/* XP Progress Bar Section */}
              {xpState && (
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-slate-100 shadow-sm mb-6 text-left">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Progreso de Experiencia
                    </span>
                    <span className={`text-[11px] font-extrabold ${isBadge ? 'text-emerald-600' : 'text-indigo-600'}`}>
                      {xpState.newXp} / {xpState.xpNeededForNext} XP
                    </span>
                  </div>
                  
                  {/* Progress bar container */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isBadge ? 'bg-gradient-to-r from-emerald-400 to-[#6FFBBE]' : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                      }`}
                      style={{ width: `${(xpState.newXp / xpState.xpNeededForNext) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-800">
                        Nivel {xpState.newLevel}
                      </span>
                      {xpState.leveledUp && (
                        <span className="inline-block text-[9px] font-black text-white bg-amber-500 px-2 py-0.5 rounded-full animate-bounce uppercase tracking-wide">
                          ¡Subiste de Nivel! 🌟
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      +{xpState.xpEarned} XP
                    </span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {!isBadge && achievementsAwarded.insignia ? (
                <button
                  onClick={() => setActiveAchievementStep('insignia')}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-extrabold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/15 active:scale-[0.98]"
                >
                  <span>Ver Insignia Ganada</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : isBadge ? (
                <button
                  onClick={() => {
                    if (isMicroTask && goal) {
                      router.push(`/objetivos/${goal.id}`)
                    } else {
                      router.push('/objetivos')
                    }
                    router.refresh()
                  }}
                  className="w-full py-4 bg-[#6FFBBE] hover:bg-[#5ce1ab] text-emerald-950 rounded-2xl text-xs font-black tracking-widest uppercase transition-all cursor-pointer shadow-lg shadow-[#6FFBBE]/20 active:scale-[0.98]"
                >
                  Volver a Objetivos
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (isMicroTask && goal) {
                      router.push(`/objetivos/${goal.id}`)
                    } else {
                      router.push('/objetivos')
                    }
                    router.refresh()
                  }}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-extrabold tracking-widest uppercase transition-all cursor-pointer shadow-lg shadow-indigo-600/15 active:scale-[0.98]"
                >
                  Volver a Objetivos
                </button>
              )}
            </div>
          </div>
        )
      })()}

      {/* ==========================================
          STEP 4: QUICK FOCUS COMPLETED LANDING SCREEN
          ========================================== */}
      {currentStep === 'quick-completed' && (
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 text-center bg-gradient-to-b from-[#181232] to-[#0A0718] text-white animate-fade-in">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-indigo-400 rounded-full opacity-35 animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-purple-400 rounded-full opacity-40 animate-ping" style={{ animationDuration: '4s' }}></div>
          </div>
          
          <div className="w-20 h-20 rounded-full bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
            <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse" />
          </div>

          <h1 className="text-xl font-bold tracking-tight leading-relaxed text-white max-w-sm whitespace-pre-line">
            {"el momento de foco termino\n ahora regresaras al inicio"}
          </h1>

          <div className="mt-8 flex items-center gap-2 text-indigo-400/80 text-xs font-black tracking-widest uppercase animate-pulse">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <span>Redirigiendo...</span>
          </div>
        </div>
      )}

      {/* Drawer layout (VAUL DRAWER) */}
      <Drawer.Root
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" />
          <Drawer.Content className="w-full max-h-[85vh] bg-[#0E1020] border-t border-white/10 rounded-t-[32px] overflow-hidden flex flex-col fixed bottom-0 left-0 right-0 outline-none z-50 max-w-md mx-auto shadow-2xl">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex gap-4">
                {isMicroTask && (
                  <button
                    onClick={() => setDrawerTab('guide')}
                    className={`text-xs font-black tracking-wide uppercase pb-1.5 border-b-2 transition-all ${
                      drawerTab === 'guide' ? 'text-white border-purple-500' : 'text-slate-400 border-transparent'
                    }`}
                  >
                    Guía de Ejecución
                  </button>
                )}
                {resources.length > 0 && (
                  <button
                    onClick={() => setDrawerTab('resources')}
                    className={`text-xs font-black tracking-wide uppercase pb-1.5 border-b-2 transition-all ${
                      drawerTab === 'resources' ? 'text-white border-purple-500' : 'text-slate-400 border-transparent'
                    }`}
                  >
                    Recursos
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 pb-12">
              {drawerTab === 'guide' && isMicroTask && (
                <div className="space-y-5">
                  <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-2xl p-4 flex items-start gap-2.5">
                    <Sparkles className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-[10px] font-black text-emerald-400 tracking-wider uppercase">
                        Generado por Inteligencia Artificial
                      </h5>
                      <p className="text-[11px] text-slate-300 font-semibold leading-relaxed mt-0.5">
                        Esta guía paso a paso te ayudará a mantener el foco y completar la micro-tarea con éxito.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(() => {
                      const displaySteps = task?.guide_steps && task.guide_steps.length > 0
                        ? task.guide_steps
                        : [
                            'Identifica la lógica principal y los requisitos de la tarea.',
                            'Divide la ejecución en pequeños pasos y trabaja de forma incremental.',
                            'Realiza pruebas locales para validar que el resultado funciona según lo esperado.'
                          ]
                      return displaySteps.map((step, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="w-6 h-6 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/20 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                            {step}
                          </p>
                        </div>
                      ))
                    })()}
                  </div>
                </div>
              )}

              {drawerTab === 'resources' && (
                <div className="space-y-3">
                  {resources.length > 0 ? (
                    resources.map((res) => (
                      <a
                        key={res.id}
                        href={res.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-between border border-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-3.5 overflow-hidden mr-2">
                          <div className="w-9 h-9 rounded-xl bg-purple-950 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/20">
                            {res.title.toLowerCase().endsWith('.pdf') ? (
                              <FileText className="w-4.5 h-4.5" />
                            ) : (
                              <LinkIcon className="w-4.5 h-4.5" />
                            )}
                          </div>
                          <div className="truncate">
                            <h5 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                              {res.title}
                            </h5>
                            <span className="text-[9px] text-slate-400 font-extrabold block mt-0.5 uppercase tracking-wide">
                              {res.title.toLowerCase().endsWith('.pdf') ? 'PDF • 2.4 MB' : 'URL EXTERNA'}
                            </span>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
                      </a>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-4">No hay recursos adjuntos para esta sesión.</p>
                  )}
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}
