'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft,
  Settings,
  Atom, 
  Award,
  Compass,
  Dumbbell,
  Leaf,
  MessageCircle,
  UserPlus,
  Zap,
  CheckCircle2,
  X,
  Target
} from 'lucide-react'
import { Drawer } from 'vaul'
import BottomNav from './BottomNav'

// Icon helper for badges
export const getBadgeIcon = (title: string) => {
  const t = (title || '').toLowerCase()
  if (t.includes('logica') || t.includes('lógica') || t.includes('arquitect')) return Compass
  if (t.includes('entrenamiento') || t.includes('ejercicio') || t.includes('deporte') || t.includes('fuerza')) return Dumbbell
  if (t.includes('foco') || t.includes('natural') || t.includes('hoja') || t.includes('planta')) return Leaf
  if (t.includes('react') || t.includes('programación') || t.includes('académic') || t.includes('código')) return Atom
  return Award
}

// Badge icon color helper
const getBadgeColor = (title: string) => {
  const t = (title || '').toLowerCase()
  if (t.includes('lógica') || t.includes('logica') || t.includes('arquitect')) return 'bg-purple-700'
  if (t.includes('entrenamiento') || t.includes('ejercicio') || t.includes('fuerza')) return 'bg-emerald-700'
  if (t.includes('foco') || t.includes('natural') || t.includes('planta')) return 'bg-teal-700'
  if (t.includes('react') || t.includes('programación') || t.includes('código')) return 'bg-indigo-700'
  return 'bg-slate-700'
}

interface PublicPerfilClientProps {
  profile: any
  goals: any[]
  badges: any[]
  logros: any[]
  myGoals?: any[]
}

