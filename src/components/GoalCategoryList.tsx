import React from 'react'
import { GraduationCap, Heart, Sparkles, User } from 'lucide-react'

export interface GoalCategoryProgress {
  academic: number
  health: number
  mentalHealth: number
  personal: number
}

interface GoalCategoryListProps {
  progress: GoalCategoryProgress
  onViewDetails?: () => void
}

export default function GoalCategoryList({ progress, onViewDetails }: GoalCategoryListProps) {
  const categories = [
    {
      id: 'academic',
      name: 'Académico',
      value: progress.academic,
      icon: GraduationCap,
      colors: {
        iconBg: 'bg-indigo-50 text-indigo-600',
        bar: 'bg-indigo-900',
      }
    },
    {
      id: 'health',
      name: 'Salud',
      value: progress.health,
      icon: Heart,
      colors: {
        iconBg: 'bg-emerald-50 text-emerald-500',
        bar: 'bg-emerald-600',
      }
    },
    {
      id: 'mentalHealth',
      name: 'Salud Mental',
      value: progress.mentalHealth,
      icon: Sparkles,
      colors: {
        iconBg: 'bg-purple-50 text-purple-600',
        bar: 'bg-purple-700',
      }
    },
    {
      id: 'personal',
      name: 'Personal',
      value: progress.personal,
      icon: User,
      colors: {
        iconBg: 'bg-slate-100 text-slate-500',
        bar: 'bg-slate-500',
      }
    }
  ]

  return (
    <div className="px-6 w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-800">
          Tus Objetivos
        </h3>
        <button
          onClick={onViewDetails}
          className="text-xs font-bold text-indigo-600 tracking-wider hover:underline"
        >
          VER DETALLES
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <div
              key={cat.id}
              className="flex flex-col p-4 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${cat.colors.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-slate-700">
                  {Math.round(cat.value)}%
                </span>
              </div>
              
              <span className="text-sm font-semibold text-slate-800 mb-2">
                {cat.name}
              </span>
              
              {/* Progress bar track */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${cat.colors.bar}`}
                  style={{ width: `${cat.value}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
