import React from 'react'

interface CircularProgressProps {
  progress: number
}

export default function CircularProgress({ progress = 0 }: CircularProgressProps) {
  const radius = 80
  const strokeWidth = 10
  const circumference = 2 * Math.PI * radius
  
  // Bound progress between 0 and 100
  const cleanProgress = Math.min(Math.max(progress, 0), 100)
  const strokeDashoffset = circumference - (cleanProgress / 100) * circumference

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      {/* Background glow shadow effect */}
      <div className="absolute w-52 h-52 bg-cyan-300/15 rounded-full blur-2xl -z-10 pointer-events-none" />
      
      <div className="relative w-56 h-56 flex items-center justify-center bg-white rounded-full shadow-md border border-slate-50">
        <svg className="w-48 h-48 transform -rotate-90">
          <defs>
            {/* Gradient that matches the cyan/emerald gradient in the new mockup */}
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" /> {/* Cyan 400 */}
              <stop offset="100%" stopColor="#34d399" /> {/* Emerald 400 */}
            </linearGradient>
          </defs>
          
          {/* Background track circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        
        {/* Inner Label content */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-bold text-slate-800 tracking-tight">
            {Math.round(cleanProgress)}%
          </span>
          <span className="text-[10px] font-semibold text-slate-400 tracking-wider mt-1 uppercase">
            Progreso Diario
          </span>
        </div>
      </div>
    </div>
  )
}
