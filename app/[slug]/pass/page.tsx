'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { FiArrowLeft, FiLock, FiShield, FiUser, FiPhone, FiGlobe, FiAward, FiGift, FiAlertTriangle } from 'react-icons/fi'

function LoyaltyPassContent() {
  const params = useParams()
  const slug = params?.slug as string

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [program, setProgram] = useState<any>(null)
  const [rewardsList, setRewardsList] = useState<any[]>([])
  
  const [globalCustomer, setGlobalCustomer] = useState<any>(null)
  const [globalWallet, setGlobalWallet] = useState<any>(null)
  
  // Estados para registro / verificación
  const [needsRegistration, setNeedsRegistration] = useState(false)
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [registering, setRegistering] = useState(false)
  const [redeemingId, setRedeemingId] = useState<string | null>(null)

  // Estados para el Modal Profesional de PIN
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [validatingPin, setValidatingPin] = useState(false)

  // Estados para Rate Limiting (Seguridad Opción 1)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLockedOut, setIsLockedOut] = useState(false)

  // Estados para Modales Personalizados (Éxito y Error)
  const [successModalData, setSuccessModalData] = useState<{
    isOpen: boolean
    pointsAdded: number
    newBalance: number
  } | null>(null)

  const [errorModalData, setErrorModalData] = useState<{
    isOpen: boolean
    title: string
    message: string
  } | null>(null)

  const GLOBAL_PHONE_KEY = 'mogu_global_customer_phone'

  useEffect(() => {
    async function loadData() {
      if (!slug) return
      setLoading(true)

      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', slug)
          .maybeSingle()

        if (prof) {
          setProfile(prof)

          const { data: prog } = await supabase
            .from('loyalty_programs')
            .select('*')
            .eq('profile_id', prof.id)
            .maybeSingle()

          if (prog) {
            setProgram(prog)

            if (prog.is_active) {
              const { data: rewards } = await supabase
                .from('loyalty_rewards')
                .select('*')
                .eq('program_id', prog.id)
                .eq('is_active', true)

              setRewardsList(rewards || [])

              const savedPhone = localStorage.getItem(GLOBAL_PHONE_KEY)
              if (!savedPhone) {
                setNeedsRegistration(true)
              } else {
                await fetchOrCreateGlobalCustomer(prog.id, savedPhone)
              }
            }
          }
        }
      } catch (e) {
        console.error('Error cargando pase de lealtad:', e)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [slug])

  async function fetchOrCreateGlobalCustomer(programId: string, phone: string, customerName?: string) {
    try {
      let { data: customer } = await supabase
        .from('mogu_customers')
        .select('*')
        .eq('phone', phone)
        .maybeSingle()

      if (!customer) {
        const { data: newCustomer, error: custErr } = await supabase
          .from('mogu_customers')
          .insert([{ phone, full_name: customerName || 'Viajero Mogu', traveler_tier: 'Explorer' }])
          .select()
          .single()

        if (!custErr && newCustomer) {
          customer = newCustomer
          await supabase.from('mogu_wallets').insert([{ customer_id: customer.id }])
        }
      }

      if (customer) {
        setGlobalCustomer(customer)

        const { data: wallet } = await supabase
          .from('mogu_wallets')
          .select('*')
          .eq('customer_id', customer.id)
          .maybeSingle()

        if (wallet) setGlobalWallet(wallet)
      }
    } catch (err) {
      console.error('Error en fetchOrCreateGlobalCustomer:', err)
    }
  }

  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regPhone.trim() || !program) return

    setRegistering(true)
    try {
      const cleanPhone = regPhone.trim()
      const cleanName = regName.trim() || 'Viajero Mogu'

      localStorage.setItem(GLOBAL_PHONE_KEY, cleanPhone)
      await fetchOrCreateGlobalCustomer(program.id, cleanPhone, cleanName)
      setNeedsRegistration(false)
    } catch (err) {
      console.error('Error al registrar cliente:', err)
    } finally {
      setRegistering(false)
    }
  }

  // VALIDACIÓN DE PIN CON MODALES PROFESIONALES EN LUGAR DE ALERTS
  const handleValidatePin = async (pin: string): Promise<boolean> => {
    if (isLockedOut) {
      setErrorModalData({
        isOpen: true,
        title: 'Acceso Bloqueado',
        message: 'Demasiados intentos fallidos. Por seguridad, la validación se encuentra bloqueada temporalmente.'
      })
      return false
    }

    try {
      const expectedPin = program?.validation_pin || '1234'

      if (pin !== expectedPin) {
        const nextAttempts = failedAttempts + 1
        setFailedAttempts(nextAttempts)

        if (nextAttempts >= 3) {
          setIsLockedOut(true)
          setIsPinModalOpen(false)
          setErrorModalData({
            isOpen: true,
            title: 'Seguridad Activada',
            message: 'Demasiados PINs incorrectos. El acceso ha sido bloqueado temporalmente.'
          })
          return false
        }

        setErrorModalData({
          isOpen: true,
          title: 'PIN Incorrecto',
          message: `El código ingresado no es válido. Te quedan ${3 - nextAttempts} intentos.`
        })
        return false
      }

      // PIN Correcto -> Reiniciamos fallos
      setFailedAttempts(0)

      if (!globalCustomer?.id || !program?.id) {
        setErrorModalData({
          isOpen: true,
          title: 'Error de Identidad',
          message: 'No se ha podido identificar tu cuenta o el programa de fidelización.'
        })
        return false
      }

      const pointsToAdd = program.points_per_visit || 15
      const { data, error } = await supabase.rpc('process_mogu_points', {
        p_customer_id: globalCustomer.id,
        p_program_id: program.id,
        p_points_change: pointsToAdd,
        p_type: 'EARN_VISIT',
        p_description: `Visita presencial a ${profile?.full_name || 'Comercio Mogu'}`
      })

      if (error) {
        // Muestra el mensaje de restricción de frecuencia (ej: ya registrado hoy) en el modal pro
        setErrorModalData({
          isOpen: true,
          title: 'Aviso de Visita',
          message: error.message
        })
        return false
      }

      if (data?.success) {
        setGlobalWallet((prev: any) => ({ ...prev, total_mogu_points: data.new_balance }))
        
        setSuccessModalData({
          isOpen: true,
          pointsAdded: pointsToAdd,
          newBalance: data.new_balance
        })

        return true
      }

      return false
    } catch (err: any) {
      setErrorModalData({
        isOpen: true,
        title: 'Error Inesperado',
        message: err?.message || 'Ocurrió un error al procesar tu solicitud.'
      })
      return false
    }
  }

  const handleRedeemReward = async (reward: any) => {
    if (!globalWallet || globalWallet.total_mogu_points < reward.points_cost) {
      setErrorModalData({
        isOpen: true,
        title: 'Puntos Insuficientes',
        message: 'No tienes suficientes Mogu Puntos en tu pasaporte para canjear este premio.'
      })
      return
    }

    const confirmRedeem = confirm(`¿Deseas canjear "${reward.title}" por ${reward.points_cost} Mogu Puntos? Muéstrale esta pantalla al garzón/cajero.`)
    if (!confirmRedeem) return

    setRedeemingId(reward.id)
    try {
      const { data, error } = await supabase.rpc('process_mogu_points', {
        p_customer_id: globalCustomer.id,
        p_program_id: program.id,
        p_points_change: -reward.points_cost,
        p_type: 'REDEEM_REWARD',
        p_description: `Canje de premio: ${reward.title} en ${profile?.full_name}`,
        p_reward_id: reward.id
      })

      if (error) {
        setErrorModalData({
          isOpen: true,
          title: 'Error de Canje',
          message: error.message
        })
        return
      }

      if (data?.success) {
        setGlobalWallet((prev: any) => ({ ...prev, total_mogu_points: data.new_balance }))
        setSuccessModalData({
          isOpen: true,
          pointsAdded: -reward.points_cost, // Indicativo de canje o solo mostramos el éxito
          newBalance: data.new_balance
        })
      }
    } catch (err: any) {
      setErrorModalData({
        isOpen: true,
        title: 'Error de Red',
        message: err?.message || 'No se pudo conectar con el servidor.'
      })
    } finally {
      setRedeemingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center font-sans">
        <div className="w-6 h-6 border-2 border-[#1D1D1F]/20 border-t-[#1D1D1F] rounded-full animate-spin" />
      </div>
    )
  }

  if (!program || !program.is_active) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm flex items-center justify-center text-[#86868B] mb-5">
          <FiLock className="text-2xl" />
        </div>
        <h2 className="text-lg font-bold tracking-tight mb-1 text-[#1D1D1F]">Programa no disponible</h2>
        <p className="text-xs text-[#86868B] mb-6 leading-relaxed">
          Este comercio aún no ha activado su programa de Mogu Puntos.
        </p>
        <Link href={`/${slug}`} className="px-5 py-3 bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold rounded-2xl transition shadow-sm">
          Volver al comercio
        </Link>
      </div>
    )
  }

  if (needsRegistration) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans flex flex-col justify-between p-6 max-w-md mx-auto">
        <header className="flex items-center justify-between pt-2">
          <Link href={`/${slug}`} className="w-10 h-10 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm flex items-center justify-center text-[#1D1D1F]">
            <FiArrowLeft className="text-sm" />
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/85 backdrop-blur-md border border-[#E5E5EA] rounded-full shadow-2xs">
            <FiGlobe className="text-xs text-blue-600" />
            <span className="text-[11px] font-semibold tracking-tight text-[#1D1D1F]">MoguTravel Network</span>
          </div>
          <div className="w-10" />
        </header>

        <main className="my-auto py-8 space-y-6">
          <div className="bg-white/90 backdrop-blur-2xl border border-[#E5E5EA] rounded-[32px] p-7 shadow-sm text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/60 mx-auto flex items-center justify-center text-xl shadow-2xs">
              🌍
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1D1D1F] tracking-tight">¡Activa tu Pasaporte Mogu!</h2>
              <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                Regístrate una sola vez. Recibirás un bono de **20 Mogu Puntos de bienvenida** para gastar en cualquier local de la red.
              </p>
            </div>

            <form onSubmit={handleRegisterClient} className="space-y-4 pt-3">
              <div className="space-y-1 text-left">
                <label className="block text-[11px] font-semibold text-[#86868B]">Tu Nombre</label>
                <div className="relative flex items-center">
                  <FiUser className="absolute left-3.5 text-[#86868B]" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-2xl pl-10 pr-4 py-3 text-xs text-[#1D1D1F] outline-none font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="block text-[11px] font-semibold text-[#86868B]">Número de Teléfono / WhatsApp</label>
                <div className="relative flex items-center">
                  <FiPhone className="absolute left-3.5 text-[#86868B]" />
                  <input
                    type="tel"
                    required
                    placeholder="Ej. +56912345678"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-2xl pl-10 pr-4 py-3 text-xs text-[#1D1D1F] outline-none font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={registering}
                className="w-full py-3.5 bg-[#1D1D1F] hover:bg-black text-white font-semibold text-xs rounded-2xl transition shadow-sm cursor-pointer disabled:opacity-50 mt-2"
              >
                {registering ? 'Activando Pasaporte...' : 'Reclamar 20 Puntos y Activar 🚀'}
              </button>
            </form>
          </div>
        </main>

        <footer className="text-center text-[10px] tracking-widest uppercase text-[#86868B] font-medium pb-2">
          mogu.cl • Global Loyalty Network
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans flex flex-col justify-between p-6 max-w-md mx-auto relative">
      <header className="flex items-center justify-between pt-2">
        <Link href={`/${slug}`} className="w-10 h-10 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm flex items-center justify-center text-[#1D1D1F]">
          <FiArrowLeft className="text-sm" />
        </Link>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-md border border-[#E5E5EA] rounded-full shadow-2xs">
          <FiShield className="text-xs text-emerald-600" />
          <span className="text-[11px] font-semibold tracking-tight text-[#1D1D1F]">Mogu Pass</span>
        </div>
        <div className="w-10" />
      </header>

      <main className="my-auto py-6 space-y-4">
        {/* BANNER DE BILLETERA GLOBAL MOGU */}
        <div className="bg-gradient-to-r from-[#1D1D1F] to-neutral-800 text-white rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-widest font-bold opacity-70 block">MoguTravel Passport</span>
              <h2 className="text-sm font-bold">{globalCustomer?.full_name || 'Viajero'}</h2>
            </div>
            <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-semibold tracking-wide uppercase">
              {globalCustomer?.traveler_tier || 'Explorer'} 🌟
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-2 border-t border-white/10">
            <div>
              <p className="text-[10px] text-neutral-300">Saldo Global Disponible</p>
              <p className="text-2xl font-extrabold text-emerald-400">
                {globalWallet?.total_mogu_points || 0} <span className="text-xs font-normal text-white">pts</span>
              </p>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">Tel: {globalCustomer?.phone}</span>
          </div>
        </div>

        {/* TARJETA DE ACUMULACIÓN DE PUNTOS EN EL LOCAL */}
        <div className="bg-white border border-[#E5E5EA] rounded-3xl p-6 shadow-sm space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 mx-auto flex items-center justify-center text-lg">
            <FiAward />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1D1D1F]">{profile?.full_name || 'Comercio Mogu'}</h3>
            <p className="text-xs text-[#86868B] mt-0.5">Suma puntos en tu visita de hoy con el PIN de caja</p>
          </div>

          <button
            onClick={() => {
              setPinInput('')
              setIsPinModalOpen(true)
            }}
            className="w-full py-3.5 bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold rounded-2xl transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Validar Visita con PIN de Caja</span>
            <span className="text-emerald-400">⚡</span>
          </button>
        </div>

        {/* CATÁLOGO DE PREMIOS */}
        <div className="bg-white border border-[#E5E5EA] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <FiGift className="text-emerald-600" />
            <h3 className="text-sm font-bold text-[#1D1D1F]">Premios disponibles en este local</h3>
          </div>

          <div className="space-y-2.5">
            {rewardsList.length === 0 ? (
              <p className="text-xs text-[#86868B] text-center py-3">Este local aún no ha publicado premios en puntos.</p>
            ) : (
              rewardsList.map((reward) => {
                const canAfford = (globalWallet?.total_mogu_points || 0) >= reward.points_cost
                return (
                  <div key={reward.id} className="p-3.5 bg-[#F5F5F7] border border-[#E5E5EA] rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#1D1D1F]">{reward.title}</p>
                      <p className="text-[10px] text-[#86868B]">{reward.description || 'Canjeable en tienda'}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {reward.points_cost} Mogu Puntos
                      </span>
                    </div>

                    <button
                      disabled={!canAfford || redeemingId === reward.id}
                      onClick={() => handleRedeemReward(reward)}
                      className={`px-3.5 py-2 rounded-xl font-semibold text-xs transition cursor-pointer ${
                        canAfford 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs' 
                          : 'bg-[#E5E5EA] text-[#86868B] cursor-not-allowed'
                      }`}
                    >
                      {redeemingId === reward.id ? 'Canjeando...' : canAfford ? 'Canjear 🎁' : 'Puntos insuficientes'}
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>

      {/* 1. MODAL DE VALIDACIÓN DE PIN */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-white border border-[#E5E5EA] rounded-[32px] p-6 shadow-2xl space-y-5 animate-scaleUp">
            
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 mx-auto flex items-center justify-center text-lg shadow-2xs">
              ✈️
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#1D1D1F] tracking-tight">Validación en Caja</h3>
              <p className="text-xs text-[#86868B] leading-relaxed">
                Ingresa el PIN de 4 dígitos entregado por el garzón o cajero para acumular tus Mogu Puntos.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <input
                type="password"
                maxLength={6}
                autoFocus
                placeholder="••••"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-2xl py-3.5 text-center text-xl font-mono tracking-[1em] text-[#1D1D1F] outline-none font-bold focus:ring-2 focus:ring-emerald-500/30 transition"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="flex-1 py-3 bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#1D1D1F] text-xs font-semibold rounded-2xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                
                <button
                  type="button"
                  disabled={validatingPin || !pinInput}
                  onClick={async () => {
                    setValidatingPin(true)
                    const success = await handleValidatePin(pinInput)
                    setValidatingPin(false)
                    if (success) {
                      setIsPinModalOpen(false)
                      setPinInput('')
                    }
                  }}
                  className="flex-1 py-3 bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold rounded-2xl transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {validatingPin ? 'Validando...' : 'Confirmar PIN ⚡'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. MODAL DE ÉXITO DE PUNTOS */}
      {successModalData?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-white border border-[#E5E5EA] rounded-[32px] p-7 shadow-2xl text-center space-y-5 animate-scaleUp">
            
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center text-2xl shadow-sm">
              🎉
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider rounded-full">
                ¡Puntos Sumados!
              </span>
              <h3 className="text-xl font-extrabold text-[#1D1D1F] tracking-tight pt-1">
                +{successModalData.pointsAdded} Mogu Puntos
              </h3>
              <p className="text-xs text-[#86868B] leading-relaxed">
                Has registrado exitosamente tu visita en <span className="font-semibold text-[#1D1D1F]">{profile?.full_name || 'este local'}</span>.
              </p>
            </div>

            <div className="p-4 bg-[#F5F5F7] border border-[#E5E5EA] rounded-2xl flex justify-between items-center text-xs">
              <span className="text-[#86868B] font-medium">Nuevo Saldo Global:</span>
              <span className="font-extrabold text-emerald-600 text-sm font-mono">
                {successModalData.newBalance} pts
              </span>
            </div>

            <button
              onClick={() => setSuccessModalData(null)}
              className="w-full py-3.5 bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold rounded-2xl transition shadow-sm cursor-pointer"
            >
              ¡Entendido, gracias! 🚀
            </button>
          </div>
        </div>
      )}

      {/* 3. MODAL DE ERROR / AVISO PROFESIONAL (REEMPLAZA EL ALERT) */}
      {errorModalData?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-white border border-[#E5E5EA] rounded-[32px] p-7 shadow-2xl text-center space-y-5 animate-scaleUp">
            
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center text-2xl shadow-sm">
              <FiAlertTriangle />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-[10px] uppercase tracking-wider rounded-full">
                {errorModalData.title}
              </span>
              <p className="text-xs text-[#86868B] leading-relaxed pt-2">
                {errorModalData.message}
              </p>
            </div>

            <button
              onClick={() => setErrorModalData(null)}
              className="w-full py-3.5 bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold rounded-2xl transition shadow-sm cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <footer className="text-center text-[10px] tracking-widest uppercase text-[#86868B] font-medium pb-2">
        mogu.cl • Global Mogu Puntos Network
      </footer>
    </div>
  )
}

export default function UniversalLoyaltyPassPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center font-sans">
        <div className="w-6 h-6 border-2 border-[#1D1D1F]/20 border-t-[#1D1D1F] rounded-full animate-spin" />
      </div>
    }>
      <LoyaltyPassContent />
    </Suspense>
  )
}