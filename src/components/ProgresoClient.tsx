'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart2,
  Flame,
  Trophy,
  Zap,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Star,
  Target,
  Clock,
  Sparkles,
  Brain,
  Compass,
} from 'lucide-react'
import BottomNav from './BottomNav'
import Link from 'next/link'

// ─── Category color helpers ────────────────────────────────────────────────
const categoryColor: Record<string, string> = {
  'Académico':    'bg-indigo-500',
  'Salud':        'bg-emerald-500',
  'Salud Mental': 'bg-violet-500',
  'Personal':     'bg-amber-500',
}
const categoryColorLight: Record<string, string> = {
  'Académico':    'bg-indigo-50 text-indigo-700',
  'Salud':        'bg-emerald-50 text-emerald-700',
  'Salud Mental': 'bg-violet-50 text-violet-700',
  'Personal':     'bg-amber-50 text-amber-700',
}

// ─── Props ────────────────────────────────────────────────────────────────
interface ProgresoClientProps {
  userName: string
  avatarUrl: string | null
  // today
  focusPercent: number
  totalMinutesToday: number
  totalDailyTarget: number
  remainingMinutes: number
  categoryStats: { category: string; doneMin: number; targetMin: number; percent: number }[]
  nextTask: { id: string; title: string; goalId: string; scheduledTime: string | null; estimatedTime: number } | null
  nextTaskGoalTitle: string | null
  rachadays: number
  completedTasksCount: number
  // historical
  weeklyData: { day: string; minutes: number }[]
  weekTrend: number
  thisWeekMin: number
  rankPercentile: number
  earnedInsignias: { id: string; title: string; description: string }[]
  earnedLogros: { id: string; title: string; description: string; category: string }[]
  historicCategoryStats: { category: string; avgProgress: number }[]
  focusHours: number
  level: number
}

