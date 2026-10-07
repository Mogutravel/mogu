'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      if (isRegistering) {
        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.')
        }

        // 1. REGISTRO EN SUPABASE AUTH
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        })

        if (signUpError) throw signUpError

        let user = signUpData.user

        if (user) {
          if (!signUpData.session) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password,
            })
            if (signInError) throw signInError
            user = signInData.user
          }

          // 2. CALCULAR FECHA DE EXPIRACIÓN DEL TRIAL (7 DÍAS)
          const trialEndDate = new Date()
          trialEndDate.setDate(trialEndDate.getDate() + 7)

          // 3. ACTUALIZAR O ASEGURAR EL PERFIL CON EL ESTADO 'trial' Y FECHA DE VENCIMIENTO
          let profile = null
          let attempts = 0

          while (!profile && attempts < 5) {
            attempts++
            
            // Intentamos actualizar el perfil generado por el trigger o crearlo si no existe
            const { data: updatedProfile, error: updateError } = await supabase
              .from('profiles')
              .update({
                status: 'trial',
                trial_ends_at: trialEndDate.toISOString(),
                full_name: fullName.trim()
              })
              .eq('user_id', user.id)
              .select('slug')
              .maybeSingle()

            if (updatedProfile) {
              profile = updatedProfile
              break
            }

            await new Promise((resolve) => setTimeout(resolve, 500))
          }

          if (profile) {
            window.location.href = `/admin/${profile.slug}`
          } else {
            setErrorMessage('Cuenta creada con éxito. Por favor inicia sesión para ingresar.')
            setIsRegistering(false)
          }
        }
      } else {
        // INICIO DE SESIÓN DIRECTO
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        if (signInData.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('slug, status, trial_ends_at')
            .eq('user_id', signInData.user.id)
            .maybeSingle()

          if (profile) {
            // Opcional: Validación si el trial ya expiró
            if (profile.status === 'trial' && profile.trial_ends_at && new Date(profile.trial_ends_at) < new Date()) {
              setErrorMessage('Tu periodo de prueba de 7 días ha expirado. Realiza la transferencia para activar tu cuenta de forma definitiva.')
              return
            }

            window.location.href = `/admin/${profile.slug}`
          } else {
            setErrorMessage('No se encontró un perfil asociado a esta cuenta.')
          }
        }
      }
    } catch (error: any) {
      if (error.message?.includes('Invalid login credentials')) {
        setErrorMessage('Credenciales inválidas. Verifica tu correo y contraseña.')
      } else {
        setErrorMessage(error.message || 'Ocurrió un error al procesar la solicitud.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-emerald-500/30">
      
      {/* GLOW DE FONDO */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm bg-neutral-900/50 backdrop-blur-2xl border border-neutral-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* LOGO / HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-block font-black text-2xl tracking-wider text-white mb-1">MOGU</div>
          <p className="text-xs text-neutral-400 font-medium">
            Tarjetas NFC Inteligentes para PyMEs ⚡
          </p>
        </div>

        {/* SELECTOR DE PESTAÑAS (TABS) */}
        <div className="grid grid-cols-2 p-1 bg-neutral-950/80 border border-neutral-800 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(false)
              setErrorMessage('')
            }}
            className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              !isRegistering
                ? 'bg-neutral-800 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(true)
              setErrorMessage('')
            }}
            className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              isRegistering
                ? 'bg-emerald-500 text-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            7 Días Gratis
          </button>
        </div>

        {/* MENSAJE DE ERROR */}
        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl text-center leading-relaxed">
            {errorMessage}
          </div>
        )}

        {/* FORMULARIO UNIFICADO */}
        <form onSubmit={handleAuth} className="space-y-4">
          {isRegistering && (
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-neutral-400">Nombre del Negocio / PyME</label>
              <input
                type="text"
                required
                placeholder="Ej: Cafetería Don Luis"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/80 transition"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-neutral-400">Correo Electrónico</label>
            <input
              type="email"
              required
              placeholder="tu@negocio.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/80 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-neutral-400">Contraseña</label>
            <input
              type="password"
              required
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/80 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer mt-2 ${
              isRegistering
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            {loading ? 'Procesando...' : isRegistering ? 'Comenzar Prueba Gratis (7 Días)' : 'Ingresar a mi Panel'}
          </button>
        </form>

        {/* FOOTER / CAMBIO RÁPIDO */}
        <div className="text-center pt-2 border-t border-neutral-800/80">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering)
              setErrorMessage('')
            }}
            className="text-[11px] text-neutral-400 hover:text-emerald-400 transition cursor-pointer"
          >
            {isRegistering
              ? '¿Ya tienes una cuenta? Inicia sesión'
              : '¿Quieres probar Mogu gratis? Regístrate aquí'}
          </button>
        </div>

      </div>

      <footer className="relative z-10 mt-8 text-[11px] text-neutral-500 font-medium">
        © 2026 MOGU. Todos los derechos reservados.
      </footer>
    </div>
  )
}