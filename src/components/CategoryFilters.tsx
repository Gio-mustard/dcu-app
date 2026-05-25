'use client'

import React from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'

interface CategoryFiltersProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export default function CategoryFilters({
  selectedCategory,
  onSelectCategory,
}: CategoryFiltersProps) {
  const categories = ['Todas', 'Académico', 'Salud', 'Salud Mental', 'Personal']

  return (
    <div className="px-6 w-full mb-6">
      {/* Header section with CATEGORÍAS and + Crear */}
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          Categorías
        </span>
        <Link
          href="/objetivos/crear"
          className="flex items-center gap-1 border border-dashed border-indigo-600/50 hover:bg-indigo-50/50 text-indigo-700 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold tracking-wide transition-all active:scale-[0.98]"
        >
          <Plus className="w-3 h-3 text-indigo-700" />
          <span>Crear</span>
        </Link>
      </div>

      {/* Horizontal categories list */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1.5">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-indigo-950 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>
    </div>
  )
}
