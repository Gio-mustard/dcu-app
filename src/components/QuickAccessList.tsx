import React from 'react'
import { GraduationCap, Heart, Sparkles, User, Clock } from 'lucide-react'

export interface QuickAccessItemData {
  id: string
  title: string
  type: 'OBJETIVO' | 'MICRO - TAREA' | 'ENFOQUE'
  category: 'ACADÉMICO' | 'SALUD' | 'SALUD MENTAL' | 'PERSONAL'
  schedule?: string
  description?: string
  durationMinutes?: number
  goalId?: string
}

interface QuickAccessListProps {
  items: QuickAccessItemData[]
  onItemClick?: (item: QuickAccessItemData) => void
}

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

export default function QuickAccessList({ items = [], onItemClick }: QuickAccessListProps) {
  
  // Icon mapper helper
  const getCategoryIcon = (category: QuickAccessItemData['category']) => {
    switch (category) {
      case 'ACADÉMICO':
        return GraduationCap
      case 'SALUD':
        return Heart
      case 'SALUD MENTAL':
        return Sparkles
      case 'PERSONAL':
      default:
        return User
    }
  }

  // Color mapper helper for microtask left circles
  const getCategoryColors = (category: QuickAccessItemData['category']) => {
    switch (category) {
      case 'SALUD':
        return 'bg-emerald-100 text-emerald-500 shadow-emerald-100/30'
      case 'ACADÉMICO':
        return 'bg-indigo-100 text-indigo-500 shadow-indigo-100/30'
      case 'SALUD MENTAL':
        return 'bg-purple-100 text-purple-500 shadow-purple-100/30'
      case 'PERSONAL':
      default:
        return 'bg-slate-100 text-slate-500 shadow-slate-100/30'
    }
  }

  return (
    <div className="px-6 w-full mb-8">
      <h3 className="text-base font-bold text-slate-800 mb-4 text-left">
        Acceso Rápido
      </h3>
      
      <div className="flex flex-col gap-4">
        {items.length > 0 ? (
          items.map((item) => {
            const Icon = getCategoryIcon(item.category)
            
            // 1. OBJETIVO LAYOUT (Gradient Violet full-width card)
            if (item.type === 'OBJETIVO') {
              return (
                <button
                  key={item.id}
                  onClick={() => onItemClick?.(item)}
                  className="w-full min-w-[280px] snap-center shrink-0 relative overflow-hidden bg-gradient-to-br from-[#AE92FF] to-[#946FFF] text-white rounded-3xl p-5 text-left border border-[#AE92FF]/25 shadow-lg shadow-[#946FFF]/15 hover:shadow-xl hover:shadow-[#946FFF]/20 transition-all duration-300 active:scale-[0.99] "
                >
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-100/80 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-200 animate-pulse" />
                      OBJETIVO {item.category}
                    </span>
                    <h4 className="text-base font-bold tracking-tight mt-1.5">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-xs text-indigo-100/70 mt-1 leading-relaxed max-w-[90%] font-medium">
                        {item.description}
                      </p>
                    )}
                  </div>
                </button>
              )
            }

            // 2. MICRO - TAREA LAYOUT (Horizontal card, white background, left circle)
            if (item.type === 'MICRO - TAREA') {
              const bgColors = getCategoryColors(item.category)
              return (
                <button
                  key={item.id}
                  onClick={() => onItemClick?.(item)}
                  className="w-full flex items-center justify-between p-4 bg-white border border-slate-100/60 rounded-3xl text-left transition-all duration-300 active:scale-[0.99] shadow-sm hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Left category circle */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${bgColors}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {/* Middle details */}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-slate-400 lowercase tracking-wide">
                        micro tarea
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 leading-tight mt-0.5">
                        {item.title}
                      </h4>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {item.schedule || 'Hoy'} {item.durationMinutes ? `• ${item.durationMinutes} min` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Right category pill */}
                  <span className="bg-slate-50 border border-slate-100/50 px-3 py-1 rounded-full text-[9px] font-bold text-slate-400/80 uppercase tracking-wider">
                    {item.category === 'ACADÉMICO' ? 'Académico' : item.category === 'SALUD MENTAL' ? 'Mental' : item.category.toLowerCase()}
                  </span>
                </button>
              )
            }

            // 3. ENFOQUE LAYOUT (Square centered/aligned-left card)
            if (item.type === 'ENFOQUE') {
              const styles = getCategoryCardStyles(item.category)
              const ItemIcon = styles.Icon

              return (
                <div key={item.id} className="w-1/2 min-w-[170px] self-start">
                  <button
                    onClick={() => onItemClick?.(item)}
                    className={`w-full flex flex-col items-center justify-center p-6 bg-white border ${styles.borderColor} rounded-[28px] text-center transition-all duration-300 active:scale-[0.98] shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.04)] cursor-pointer relative overflow-hidden`}
                  >
                    {/* Radial gradient glow positioned behind the circle */}
                    <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,_var(--tw-gradient-stops))] ${styles.auraGradient} pointer-events-none`} />

                    {/* Top Circle */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-1 relative z-10 ${styles.circleBg} ${styles.iconColor}`}>
                      <ItemIcon className="w-6.5 h-6.5" />
                    </div>
                    {/* Title */}
                    <h4 className="text-[14px] font-extrabold text-slate-800 mt-3 truncate max-w-full px-1 relative z-10 leading-snug">
                      {item.title}
                    </h4>
                    {/* Subtitles stacked vertically */}
                    <div className="flex flex-col items-center mt-2.5 gap-0.5 relative z-10">
                      <span className="text-[10px] text-slate-400 font-semibold lowercase tracking-wide">
                        {item.category === 'SALUD MENTAL' ? 'salud mental' : item.category.toLowerCase()}
                      </span>
                      {item.durationMinutes && (
                        <span className="text-[10px] text-slate-400 font-semibold lowercase tracking-wide">
                          {item.durationMinutes} minutos
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              )
            }

            return null
          })
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-3xl text-center text-xs text-slate-400 italic">
            No hay actividades programadas para este momento.
          </div>
        )}
      </div>
    </div>
  )
}
