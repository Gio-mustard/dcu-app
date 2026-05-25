'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Mail, Lock, User, AlertCircle, Loader, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) {
        setErrorMsg(error.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    } catch (err: any) {
      setErrorMsg('Ocurrió un error inesperado al registrarse.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 text-white">
      
      {/* Decorative gradient blur background */}
      <div className="absolute top-20 left-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        {/* App Logo */}
        <div className="inline-flex items-center justify-center p-3 bg-indigo-500/15 border border-indigo-500/20 rounded-3xl mb-4 shadow-lg shadow-indigo-500/5">
          <Sparkles className="h-8 w-8 text-emerald-400" />
        </div>
        
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Crea tu Cuenta
        </h2>
        <p className="mt-2 text-sm text-indigo-200/60">
          Comienza a organizar y potenciar tu enfoque hoy
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900/60 backdrop-blur-xl py-8 px-6 border border-white/5 rounded-3xl shadow-xl">
          
          {success ? (
            <div className="p-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center p-3 bg-emerald-500/15 rounded-full mb-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">¡Registro completado!</h3>
              <p className="text-sm text-indigo-200/70">
                Se ha enviado un correo de confirmación (si está configurado) o ya puedes iniciar sesión. Redirigiendo al login...
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleRegister}>
              
              {errorMsg && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/70 mb-2">
                  Nombre Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-indigo-300/40" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm placeholder-indigo-200/30 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/70 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-indigo-300/40" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm placeholder-indigo-200/30 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="nombre@ejemplo.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/70 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-indigo-300/40" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm placeholder-indigo-200/30 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="•••••••• (mín. 6 caracteres)"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-indigo-950 bg-emerald-400 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                >
                  {loading ? (
                    <Loader className="animate-spin h-5 w-5 text-indigo-950" />
                  ) : (
                    'Registrarme'
                  )}
                </button>
              </div>

            </form>
          )}

          {/* Switch to Login */}
          <div className="mt-6 text-center">
            <p className="text-xs text-indigo-200/60">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="font-bold text-emerald-400 hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>

        </div>
      </div>
      
    </div>
  )
}
