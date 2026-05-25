import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: 'FocusShift - Tu App de Productividad',
  description: 'Maneja tus objetivos, enfócate y trabaja en sesiones grupales pomodoro.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${outfit.variable} h-full antialiased`}>
      {/* 
        This body wrapper centers the mobile screen on desktop. 
        It has a beautiful dark gradient background on desktop, 
        and renders the phone frame with a clean border, shadow, and slide effects.
      */}
      <body className="min-h-screen bg-slate-900 md:py-8 flex items-center justify-center font-sans">
        <div className="w-full max-w-md min-h-screen md:min-h-[850px] md:h-[850px] bg-slate-50 md:rounded-[40px] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] md:border-[10px] md:border-slate-800 relative overflow-y-auto flex flex-col overflow-x-hidden scrollbar-none">

          {/* Mock Mobile Camera Notch / Status bar for desktop frame */}
          <div className="hidden md:block absolute top-0 left-1/2 transform -translate-x-1/2 h-5 w-32 bg-slate-800 rounded-b-2xl z-50 pointer-events-none" />

          {/* Children app contents */}
          <main className="flex-1 relative">
            {children}
          </main>

        </div>
      </body>
    </html>
  )
}
