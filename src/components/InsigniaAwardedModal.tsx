'use client'

import React from 'react'
import { Award, Sparkles, X, Compass, Dumbbell, Leaf, Atom } from 'lucide-react'
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

interface InsigniaAwardedModalProps {
  isOpen: boolean
  onClose: () => void
  insigniaTitle: string
  insigniaDescription?: string
}

export default function InsigniaAwardedModal({
  isOpen,
  onClose,
  insigniaTitle,
  insigniaDescription,
}: InsigniaAwardedModalProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        {/* Backdrop */}
        <Drawer.Overlay className="fixed inset-0 bg-indigo-950/40 backdrop-blur-md z-50 animate-fade-in" />

        {/* Drawer Content */}
        <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] max-h-[96%] fixed bottom-0 left-0 right-0 outline-none z-50 max-w-md mx-auto shadow-2xl overflow-hidden">
          <div className="p-8 bg-white rounded-t-[32px] flex-1 overflow-y-auto text-center relative">
            
            {/* Floating Sparkles Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full opacity-40 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute bottom-10 right-10 w-3 h-3 bg-purple-400 rounded-full opacity-40 animate-ping" style={{ animationDuration: '4s' }} />
              <div className="absolute top-1/2 right-12 w-2 h-2 bg-emerald-400 rounded-full opacity-30 animate-ping" style={{ animationDuration: '5s' }} />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Radial Aura Behind Badge */}
            <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 w-48 h-48 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-100/60 via-emerald-50/10 to-transparent pointer-events-none rounded-full" />

            {/* Badge Showcase */}
            <div className="flex justify-center items-center my-6 relative">
              {/* Confetti Rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[180px] h-[180px] rounded-full bg-emerald-500/5 border border-emerald-500/10 animate-pulse" />
                <div className="w-[140px] h-[140px] rounded-full bg-emerald-500/10 border border-emerald-400/20" />
              </div>

              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center relative shadow-[0_12px_40px_rgba(16,185,129,0.3)] z-10 border border-emerald-400/20">
                <div className="bg-emerald-950/40 p-4 rounded-full border border-emerald-400/30">
                  {(() => {
                    const BadgeIcon = getBadgeIcon(insigniaTitle)
                    return <BadgeIcon className="w-12 h-12 text-white animate-bounce" style={{ animationDuration: '3s' }} />
                  })()}
                </div>
                
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" style={{ animationDuration: '5s' }} />
                </div>
              </div>
            </div>

            {/* Texts */}
            <div className="relative z-10 mt-6">
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-4 py-1.5 rounded-full uppercase tracking-widest">
                🏆 ¡Objetivo Completado!
              </span>
              
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mt-5 mb-2 leading-tight">
                {insigniaTitle}
              </h2>
              
              <p className="text-xs text-slate-500 font-semibold leading-relaxed px-2">
                {insigniaDescription || '¡Felicidades! Completaste con éxito todas las micro-tareas de tu objetivo.'}
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={onClose}
              className="w-full py-4 mt-8 bg-indigo-950 hover:bg-indigo-900 text-white rounded-2xl text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-lg shadow-indigo-950/15 active:scale-[0.98]"
            >
              ¡Excelente!
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
