'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  FiArrowLeft, 
  FiKey, 
  FiAward, 
  FiGift, 
  FiUsers, 
  FiCheck, 
  FiSave,
  FiRefreshCw,
  FiClock,
  FiExternalLink,
  FiZap,
  FiWifi,
  FiCopy
} from 'react-icons/fi'

export default function UniversalLoyaltyAdminPanelPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [copiedNfc, setCopiedNfc] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [program, setProgram] = useState<any>(null)
  const [stats, setStats] = useState({
    totalPasses: 0,
    totalStamps: 0,
    todayStamps: 0
  })

  // Form states
  const [validationPin, setValidationPin] = useState('1234')
  const [nfcSecretKey, setNfcSecretKey] = useState('')
  const [stampsRequired, setStampsRequired] = useState(10)
  const [rewardTitle, setRewardTitle] = useState('')
  const [collectionTag, setCollectionTag] = useState('')
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    async function loadAdminData() {
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

          let { data: prog } = await supabase
            .from('loyalty_programs')
            .select('*')
            .eq('profile_id', prof.id)
            .maybeSingle()

          if (prog) {
            setProgram(prog)
            setValidationPin(prog.validation_pin || '1234')
            const defaultNfc = prog.nfc_secret_key || `${slug}_nfc_${Math.random().toString(36).substring(2, 8)}`
            setNfcSecretKey(defaultNfc)
            setStampsRequired(prog.stamps_required || 10)
            setRewardTitle(prog.reward_title || '10% de descuento / Producto de regalo')
            setCollectionTag(prog.collection_tag || 'Club Mogu')
            setIsActive(prog.is_active ?? false)

            const { data: passes } = await supabase
              .from('loyalty_passes')
              .select('id, current_stamps')
              .eq('program_id', prog.id)

            const totalPassesCount = passes?.length || 0
            const totalStampsCount = passes?.reduce((acc, p) => acc + (p.current_stamps || 0), 0) || 0

            const todayStart = new Date()
            todayStart.setHours(0, 0, 0, 0)

            const { data: stampsToday } = await supabase
              .from('loyalty_stamps')
              .select('id')
              .gte('created_at', todayStart.toISOString())

            setStats({
              totalPasses: totalPassesCount,
              totalStamps: totalStampsCount,
              todayStamps: stampsToday?.length || 0
            })
          }
        }
      } catch (err) {
        console.error('Error cargando datos:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [slug])

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.id) return

    setSaving(true)
    setSaveSuccess(false)

    try {
      const payload = {
        profile_id: profile.id,
        validation_pin: validationPin,
        nfc_secret_key: nfcSecretKey,
        stamps_required: Number(stampsRequired),
        reward_title: rewardTitle,
        collection_tag: collectionTag,
        is_active: isActive,
        updated_at: new Date().toISOString()
      }

      if (program?.id) {
        const { data: updated, error } = await supabase
          .from('loyalty_programs')
          .update(payload)
          .eq('id', program.id)
          .select()
          .single()

        if (!error && updated) setProgram(updated)
      } else {
        const { data: created, error } = await supabase
          .from('loyalty_programs')
          .insert([payload])
          .select()
          .single()

        if (!error && created) setProgram(created)
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Error guardando configuración:', err)
    } finally {
      setSaving(false)
    }
  }

  const nfcFullUrl = `https://mogu.cl/${slug}/pass?nfc_token=${nfcSecretKey}`

  const copyNfcUrl = () => {
    navigator.clipboard.writeText(nfcFullUrl)
    setCopiedNfc(true)
    setTimeout(() => setCopiedNfc(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <FiRefreshCw className="w-8 h-8 text-[#86868B] animate-spin" />
          <span className="text-xs font-medium tracking-wide text-[#86868B]">Cargando Mogu Studio...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-[#E8E8ED] pb-20">
      <header className="sticky top-0 z-50 bg-[#F5F5F7]/85 backdrop-blur-2xl border-b border-[#E5E5EA] transition-colors">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Redirección estricta a app/admin/[slug] */}
            <Link 
              href={`/admin/${slug}`} 
              className="w-9 h-9 rounded-xl bg-white border border-[#E5E5EA] shadow-2xs flex items-center justify-center text-[#1D1D1F] hover:bg-[#F0F0F2] transition"
            >
              <FiArrowLeft className="text-sm" />
            </Link>
            <div>
              <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider block">Mogu Studio</span>
              <h1 className="text-sm font-bold text-[#1D1D1F] tracking-tight">{profile?.full_name || 'Fidelización VIP'}</h1>
            </div>
          </div>

          <Link
            href={`/${slug}/pass`}
            target="_blank"
            className="px-3.5 py-2 bg-white hover:bg-[#F0F0F2] border border-[#E5E5EA] text-xs font-medium text-[#1D1D1F] rounded-xl transition flex items-center gap-1.5 shadow-2xs"
          >
            <span>Ver Tarjeta en Vivo</span>
            <FiExternalLink className="text-xs text-[#86868B]" />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-8 space-y-6">
        {/* MÉTRICAS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center text-[#1D1D1F]">
              <FiUsers className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#86868B]">Socios Registrados</p>
              <p className="text-2xl font-bold tracking-tight text-[#1D1D1F]">{stats.totalPasses}</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center text-[#1D1D1F]">
              <FiAward className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#86868B]">Sellos Totales</p>
              <p className="text-2xl font-bold tracking-tight text-[#1D1D1F]">{stats.totalStamps}</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center text-[#1D1D1F]">
              <FiClock className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#86868B]">Emitidos Hoy</p>
              <p className="text-2xl font-bold tracking-tight text-[#1D1D1F]">{stats.todayStamps}</p>
            </div>
          </div>
        </section>

        {/* FORMULARIO Y MÓDULO NFC */}
        <section className="p-8 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5E5EA] pb-5 gap-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-emerald-200/60 mb-1">
                Servicio VIP Mogu ⚡
              </span>
              <h2 className="text-base font-bold text-[#1D1D1F] tracking-tight">Estado de la Suscripción</h2>
              <p className="text-xs text-[#86868B]">Activa o desactiva la tarjeta de fidelización pública.</p>
            </div>

            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
                isActive 
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs' 
                  : 'bg-[#F5F5F7] text-[#86868B] border-[#E5E5EA]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-neutral-400'}`} />
              {isActive ? 'Servicio Activo' : 'Inactivo / Pausado'}
            </button>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* PIN DE CAJA */}
              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1.5 flex items-center gap-1">
                  <FiKey className="text-xs" /> PIN de Validación (Caja)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={validationPin}
                  onChange={(e) => setValidationPin(e.target.value)}
                  placeholder="1234"
                  className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest text-[#1D1D1F] focus:ring-2 focus:ring-[#86868B]/35 outline-none transition font-bold"
                  required
                />
                <p className="text-[10px] text-[#86868B] mt-1">Clave de caja para autorizar sellos presenciales.</p>
              </div>

              {/* CANTIDAD DE SELLOS */}
              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1.5 flex items-center gap-1">
                  <FiAward className="text-xs" /> Sellos Necesarios
                </label>
                <input
                  type="number"
                  min={3}
                  max={20}
                  value={stampsRequired}
                  onChange={(e) => setStampsRequired(Number(e.target.value))}
                  className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#1D1D1F] focus:ring-2 focus:ring-[#86868B]/35 outline-none transition"
                  required
                />
                <p className="text-[10px] text-[#86868B] mt-1">Número de visitas para obtener la recompensa.</p>
              </div>
            </div>

            {/* MÓDULO NFC SEGURO */}
            <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
                  <FiWifi className="text-sm text-emerald-600" /> Configuración de Enlace NFC Físico
                </label>
                <span className="text-[10px] font-mono text-[#86868B]">Seguridad NFC</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={nfcFullUrl}
                  className="w-full bg-white border border-[#E5E5EA] rounded-xl px-3.5 py-2 text-xs font-mono text-[#86868B] outline-none select-all"
                />
                <button
                  type="button"
                  onClick={copyNfcUrl}
                  className="px-4 py-2 bg-white hover:bg-[#F0F0F2] border border-[#E5E5EA] text-xs font-semibold text-[#1D1D1F] rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-2xs"
                >
                  {copiedNfc ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                  <span>{copiedNfc ? 'Copiado' : 'Copiar URL'}</span>
                </button>
              </div>
              <p className="text-[10px] text-[#86868B]">
                Graba esta URL directamente en tus etiquetas NFC con la app <b>NFC Tools</b>. Al acercar el celular se otorgará el sello sin necesidad de ingresar PIN.
              </p>
            </div>

            {/* RECOMPENSA Y ETIQUETA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1.5 flex items-center gap-1">
                  <FiGift className="text-xs" /> Recompensa / Premio
                </label>
                <input
                  type="text"
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  placeholder="Ej: Café de regalo / 15% Descuento"
                  className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3.5 py-2.5 text-xs text-[#1D1D1F] focus:ring-2 focus:ring-[#86868B]/35 outline-none transition font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#86868B] mb-1.5">
                  Nombre del Club / Categoría
                </label>
                <input
                  type="text"
                  value={collectionTag}
                  onChange={(e) => setCollectionTag(e.target.value)}
                  placeholder="Ej: Club Frecuente, Socio Black Tier"
                  className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3.5 py-2.5 text-xs text-[#1D1D1F] focus:ring-2 focus:ring-[#86868B]/35 outline-none transition font-medium"
                />
              </div>
            </div>

            {/* BOTÓN DE GUARDADO */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#1D1D1F] hover:bg-black text-white font-medium text-xs rounded-xl transition shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <FiRefreshCw className="animate-spin text-xs" /> Guardando...
                  </>
                ) : saveSuccess ? (
                  <>
                    <FiCheck className="text-emerald-400 text-xs" /> ¡Cambios Aplicados!
                  </>
                ) : (
                  <>
                    <FiSave className="text-xs" /> Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}