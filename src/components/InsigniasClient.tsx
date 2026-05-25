'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Trophy,
  Award,
  Sparkles,
  Brain,
  Compass,
  Zap,
  Target,
  Clock,
  Atom,
  Dumbbell,
  Leaf
} from 'lucide-react'
import BottomNav from './BottomNav'

interface InsigniaItem {
  id: string
  title: string
  description: string
  createdAt?: string | null
}

interface LogroItem {
  id: string
  title: string
  description: string
  category: string
  createdAt?: string | null
}

interface InsigniasClientProps {
  userName: string
  avatarUrl: string | null
  earnedInsignias: InsigniaItem[]
  earnedLogros: LogroItem[]
}

// Icon helper for badges/insignias
function getInsigniaIcon(title: string) {
  const t = title.toLowerCase()
  if (t.includes('react') || t.includes('lógica') || t.includes('arquitecto') || t.includes('código')) return Compass
  if (t.includes('salud') || t.includes('serena') || t.includes('mente')) return Brain
  return Trophy
}

// Icon helper for achievements/logros
function getLogroIcon(category: string) {
  const c = category.toLowerCase()
  if (c.includes('acadé') || c.includes('academic') || c.includes('logica')) return Atom
  if (c.includes('salud') || c.includes('ejercicio') || c.includes('deporte')) return Dumbbell
  if (c.includes('mente') || c.includes('mental')) return Brain
  return Leaf
}

export default function InsigniasClient({
  userName,
  avatarUrl,
  earnedInsignias = [],
  earnedLogros = [],
}: InsigniasClientProps) {
  const router = useRouter()

  // Full default lists if database records are empty
  const insigniasToShow = earnedInsignias.length > 0
    ? earnedInsignias
    : [
        {
          id: 'mock-insignia-1',
          title: 'El mero mero de React',
          description: '¡Felicidades! Has dominado el desarrollo de componentes, hooks avanzados y optimización de rendimiento en React.',
        },
        {
          id: 'mock-insignia-2',
          title: 'Mente Serena',
          description: 'Por acumular 10 horas de enfoque en la categoría de Salud Mental con éxito continuo.',
        },
        {
          id: 'mock-insignia-3',
          title: 'Campeón de Racha',
          description: 'Por mantener una racha impecable de objetivos diarios completados durante 7 días.',
        }
      ]

  const logrosToShow = earnedLogros.length > 0
    ? earnedLogros
    : [
        {
          id: 'mock-logro-1',
          title: 'Arquitecto de Lógica',
          description: 'Por diseñar arquitecturas de código estructuradas y limpias en tus proyectos académicos.',
          category: 'Académico'
        },
        {
          id: 'mock-logro-2',
          title: 'Primer Paso',
          description: 'Por completar tu primera micro-tarea diaria de enfoque.',
          category: 'Personal'
        },
        {
          id: 'mock-logro-3',
          title: 'Rutina de Hierro',
          description: 'Completaste 5 sesiones de salud física de manera exitosa esta semana.',
          category: 'Salud'
        }
      ]

  return (
    <div className="min-h-screen bg-[#f5f4fc] max-w-md mx-auto flex flex-col pb-24 text-left">
      {/* HEADER SECTION */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 sticky top-0 z-40 w-full">
        <button
          onClick={() => router.push('/progreso')}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-indigo-950" />
          <span>Volver</span>
        </button>
        <h1 className="text-sm font-black text-slate-800 tracking-tight select-none">Logros e Insignias</h1>
        <div className="w-10 h-10 flex items-center justify-end">
          <div className="w-7 h-7 rounded-full overflow-hidden border border-indigo-100 bg-slate-200">
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center font-black text-[10px] text-indigo-900">{userName.charAt(0)}</span>
            )}
          </div>
        </div>
      </header>

      {/* BODY CONTENT */}
      <div className="px-5 py-6 space-y-6 animate-fade-in">
        
        {/* Welcome Section */}
        <div>
          <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
            Historial de Galardones
          </span>
          <h2 className="text-2xl font-black text-indigo-950 tracking-tight leading-tight">
            Colección de {userName}
          </h2>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">
            Visualiza todas tus insignias de honor y logros que has desbloqueado en tu camino.
          </p>
        </div>

        {/* Insignias Section */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 bg-yellow-100 text-yellow-700 rounded-lg">
              <Award className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-base font-black text-indigo-950">Insignias de Honor ({insigniasToShow.length})</h3>
          </div>

          <div className="flex flex-col gap-3">
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
                    <p className="text-[10px] font-bold text-[#5F49E0] uppercase tracking-widest leading-none mb-1.5">INSIGNIA DE HONOR</p>
                    <h4 className="text-[17px] font-black text-[#1E0A6C] tracking-tight leading-tight">{insignia.title}</h4>
                    {insignia.description && (
                      <p className="text-[11px] text-[#4d3ca6] font-semibold leading-tight mt-1.5 max-w-[90%]">{insignia.description}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Logros Section */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 bg-indigo-100 text-[#5f49e0] rounded-lg">
              <Trophy className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-base font-black text-indigo-950">Logros Obtenidos ({logrosToShow.length})</h3>
          </div>

          <div className="flex flex-col gap-3">
            {logrosToShow.map(logro => {
              const LogroIcon = getLogroIcon(logro.category)
              return (
                <div 
                  key={logro.id} 
                  className="bg-[#EAE6F9] rounded-[24px] p-5 flex items-center gap-4 text-indigo-950 border border-indigo-100/50 shadow-sm text-left relative overflow-hidden"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm">
                    <LogroIcon className="w-6 h-6 text-[#5f49e0]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-extrabold text-[#5f49e0] uppercase tracking-widest leading-none mb-1.5">
                      LOGRO · {logro.category}
                    </p>
                    <p className="text-[16px] font-black tracking-tight text-[#1E1B4B]">{logro.title}</p>
                    {logro.description && (
                      <p className="text-[11px] text-slate-500 font-medium leading-tight mt-1 max-w-[90%]">{logro.description}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* BOTTOM NAV BAR */}
      <BottomNav activeTab="progreso" />
    </div>
  )
}
