'use client'

import React, { useState } from 'react'
import { Users, Play, Check } from 'lucide-react'

export default function LiveFocusCard() {
  const [joined, setJoined] = useState(false)

  return (
    <div className="px-6 w-full mb-8">
      <div className="relative overflow-hidden bg-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-900">
        
        {/* Waves SVG pattern in background bottom-right */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <svg width="150" height="100" viewBox="0 0 150 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50 C 30 20, 60 80, 90 50 C 120 20, 150 80, 180 50" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M0 70 C 30 40, 60 100, 90 70 C 120 40, 150 100, 180 70" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          {/* Overlapping Mock Avatars */}
          <div className="flex items-center">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-950 bg-indigo-300 flex items-center justify-center text-xs font-bold text-indigo-900">
                A
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-indigo-950 bg-pink-300 flex items-center justify-center text-xs font-bold text-pink-900">
                L
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-indigo-950 bg-emerald-400 flex items-center justify-center text-xs font-bold text-emerald-950">
                +12
              </div>
            </div>
          </div>

          {/* Live Badge */}
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-indigo-900/50 border border-indigo-700/50 text-emerald-400">
            • En Vivo Ahora
          </span>
        </div>

        {/* Info Content */}
        <div className="mt-4 text-left">
          <h4 className="text-lg font-bold tracking-tight">
            Sesión de Enfoque Profundo
          </h4>
          <p className="text-xs text-indigo-200/80 mt-1 leading-relaxed max-w-[240px]">
            Únete a otros 14 estudiantes. Técnica Pomodoro activa.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setJoined(!joined)}
          className={`w-full font-bold text-sm py-3 px-4 rounded-2xl flex items-center justify-center gap-2 mt-5 transition-all duration-300 active:scale-[0.98] cursor-pointer ${
            joined
              ? 'bg-indigo-800 text-indigo-200 border border-indigo-700'
              : 'bg-emerald-400 hover:bg-emerald-300 text-indigo-950 shadow-md shadow-emerald-400/10'
          }`}
        >
          {joined ? (
            <>
              <Check className="w-4 h-4" />
              Unido a la sesión
            </>
          ) : (
            <>
              <Users className="w-4 h-4" />
              Unirme a la sesión
            </>
          )}
        </button>

      </div>
    </div>
  )
}
