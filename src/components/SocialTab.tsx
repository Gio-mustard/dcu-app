'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, Loader, Users, ChevronRight, X } from 'lucide-react'

export default function SocialTab() {
  const router = useRouter()
  const supabase = createClient()
  
  const [userId, setUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        // Fetch suggested active users who are open to social sharing
        const { data: profiles } = await supabase
          .from('perfiles')
          .select('*')
          .eq('social_open', true)
          .neq('id', user.id)
          .limit(5)
        setSuggestedUsers(profiles || [])
      }
      setLoadingSuggestions(false)
    }
    init()
  }, [])

  // Trigger search on query change
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true)
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
      }
    }, 400)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  return (
    <div className="w-full pb-28 px-6 animate-fade-in text-left">
      {/* Search Input */}
      <div className="relative mb-6 z-30">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre, metas, react, salud..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100/60 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/10 placeholder-slate-400 text-slate-800 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-50 rounded-full text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {searchQuery.trim().length >= 2 ? (
        /* ==================== SEARCH RESULTS VIEW ==================== */
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">
            Resultados de búsqueda ({searchResults.length})
          </h3>

          {isSearching ? (
            <div className="flex items-center justify-center py-10 gap-2 text-slate-400 text-xs">
              <Loader className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Buscando...</span>
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
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic text-center py-10 bg-white border border-slate-100/60 rounded-3xl">
              No se encontraron coincidencias de usuarios o temas.
            </div>
          )}
        </div>
      ) : (
        /* ==================== COMMUNITY FEED / SUGGESTIONS VIEW ==================== */
        <div>
          {/* Informational Banner */}
          <div className="bg-[#f0fdf4] border border-emerald-100 rounded-3xl p-5 mb-6 text-left flex items-start gap-3">
            <div className="p-2 bg-emerald-100 rounded-2xl text-emerald-700 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-emerald-800">Comunidad FocusMind</h4>
              <p className="text-[10px] text-emerald-700/80 leading-relaxed mt-1 font-medium">
                Conéctate con otros usuarios. Busca personas interesadas en temas como "react", "salud" o "lectura" para ver sus progresos y compartir objetivos.
              </p>
            </div>
          </div>

          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">
            Comunidad sugerida
          </h3>

          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-10 gap-2 text-slate-400 text-xs">
              <Loader className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Cargando sugerencias...</span>
            </div>
          ) : suggestedUsers.length > 0 ? (
            <div className="flex flex-col gap-3">
              {suggestedUsers.map((sUser) => (
                <button
                  key={sUser.id}
                  onClick={() => router.push(`/perfil/${sUser.id}`)}
                  className="w-full bg-white border border-slate-100/60 rounded-3xl p-4 flex items-center justify-between text-left shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-100 bg-slate-100 shrink-0">
                      <img 
                        src={sUser.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'} 
                        alt={sUser.full_name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 leading-tight">{sUser.full_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-slate-400 font-bold">Lvl {sUser.level}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[9px] text-emerald-600 font-bold lowercase">{sUser.status_text}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic text-center py-6">
              No hay otros perfiles públicos registrados aún.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
