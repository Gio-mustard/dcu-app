'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Search,
  X,
  BookOpen,
  Heart,
  Brain,
  User,
  CheckCircle2,
  Circle,
  FileEdit,
  ChevronRight,
  Target,
  Calendar,
  Clock,
  SlidersHorizontal,
} from 'lucide-react'
import BottomNav from './BottomNav'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ElementType; bg: string; text: string; pill: string; dot: string }
> = {
  Académico: {
    icon: BookOpen,
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    pill: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
  },
  Salud: {
    icon: Heart,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    pill: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  'Salud Mental': {
    icon: Brain,
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    pill: 'bg-violet-100 text-violet-700 border-violet-200',
    dot: 'bg-violet-500',
  },
  Personal: {
    icon: User,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    pill: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  en_curso: {
    label: 'En curso',
    icon: Circle,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  completado: {
    label: 'Completado',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  borrador: {
    label: 'Borrador',
    icon: FileEdit,
    color: 'text-slate-500',
    bg: 'bg-slate-100',
  },
}

const ALL_CATEGORIES = ['Todas', 'Académico', 'Salud', 'Salud Mental', 'Personal']
const ALL_STATUSES = ['Todos', 'en_curso', 'completado', 'borrador']

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

// ─── Goal Card ────────────────────────────────────────────────────────────────
function GoalCard({ goal, onClick }: { goal: any; onClick: () => void }) {
  const cat = CATEGORY_CONFIG[goal.category] || CATEGORY_CONFIG['Personal']
  const status = STATUS_CONFIG[goal.status] || STATUS_CONFIG['borrador']
  const CatIcon = cat.icon
  const StatusIcon = status.icon

  const progress = Math.min(100, Math.max(0, goal.progress || 0))

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-[22px] p-5 border border-slate-100 shadow-sm flex flex-col gap-3 text-left active:scale-[0.99] transition-all hover:shadow-md hover:border-indigo-100 cursor-pointer group"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Category icon */}
          <div className={`w-10 h-10 rounded-2xl ${cat.bg} flex items-center justify-center shrink-0`}>
            <CatIcon className={`w-5 h-5 ${cat.text}`} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Category pill */}
            <span
              className={`text-[9px] font-extrabold uppercase tracking-widest border ${cat.pill} px-2 py-0.5 rounded-full inline-block mb-1`}
            >
              {goal.category}
            </span>
            {/* Title */}
            <h3 className="text-[15px] font-black text-indigo-950 leading-tight line-clamp-2">
              {goal.title}
            </h3>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mt-1 group-hover:text-indigo-400 transition-colors" />
      </div>

      {/* Description */}
      {goal.description && (
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed line-clamp-2">
          {goal.description}
        </p>
      )}

      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <div className={`flex items-center gap-1 ${status.bg} px-2 py-0.5 rounded-full`}>
            <StatusIcon className={`w-3 h-3 ${status.color}`} />
            <span className={`text-[9px] font-extrabold uppercase tracking-wider ${status.color}`}>
              {status.label}
            </span>
          </div>
          <span className="text-[11px] font-black text-slate-500">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${cat.dot}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer meta */}
      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
        {goal.target_time && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {goal.target_time} min / día
          </span>
        )}
        {goal.created_at && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(goal.created_at)}
          </span>
        )}
      </div>
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface TodosObjetivosClientProps {
  userName: string
  avatarUrl: string | null
  allGoals: any[]
}

