'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Target, Users, BarChart2 } from 'lucide-react'

interface BottomNavProps {
  activeTab?: 'inicio' | 'objetivos' | 'social' | 'progreso'
}

const navItems = [
  { id: 'inicio',    label: 'INICIO',    icon: Home,     href: '/' },
  { id: 'objetivos', label: 'OBJETIVOS', icon: Target,   href: '/objetivos' },
  { id: 'social',    label: 'SOCIAL',    icon: Users,    href: '/social' },
  { id: 'progreso',  label: 'PROGRESO',  icon: BarChart2, href: '/progreso' },
] as const

export default function BottomNav({ activeTab }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-slate-100 max-w-md mx-auto px-4 py-2">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab
            ? activeTab === item.id
            : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                isActive
                  ? 'text-emerald-900 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div
                className={`flex items-center justify-center p-1 px-3.5 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[9px] tracking-wider font-semibold">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
