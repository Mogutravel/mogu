'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoyaltyCard } from '@/components/LoyaltyCard'
import Link from 'next/link'
import { FiArrowLeft, FiLock, FiShield, FiUser, FiPhone } from 'react-icons/fi'

function LoyaltyPassContent() {
  const params = useParams()
  const slug = params?.slug as string

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [program, setProgram] = useState<any>(null)
  const [pass, setPass] = useState<any>(null)
  
  // Estados para registro de nuevos clientes
  const [needsRegistration, setNeedsRegistration] = useState(false)
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!slug) return
      setLoading(true)

      try {
        // 1. Obtener perfil del comercio por su slug
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', slug)
          .maybeSingle()

        if (prof) {
          setProfile(prof)

          // 2. Obtener programa de fidelización del comercio
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
                // Cliente nuevo: solicitar inscripción inicial
                setNeedsRegistration(true)
              } else {
                // Cliente existente: cargar la tarjeta de inmediato
                await fetchOrCreatePass(prog.id, savedPhone)
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
            current_stamps: 0,
            reward_status: 'none'
          }])
          .select()
          .single()

        passData = insertErr 
          ? { id: 'demo-pass-' + Date.now(), program_id: programId, customer_phone: phone, current_stamps: 0, reward_status: 'none' } 
          : newPass
      }

      setPass(passData)
      return passData
    } catch (err) {
      const fallbackPass = { id: 'demo-pass-' + Date.now(), program_id: programId, customer_phone: phone, current_stamps: 0, reward_status: 'none' }
      setPass(fallbackPass)
      return fallbackPass
    }
  }

  // Registro del cliente nuevo por única vez
  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regName.trim() || !regPhone.trim() || !profile || !program) return

    setRegistering(true)
    try {
      const cleanPhone = regPhone.trim()
      const cleanName = regName.trim()

      localStorage.setItem(`mogu_customer_phone_${profile.id}`, cleanPhone)
      await fetchOrCreatePass(program.id, cleanPhone, cleanName)
      setNeedsRegistration(false)
    } catch (err) {
      console.error('Error al registrar cliente:', err)
    } finally {
      setRegistering(false)
    }
  }

  // 🛡️ VALIDACIÓN PRESENCIAL CON LÍMITE DIARIO Y GENERACIÓN DE CÓDIGO VIP
  const handleValidatePin = async (pin: string): Promise<boolean> => {
    try {
      const expectedPin = program?.validation_pin || '1234'
      if (pin !== expectedPin) {
        alert('❌ PIN incorrecto')
        return false
      }

      let currentPass = pass
      if (!currentPass?.id && program?.id) {
        const savedPhone = localStorage.getItem(`mogu_customer_phone_${profile?.id}`) || '+56912345678'
        currentPass = await fetchOrCreatePass(program.id, savedPhone)
      }

      if (!currentPass?.id) {
        alert('❌ No se encontró el pase del cliente.')
        return false
      }

      // 1. OBTENER FECHA DE HOY (UTC 00:00:00)
      const now = new Date()
      const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)).toISOString()

      // 2. VERIFICAR SI YA TIENE SELLO HOY EN SUPABASE
      if (!String(currentPass.id).startsWith('demo-pass-')) {
        const { data: todayStamps, error: checkError } = await supabase
          .from('loyalty_stamps')
          .select('id')
          .eq('pass_id', currentPass.id)
          .gte('created_at', todayStart)

        if (checkError) {
          alert('⚠️ Error consultando sellos: ' + checkError.message)
          console.error(checkError)
        }

        if (todayStamps && todayStamps.length > 0) {
          alert('⚠️ ¡Ya registraste tu sello de hoy! Te esperamos mañana.')
          return false
        }
      }

      const totalRequired = program?.stamps_required || 10
      const newStamps = (currentPass.current_stamps || 0) + 1
      const isCompleted = newStamps >= totalRequired

      // Generar o mantener Código VIP si completó los sellos
      let rewardCodeToSave = currentPass.reward_code
      let rewardStatusToSave = currentPass.reward_status || 'none'

      if (isCompleted && (!rewardCodeToSave || rewardStatusToSave !== 'pending')) {
        const randomNum = Math.floor(1000 + Math.random() * 9000)
        rewardCodeToSave = `REWARD-${randomNum}`
        rewardStatusToSave = 'pending'
      }

      if (String(currentPass.id).startsWith('demo-pass-')) {
        setPass({ 
          ...currentPass, 
          current_stamps: newStamps,
          reward_code: rewardCodeToSave,
          reward_status: rewardStatusToSave
        })
        return true
      }

      // 3. INSERTAR EN LA TABLA loyalty_stamps CON action_type 'pin'
      const { error: stampError } = await supabase
        .from('loyalty_stamps')
        .insert([{
          pass_id: currentPass.id,
          action_type: 'pin',
          created_at: new Date().toISOString()
        }])

      if (stampError) {
        alert('❌ Error al guardar sello en loyalty_stamps: ' + stampError.message)
        console.error(stampError)
        return false
      }

      // 4. ACTUALIZAR CONTADOR Y CÓDIGO RECOMPENSA EN loyalty_passes
      const { data: updated, error: passError } = await supabase
        .from('loyalty_passes')
        .update({ 
          current_stamps: newStamps,
          reward_code: rewardCodeToSave,
          reward_status: rewardStatusToSave,
          updated_at: new Date().toISOString() 
        })
        .eq('id', currentPass.id)
        .select()
        .single()

      if (passError) {
        alert('❌ Error al actualizar loyalty_passes: ' + passError.message)
        console.error(passError)
        return false
      }

      if (updated) {
        setPass(updated)
        return true
      }

      return false
    } catch (err: any) {
      alert('❌ Excepción general en PIN: ' + (err?.message || err))
      console.error(err)
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

  // Vista de inscripción para clientes nuevos
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
                Inscríbete por única vez para activar tu tarjeta VIP y acumular tus sellos en caja.
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
                {registering ? 'Activando tarjeta...' : 'Activar mi Tarjeta VIP 🚀'}
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
          rewardCode={pass?.reward_code}
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