export default function PublicPerfilClient({
  profile,
  goals = [],
  badges = [],
  logros = [],
  myGoals = [],
}: PublicPerfilClientProps) {
  const router = useRouter()
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [proposalSent, setProposalSent] = useState(false)

  const handleTabChange = (tab: 'inicio' | 'objetivos' | 'social' | 'progreso') => {
    if (tab === 'inicio') {
      router.push('/')
    } else if (tab === 'objetivos') {
      router.push('/objetivos')
    } else if (tab === 'social') {
      router.push('/social')
    } else {
      router.push(`/?tab=${tab}`)
    }
  }

  // Calculate common goals / categories
  const myGoalCategories = new Set(myGoals.map((mg: any) => mg.category))
  const myGoalTitles = myGoals.map((mg: any) => mg.title.toLowerCase())

  const commonGoals = goals.filter((g) => {
    const titleLower = g.title.toLowerCase()
    return myGoalTitles.some((myTitle: string) => {
      const words = myTitle.split(/\s+/).filter((w) => w.length > 3)
      return words.some((w) => titleLower.includes(w))
    })
  })

  const commonCategories = [...new Set(
    goals
      .filter((g) => myGoalCategories.has(g.category))
      .map((g) => g.category)
  )]

  const isActive = profile.status_text === 'En estado de Enfoque'

  // "Abierta/Abierto" gender detection (simple heuristic by name ending)
  const firstName = (profile.full_name || '').split(' ')[0]
  const isFeminine = ['a', 'ia', 'ía'].some(ending => firstName.toLowerCase().endsWith(ending))
  const collaborateLabel = isFeminine ? 'ABIERTA A COLABORAR' : 'ABIERTO A COLABORAR'
  const collaborateDesc = isFeminine 
    ? `${firstName} prefiere trabajar en objetivos de tipo`
    : `${firstName} prefiere trabajar en objetivos de tipo`

  const handleSendProposal = () => {
    if (!selectedGoalId) return
    setProposalSent(true)
    setTimeout(() => {
      setProposalSent(false)
      setShowProposalModal(false)
      setSelectedGoalId(null)
    }, 2800)
  }

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pb-24 relative text-left max-w-md mx-auto shadow-xl border-x border-slate-100">
      
      {/* HEADER */}
      <header className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100 sticky top-0 z-40">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-semibold lowercase">perfil de {firstName}</span>
        </button>
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* BODY */}
      <div className="px-5 pt-6 pb-4 animate-fade-in">

        {/* HERO - Avatar + Status + Name + Bio */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            {/* Avatar ring glow when active */}
            <div className={`w-24 h-24 rounded-full overflow-hidden shadow-lg ${isActive ? 'ring-[3px] ring-emerald-400 ring-offset-2' : 'ring-[3px] ring-slate-200'}`}>
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.full_name}`}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Active dot */}
            {isActive && (
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
            )}
          </div>

          {/* Status badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-3 ${
            isActive 
              ? 'bg-emerald-900 text-emerald-300 border border-emerald-700/30' 
              : 'bg-slate-100 text-slate-500 border border-slate-200/50'
          }`}>
            <Zap className={`w-3 h-3 ${isActive ? 'fill-emerald-400 text-emerald-400' : 'text-slate-400'}`} />
            {isActive ? `Enfoque Activo: ${profile.status_text}` : (profile.status_text || 'Disponible')}
          </span>

          <h2 className="text-xl font-extrabold text-slate-900 leading-tight">{profile.full_name}</h2>
          {profile.bio && (
            <p className="text-xs text-slate-400 font-medium mt-1">{profile.bio}</p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 mt-5 w-full max-w-[280px]">
            <button className="flex-1 py-3 bg-indigo-700 hover:bg-indigo-800 text-white rounded-2xl text-xs font-black tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-700/20 active:scale-[0.98]">
              <MessageCircle className="w-4 h-4" />
              Enviar Mensaje
            </button>
            <button className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-colors cursor-pointer active:scale-[0.97]">
              <UserPlus className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* INSIGNIAS OBTENIDAS */}
        {badges.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Insignias Obtenidas</h3>
            <div className="flex flex-wrap gap-4">
              {badges.map((b) => {
                const BadgeIcon = getBadgeIcon(b.title)
                const bgColor = getBadgeColor(b.title)
                return (
                  <div key={b.id} className="flex flex-col items-center gap-1.5 w-[72px] text-center">
                    <div className={`w-14 h-14 rounded-full ${bgColor} flex items-center justify-center shadow-md`}>
                      <BadgeIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 leading-tight line-clamp-2">{b.title}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* INTERSECCIÓN — Objetivos en Común */}
        {(commonGoals.length > 0 || commonCategories.length > 0) && (
          <div className="mb-6 rounded-3xl overflow-hidden bg-gradient-to-br from-[#1E1B6B] to-[#2E2882] p-5 shadow-lg">
            <p className="text-[9px] font-black text-indigo-300 tracking-widest uppercase mb-1">Intersección</p>
            <h4 className="text-base font-extrabold text-white mb-3">Objetivos en Común</h4>
            <div className="flex flex-col gap-2">
              {commonGoals.length > 0 ? (
                commonGoals.map((g, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 bg-white/10 rounded-2xl px-3 py-2.5">
                    <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <Atom className="w-4 h-4 text-indigo-200" />
                    </div>
                    <span className="text-xs font-bold text-indigo-100">Ambos están trabajando en {g.title}</span>
                  </div>
                ))
              ) : (
                commonCategories.map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 bg-white/10 rounded-2xl px-3 py-2.5">
                    <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <Target className="w-4 h-4 text-indigo-200" />
                    </div>
                    <span className="text-xs font-bold text-indigo-100">Ambos tienen metas de tipo <span className="text-[#6FFBBE]">{cat}</span></span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* OBJETIVOS PÚBLICOS */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-slate-800">Objetivos Públicos</h3>
            <button className="text-xs font-black text-indigo-600 hover:text-indigo-800 cursor-pointer">Ver todos</button>
          </div>
          <div className="flex flex-col gap-3">
            {goals.length > 0 ? (
              goals.map((g) => {
                const GoalIcon = getBadgeIcon(g.title + ' ' + g.category)
                const hasCommonCategory = myGoalCategories.has(g.category)
                const hasCommonTitle = myGoalTitles.some((myTitle: string) => {
                  const words = myTitle.split(/\s+/).filter((w) => w.length > 3)
                  return words.some((w) => g.title.toLowerCase().includes(w))
                })

                return (
                  <div key={g.id} className="bg-white border border-slate-100/60 rounded-3xl p-4 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                          <GoalIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-800 leading-tight">{g.title}</h4>
                          <span className="text-[10px] text-slate-400 font-semibold">Meta: {g.target_time} min este mes</span>
                        </div>
                      </div>
                      <span className={`text-xs font-black ${g.progress === 100 ? 'text-emerald-600' : 'text-indigo-600'} shrink-0`}>
                        {g.progress === 100 ? 'COMPLETADO' : `${g.progress}%`}
                      </span>
                    </div>

                    {(hasCommonTitle || hasCommonCategory) && (
                      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50">
                        {hasCommonTitle ? (
                          <span className="text-[8px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-lg uppercase tracking-wider flex items-center gap-0.5">
                            🤝 ¡Objetivo en común!
                          </span>
                        ) : (
                          <span className="text-[8px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-lg uppercase tracking-wider flex items-center gap-0.5">
                            📚 Comparten categoría {g.category}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="text-xs text-slate-400 italic text-center py-6 bg-white border border-slate-100/60 rounded-3xl">
                Este usuario no tiene objetivos públicos.
              </div>
            )}
          </div>
        </div>

        {/* ABIERTA/ABIERTO A COLABORAR */}
        {profile.social_open && (
          <div className="mb-6 rounded-3xl overflow-hidden bg-gradient-to-br from-[#1E1B6B] to-[#2E2882] p-5 shadow-lg">
            <p className="text-[9px] font-black text-indigo-300 tracking-widest uppercase mb-1">{collaborateLabel}</p>
            <p className="text-sm font-bold text-white/90 leading-snug mb-4">
              {collaborateDesc}
            </p>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-5">
              {(profile.social_categories || ['Académico']).map((cat: string) => (
                <span
                  key={cat}
                  className="px-3 py-1.5 bg-indigo-900/60 border border-indigo-600/30 text-white/90 rounded-xl text-[10px] font-black uppercase tracking-wider"
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Propose CTA */}
            <button
              onClick={() => setShowProposalModal(true)}
              className="w-full py-3.5 bg-[#6FFBBE] hover:bg-[#5ce1ab] text-emerald-950 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-md shadow-[#6FFBBE]/20 active:scale-[0.98]"
            >
              <Target className="w-4 h-4" />
              Proponer Objetivo compartido
            </button>
          </div>
        )}
      </div>

      {/* BOTTOM NAV BAR */}
      <BottomNav activeTab="social" />

      {/* ========== PROPOSAL MODAL (VAUL DRAWER) ========== */}
      <Drawer.Root
        open={showProposalModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowProposalModal(false)
            setSelectedGoalId(null)
            setProposalSent(false)
          }
        }}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] max-h-[96%] fixed bottom-0 left-0 right-0 outline-none z-50 max-w-md mx-auto shadow-2xl">
            <div className="px-6 pt-5 pb-10 bg-white rounded-t-[32px] flex-1 overflow-y-auto">
              {/* Handle */}
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

              {proposalSent ? (
                /* Success state */
                <div className="flex flex-col items-center text-center py-8 gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center animate-bounce-once">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800">¡Propuesta enviada!</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
                    Pronto recibirás noticias de <span className="font-bold text-indigo-700">{firstName}</span>.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-800">Proponer Objetivo</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Selecciona cuál de tus metas compartirías con {firstName}</p>
                    </div>
                    <button
                      onClick={() => { setShowProposalModal(false); setSelectedGoalId(null) }}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* My goals list */}
                  <div className="flex flex-col gap-2.5 mb-6 max-h-[45vh] overflow-y-auto pr-1">
                    {myGoals.length > 0 ? (
                      myGoals.map((g: any) => {
                        const GoalIcon = getBadgeIcon(g.title + ' ' + g.category)
                        const isSelected = selectedGoalId === g.id
                        return (
                          <button
                            key={g.id}
                            onClick={() => setSelectedGoalId(g.id)}
                            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-indigo-400 bg-indigo-50 shadow-sm'
                                : 'border-slate-100 bg-white hover:border-slate-200'
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                              <GoalIcon className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-extrabold text-slate-800 truncate">{g.title}</h5>
                              <span className="text-[10px] text-slate-400 font-medium">{g.category} · {g.progress}% completado</span>
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 ml-auto" />}
                          </button>
                        )
                      })
                    ) : (
                      <div className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 rounded-2xl">
                        No tienes objetivos activos aún.
                      </div>
                    )}
                  </div>

                  {/* Send CTA */}
                  <button
                    onClick={handleSendProposal}
                    disabled={!selectedGoalId}
                    className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${
                      selectedGoalId
                        ? 'bg-[#6FFBBE] text-emerald-950 hover:bg-[#5ce1ab] shadow-lg shadow-emerald-400/20 cursor-pointer active:scale-[0.98]'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    Enviar Propuesta
                  </button>
                </>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}
