'use client'

import React, { useState, useEffect } from 'react'
import { Play, Pause, X, RotateCcw, AlertTriangle, CheckCircle, FastForward } from 'lucide-react'

interface TimerModalProps {
  title: string
  category: string
  durationMinutes: number
  microTaskId?: string | null
  enfoqueId?: string | null
  onClose: () => void
  onComplete: () => void
}

export default function TimerModal({
  title,
  category,
  durationMinutes,
  microTaskId = null,
  enfoqueId = null,
  onClose,
  onComplete,
}: TimerModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60)
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let interval: any = null

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1)
      }, 1000)
    } else if (secondsLeft === 0) {
      clearInterval(interval)
      handleAutoCompleted()
    }

    return () => clearInterval(interval)
  }, [isActive, secondsLeft])

  const handleAutoCompleted = async () => {
    setIsActive(false)
    await saveFocusSession()
  }

  const saveFocusSession = async () => {
    setSaving(true)
    setErrorMsg(null)

    try {
      const response = await fetch('/api/sesiones/completar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          micro_tarea_id: microTaskId,
          enfoque_id: enfoqueId,
          duration_minutes: durationMinutes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fallo al guardar la sesión de enfoque')
      }

      onComplete()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  // Format MM:SS
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-50 bg-indigo-950/98 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center animate-fade-in">
      
      {/* Glow highlight backdrop */}
      <div className="absolute w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-indigo-200 transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header Info */}
      <div className="mb-8">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/15">
          {category}
        </span>
        <h2 className="text-xl font-bold tracking-tight text-white mt-4 max-w-xs px-2 leading-tight">
          {title}
        </h2>
        <p className="text-xs text-indigo-200/50 mt-1">
          Sesión de Enfoque Activa
        </p>
      </div>

      {/* Big Digital Clock Timer */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-8 border border-white/5 rounded-full shadow-inner bg-white/2">
        {/* Animated glowing border ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/20 animate-spin-slow" />
        
        <span className="text-6xl font-extrabold tracking-tighter tabular-nums font-mono text-white select-none">
          {timeFormatted}
        </span>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-2 text-xs text-rose-300 max-w-xs text-left">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Controls toolbar */}
      <div className="flex items-center gap-6 mb-10">
        {/* Reset / Restart */}
        <button
          onClick={() => {
            setIsActive(false)
            setSecondsLeft(durationMinutes * 60)
          }}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-indigo-200 transition-all cursor-pointer"
          title="Reiniciar"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Play / Pause Toggle */}
        <button
          onClick={() => setIsActive(!isActive)}
          className={`p-5 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg active:scale-95 ${
            isActive
              ? 'bg-white hover:bg-slate-100 text-indigo-950 shadow-white/5'
              : 'bg-emerald-400 hover:bg-emerald-300 text-indigo-950 shadow-emerald-400/20'
          }`}
        >
          {isActive ? <Pause className="w-6 h-6 fill-indigo-950" /> : <Play className="w-6 h-6 fill-indigo-950 ml-0.5" />}
        </button>

        {/* Fast forward / Simulate completion (TESTING HELPER) */}
        <button
          onClick={saveFocusSession}
          disabled={saving}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-indigo-200 transition-all cursor-pointer disabled:opacity-50"
          title="Simular Finalización"
        >
          <FastForward className="w-5 h-5" />
        </button>
      </div>

      {/* Loading state indicator */}
      {saving && (
        <div className="text-xs font-semibold text-emerald-400 animate-pulse flex items-center gap-1.5 justify-center">
          <CheckCircle className="w-4 h-4" />
          Guardando progreso en base de datos...
        </div>
      )}

    </div>
  )
}
