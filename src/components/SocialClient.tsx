'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Search, 
  Loader, 
  Users, 
  ChevronRight, 
  X, 
  Sparkles, 
  Zap, 
  Share2, 
  UserPlus 
} from 'lucide-react'
import BottomNav from './BottomNav'

interface SocialClientProps {
  userProfile: any
}

export default function SocialClient({ userProfile }: SocialClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Read initial search query from URL parameter 'q' or 'query'
  const initialQuery = searchParams.get('q') || searchParams.get('query') || ''
  
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])

  // Redirect handler for bottom tab nav
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

  // Handle setting URL parameter when query changes
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true)
        
        // Update URL parameter dynamically without refreshing page
        const newUrl = `${window.location.pathname}?q=${encodeURIComponent(searchQuery)}`
        window.history.replaceState({ path: newUrl }, '', newUrl)

        try {
          const res = await fetch(`/api/social/search?query=${encodeURIComponent(searchQuery)}`)
          if (res.ok) {
            const data = await res.json()
            setSearchResults(data.users || [])
          }
        } catch (e) {
          console.error('Error executing social search:', e)
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        // Clear query param if input is empty
        if (window.location.search) {
          window.history.replaceState({ path: window.location.pathname }, '', window.location.pathname)
        }
      }
    }, 400)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  // Sync search input if URL changes externally
  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('query') || ''
    if (q !== searchQuery) {
      setSearchQuery(q)
    }
  }, [searchParams])

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pb-24 relative text-left max-w-md mx-auto shadow-xl border-x border-slate-100">
      
      {/* HEADER SECTION */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 sticky top-0 z-40 w-full">
        <h1 className="text-xl font-black text-slate-800 tracking-tight">Social</h1>

        {/* Clickable profile photo on the right */}
        <button 
          onClick={() => router.push('/perfil')}
          className="w-9 h-9 rounded-full overflow-hidden border-2 border-indigo-100 bg-slate-200 shadow-sm cursor-pointer shrink-0"
        >
          <img 
            src={userProfile?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'} 
            alt="Mi perfil" 
            className="w-full h-full object-cover" 
          />
        </button>
      </header>

      {/* BODY CONTENT */}
      <div className="px-6 py-6 animate-fade-in">
        
        {/* Search Input */}
        <div className="relative mb-6 z-30">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, metas, react, salud..."
            className="w-full pl-11 pr-11 py-3 bg-white border border-slate-100/60 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/10 placeholder-slate-400 text-slate-800 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-50 rounded-full text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {searchQuery.trim().length >= 2 ? (
          /* ==========================================
             SEARCH RESULTS VIEW
             ========================================== */
          <div>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-4">
              Resultados de búsqueda ({searchResults.length})
            </h3>

            {isSearching ? (
              <div className="flex items-center justify-center py-12 gap-2 text-slate-400 text-xs">
                <Loader className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Buscando coincidencias...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="flex flex-col gap-3">
                {searchResults.map((userResult) => (
                  <button
                    key={userResult.id}
                    onClick={() => router.push(`/perfil/${userResult.id}`)}
                    className="w-full bg-white border border-slate-100/60 rounded-3xl p-4 flex items-center justify-between text-left shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-100 bg-slate-100 shrink-0">
                        <img 
                          src={userResult.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'} 
                          alt={userResult.full_name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 leading-tight">{userResult.full_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-slate-400 font-bold">Lvl {userResult.level}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <span className="text-[9px] text-emerald-600 font-bold lowercase">{userResult.status_text}</span>
                        </div>

                        {/* Display common goals or category interest */}
                        {((userResult.commonGoals && userResult.commonGoals.length > 0) || 
                          (userResult.commonCategories && userResult.commonCategories.length > 0)) && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {userResult.commonGoals?.map((cg: any, idx: number) => (
                              <span key={`cg-${idx}`} className="text-[8px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-lg flex items-center gap-0.5 uppercase tracking-wide">
                                🤝 {cg.title}
                              </span>
                            ))}
                            {userResult.commonGoals?.length === 0 && userResult.commonCategories?.map((cat: string, idx: number) => (
                              <span key={`cat-${idx}`} className="text-[8px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-lg flex items-center gap-0.5 uppercase tracking-wide">
                                📚 Interés: {cat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic text-center py-10 bg-white border border-slate-100/60 rounded-3xl">
                No se encontraron estudiantes, insignias o metas con ese nombre.
              </div>
            )}
          </div>
        ) : (
          /* ==========================================
             MOCKUP SOCIAL FEED & COMMUNITY
             ========================================== */
          <div className="space-y-6">
            
            {/* Live Community Banner Card */}
            <div className="bg-gradient-to-b from-[#2E2882] to-[#1E1B6B] rounded-[32px] p-6 text-white text-left relative overflow-hidden shadow-lg border border-[#2E2882]/20">
              {/* Decorative rings background */}
              <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

              <span className="text-[9px] font-black text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest inline-flex items-center gap-1.5 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Comunidad en vivo
              </span>

              <h2 className="text-3xl font-extrabold tracking-tight leading-tight mb-2">
                8,432 Estudiantes aprendiendo React
              </h2>
              
              <p className="text-xs text-slate-300 font-medium leading-relaxed mb-6">
                Fluyendo juntos en este momento. La energía colectiva potencia tu enfoque.
              </p>

              <div className="flex flex-col gap-3">
                <button className="w-full py-3.5 bg-[#6FFBBE] hover:bg-[#5ce1ab] text-emerald-950 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-md shadow-[#6FFBBE]/10">
                  <Zap className="w-4 h-4 fill-emerald-950" />
                  <span>Unirse al Enfoque</span>
                </button>
                <button className="w-full py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer border border-white/5">
                  <Share2 className="w-4 h-4" />
                  <span>Invitar amig@s</span>
                </button>
              </div>
            </div>

            {/* Popular Rooms Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-slate-800">
                  Salas de enfoque Populares
                </h3>
                <button className="text-xs font-black text-indigo-700 hover:text-indigo-900 cursor-pointer">
                  Ver todas
                </button>
              </div>

              <div className="space-y-5">
                
                {/* Room 1: Pascal */}
                <div className="bg-white border border-slate-100 rounded-[28px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow">
                  <div 
                    className="h-44 relative bg-cover bg-center flex flex-col justify-end p-4" 
                    style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.85)), url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop')` }}
                  >
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      <span className="text-[8px] font-black text-white bg-[#5f49e0] px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Objetivos Compartidos
                      </span>
                      <span className="text-[8px] font-black text-white bg-[#4736ad] px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Chat de Voz
                      </span>
                      <span className="text-[8px] font-black text-white bg-slate-900/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        +3
                      </span>
                    </div>
                    <h4 className="text-2xl font-black text-white tracking-tight font-mono uppercase">
                      Turbo Pascal
                    </h4>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-extrabold text-slate-800">Aprendiendo a programar</h5>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                        Para aprender a programar : SOLO EN TURBO PASCAL
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex -space-x-1.5">
                          <img className="w-5 h-5 rounded-full border border-white" src="https://api.dicebear.com/7.x/adventurer/svg?seed=Mateo" alt="user" />
                          <img className="w-5 h-5 rounded-full border border-white" src="https://api.dicebear.com/7.x/adventurer/svg?seed=Elena" alt="user" />
                          <img className="w-5 h-5 rounded-full border border-white" src="https://api.dicebear.com/7.x/adventurer/svg?seed=Daniel" alt="user" />
                        </div>
                        <span className="text-[9px] font-bold text-indigo-600">+1.2k</span>
                      </div>
                    </div>
                    
                    <button className="p-2 text-indigo-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer shrink-0">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Room 2: Lofi Chill */}
                <div className="bg-white border border-slate-100 rounded-[28px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow">
                  <div 
                    className="h-44 relative bg-cover bg-center flex flex-col justify-end p-4" 
                    style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.85)), url('https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600&auto=format&fit=crop')` }}
                  >
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      <span className="text-[8px] font-black text-white bg-[#5f49e0] px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Playlist Compartida
                      </span>
                      <span className="text-[8px] font-black text-white bg-[#4736ad] px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Silencio Total
                      </span>
                      <span className="text-[8px] font-black text-white bg-[#4736ad] px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Música Activa
                      </span>
                    </div>
                    <h4 className="text-2xl font-black text-white tracking-tight uppercase">
                      Lo-Fi Chill
                    </h4>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-extrabold text-slate-800">Lo-Fi Chill</h5>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                        Ambiente relajado para tareas creativas.
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex -space-x-1.5">
                          <img className="w-5 h-5 rounded-full border border-white" src="https://api.dicebear.com/7.x/adventurer/svg?seed=Lucia" alt="user" />
                          <img className="w-5 h-5 rounded-full border border-white" src="https://api.dicebear.com/7.x/adventurer/svg?seed=Hugo" alt="user" />
                        </div>
                        <span className="text-[9px] font-bold text-indigo-600">+850</span>
                      </div>
                    </div>

                    <button className="p-2 text-indigo-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer shrink-0">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Connected Friends Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-slate-800">
                  Amigos conectados
                </h3>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                  <UserPlus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                
                {/* Friend 1: Mateo */}
                <button
                  onClick={() => router.push('/perfil/a2b1c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d')}
                  className="w-full bg-white border border-slate-100 rounded-3xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-200 border border-slate-100">
                        <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Mateo" alt="Mateo García" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-800 leading-tight">Mateo García</h5>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold max-w-[200px] leading-snug">
                        ⏱️ Enfoque: 42m 15s - haciendo <span className="text-indigo-600 font-extrabold">Tarea de maldito calculo</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] font-black text-emerald-600 tracking-wider uppercase bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-full">
                      En Vivo
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </button>

                {/* Friend 2: Elena */}
                <button
                  onClick={() => router.push('/perfil/b3c2d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e')}
                  className="w-full bg-white border border-slate-100 rounded-3xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-200 border border-slate-100">
                        <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Elena" alt="Elena Rivas" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-slate-300 border-2 border-white rounded-full" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-800 leading-tight">Elena Rivas</h5>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                        🕒 Hace 15 min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase bg-slate-100 border border-slate-200/40 px-2.5 py-1 rounded-full">
                      Offline
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </button>

                {/* Friend 3: Daniel */}
                <button
                  onClick={() => router.push('/perfil/c4d3e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f')}
                  className="w-full bg-white border border-slate-100 rounded-3xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-200 border border-slate-100">
                        <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Daniel" alt="Daniel Sosa" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-800 leading-tight">Daniel Sosa</h5>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                        ⏱️ Enfoque: 1h 05m
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] font-black text-emerald-600 tracking-wider uppercase bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-full">
                      En Vivo
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </button>

              </div>
            </div>

          </div>
        )}
        
      </div>

      {/* BOTTOM NAV BAR */}
      <BottomNav activeTab="social" />

    </div>
  )
}
