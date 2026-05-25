'use client'

import React from 'react'
import Link from 'next/link'
import { Objetivo } from '@/repositories/GoalRepository'

interface GoalCardCarouselProps {
  goals: Objetivo[]
}

export default function GoalCardCarousel({ goals = [] }: GoalCardCarouselProps) {
  return (
    <div className="w-full mb-8">
      {/* Header section with title and indicators */}
      <div className="flex items-center justify-between px-6 mb-3">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          Objetivos Activos
        </span>
        {/* Simple dots indicator */}
        {goals.length > 0 && (
          <div className="flex gap-1">
            {Array.from({ length: Math.min(3, goals.length) }).map((_, idx) => (
              <span 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-indigo-600' : 'bg-slate-200'}`} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Horizontal snap carousel list */}
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none px-6 pb-2">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <Link
              key={goal.id}
              href={`/objetivos/${goal.id}`}
              className="w-[280px] min-w-[280px] snap-center shrink-0 relative overflow-hidden bg-gradient-to-br from-[#AE92FF] to-[#946FFF] text-white rounded-3xl p-5 text-left border border-[#AE92FF]/25 shadow-lg shadow-[#946FFF]/15 hover:shadow-xl hover:shadow-[#946FFF]/20 transition-all duration-300 active:scale-[0.99]"
            >
              {/* Pulsing indicator */}
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-300 animate-ping" />

              <div className="flex flex-col h-28 justify-between">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-purple-100/90 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-purple-200" />
                    {goal.category}
                  </span>
                  <h4 className="text-lg font-bold tracking-tight mt-1 leading-snug">
                    {goal.title}
                  </h4>
                </div>
                
                {goal.description && (
                  <p className="text-xs text-purple-100/80 line-clamp-2 leading-relaxed font-medium">
                    {goal.description}
                  </p>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="w-full py-8 px-6 bg-white border border-slate-100 rounded-3xl text-center text-xs text-slate-400 italic">
            No tienes objetivos activos en este momento. ¡Crea uno para empezar!
          </div>
        )}
      </div>
    </div>
  )
}
