'use client'

import React from 'react'
import Link from 'next/link'
import { Heart, GraduationCap, User, Plus } from 'lucide-react'

// Custom Lotus Icon for Salud Mental
const LotusIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Head (filled circle) */}
    <circle cx="12" cy="5.5" r="1.8" fill="currentColor" />
    
    {/* Torso & Arms */}
    <path d="M12 9c-2 0-4.5 1.5-5 3.5C6.5 14 7.5 15 8.5 15c1 0 2-1 3.5-1s2.5 1 3.5 1c1 0 2-1 1.5-2.5C16.5 10.5 14 9 12 9z" />
    
    {/* Hips and Crossed Legs */}
    <path d="M6 17c-1 0-2 .8-2 1.8C4 20 6.5 20.5 12 20.5s8-.5 8-1.7c0-1-1-1.8-2-1.8" />
    <path d="M9 18.5c2 .5 4 .5 6 0" />
  </svg>
)

const getCategoryCardStyles = (category: string) => {
  const normCategory = (category || '').toUpperCase()
  switch (normCategory) {
    case 'SALUD MENTAL':
      return {
        Icon: LotusIcon,
        iconColor: 'text-[#260c6d]',
        circleBg: 'bg-[#e8e0ff]',
        auraGradient: 'from-[#e8e0ff]/65 via-[#f9f8ff]/10 to-transparent',
        borderColor: 'border-[#ede9fe]/50',
      }
    case 'ACADÉMICO':
      return {
        Icon: GraduationCap,
        iconColor: 'text-[#0369a1]',
        circleBg: 'bg-[#e0f2fe]',
        auraGradient: 'from-[#e0f2fe]/65 via-[#f0f9ff]/10 to-transparent',
        borderColor: 'border-[#e0f2fe]/50',
      }
    case 'SALUD':
      return {
        Icon: Heart,
        iconColor: 'text-[#15803d]',
        circleBg: 'bg-[#dcfce7]',
        auraGradient: 'from-[#dcfce7]/65 via-[#f0fdf4]/10 to-transparent',
        borderColor: 'border-[#dcfce7]/50',
      }
    case 'PERSONAL':
    default:
      return {
        Icon: User,
        iconColor: 'text-[#b45309]',
        circleBg: 'bg-[#ffedd5]',
        auraGradient: 'from-[#ffedd5]/65 via-[#fffbeb]/10 to-transparent',
        borderColor: 'border-[#ffedd5]/50',
      }
  }
}

export interface FocusTemplate {
  id: string
  title: string
  category: 'Académico' | 'Salud' | 'Salud Mental' | 'Personal'
  duration: number
  icon: string
}

interface FocusTemplatesGridProps {
  enfoques: FocusTemplate[]
  onStartFocus?: (enfoque: FocusTemplate) => void
}

export default function FocusTemplatesGrid({
  enfoques = [],
  onStartFocus,
}: FocusTemplatesGridProps) {
  return (
    <div className="px-6 w-full mb-12 relative">
      {/* Title */}
      <h3 className="text-base font-bold text-slate-800 mb-4 text-left">
        Enfoques
      </h3>

      {/* Grid wrapper */}
      <div className="grid grid-cols-2 gap-4">
        {enfoques.length > 0 ? (
          enfoques.map((enfoque) => {
            const styles = getCategoryCardStyles(enfoque.category)
            const Icon = styles.Icon
            
            return (
              <button
                key={enfoque.id}
                onClick={() => onStartFocus?.(enfoque)}
                className={`w-full flex flex-col items-center justify-center p-6 bg-white border ${styles.borderColor} rounded-[28px] text-center transition-all duration-300 active:scale-[0.98] shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.04)] cursor-pointer relative overflow-hidden`}
              >
                {/* Radial gradient glow positioned behind the circle */}
                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,_var(--tw-gradient-stops))] ${styles.auraGradient} pointer-events-none`} />

                {/* Top Circle */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-1 relative z-10 ${styles.circleBg} ${styles.iconColor}`}>
                  <Icon className="w-6.5 h-6.5" />
                </div>
                
                {/* Title */}
                <h4 className="text-[14px] font-extrabold text-slate-800 mt-3 truncate max-w-full px-1 relative z-10 leading-snug">
                  {enfoque.title}
                </h4>
                
                {/* Subtitles stacked vertically */}
                <div className="flex flex-col items-center mt-2.5 gap-0.5 relative z-10">
                  <span className="text-[10px] text-slate-400 font-semibold lowercase tracking-wide">
                    {enfoque.category === 'Salud Mental' ? 'salud mental' : enfoque.category.toLowerCase()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold lowercase tracking-wide">
                    {enfoque.duration} minutos
                  </span>
                </div>
              </button>
            )
          })
        ) : (
          <div className="col-span-2 p-4 bg-slate-50 border border-slate-100 rounded-3xl text-center text-xs text-slate-400 italic">
            No hay plantillas de enfoques registradas.
          </div>
        )}
      </div>

      {/* FLOATING ACTION BUTTON (FAB) redirecting to creator */}
      <div className="fixed bottom-20 right-6 z-40">
        <Link
          href="/objetivos/crear"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-950 text-white shadow-xl hover:bg-indigo-900 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>
    </div>
  )
}
