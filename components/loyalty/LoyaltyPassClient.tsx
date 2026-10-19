'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  FiCheckCircle, 
  FiAward, 
  FiPhone, 
  FiLock, 
  FiSmartphone, 
  FiGift, 
  FiCheck,
  FiLoader,
  FiX,
  FiRadio,
  FiDownload
} from 'react-icons/fi'

interface LoyaltyPassClientProps {
  slug: string
  sourceType: 'catalogo' | 'menu'
}

export default function LoyaltyPassClient({ slug, sourceType }: LoyaltyPassClientProps) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [program, setProgram] = useState<any>(null)
  const [pass, setPass] = useState<any>(null)

  // Registro/Login
  const [phoneInput, setPhoneInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  // Modales y Métodos de Validación (PIN / NFC)
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false)
  const [inputPin, setInputPin] = useState('')
  const [validating, setValidating] = useState(false)
  const [nfcScanning, setNfcScanning] = useState(false)
  const [nfcSupported, setNfcSupported] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    // Detectar soporte Web NFC
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setNfcSupported(true)
    }

    // Capturar evento de instalación PWA
    const handleBeforeInstall = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    async function loadLoyalty() {
      if (!slug) return
      setLoading(true)

      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, slug, avatar_url')
          .eq('slug', slug)
          .single()

        if (!profileData) {
          setLoading(false)
          return
        }

        setProfile(profileData)

        const { data: programData } = await supabase
          .from('loyalty_programs')
          .select('*')
          .eq('profile_id', profileData.id)
          .eq('is_active', true)
          .maybeSingle()

        if (programData) {
          setProgram(programData)

          const savedPhone = localStorage.getItem(`mogu_pass_phone_${profileData.id}`)
          if (savedPhone) {
            const { data: passData } = await supabase
              .from('loyalty_passes')
              .select('*')
              .eq('program_id', programData.id)
              .eq('customer_phone', savedPhone)
              .maybeSingle()

            if (passData) setPass(passData)
          }
        }
      } catch (err) {
        console.error('Error cargando pase:', err)
      } finally {
        setLoading(false)
      }
    }

    loadLoyalty()

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [slug])

  // Función para instalar PWA
  const handleInstallPWA = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstallable(false)
    }
    setDeferredPrompt(null)
  }

  // Registro de Pase
  const handleStartPass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneInput || !program) return

    setIsRegistering(true)
    const cleanPhone = phoneInput.replace(/[^0-9]/g, '')

    try {
      let { data: existingPass } = await supabase
        .from('loyalty_passes')
        .select('*')
        .eq('program_id', program.id)
        .eq('customer_phone', cleanPhone)
        .maybeSingle()

      if (!existingPass) {
        const { data: newPass, error } = await supabase
          .from('loyalty_passes')
          .insert([{
            program_id: program.id,
            customer_phone: cleanPhone,
            customer_name: nameInput.trim() || 'Cliente VIP',
            current_stamps: 1,
          }])
          .select()
          .single()

        if (error) throw error
        existingPass = newPass

        await supabase.from('loyalty_stamps').insert([{
          pass_id: newPass.id,
          stamps_added: 1,
          action_type: 'ADD',
          note: 'Sello de Bienvenida'
        }])

        setToastMessage('🎉 ¡Bienvenido! Te regalamos tu 1er sello.')
      }

      setPass(existingPass)
      localStorage.setItem(`mogu_pass_phone_${profile.id}`, cleanPhone)
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setIsRegistering(false)
    }
  }

  // Acreditar con PIN (o Canjear si completó la tarjeta)
  const handleAddStampWithPin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pass || !inputPin) return

    setValidating(true)
    try {
      const isRedeem = pass.current_stamps >= program.stamps_required

      const { data, error } = await supabase.rpc('add_loyalty_stamp', {
        target_pass_id: pass.id,
        input_pin: inputPin.trim(),
        input_nfc_key: null,
        is_redeem_action: isRedeem
      })

      if (error) throw error

      if (data.success) {
        setPass({ ...pass, current_stamps: data.current_stamps })
        setIsValidationModalOpen(false)
        setInputPin('')
        setToastMessage(data.message)
        setTimeout(() => setToastMessage(null), 3500)
      } else {
        alert(data.message || 'Acción no autorizada.')
      }
    } catch (err: any) {
      alert(`Error de validación: ${err.message}`)
    } finally {
      setValidating(false)
    }
  }

  // Acreditar con NFC
  const handleScanNFC = async () => {
    if (!nfcSupported) {
      alert('Tu navegador no soporta lectura NFC directa. Utiliza el PIN de caja.')
      return
    }

    setNfcScanning(true)
    try {
      // @ts-ignore
      const ndef = new NDEFReader()
      await ndef.scan()

      // @ts-ignore
      ndef.addEventListener("reading", async ({ serialNumber }: any) => {
        const nfcToken = serialNumber || program.nfc_secret_key
        const isRedeem = pass.current_stamps >= program.stamps_required

        const { data, error } = await supabase.rpc('add_loyalty_stamp', {
          target_pass_id: pass.id,
          input_pin: null,
          input_nfc_key: nfcToken,
          is_redeem_action: isRedeem
        })

        setNfcScanning(false)
        if (!error && data?.success) {
          setPass({ ...pass, current_stamps: data.current_stamps })
          setIsValidationModalOpen(false)
          setToastMessage(data.message)
          setTimeout(() => setToastMessage(null), 3500)
        } else {
          alert(data?.message || 'Tag NFC no reconocido para este local.')
        }
      })
    } catch (err: any) {
      console.error('Error NFC:', err)
      setNfcScanning(false)
      alert(`Error al escanear NFC: ${err.message || 'Permiso denegado'}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center p-6 text-center">
        <FiGift className="w-12 h-12 text-neutral-600 mb-3" />
        <h2 className="text-lg font-bold">Programa no activo</h2>
        <p className="text-xs text-neutral-400 mt-1">Este local aún no tiene activa su tarjeta de fidelización.</p>
      </div>
    )
  }

  const isCardCompleted = pass && pass.current_stamps >= program.stamps_required

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F5F5F7] font-sans selection:bg-neutral-800 pb-20 flex flex-col justify-between">
      
      {/* HEADER */}
      <header className="p-6 text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1 shadow-2xl overflow-hidden">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white">M</div>
          )}
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-bold block">
          {program.collection_tag || '✦ MOGU PASS ✦'}
        </span>
        <h1 className="text-xl font-extrabold tracking-tight">{profile?.full_name || slug}</h1>
        <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          {sourceType === 'menu' ? 'Menú & Restobar' : 'Tienda & Catálogo'}
        </span>
      </header>

      {/* VISTA REGISTRO O TARJETA */}
      {!pass ? (
        <main className="max-w-md mx-auto px-6 w-full space-y-6">
          <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800 text-center space-y-4 backdrop-blur-xl shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-xl">
              <FiGift />
            </div>
            <div>
              <h2 className="text-base font-bold">Obtén tu Tarjeta Digital</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Ingresa tu número de teléfono para comenzar a acumular sellos en cada visita.
              </p>
            </div>

            <form onSubmit={handleStartPass} className="space-y-3 pt-2">
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-xs" />
                <input
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-black border border-neutral-800 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500 transition"
                  required
                />
              </div>

              <input
                type="text"
                placeholder="Tu Nombre (Opcional)"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-black border border-neutral-800 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500 transition"
              />

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-3.5 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-2xl transition hover:bg-neutral-200 cursor-pointer flex items-center justify-center gap-2"
              >
                {isRegistering ? <FiLoader className="animate-spin" /> : <FiCheckCircle />}
                <span>{isRegistering ? 'Creando Pase...' : 'Obtener mi Tarjeta'}</span>
              </button>
            </form>
          </div>
        </main>
      ) : (
        <main className="max-w-md mx-auto px-6 w-full space-y-6">
          
          {/* BOTÓN INSTALAR PWA (SI ESTÁ DISPONIBLE) */}
          {isInstallable && (
            <button
              onClick={handleInstallPWA}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
            >
              <FiDownload className="text-sm stroke-[2.5]" />
              <span>📲 Añadir Tarjeta a Pantalla de Inicio</span>
            </button>
          )}

          {/* TARJETA VISUAL */}
          <div 
            className="relative w-full rounded-[32px] p-6 border border-white/20 shadow-2xl backdrop-blur-2xl transition-all duration-500 overflow-hidden space-y-6"
            style={{
              background: `linear-gradient(135deg, ${program.card_color_bg || '#0A0A0C'} 0%, #18181B 100%)`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block">Pase del Cliente</span>
                <h3 className="text-sm font-bold text-white">{pass.customer_name || 'Cliente VIP'}</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {pass.current_stamps} / {program.stamps_required} Sellos
              </span>
            </div>

            {/* GRID DE SELLOS */}
            <div className="grid grid-cols-5 gap-3 pt-2">
              {Array.from({ length: program.stamps_required }).map((_, index) => {
                const isStamped = index < pass.current_stamps
                const isLast = index === program.stamps_required - 1

                return (
                  <div
                    key={index}
                    className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-500 border ${
                      isStamped
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-lg scale-105'
                        : isLast
                        ? 'bg-white/10 text-emerald-400 border-emerald-500/50 animate-pulse'
                        : 'bg-black/40 text-neutral-600 border-white/10'
                    }`}
                  >
                    {isStamped ? (
                      <FiCheckCircle className="text-lg stroke-[2.5]" />
                    ) : isLast ? (
                      <FiAward className="text-lg" />
                    ) : (
                      <span className="text-xs font-bold opacity-40">{index + 1}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* TARJETA DE ESTADO / PREMIO */}
          {isCardCompleted ? (
            <div className="p-5 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-2 animate-bounce">
              <span className="text-xs font-black uppercase text-emerald-400 tracking-wider block">🎁 ¡Tarjeta Completada!</span>
              <p className="text-xs text-white font-medium">Muestra esta pantalla al garzón para reclamar tu premio.</p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-400">
              Faltan <strong className="text-white">{program.stamps_required - pass.current_stamps} sellos</strong> para tu premio: <span className="text-emerald-400 font-bold">{program.reward_title}</span>
            </div>
          )}

          {/* BOTÓN DE ACCIÓN (ACREDITAR O CANJEAR) */}
          <div className="space-y-3">
            <button
              onClick={() => setIsValidationModalOpen(true)}
              className={`w-full py-4 font-extrabold text-xs uppercase tracking-widest rounded-2xl transition active:scale-[0.98] cursor-pointer shadow-xl flex items-center justify-center gap-2 ${
                isCardCompleted ? 'bg-amber-400 hover:bg-amber-300 text-black' : 'bg-emerald-500 hover:bg-emerald-400 text-black'
              }`}
            >
              <FiRadio className="text-base animate-pulse" />
              <span>{isCardCompleted ? 'Canjear Premio (NFC / PIN)' : 'Sumar Sello (NFC / PIN)'}</span>
            </button>
          </div>

        </main>
      )}

      {/* MODAL DE VALIDACIÓN NFC Y PIN */}
      {isValidationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xs rounded-3xl bg-[#121215] border border-neutral-800 p-6 space-y-5 text-center shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-xs font-bold text-neutral-400 flex items-center gap-1.5">
                <FiLock className="text-emerald-400" />
                <span>{isCardCompleted ? 'Validar Canje en Caja' : 'Validar Sello en Caja'}</span>
              </span>
              <button onClick={() => setIsValidationModalOpen(false)} className="text-neutral-500 hover:text-white">
                <FiX />
              </button>
            </div>

            {/* NFC */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <FiRadio className="mx-auto text-2xl text-emerald-400 animate-bounce" />
              <p className="text-[11px] text-neutral-300">Acerca tu teléfono al sticker o tarjeta NFC del local:</p>
              <button
                onClick={handleScanNFC}
                disabled={nfcScanning}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {nfcScanning ? <FiLoader className="animate-spin" /> : <FiRadio />}
                <span>{nfcScanning ? 'Escaneando...' : 'Tocar Tag NFC'}</span>
              </button>
            </div>

            {/* PIN */}
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <p className="text-[11px] text-neutral-400">O ingresa el PIN del garzón/caja:</p>
              <form onSubmit={handleAddStampWithPin} className="space-y-3">
                <input
                  type="password"
                  maxLength={6}
                  placeholder="PIN"
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  className="w-full text-center tracking-[0.5em] text-lg py-2.5 rounded-2xl bg-black border border-neutral-800 text-white outline-none focus:border-emerald-500"
                />

                <button
                  type="submit"
                  disabled={validating}
                  className="w-full py-3 bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  {validating ? 'Verificando...' : 'Confirmar PIN'}
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* TOAST FLOTANTE */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-500 text-black text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <FiCheck />
          <span>{toastMessage}</span>
        </div>
      )}

      <footer className="p-6 text-center">
        <span className="text-[10px] text-neutral-600 font-medium tracking-widest uppercase">
          mogu.cl ✦ Loyalty NFC
        </span>
      </footer>

    </div>
  )
}