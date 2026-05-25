'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Target, Waves, Lock, Globe, Sparkles, Loader } from 'lucide-react'

export default function CreateGoalForm() {
  const router = useRouter()

  // Form State
  const [type, setType] = useState<'objetivo' | 'enfoque'>('objetivo')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<'Académico' | 'Salud' | 'Salud Mental' | 'Personal'>('Académico')
  const [selectedDays, setSelectedDays] = useState<string[]>(['Lunes', 'Miércoles', 'Viernes']) // Default rhythm days
  const [metaValue, setMetaValue] = useState('1')
  const [metaUnit, setMetaUnit] = useState<'Horas' | 'Minutos'>('Horas')
  const [visibility, setVisibility] = useState<'Privado' | 'Compartido'>('Privado')
  const [remindersOn, setRemindersOn] = useState(true)
  const [reminderStart, setReminderStart] = useState('09:00 AM')
  const [reminderEnd, setReminderEnd] = useState('08:00 PM')
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const daysMapping = [
    { label: 'L', name: 'Lunes' },
    { label: 'M', name: 'Martes' },
    { label: 'X', name: 'Miércoles' },
    { label: 'J', name: 'Jueves' },
    { label: 'V', name: 'Viernes' },
    { label: 'S', name: 'Sábado' },
    { label: 'D', name: 'Domingo' },
  ]

  const toggleDay = (dayName: string) => {
    if (selectedDays.includes(dayName)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayName))
    } else {
      setSelectedDays([...selectedDays, dayName])
    }
  }

  const handleSubmit = async (status: 'en_curso' | 'borrador') => {
    if (!title.trim()) {
      setErrorMsg('Por favor ingresa un nombre para tu objetivo/enfoque')
      return
    }

    setErrorMsg(null)
    setLoading(true)

    // Calculate target time in minutes
    let targetTimeMinutes = 25 // default enfoque duration
    if (type === 'objetivo') {
      const val = parseFloat(metaValue) || 1
      targetTimeMinutes = metaUnit === 'Horas' ? Math.round(val * 60) : Math.round(val)
    } else {
      // For enfoques, use the target time as its specific duration
      const val = parseFloat(metaValue) || 25
      targetTimeMinutes = metaUnit === 'Horas' ? Math.round(val * 60) : Math.round(val)
    }

    try {
      const response = await fetch('/api/objetivos/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          title,
          category,
          rhythm_days: type === 'objetivo' ? selectedDays : null,
          target_time: targetTimeMinutes,
          visibility: type === 'objetivo' ? visibility : 'Privado',
          smart_reminders: type === 'objetivo' ? remindersOn : false,
          reminder_start: type === 'objetivo' && remindersOn ? reminderStart : null,
          reminder_end: type === 'objetivo' && remindersOn ? reminderEnd : null,
          status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error al guardar')
      }

      router.push('/objetivos')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con el servidor')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 px-6 py-6 pb-28 text-slate-800">
      
      {/* BACK BUTTON */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 font-extrabold text-[10px] uppercase tracking-wider mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-slate-400" />
        <span>Volver</span>
      </button>

      {/* HEADER SECTION */}
      <div className="text-left mb-8">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
          Nuevo Comienzo
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1 leading-none">
          Diseña tu próxima<br />Forma de crecer.
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed mt-3 max-w-[90%] font-medium">
          Define el ritmo de tu crecimiento. Elige entre la precisión de un objetivo o la libertad de un nuevo enfoque.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-600 text-left font-medium">
          {errorMsg}
        </div>
      )}

      {/* TYPE SELECTOR CARDS */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Type 1: OBJETIVO */}
        <button
          type="button"
          onClick={() => {
            setType('objetivo')
            setMetaValue('1')
            setMetaUnit('Horas')
          }}
          className={`w-full p-5 rounded-3xl text-left border transition-all duration-300 active:scale-[0.99] cursor-pointer flex flex-col justify-between ${
            type === 'objetivo'
              ? 'bg-indigo-950 text-white border-indigo-950 shadow-lg shadow-indigo-950/20'
              : 'bg-white text-slate-800 border-slate-100 shadow-sm hover:border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${type === 'objetivo' ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-50 text-indigo-600'}`}>
              <Target className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold">Objetivo</span>
          </div>
          
          <p className={`text-xs mt-3 leading-relaxed font-medium ${type === 'objetivo' ? 'text-indigo-200/80' : 'text-slate-400'}`}>
            Secuencial y preciso. Nuestra IA generará micro-tareas automáticas para guiarte paso a paso (después puedes crear más o modificarlas).
          </p>

          <div className="flex gap-2 mt-4">
            <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase ${type === 'objetivo' ? 'bg-indigo-900/60 text-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
              IA-POWERED
            </span>
            <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase ${type === 'objetivo' ? 'bg-indigo-900/60 text-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
              ESTRUCTURADO
            </span>
          </div>
        </button>

        {/* Type 2: ENFOQUE */}
        <button
          type="button"
          onClick={() => {
            setType('enfoque')
            setMetaValue('25')
            setMetaUnit('Minutos')
          }}
          className={`w-full p-5 rounded-3xl text-left border transition-all duration-300 active:scale-[0.99] cursor-pointer flex flex-col justify-between ${
            type === 'enfoque'
              ? 'bg-indigo-950 text-white border-indigo-950 shadow-lg shadow-indigo-950/20'
              : 'bg-white text-slate-800 border-slate-100 shadow-sm hover:border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${type === 'enfoque' ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-50 text-indigo-600'}`}>
              <Waves className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold">Enfoque</span>
          </div>
          
          <p className={`text-xs mt-3 leading-relaxed font-medium ${type === 'enfoque' ? 'text-indigo-200/80' : 'text-slate-400'}`}>
            Relajado y flexible. Define qué es lo que harás al usarlo, tú eres libre de decidir cómo lo haces en el momento.
          </p>

          <div className="flex gap-2 mt-4">
            <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase ${type === 'enfoque' ? 'bg-indigo-900/60 text-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
              FLEXIBLE
            </span>
            <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase ${type === 'enfoque' ? 'bg-indigo-900/60 text-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
              RUTINA
            </span>
          </div>
        </button>
      </div>

      {/* FORM INPUTS WRAPPER */}
      <div className="bg-white rounded-[32px] border border-slate-100/80 shadow-sm p-6 space-y-6 text-left">
        
        {/* Name input */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
            ¿Cómo lo llamarás?
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full px-4 py-3 bg-slate-100 border-none rounded-2xl text-sm placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 font-semibold"
            placeholder={type === 'objetivo' ? 'Ej. Dominar el minimalismo digital' : 'Ej. Meditar'}
          />
        </div>

        {/* Category input */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
            Categoría
          </label>
          <div className="flex flex-wrap gap-2">
            {(['Académico', 'Salud', 'Salud Mental', 'Personal'] as const).map((cat) => {
              const isActive = category === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Rhythm settings - only for Objetivo */}
        {type === 'objetivo' && (
          <div className="space-y-6 pt-2 border-t border-slate-50">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                Configuración de Ritmo
              </label>
              <p className="text-[11px] text-slate-400 mb-3.5 font-medium leading-relaxed">
                Selecciona los días en que quieras hacerlo
              </p>
              
              {/* Day selection bubbles */}
              <div className="flex gap-2">
                {daysMapping.map((day) => {
                  const isSel = selectedDays.includes(day.name)
                  return (
                    <button
                      key={day.name}
                      type="button"
                      onClick={() => toggleDay(day.name)}
                      className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center transition-all duration-200 cursor-pointer ${
                        isSel
                          ? 'bg-indigo-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Meta especifica */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Meta específica
              </label>
              <p className="text-[11px] text-slate-400 mb-3 font-medium">
                Ej. 1 Hora
              </p>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  value={metaValue}
                  onChange={(e) => setMetaValue(e.target.value)}
                  className="w-24 px-4 py-3 bg-slate-100 border-none rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 font-bold text-center"
                />
                <select
                  value={metaUnit}
                  onChange={(e: any) => setMetaUnit(e.target.value)}
                  className="px-4 py-3 bg-slate-100 border-none rounded-2xl text-sm text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/10"
                >
                  <option value="Horas">Horas</option>
                  <option value="Minutos">Minutos</option>
                </select>
              </div>
            </div>

            {/* Visibilidad */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                Visibilidad
              </label>
              <p className="text-[11px] text-slate-400 mb-3 font-medium leading-relaxed">
                Si es público, cualquiera que visite tu perfil lo verá (objetivos de estudio y progreso se mantienen privados).
              </p>

              {/* Toggle visor container */}
              <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 w-full max-w-[280px]">
                <button
                  type="button"
                  onClick={() => setVisibility('Privado')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                    visibility === 'Privado' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Privado</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('Compartido')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                    visibility === 'Compartido' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Compartido</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Duration input for Enfoque */}
        {type === 'enfoque' && (
          <div className="space-y-6 pt-2 border-t border-slate-50">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Duración del enfoque
              </label>
              <p className="text-[11px] text-slate-400 mb-3 font-medium">
                Ej. 25 Minutos
              </p>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  value={metaValue}
                  onChange={(e) => setMetaValue(e.target.value)}
                  className="w-24 px-4 py-3 bg-slate-100 border-none rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 font-bold text-center"
                />
                <select
                  value={metaUnit}
                  onChange={(e: any) => setMetaUnit(e.target.value)}
                  className="px-4 py-3 bg-slate-100 border-none rounded-2xl text-sm text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-600/10"
                >
                  <option value="Minutos">Minutos</option>
                  <option value="Horas">Horas</option>
                </select>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* RECORDATORIOS BLOCK - ONLY FOR OBJETIVO */}
      {type === 'objetivo' && (
        <div className="mt-6 text-left">
          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1 mb-2">
            Recordatorios
          </span>
          <p className="text-[11px] text-slate-400 px-1 mb-3.5 font-medium leading-relaxed">
            Nuestro IA aprenderá tus momentos de mayor calma para enviarte recordatorios no intrusivos.
          </p>

          <div className="bg-indigo-950 text-white rounded-3xl p-5 border border-indigo-900/60 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider">
                  ESTADO ACTUAL
                </span>
                <span className="text-sm font-bold mt-0.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  Recordatorios Inteligentes: {remindersOn ? 'ON' : 'OFF'}
                </span>
              </div>
              {/* iOS toggle style button */}
              <button
                type="button"
                onClick={() => setRemindersOn(!remindersOn)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  remindersOn ? 'bg-emerald-400' : 'bg-indigo-900'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    remindersOn ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Config times */}
            {remindersOn && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-indigo-900/50 border border-indigo-800/40 rounded-2xl p-3 flex flex-col">
                  <span className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider">
                    Inicio del día:
                  </span>
                  <input
                    type="text"
                    value={reminderStart}
                    onChange={(e) => setReminderStart(e.target.value)}
                    className="bg-transparent border-none text-white focus:outline-none text-xs font-bold mt-1 text-left w-full"
                  />
                </div>
                <div className="bg-indigo-900/50 border border-indigo-800/40 rounded-2xl p-3 flex flex-col">
                  <span className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider">
                    Cierre del día:
                  </span>
                  <input
                    type="text"
                    value={reminderEnd}
                    onChange={(e) => setReminderEnd(e.target.value)}
                    className="bg-transparent border-none text-white focus:outline-none text-xs font-bold mt-1 text-left w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBMISSION ACTION BUTTONS */}
      <div className="flex items-center justify-between gap-4 mt-8">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSubmit('borrador')}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 disabled:opacity-50 cursor-pointer"
        >
          Guardar Borrador
        </button>
        
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSubmit('en_curso')}
          className="flex-1 max-w-[200px] flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-950 hover:bg-indigo-900 text-white rounded-2xl text-xs font-extrabold tracking-wider transition-all duration-300 active:scale-[0.98] shadow-md cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <Loader className="animate-spin w-4 h-4 text-white" />
          ) : (
            type === 'objetivo' ? 'Crear Objetivo' : 'Crear Enfoque'
          )}
        </button>
      </div>

    </div>
  )
}