// ─── Weekly Bar Chart (SVG) ────────────────────────────────────────────────
function WeeklyBarChart({ data }: { data: { day: string; minutes: number }[] }) {
  const maxMin = Math.max(...data.map(d => d.minutes), 30)
  const chartH = 90
  const barW = 28
  const gap = 10
  const totalW = data.length * (barW + gap) - gap

  return (
    <svg width="100%" viewBox={`0 0 ${totalW} ${chartH + 24}`} className="overflow-visible">
      {data.map((d, i) => {
        const barH = Math.max(4, (d.minutes / maxMin) * chartH)
        const x = i * (barW + gap)
        const y = chartH - barH
        const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
        const highlight = i === todayIdx
        return (
          <g key={d.day}>
            <rect
              x={x} y={y} width={barW} height={barH}
              rx={8}
              fill={highlight ? '#6d5adb' : '#e8e5f7'}
            />
            {d.minutes > 0 && (
              <text
                x={x + barW / 2} y={y - 5}
                textAnchor="middle"
                fontSize="8"
                fill={highlight ? '#6d5adb' : '#94a3b8'}
                fontWeight="700"
              >
                {d.minutes}m
              </text>
            )}
            <text
              x={x + barW / 2} y={chartH + 16}
              textAnchor="middle"
              fontSize="9"
              fill={highlight ? '#6d5adb' : '#94a3b8'}
              fontWeight={highlight ? '800' : '600'}
            >
              {d.day}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Ring component ────────────────────────────────────────────────────────
function FocusRing({ percent }: { percent: number }) {
  const size = 180
  const strokeW = 14
  const radius = (size - strokeW) / 2
  const circ = 2 * Math.PI * radius
  const offset = circ - (percent / 100) * circ

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} stroke="#e8e5f7" strokeWidth={strokeW} fill="none" />
      <circle
        cx={size/2} cy={size/2} r={radius}
        stroke="#34e8ac"
        strokeWidth={strokeW}
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  )
}

// ─── Insignia icon helper ──────────────────────────────────────────────────
function getInsigniaIcon(title: string) {
  const t = title.toLowerCase()
  if (t.includes('react') || t.includes('lógica') || t.includes('arquitecto')) return Compass
  if (t.includes('salud') || t.includes('serena') || t.includes('mente')) return Brain
  return Trophy
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function ProgresoClient({
  userName, avatarUrl,
  focusPercent, totalMinutesToday, totalDailyTarget, remainingMinutes,
  categoryStats, nextTask, nextTaskGoalTitle, rachadays, completedTasksCount,
  weeklyData, weekTrend, thisWeekMin, rankPercentile, earnedInsignias, earnedLogros,
  historicCategoryStats, focusHours, level,
}: ProgresoClientProps) {
  const [activeView, setActiveView] = useState<'hoy' | 'historico'>('hoy')
  const router = useRouter()

  // Pre-populate with beautiful default demo accomplishments if they are empty
  const insigniasToShow = (earnedInsignias.length > 0
    ? earnedInsignias
    : [{ id: 'mock-insignia-1', title: 'El mero mero de React', description: '¡Felicidades! Has dominado el desarrollo de componentes, hooks avanzados y optimización de rendimiento en React.' }]
  ).slice(0, 2)

  const logrosToShow = (earnedLogros.length > 0
    ? earnedLogros
    : [{ id: 'mock-logro-1', title: 'Arquitecto de Lógica', description: 'Por diseñar arquitecturas de código estructuradas y limpias.', category: 'Académico' }]
  ).slice(0, 2)

  const contextMessage = (() => {
    if (focusPercent >= 100) return '🎉 ¡Lograste tu meta diaria! Descansa y recarga.'
    if (focusPercent >= 75) return `Estás en un <span class="text-[#6d5adb] font-black">estado óptimo</span>. Solo te faltan ${remainingMinutes} min para tu meta diaria.`
    if (focusPercent >= 40) return `Vas bien. Necesitas <span class="font-black text-indigo-800">${remainingMinutes} min</span> más hoy.`
    return `Empieza tu sesión. Tu meta es <span class="font-black text-indigo-800">${totalDailyTarget} min</span> hoy.`
  })()

  const rankLabel = (() => {
    if (rankPercentile <= 5) return 'Top 5%'
    if (rankPercentile <= 10) return 'Top 10%'
    if (rankPercentile <= 25) return 'Top 25%'
    if (rankPercentile <= 50) return 'Top 50%'
    return 'En progreso'
  })()

  return (
    <div className="min-h-screen bg-[#f5f4fc] max-w-md mx-auto flex flex-col pb-24">

      {/* HEADER SECTION */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 sticky top-0 z-40 w-full">
        <h1 className="text-lg font-bold text-slate-800 text-left">Progreso</h1>

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

      {/* Tab Toggle */}
      <div className="px-5 mb-5">
        <p className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase mb-3">PROGRESO</p>
        <div className="flex gap-2">
          {(['hoy', 'historico'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveView(tab)}
              className={`px-5 py-2 rounded-full text-xs font-black transition-all ${
                activeView === tab
                  ? 'bg-indigo-950 text-white shadow-md'
                  : 'bg-white text-slate-400 border border-slate-100'
              }`}
            >
              {tab === 'hoy' ? 'Hoy' : 'Histórico'}
            </button>
          ))}
        </div>
      </div>

      {/* ════════════ HOY VIEW ════════════ */}
      {activeView === 'hoy' && (
        <div className="px-5 space-y-4 animate-fade-in">

          {/* Focus Ring Card */}
          <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-100/60 flex flex-col items-center">
            <div className="relative flex items-center justify-center mb-4">
              <FocusRing percent={focusPercent} />
              <div className="absolute flex flex-col items-center">
                <span className="text-[38px] font-black text-indigo-950 leading-none">{focusPercent}%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Flujo Logrado</span>
              </div>
            </div>
            <p
              className="text-center text-sm text-slate-500 font-medium leading-relaxed max-w-[85%]"
              dangerouslySetInnerHTML={{ __html: contextMessage }}
            />
          </div>

          {/* Suggestion */}
          {nextTask && (
            <div>
              <p className="text-[13px] font-black text-indigo-800 mb-0.5">Sugerencias para acabar hoy</p>
              <p className="text-[10px] text-slate-400 font-medium mb-2">Avanza con estas micro tareas</p>
              <div
                onClick={() => router.push(`/objetivos/${nextTask.goalId}/tareas/${nextTask.id}`)}
                className="bg-white rounded-[20px] p-4 flex items-center justify-between border border-slate-100/60 shadow-sm cursor-pointer active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-indigo-950 leading-tight line-clamp-1">{nextTask.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      ⏱ {nextTask.scheduledTime || '16:00'} · {nextTask.estimatedTime} min
                    </p>
                  </div>
                </div>
                <button className="shrink-0 text-xs font-black px-4 py-2 bg-[#34e8ac] text-indigo-950 rounded-xl">
                  Empezar
                </button>
              </div>
            </div>
          )}

          {/* Categories */}
          {categoryStats.length > 0 && (
            <div className="bg-white rounded-[24px] p-5 border border-slate-100/60 shadow-sm">
              <h3 className="text-[16px] font-black text-indigo-950 mb-4">Categorías</h3>
              <div className="space-y-4">
                {categoryStats.map(cat => (
                  <div key={cat.category}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-bold text-indigo-950">{cat.category}</span>
                      <span className="text-[11px] font-extrabold text-slate-400">
                        {cat.doneMin}min → {cat.targetMin}min
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${categoryColor[cat.category] || 'bg-indigo-500'}`}
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Streak Bonus */}
          <div className="bg-white rounded-[24px] p-5 border border-slate-100/60 shadow-sm">
            <h3 className="text-[16px] font-black text-indigo-950 mb-3">Ajustes de Comportamiento</h3>
            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-2xl mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-400 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-wider">BONO DE RACHA</p>
                <p className="text-[15px] font-black text-emerald-800">
                  {rachadays >= 7 ? '+15%' : rachadays >= 3 ? '+10%' : '+5%'} Multiplicador
                </p>
                <p className="text-[10px] text-emerald-600 font-bold">{completedTasksCount} micro tareas completadas</p>
              </div>
            </div>
            <button className="w-full py-3 bg-indigo-950 text-white text-sm font-black rounded-2xl flex items-center justify-center gap-2">
              Ver sugerencias de flujo
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ════════════ HISTÓRICO VIEW ════════════ */}
      {activeView === 'historico' && (
        <div className="px-5 space-y-4 animate-fade-in">

          {/* Weekly Chart Card */}
          <div className="bg-white rounded-[28px] p-5 border border-slate-100/60 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Ver gráfica general</p>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> OPTIMIZADO
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-[15px] font-black text-indigo-950">Tendencia Semanal</h3>
            </div>
            <p className="text-sm text-slate-400 mb-3 font-medium">
              {weekTrend >= 0
                ? `Has mejorado un `
                : `Bajaste un `}
              <span className={`font-black ${weekTrend >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {Math.abs(weekTrend)}%
              </span>
              {' vs la semana anterior'}
              {weekTrend >= 0
                ? <TrendingUp className="inline w-3.5 h-3.5 ml-1 text-emerald-600" />
                : <TrendingDown className="inline w-3.5 h-3.5 ml-1 text-rose-500" />}
            </p>
            <WeeklyBarChart data={weeklyData} />
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-indigo-950 rounded-[22px] p-4 flex flex-col gap-1">
              <Clock className="w-5 h-5 text-indigo-400 mb-1" />
              <span className="text-[36px] font-black text-white leading-none">{rachadays}</span>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider leading-tight">Días de racha cumpliendo objetivos</span>
            </div>
            <div className="bg-emerald-400 rounded-[22px] p-4 flex flex-col gap-1">
              <Trophy className="w-5 h-5 text-emerald-900 mb-1" />
              <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider">GLOBAL</span>
              <span className="text-[32px] font-black text-emerald-950 leading-none">{rankLabel}</span>
            </div>
          </div>

          {/* Earned Badges & Achievements (Insignias vs. Logros) */}
          <div className="space-y-3">
            {insigniasToShow.map(insignia => {
              const InsigniaIcon = getInsigniaIcon(insignia.title)
              return (
                <div
                  key={insignia.id}
                  className="relative overflow-hidden rounded-[28px] p-5 flex items-center gap-4 text-left border border-white/50 shadow-[0_8px_30px_rgba(95,73,224,0.12)] transition-all hover:shadow-[0_10px_35px_rgba(95,73,224,0.16)] w-full"
                  style={{ background: 'radial-gradient(120% 120% at 20% 20%, #E5DEFF 0%, #CBBFFF 100%)' }}
                >
                  {/* Giant Faint Trophy Outline Watermark */}
                  <Trophy className="absolute right-[-15px] bottom-[-25px] w-36 h-36 text-[#5f49e0]/[0.08] stroke-[1.2] pointer-events-none select-none" />

                  {/* Left Circle White Icon Container */}
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm relative z-10">
                    <InsigniaIcon className="w-5.5 h-5.5 text-[#5F49E0]" />
                  </div>

                  {/* Middle Content */}
                  <div className="relative z-10 flex-1">
                    <p className="text-[10px] font-bold text-[#5F49E0] uppercase tracking-widest leading-none mb-1.5">INSIGNIA</p>
                    <h4 className="text-[17px] font-black text-[#1E0A6C] tracking-tight leading-tight">{insignia.title}</h4>
                    {insignia.description && (
                      <p className="text-[11px] text-[#4d3ca6] font-semibold leading-tight mt-1.5 max-w-[85%]">{insignia.description}</p>
                    )}
                  </div>
                </div>
              )
            })}

            {logrosToShow.map(logro => (
              <div key={logro.id} className="bg-[#EAE6F9] rounded-[24px] p-5 flex items-center gap-4 text-indigo-950 border border-indigo-100/50 shadow-sm text-left">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm">
                  <Compass className="w-6 h-6 text-[#5f49e0]" />
                </div>
                <div>
                  <p className="text-[9px] font-extrabold text-[#5f49e0] uppercase tracking-widest leading-none mb-1.5">LOGRO</p>
                  <p className="text-[16px] font-black tracking-tight text-[#1E1B4B]">{logro.title}</p>
                  {logro.description && (
                    <p className="text-[11px] text-slate-500 font-medium leading-tight mt-1">{logro.description}</p>
                  )}
                </div>
              </div>
            ))}

            {/* View all button */}
            <button
              onClick={() => router.push('/progreso/insignias')}
              className="w-full py-4 mt-2 border-2 border-dashed border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50 bg-white text-[#5f49e0] font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Ver todas las insignias y logros</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Historic Categories */}
          {historicCategoryStats.length > 0 && (
            <div className="bg-white rounded-[24px] p-5 border border-slate-100/60 shadow-sm">
              <h3 className="text-[15px] font-black text-indigo-950 mb-1">Desglose por Categoría</h3>
              <p className="text-[10px] text-slate-400 font-medium mb-4">que tanto avanzas en tu objetivo</p>
              <div className="space-y-4">
                {historicCategoryStats.map(cat => (
                  <div key={cat.category}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] ${categoryColorLight[cat.category] || 'bg-indigo-50 text-indigo-700'}`}>
                          {/* {cat.category === 'Académico' ? '📚' : cat.category === 'Salud' ? '💚' : cat.category === 'Personal' ? '🎯' : '🧠'} */}
                        </span>
                        <span className="text-sm font-bold text-indigo-950">{cat.category}</span>
                      </div>
                      <span className="text-[13px] font-black text-indigo-950">{cat.avgProgress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${categoryColor[cat.category] || 'bg-indigo-500'}`}
                        style={{ width: `${cat.avgProgress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Static Insight Cards */}
          <div className="bg-indigo-950 rounded-[24px] p-5 text-white">
            <h3 className="text-[15px] font-black mb-1">Siempre Puedes Cambiar</h3>
            <p className="text-[11px] text-indigo-300 mb-4 leading-relaxed">
              Según nuestro análisis, te has dejado de enfocar en tus objetivos. Usa nuestras herramientas para la salud como siempre prometiste.
            </p>
            <button className="w-full py-2.5 bg-white text-indigo-950 text-xs font-black rounded-xl mb-2">Realizar cuestionario</button>
            <button className="w-full py-2.5 bg-indigo-800 text-white text-xs font-black rounded-xl mb-3">Optimizar horarios</button>
            <button className="text-[10px] text-indigo-400 font-bold mx-auto block">Dejar de mostrar esto</button>
          </div>

          <div className="bg-white rounded-[24px] p-5 border border-slate-100/60 shadow-sm">
            <h3 className="text-[15px] font-black text-indigo-950 mb-1">Tu Mejor Momento</h3>
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              Según nuestro análisis, eres más productiva los Martes a las 11:00 AM
            </p>
            <button className="w-full py-2.5 bg-indigo-950 text-white text-xs font-black rounded-xl mb-3">Optimizar horarios</button>
            <button className="text-[10px] text-slate-400 font-bold mx-auto block">Dejar de mostrar esto</button>
          </div>

        </div>
      )}

      <BottomNav activeTab="progreso" />
    </div>
  )
}
