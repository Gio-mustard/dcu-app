'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Award, 
  Plus, 
  Check, 
  Loader, 
  Atom, 
  X,
  Compass,
  Dumbbell,
  Leaf,
  LogOut
} from 'lucide-react'
import BottomNav from './BottomNav'
import { Drawer } from 'vaul'
// Icon helper for badges
export const getBadgeIcon = (title: string) => {
  const t = (title || '').toLowerCase()
  if (t.includes('logica') || t.includes('lógica') || t.includes('arquitect')) return Compass
  if (t.includes('entrenamiento') || t.includes('ejercicio') || t.includes('deporte') || t.includes('fuerza')) return Dumbbell
  if (t.includes('foco') || t.includes('natural') || t.includes('hoja') || t.includes('planta')) return Leaf
  if (t.includes('react') || t.includes('programación') || t.includes('académic') || t.includes('código')) return Atom
  return Award
}

interface PerfilClientProps {
  email: string
  initialProfile: any
  initialBadges: any[]
  initialGoals: any[]
}

export default function PerfilClient({
  email,
  initialProfile,
  initialBadges = [],
  initialGoals = [],
}: PerfilClientProps) {
  const router = useRouter()
  const supabase = createClient()

  // States
  const [profile, setProfile] = useState(initialProfile)
  const [badges] = useState(initialBadges)
  const [publicGoals] = useState(initialGoals)
  const [loggingOut, setLoggingOut] = useState(false)
  
  // Edit profile states
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editName, setEditName] = useState(profile?.full_name || '')
  const [editStatus, setEditStatus] = useState(profile?.status_text || 'Normal')
  const [editAvatar, setEditAvatar] = useState(profile?.avatar_url || '')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Handle manual tab change in the bottom nav
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

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Toggle social availability open status
  const handleToggleSocialOpen = async () => {
    if (!profile) return
    const newStatus = !profile.social_open
    try {
      setProfile({ ...profile, social_open: newStatus })
      await supabase
        .from('perfiles')
        .update({ social_open: newStatus })
        .eq('id', profile.id)
    } catch (e) {
      console.error(e)
    }
  }

  // Toggle category shared filters
  const handleToggleCategory = async (category: string) => {
    if (!profile) return
    let categories = [...(profile.social_categories || [])]
    if (categories.includes(category)) {
      categories = categories.filter(c => c !== category)
    } else {
      categories.push(category)
    }

    try {
      setProfile({ ...profile, social_categories: categories })
      await supabase
        .from('perfiles')
        .update({ social_categories: categories })
        .eq('id', profile.id)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setIsSavingProfile(true)
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({
          full_name: editName,
          status_text: editStatus,
          avatar_url: editAvatar,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (!error) {
        setProfile({
          ...profile,
          full_name: editName,
          status_text: editStatus,
          avatar_url: editAvatar,
        })
        setIsEditOpen(false)
        router.refresh()
      }
    } catch (err) {
      console.error('Error updating profile:', err)
    } finally {
      setIsSavingProfile(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-24 relative text-left">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 sticky top-0 z-40 w-full">
        <h1 className="text-lg font-bold text-slate-800 text-left">Mi perfil</h1>
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer active:scale-95 shrink-0"
        >
          Volver
        </button>
      </header>

      {/* BODY */}
      <div className="px-6 mt-6 animate-fade-in">
        {profile ? (
          <>
            {/* Header Profile Summary */}
            <div className="flex flex-col items-center text-center mt-2 mb-8">
              <div className="relative mb-3">
                <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-emerald-500/80 shadow-md">
                  <img
                    src={profile.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {profile.status_text === 'En estado de Enfoque' && (
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
                )}
              </div>

              <h2 className="text-xl font-extrabold text-slate-800">{profile.full_name || 'Nombre'}</h2>
              
              {profile.status_text && (
                <span className="text-[9px] text-emerald-600 font-extrabold bg-emerald-50 border border-emerald-100/50 px-3 py-1 rounded-full mt-2 inline-flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                  {profile.status_text}
                </span>
              )}

              <button
                onClick={() => setIsEditOpen(true)}
                className="mt-4 px-5 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer active:scale-95"
              >
                Editar Perfil
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-white border border-slate-100/60 rounded-3xl p-4 text-center shadow-sm">
                <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Enfoque</span>
                <h4 className="text-sm font-black text-slate-800 mt-1">{profile.focus_hours}h</h4>
                <span className="text-[8px] text-slate-400 block mt-0.5">horas totales</span>
              </div>
              <div className="bg-white border border-slate-100/60 rounded-3xl p-4 text-center shadow-sm">
                <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Racha</span>
                <h4 className="text-sm font-black text-slate-800 mt-1">{profile.racha_days} Días</h4>
                <span className="text-[8px] text-slate-400 block mt-0.5">Record: {profile.racha_record}</span>
              </div>
              <div className="bg-white border border-slate-100/60 rounded-3xl p-4 text-center shadow-sm">
                <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Nivel</span>
                <h4 className="text-sm font-black text-indigo-900 mt-1">Lvl {profile.level}</h4>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden relative" title={`${profile.xp || 0} / ${(profile.level || 1) * 100} XP`}>
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.max(0, (((profile.xp || 0) / ((profile.level || 1) * 100)) * 100)))}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Public Goals */}
            <div className="mb-8">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Objetivos Públicos</h3>
              <div className="flex flex-col gap-3">
                {publicGoals.length > 0 ? (
                  publicGoals.map((g) => (
                    <div key={g.id} className="bg-white border border-slate-100/60 rounded-3xl p-4 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Atom className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-800">{g.title}</h4>
                          <span className="text-[10px] text-slate-400 font-semibold lowercase">meta: {g.target_time} min</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-600">{g.progress === 100 ? 'COMPLETADO' : `${g.progress}%`}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 italic text-center py-4 bg-white border border-slate-100/60 rounded-3xl">
                    No tienes objetivos marcados como compartidos/públicos.
                  </div>
                )}
              </div>
            </div>

            {/* Badges List */}
            <div className="mb-8">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Insignias Obtenidas</h3>
              {badges.length > 0 ? (
                <div className="flex flex-wrap gap-4 justify-start">
                  {badges.map((b) => {
                    const BadgeIcon = getBadgeIcon(b.title)
                    return (
                      <div key={b.id} className="flex flex-col items-center gap-1.5 w-[85px] text-center">
                        <div className="w-14 h-14 rounded-full bg-indigo-950 text-white flex items-center justify-center shadow-md">
                          <BadgeIcon className="w-6 h-6 text-yellow-300" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-600 leading-tight line-clamp-2">{b.title}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic text-center py-4 bg-white border border-slate-100/60 rounded-3xl">
                  Aún no has completado objetivos para obtener insignias.
                </div>
              )}
            </div>

            {/* Social Settings Panel */}
            <div className="bg-[#f8fafc] border border-slate-100 rounded-3xl p-6 shadow-inner mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">Disponibilidad Social</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">¿Abierto a nuevos objetivos compartidos?</p>
                </div>
                <button
                  onClick={handleToggleSocialOpen}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 cursor-pointer ${
                    profile.social_open ? 'bg-emerald-500 justify-end' : 'bg-slate-200 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5 mt-5">
                {['Académico', 'Salud', 'Personal'].map((cat) => {
                  const isSelected = (profile.social_categories || []).includes(cat)
                  return (
                    <button
                      key={cat}
                      onClick={() => handleToggleCategory(cat)}
                      className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-indigo-100 border-indigo-200 text-indigo-800'
                          : 'bg-white border-slate-100 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <span>{cat}</span>
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Cerrar Sesión Button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full py-4 border border-rose-100 bg-rose-50 hover:bg-rose-100/80 text-rose-600 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer mt-6"
            >
              <LogOut className="w-5 h-5" />
              {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
            </button>
          </>
        ) : (
          <div className="text-xs text-slate-400 italic py-10 text-center">No se pudo cargar el perfil.</div>
        )}
      </div>

      {/* QUICK EDIT PROFILE (VAUL DRAWER) */}
      <Drawer.Root
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-indigo-950/20 backdrop-blur-sm z-50 animate-fade-in" />
          <Drawer.Content className="w-full max-h-[85vh] bg-white rounded-t-[32px] overflow-hidden flex flex-col fixed bottom-0 left-0 right-0 outline-none z-50 max-w-md mx-auto shadow-2xl">
            <div className="p-6 bg-white rounded-t-[32px] flex-1 overflow-y-auto relative text-left">
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

              <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-800">Editar Perfil</h3>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="p-1 hover:bg-slate-50 rounded-full text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Tu nombre..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/10 placeholder-slate-400 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    Estado actual
                  </label>
                  <input
                    type="text"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    placeholder="Ej: En estado de Enfoque..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/10 placeholder-slate-400 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    Imagen de Avatar (URL)
                  </label>
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="URL de imagen..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/10 placeholder-slate-400 text-slate-800"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="w-1/2 py-3 bg-indigo-950 hover:bg-indigo-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingProfile ? <Loader className="w-4 h-4 animate-spin text-white" /> : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>



      {/* BOTTOM NAV BAR */}
      <BottomNav activeTab="social" />
    </div>
  )
}
