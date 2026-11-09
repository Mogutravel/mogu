'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FiCoffee, FiDollarSign, FiShield, FiLock, FiX } from 'react-icons/fi'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // ESTADOS PARA EL SELECTOR DE PERFILES Y PIN
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [showRoleSelector, setShowRoleSelector] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState(false)
  const [checkingPin, setCheckingPin] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      // 1. INICIO DE SESIÓN DIRECTO EN AUTH
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (signInData.user) {
        // 2. CONSULTAR PERFIL Y SU PLAN ASOCIADO
        const { data: profile } = await supabase
          .from('profiles')
          .select('slug, subscription_type, plan_id, plans(slug)')
          .eq('user_id', signInData.user.id)
          .maybeSingle()

        if (profile) {
          const planSlug = (profile.plans as any)?.slug

          // 3. SI ES PLAN MOGU START -> REDIRECCIÓN DIRECTA AL ADMIN
          if (profile.subscription_type === 'free_start' || planSlug === 'mogu-start') {
            window.location.href = `/admin/${profile.slug}`
            return
          }

          // 4. SI ES UN PLAN AVANZADO -> MOSTRAR SELECTOR DE ROL (Cocina / Caja / Admin)
          setActiveSlug(profile.slug)
          setShowRoleSelector(true)
        } else {
          setErrorMessage('No se encontró un perfil asociado a esta cuenta.')
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

  // MANEJO DE RUTAS SEGÚN EL ROL SELECCIONADO (Para planes Pro / Empresa)
  const handleSelectRole = async (role: 'cocina' | 'caja' | 'admin') => {
    if (!activeSlug) return

    if (role === 'cocina') {
      window.location.href = `/panel/${activeSlug}/cocina`
    } else if (role === 'caja') {
      window.location.href = `/panel/${activeSlug}/caja`
    } else if (role === 'admin') {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('pin_code')
          .eq('user_id', user.id)
          .maybeSingle()

        // Si no tiene PIN configurado, ingresar directo
        if (!profile?.pin_code) {
          window.location.href = `/admin/${activeSlug}`
          return
        }
      }
      setShowPinModal(true)
    }
  }

  // VALIDACIÓN DEL PIN DE ADMINISTRADOR (Para planes con PIN)
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCheckingPin(true)
    setPinError(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No hay sesión activa')

      const { data: profile } = await supabase
        .from('profiles')
        .select('pin_code')
        .eq('user_id', user.id)
        .maybeSingle()

      const correctPin = profile?.pin_code || '1234'

      if (pinInput === correctPin) {
        window.location.href = `/admin/${activeSlug}`
      } else {
        setPinError(true)
        setPinInput('')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setCheckingPin(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-emerald-500/30">
      
      {/* GLOW DE FONDO */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />

      {!showRoleSelector ? (
        /* VISTA DE LOGIN PRINCIPAL */
        <div className="relative z-10 w-full max-w-sm bg-neutral-900/50 backdrop-blur-2xl border border-neutral-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          
          {/* LOGO / HEADER */}
          <div className="text-center space-y-2">
            <div className="inline-block font-black text-2xl tracking-wider text-white mb-1">MOGU</div>
            <p className="text-xs text-neutral-400 font-medium">
              Plataforma de Fidelización e Integración Comercial ⚡
            </p>
          </div>

          {/* MENSAJE DE ERROR */}
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl text-center leading-relaxed">
              {errorMessage}
            </div>
          )}

          {/* FORMULARIO DE INICIO DE SESIÓN */}
          <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/80 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-white text-black hover:bg-neutral-200 font-extrabold text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer mt-2 shadow-lg"
            >
              {loading ? 'Verificando...' : 'Ingresar a mi Panel'}
            </button>
          </form>

        </div>
      ) : (
        /* VISTA DEL SELECTOR DE PERFIL POST-LOGIN (Planes Pro / Empresa) */
        <div className="relative z-10 w-full max-w-md bg-neutral-900/50 backdrop-blur-2xl border border-neutral-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
          <div>
            <h2 className="text-xl font-bold">¿Quién se está conectando?</h2>
            <p className="text-xs text-neutral-400 mt-1">Selecciona la vista para este dispositivo</p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {/* COCINA */}
            <button
              onClick={() => handleSelectRole('cocina')}
              className="p-4 bg-neutral-950/80 border border-neutral-800 hover:border-amber-500/50 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg group-hover:scale-110 transition">
                <FiCoffee />
              </div>
              <span className="text-xs font-bold">Cocina</span>
            </button>

            {/* CAJA */}
            <button
              onClick={() => handleSelectRole('caja')}
              className="p-4 bg-neutral-950/80 border border-neutral-800 hover:border-emerald-500/50 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg group-hover:scale-110 transition">
                <FiDollarSign />
              </div>
              <span className="text-xs font-bold">Caja</span>
            </button>

            {/* ADMIN */}
            <button
              onClick={() => handleSelectRole('admin')}
              className="p-4 bg-neutral-950/80 border border-neutral-800 hover:border-sky-500/50 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center text-lg group-hover:scale-110 transition">
                <FiShield />
              </div>
              <span className="text-xs font-bold">Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE PIN DE ADMINISTRADOR */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <FiLock /> Acceso Administrador
              </span>
              <button
                onClick={() => setShowPinModal(false)}
                className="text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                <FiX />
              </button>
            </div>

            <h3 className="text-sm font-bold">Ingresa tu PIN de Seguridad</h3>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className={`w-full tracking-[0.5em] text-center text-2xl font-mono bg-neutral-950 border rounded-2xl py-3 text-white outline-none ${
                  pinError ? 'border-rose-500 text-rose-400' : 'border-neutral-800 focus:border-amber-400'
                }`}
              />

              {pinError && (
                <p className="text-[11px] text-rose-400 font-semibold">PIN incorrecto (Por defecto: 1234)</p>
              )}

              <button
                type="submit"
                disabled={checkingPin || pinInput.length < 4}
                className="w-full py-3 bg-amber-400 text-black font-extrabold text-xs rounded-xl hover:brightness-110 transition cursor-pointer disabled:opacity-40"
              >
                {checkingPin ? 'Verificando...' : 'Desbloquear Panel'}
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="relative z-10 mt-8 text-[11px] text-neutral-500 font-medium">
        © 2026 MOGU. Todos los derechos reservados.
      </footer>
    </div>
  )
}