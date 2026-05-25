import React from 'react'
import { Sparkles } from 'lucide-react'

interface EncouragementBannerProps {
  userName: string
  remainingAcademicMinutes: number
  hasActiveGoals: boolean
  todayDayName: string
}

export default function EncouragementBanner({
  userName = 'Lucia',
  remainingAcademicMinutes = 45,
  hasActiveGoals = true,
  todayDayName = 'hoy'
}: EncouragementBannerProps) {
  return (
    <div className="flex flex-col items-center text-center px-6 mt-4 mb-6">
      {hasActiveGoals ? (
        <>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-1 justify-center">
            ¡Casi lo logras, {userName}!
            <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-100" />
          </h2>
          
          <p className="text-slate-500 text-sm max-w-xs mt-2 leading-relaxed">
            Te faltan <span className="font-semibold text-indigo-600 underline decoration-2 decoration-indigo-200">{remainingAcademicMinutes} minutos</span> de enfoque para completar tu meta académica hoy.
          </p>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-slate-800">
            ¡Hola, {userName}!
          </h2>
          <p className="text-slate-500 text-sm max-w-xs mt-2 leading-relaxed">
            No tienes metas académicas programadas para hoy ({todayDayName}). ¡Añade una meta para comenzar a enfocarte!
          </p>
        </>
      )}
    </div>
  )
}