export default function TodosObjetivosClient({
  userName,
  avatarUrl,
  allGoals = [],
}: TodosObjetivosClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [selectedStatus, setSelectedStatus] = useState('Todos')
  const [showFilters, setShowFilters] = useState(false)

  // Derived filtered goals
  const filtered = useMemo(() => {
    return allGoals.filter((goal) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (goal.description || '').toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === 'Todas' || goal.category === selectedCategory

      const matchesStatus =
        selectedStatus === 'Todos' || goal.status === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [allGoals, searchQuery, selectedCategory, selectedStatus])

  // Counts per status for pills
  const statusCounts = useMemo(
    () => ({
      en_curso: allGoals.filter((g) => g.status === 'en_curso').length,
      completado: allGoals.filter((g) => g.status === 'completado').length,
      borrador: allGoals.filter((g) => g.status === 'borrador').length,
    }),
    [allGoals]
  )

  const hasActiveFilters =
    selectedCategory !== 'Todas' || selectedStatus !== 'Todos'

  return (
    <div className="min-h-screen bg-[#f5f4fc] max-w-md mx-auto flex flex-col pb-24">
      {/* ── HEADER ── */}
      <header className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100 sticky top-0 z-40 w-full">
        <button
          onClick={() => router.push('/objetivos')}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-indigo-950" />
          <span>Volver</span>
        </button>

        <h1 className="text-sm font-black text-slate-800 tracking-tight select-none">
          Mis Objetivos
        </h1>

        <button
          onClick={() => router.push('/perfil')}
          className="w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-100 bg-slate-200 shadow-sm flex items-center justify-center font-bold text-indigo-900 text-xs cursor-pointer shrink-0"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
          ) : (
            userName.charAt(0)
          )}
        </button>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-col px-5 py-5 gap-4 animate-fade-in">

        {/* Title + count */}
        <div>
          <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
            Historial completo
          </span>
          <h2 className="text-2xl font-black text-indigo-950 tracking-tight leading-tight">
            Todos mis Objetivos
          </h2>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">
            {allGoals.length} objetivo{allGoals.length !== 1 ? 's' : ''} en total ·{' '}
            {statusCounts.en_curso} activo{statusCounts.en_curso !== 1 ? 's' : ''}
          </p>
        </div>

        {/* ── SEARCH BAR ── */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar objetivos..."
            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-indigo-950 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── FILTER TOGGLE ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider px-3 py-2 rounded-xl transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-indigo-950 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtros
            {hasActiveFilters && (
              <span className="bg-white text-indigo-950 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black leading-none">
                !
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSelectedCategory('Todas')
                setSelectedStatus('Todos')
              }}
              className="text-[11px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* ── FILTER PANEL ── */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
            {/* Category */}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
                Categoría
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-black border transition-all ${
                        active
                          ? 'bg-indigo-950 text-white border-indigo-950 shadow-sm'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-200'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
                Estado
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_STATUSES.map((s) => {
                  const active = selectedStatus === s
                  const label =
                    s === 'Todos'
                      ? 'Todos'
                      : STATUS_CONFIG[s]?.label || s
                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedStatus(s)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-black border transition-all ${
                        active
                          ? 'bg-indigo-950 text-white border-indigo-950 shadow-sm'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-200'
                      }`}
                    >
                      {label}
                      {s !== 'Todos' && statusCounts[s as keyof typeof statusCounts] !== undefined && (
                        <span className={`ml-1 text-[9px] ${active ? 'text-indigo-300' : 'text-slate-400'}`}>
                          ({statusCounts[s as keyof typeof statusCounts]})
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
              <Target className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm font-black text-slate-700 mb-1">
              {searchQuery ? 'Sin resultados' : 'No hay objetivos'}
            </p>
            <p className="text-[11px] text-slate-400 font-medium max-w-[200px]">
              {searchQuery
                ? `No encontramos objetivos que coincidan con "${searchQuery}"`
                : 'Aún no tienes objetivos registrados. ¡Crea uno ahora!'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/objetivos/crear')}
                className="mt-5 px-6 py-3 bg-indigo-950 text-white text-xs font-black rounded-2xl shadow-md active:scale-95 transition-transform"
              >
                Crear objetivo
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </p>
            {filtered.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onClick={() => router.push(`/objetivos/${goal.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <BottomNav activeTab="objetivos" />
    </div>
  )
}
