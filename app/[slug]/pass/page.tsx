'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoyaltyCard } from '@/components/LoyaltyCard'
import Link from 'next/link'
import { FiArrowLeft, FiLock, FiShield, FiCheckCircle, FiUser, FiPhone } from 'react-icons/fi'

function LoyaltyPassContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const slug = params?.slug as string
  const urlNfcToken = searchParams.get('nfc_token')

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [program, setProgram] = useState<any>(null)
  const [pass, setPass] = useState<any>(null)
  
  // Estados para el registro de nuevos clientes
  const [needsRegistration, setNeedsRegistration] = useState(false)
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [registering, setRegistering] = useState(false)

  const [nfcSuccessMsg, setNfcSuccessMsg] = useState('')

  useEffect(() => {
    async function loadData() {
      if (!slug) return
      setLoading(true)
      try {
        // 1. Guardar token NFC en sessionStorage si viene en la URL (para persistirlo tras registro)
        if (urlNfcToken) {
          sessionStorage.setItem(`mogu_pending_nfc_${slug}`, urlNfcToken)
        }
        const activeNfcToken = urlNfcToken || sessionStorage.getItem(`mogu_pending_nfc_${slug}`)

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
              const savedPhone = localStorage.getItem(`mogu_customer_phone_${prof.id}`)

              if (!savedPhone) {
                setNeedsRegistration(true)
              } else {
                const currentPass = await fetchOrCreatePass(prog.id, savedPhone)
                if (activeNfcToken && currentPass) {
                  await handleNfcAutoStamp(prog, currentPass, activeNfcToken)
                }
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
  }, [slug, urlNfcToken])

  async function fetchOrCreatePass(programId: string, phone: string, customerName?: string) {
    try {
      let { data: passData } = await supabase
        .from('loyalty_passes')
        .select('*')
        .eq('program_id', programId)
        .eq('customer_phone', phone)
        .maybeSingle()

      if (!passData) {
        const { data: newPass, error: insertErr } = await supabase
          .from('loyalty_passes')
          .insert([{ 
            program_id: programId, 
            customer_phone: phone, 
            customer_name: customerName || 'Socio Mogu',
            current_stamps: 0 
          }])
          .select()
          .single()

        passData = insertErr ? { id: 'demo-pass-' + Date.now(), program_id: programId, customer_phone: phone, current_stamps: 0 } : newPass
      }

      setPass(passData)
      return passData
    } catch (err) {
      const fallbackPass = { id: 'demo-pass-' + Date.now(), program_id: programId, customer_phone: phone, current_stamps: 0 }
      setPass(fallbackPass)
      return fallbackPass
    }
  }

  // Manejar el registro del cliente nuevo y aplicar el sello pendiente de inmediato
  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regName.trim() || !regPhone.trim() || !profile || !program) return

    setRegistering(true)
    try {
      const cleanPhone = regPhone.trim()
      const cleanName = regName.trim()

      localStorage.setItem(`mogu_customer_phone_${profile.id}`, cleanPhone)

      const currentPass = await fetchOrCreatePass(program.id, cleanPhone, cleanName)

      // Recuperar token NFC pendiente
      const pendingNfc = sessionStorage.getItem(`mogu_pending_nfc_${slug}`)
      if (pendingNfc && currentPass) {
        await handleNfcAutoStamp(program, currentPass, pendingNfc)
        sessionStorage.removeItem(`mogu_pending_nfc_${slug}`)
      }

      setNeedsRegistration(false)
    } catch (err) {
      console.error('Error al registrar cliente:', err)
    } finally {
      setRegistering(false)
    }
  }

  // Lógica de validación del NFC automático con suma inmediata
  async function handleNfcAutoStamp(programData: any, passData: any, tokenToValidate: string) {
    if (!programData.nfc_secret_key || tokenToValidate !== programData.nfc_secret_key) {
      return
    }

    if (!String(passData.id).startsWith('demo-pass-')) {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const { data: todayStamps } = await supabase
        .from('loyalty_stamps')
        .select('id')
        .eq('pass_id', passData.id)
        .gte('created_at', todayStart.toISOString())

      if (todayStamps && todayStamps.length > 0) {
        setNfcSuccessMsg('⚠️ Ya habías registrado tu sello de hoy. ¡Vuelve mañana!')
        setTimeout(() => setNfcSuccessMsg(''), 4000)
        sessionStorage.removeItem(`mogu_pending_nfc_${slug}`)
        window.history.replaceState({}, '', window.location.pathname)
        return
      }
    }

    const newStamps = (passData.current_stamps || 0) + 1

    if (!String(passData.id).startsWith('demo-pass-')) {
      await supabase.from('loyalty_stamps').insert([{
        pass_id: passData.id,
        action_type: 'ADD',
        created_at: new Date().toISOString()
      }])

      const { data: updated } = await supabase
        .from('loyalty_passes')
        .update({ current_stamps: newStamps, updated_at: new Date().toISOString() })
        .eq('id', passData.id)
        .select()
        .single()

      if (updated) setPass(updated)
    } else {
      setPass({ ...passData, current_stamps: newStamps })
    }

    setNfcSuccessMsg('🎉 ¡Sello sumado de inmediato vía NFC!')
    setTimeout(() => setNfcSuccessMsg(''), 5000)

    sessionStorage.removeItem(`mogu_pending_nfc_${slug}`)
    window.history.replaceState({}, '', window.location.pathname)
  }

  // Validar con PIN (Fallback presencial)
  const handleValidatePin = async (pin: string): Promise<boolean> => {
    try {
      const expectedPin = program?.validation_pin || '1234'
      if (pin !== expectedPin) return false

      let currentPass = pass
      if (!currentPass?.id && program?.id) {
        const savedPhone = localStorage.getItem(`mogu_customer_phone_${profile?.id}`) || '+56912345678'
        currentPass = await fetchOrCreatePass(program.id, savedPhone)
      }

      if (!currentPass?.id) return false

      if (!String(currentPass.id).startsWith('demo-pass-')) {
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        const { data: todayStamps } = await supabase
          .from('loyalty_stamps')
          .select('id')
          .eq('pass_id', currentPass.id)
          .gte('created_at', todayStart.toISOString())

        if (todayStamps && todayStamps.length > 0) {
          alert('¡Ya registraste tu sello de hoy! Te esperamos mañana.')
          return false
        }
      }

      const newStamps = (currentPass.current_stamps || 0) + 1

      if (String(currentPass.id).startsWith('demo-pass-')) {
        setPass({ ...currentPass, current_stamps: newStamps })
        return true
      }

      await supabase.from('loyalty_stamps').insert([{
        pass_id: currentPass.id,
        action_type: 'ADD',
        created_at: new Date().toISOString()
      }])

      const { data: updated } = await supabase
        .from('loyalty_passes')
        .update({ current_stamps: newStamps, updated_at: new Date().toISOString() })
        .eq('id', currentPass.id)
        .select()
        .single()

      if (updated) {
        setPass(updated)
        return true
      }
      return false
    } catch (err) {
      return false
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
        <h2 className="text-lg font-bold tracking-tight mb-1 text-[#1D1D1F]">Tarjeta no disponible</h2>
        <p className="text-xs text-[#86868B] mb-6 leading-relaxed">
          Este comercio aún no ha activado su programa de miembros o se encuentra pausado.
        </p>
        <Link href={`/${slug}`} className="px-5 py-3 bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold rounded-2xl transition shadow-sm">
          Volver al comercio
        </Link>
      </div>
    )
  }

  // VISTA DE INSCRIPCIÓN PARA CLIENTES NUEVOS
  if (needsRegistration) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans flex flex-col justify-between p-6 max-w-md mx-auto selection:bg-[#E8E8ED]">
        <header className="flex items-center justify-between pt-2">
          <Link href={`/${slug}`} className="w-10 h-10 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm flex items-center justify-center text-[#1D1D1F] hover:bg-[#F0F0F2] transition">
            <FiArrowLeft className="text-sm" />
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/85 backdrop-blur-md border border-[#E5E5EA] rounded-full shadow-2xs">
            <FiShield className="text-xs text-emerald-600" />
            <span className="text-[11px] font-semibold tracking-tight text-[#1D1D1F]">Inscripción VIP</span>
          </div>
          <div className="w-10" />
        </header>

        <main className="my-auto py-8 space-y-6">
          <div className="bg-white/90 backdrop-blur-2xl border border-[#E5E5EA] rounded-[32px] p-7 shadow-sm text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 mx-auto flex items-center justify-center text-xl shadow-2xs">
              🎁
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1D1D1F] tracking-tight">¡Bienvenido a {profile?.full_name || 'Mogu'}!</h2>
              <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                Inscríbete por única vez para activar tu tarjeta VIP y registrar tu sello de hoy al instante.
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
                    className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-2xl pl-10 pr-4 py-3 text-xs text-[#1D1D1F] focus:ring-2 focus:ring-[#86868B]/35 outline-none font-medium"
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
                    className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-2xl pl-10 pr-4 py-3 text-xs text-[#1D1D1F] focus:ring-2 focus:ring-[#86868B]/35 outline-none font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={registering}
                className="w-full py-3.5 bg-[#1D1D1F] hover:bg-black text-white font-semibold text-xs rounded-2xl transition shadow-sm cursor-pointer disabled:opacity-50 mt-2"
              >
                {registering ? 'Activando tarjeta...' : 'Activar mi Tarjeta y Sumar Sello 🚀'}
              </button>
            </form>
          </div>
        </main>

        <footer className="text-center text-[10px] tracking-widest uppercase text-[#86868B] font-medium pb-2">
          mogu.cl • Loyalty Registration
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans flex flex-col justify-between p-6 max-w-md mx-auto selection:bg-[#E8E8ED]">
      <header className="flex items-center justify-between pt-2">
        <Link href={`/${slug}`} className="w-10 h-10 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm flex items-center justify-center text-[#1D1D1F] hover:bg-[#F0F0F2] transition">
          <FiArrowLeft className="text-sm" />
        </Link>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-md border border-[#E5E5EA] rounded-full shadow-2xs">
          <FiShield className="text-xs text-emerald-600" />
          <span className="text-[11px] font-semibold tracking-tight text-[#1D1D1F]">Mogu Pass</span>
        </div>
        <div className="w-10" />
      </header>

      <main className="my-auto py-6">
        {nfcSuccessMsg && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs font-semibold text-emerald-800 text-center flex items-center justify-center gap-2 shadow-2xs animate-bounce">
            <FiCheckCircle className="text-sm text-emerald-600" />
            <span>{nfcSuccessMsg}</span>
          </div>
        )}

        <LoyaltyCard
          businessName={profile?.full_name || 'Comercio Mogu'}
          programName={program?.collection_tag || 'Club Frecuente'}
          categoryTitle={`Socio: ${pass?.customer_name || 'VIP'}`}
          themeType="retail"
          currentStamps={pass?.current_stamps || 0}
          totalStamps={program?.stamps_required || 10}
          rewardTitle={program?.reward_title || 'Premio de fidelidad'}
          rewardDescription="Válida para canjear en tu próxima visita presencial"
          membershipId={`Tel: ${pass?.customer_phone || ''}`}
          onValidatePin={handleValidatePin}
        />
      </main>

      <footer className="text-center text-[10px] tracking-widest uppercase text-[#86868B] font-medium pb-2">
        mogu.cl • NFC Web Loyalty
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