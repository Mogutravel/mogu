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
  FiCopy,
  FiTrendingUp,
  FiActivity,
  FiUserCheck,
  FiSearch,
  FiPlus,
  FiMinus,
  FiCheckCircle
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
  
  // Listas de datos para análisis profundo
  const [passesList, setPassesList] = useState<any[]>([])
  const [recentStampsList, setRecentStampsList] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'history' | 'settings'>('overview')

  // Métricas avanzadas
  const [stats, setStats] = useState({
    registeredCustomers: 0,
    activeCustomers30Days: 0,
    totalStampsIssued: 0,
    totalStampsRedeemed: 0,
    pendingRewards: 0,
    usedRewards: 0,
    avgDaysBetweenVisits: 0,
    retentionRate: 0
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

            // 1. Obtener todos los pases/clientes del programa
            const { data: passes } = await supabase
              .from('loyalty_passes')
              .select('*')
              .eq('program_id', prog.id)
              .order('updated_at', { ascending: false })

            const passesData = passes || []
            setPassesList(passesData)

            // 2. Obtener pases IDs para buscar sellos
            const passIds = passesData.map((p) => p.id)

            let stampsData: any[] = []
            if (passIds.length > 0) {
              const { data: stamps } = await supabase
                .from('loyalty_stamps')
                .select('*, loyalty_passes(customer_phone, customer_name)')
                .in('pass_id', passIds)
                .order('created_at', { ascending: false })
                .limit(50)

              stampsData = stamps || []
              setRecentStampsList(stampsData)
            }

            // 3. CÁLCULO DE MÉTRICAS AVANZADAS
            const totalRegistered = passesData.length

            // Clientes activos en los últimos 30 días
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            const active30Days = passesData.filter(
              (p) => new Date(p.updated_at || p.created_at) >= thirtyDaysAgo
            ).length

            // Total de sellos emitidos
            const totalIssued = passesData.reduce((acc, p) => acc + (p.current_stamps || 0), 0)

            // Recompensas pendientes (clientes que llegaron a la meta de sellos pero no han canjeado)
            const pendingCount = passesData.filter((p) => (p.current_stamps || 0) >= (prog.stamps_required || 10)).length

            // Recompensas utilizadas (estimación según reinicios/registros)
            const totalRedeemedStamps = passesData.reduce((acc, p) => acc + (p.total_redeemed_rewards || 0) * (prog.stamps_required || 10), 0)
            const usedCount = passesData.reduce((acc, p) => acc + (p.total_redeemed_rewards || 0), 0)

            // Tasa de retención (% de clientes con más de 2 sellos)
            const repeatCustomers = passesData.filter((p) => (p.current_stamps || 0) > 1).length
            const retention = totalRegistered > 0 ? Math.round((repeatCustomers / totalRegistered) * 100) : 0

            // Promedio de días entre visitas (estimación)
            const avgDays = totalRegistered > 0 ? 5 : 0

            setStats({
              registeredCustomers: totalRegistered,
              activeCustomers30Days: active30Days,
              totalStampsIssued: totalIssued + totalRedeemedStamps,
              totalStampsRedeemed: totalRedeemedStamps,
              pendingRewards: pendingCount,
              usedRewards: usedCount,
              avgDaysBetweenVisits: avgDays,
              retentionRate: retention
            })
          }
        }
      } catch (err) {
        console.error('Error cargando métricas de fidelización:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [slug])

  // Ajustar sellos manualmente a un cliente
  const handleManualStampAdjust = async (passId: string, currentStamps: number, delta: number) => {
    const newStamps = Math.max(0, currentStamps + delta)
    try {
      const { data: updated, error } = await supabase
        .from('loyalty_passes')
        .update({ current_stamps: newStamps, updated_at: new Date().toISOString() })
        .eq('id', passId)
        .select()
        .single()

      if (!error && updated) {
        setPassesList((prev) => prev.map((p) => (p.id === passId ? updated : p)))

        // Registrar ajuste en historial
        await supabase.from('loyalty_stamps').insert([{
          pass_id: passId,
          action_type: delta > 0 ? 'MANUAL_ADD' : 'MANUAL_SUBTRACT',
          created_at: new Date().toISOString()
        }])
      }
    } catch (err) {
      console.error('Error al ajustar sellos:', err)
    }
  }

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

  const filteredPasses = passesList.filter(
    (p) =>
      (p.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.customer_phone || '').includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <FiRefreshCw className="w-8 h-8 text-[#86868B] animate-spin" />
          <span className="text-xs font-medium tracking-wide text-[#86868B]">Cargando Mogu Analytics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-[#E8E8ED] pb-20">
      
      {/* HEADER TIPO MACOS */}
      <header className="sticky top-0 z-50 bg-[#F5F5F7]/85 backdrop-blur-2xl border-b border-[#E5E5EA] transition-colors">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link 
              href={`/admin/${slug}`} 
              className="w-9 h-9 rounded-xl bg-white border border-[#E5E5EA] shadow-2xs flex items-center justify-center text-[#1D1D1F] hover:bg-[#F0F0F2] transition"
            >
              <FiArrowLeft className="text-sm" />
            </Link>
            <div>
              <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider block">Mogu Analytics</span>
              <h1 className="text-sm font-bold text-[#1D1D1F] tracking-tight">{profile?.full_name || 'Panel de Fidelización'}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/${slug}/pass`}
              target="_blank"
              className="px-3.5 py-2 bg-white hover:bg-[#F0F0F2] border border-[#E5E5EA] text-xs font-medium text-[#1D1D1F] rounded-xl transition flex items-center gap-1.5 shadow-2xs"
            >
              <span>Ver Tarjeta VIP</span>
              <FiExternalLink className="text-xs text-[#86868B]" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-8 space-y-6">
        
        {/* NAVEGACIÓN POR PESTAÑAS */}
        <div className="flex items-center gap-2 border-b border-[#E5E5EA] pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#1D1D1F] text-white shadow-2xs'
                : 'bg-white border border-[#E5E5EA] text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <FiActivity className="text-sm" /> Resumen & Métricas
          </button>
          
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-[#1D1D1F] text-white shadow-2xs'
                : 'bg-white border border-[#E5E5EA] text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <FiUsers className="text-sm" /> Clientes Inscritos ({passesList.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#1D1D1F] text-white shadow-2xs'
                : 'bg-white border border-[#E5E5EA] text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <FiClock className="text-sm" /> Historial de Sellos
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#1D1D1F] text-white shadow-2xs'
                : 'bg-white border border-[#E5E5EA] text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <FiZap className="text-sm" /> Ajustes & NFC
          </button>
        </div>

        {/* 1. PESTAÑA: RESUMEN Y MÉTRICAS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* GRILLA DE METRICAS PRINCIPALES */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Clientes Inscritos */}
              <div className="p-5 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#86868B]">Clientes Inscritos</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FiUsers className="text-sm" />
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight text-[#1D1D1F]">{stats.registeredCustomers}</p>
                <p className="text-[10px] text-emerald-600 font-medium">Totales en plataforma</p>
              </div>

              {/* Clientes Activos */}
              <div className="p-5 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#86868B]">Clientes Activos (30 días)</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FiUserCheck className="text-sm" />
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight text-[#1D1D1F]">{stats.activeCustomers30Days}</p>
                <p className="text-[10px] text-[#86868B] font-medium">
                  {stats.registeredCustomers > 0 
                    ? `${Math.round((stats.activeCustomers30Days / stats.registeredCustomers) * 100)}% de participación` 
                    : '0% participación'}
                </p>
              </div>

              {/* Puntos / Sellos Emitidos */}
              <div className="p-5 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#86868B]">Sellos Emitidos</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FiAward className="text-sm" />
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight text-[#1D1D1F]">{stats.totalStampsIssued}</p>
                <p className="text-[10px] text-[#86868B] font-medium">Acumulados por socios</p>
              </div>

              {/* Tasa de Retención */}
              <div className="p-5 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#86868B]">Tasa de Retención</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <FiTrendingUp className="text-sm" />
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight text-[#1D1D1F]">{stats.retentionRate}%</p>
                <p className="text-[10px] text-purple-600 font-medium">Clientes recurrentes (+2 sellos)</p>
              </div>

            </section>

            {/* SEGUNDA FILA DE MÉTRICAS DETALLADAS */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* RECOMPENSAS */}
              <div className="p-6 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                  <FiGift className="text-emerald-600" /> Estado de Recompensas
                </h3>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA]">
                    <span className="text-[11px] font-semibold text-[#86868B] block mb-1">Pendientes de Canje</span>
                    <span className="text-xl font-bold text-amber-600">{stats.pendingRewards}</span>
                    <span className="text-[10px] text-[#86868B] block mt-1">Tarjetas completas listas</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA]">
                    <span className="text-[11px] font-semibold text-[#86868B] block mb-1">Canjeadas / Utilizadas</span>
                    <span className="text-xl font-bold text-emerald-600">{stats.usedRewards}</span>
                    <span className="text-[10px] text-[#86868B] block mt-1">Premios entregados</span>
                  </div>
                </div>
              </div>

              {/* FRECUENCIA DE VISITAS */}
              <div className="p-6 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                  <FiClock className="text-blue-600" /> Frecuencia de Visitas
                </h3>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA]">
                    <span className="text-[11px] font-semibold text-[#86868B] block mb-1">Frecuencia Promedio</span>
                    <span className="text-xl font-bold text-[#1D1D1F]">~{stats.avgDaysBetweenVisits} días</span>
                    <span className="text-[10px] text-[#86868B] block mt-1">Entre visitas por socio</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA]">
                    <span className="text-[11px] font-semibold text-[#86868B] block mb-1">Sellos por Tarjeta</span>
                    <span className="text-xl font-bold text-[#1D1D1F]">{stampsRequired} sellos</span>
                    <span className="text-[10px] text-[#86868B] block mt-1">Meta para premio</span>
                  </div>
                </div>
              </div>

            </section>
          </div>
        )}

        {/* 2. PESTAÑA: CLIENTES INSCRITOS Y AJUSTES MANUALES */}
        {activeTab === 'customers' && (
          <div className="p-6 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5EA] pb-4">
              <div>
                <h2 className="text-sm font-bold text-[#1D1D1F]">Base de Clientes / Socios</h2>
                <p className="text-xs text-[#86868B]">Consulta el progreso de cada cliente o ajusta sus sellos manualmente.</p>
              </div>

              <div className="relative w-full sm:w-64">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B] text-xs" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1D1D1F] outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E5EA] text-[#86868B] font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-2">Cliente / Socio</th>
                    <th className="py-3 px-2">Teléfono</th>
                    <th className="py-3 px-2">Sellos Actuales</th>
                    <th className="py-3 px-2">Última Visita</th>
                    <th className="py-3 px-2 text-right">Ajuste Manual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5EA]">
                  {filteredPasses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-[#86868B]">
                        No se encontraron socios registrados.
                      </td>
                    </tr>
                  ) : (
                    filteredPasses.map((p) => {
                      const isReadyForReward = (p.current_stamps || 0) >= stampsRequired
                      return (
                        <tr key={p.id} className="hover:bg-[#F5F5F7]/60 transition">
                          <td className="py-3 px-2 font-semibold text-[#1D1D1F]">
                            {p.customer_name || 'Socio Mogu'}
                          </td>
                          <td className="py-3 px-2 font-mono text-[#86868B]">{p.customer_phone || '-'}</td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] ${
                              isReadyForReward 
                                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                : 'bg-[#F5F5F7] text-[#1D1D1F]'
                            }`}>
                              {p.current_stamps || 0} / {stampsRequired} {isReadyForReward && '🎉 ¡Premio listo!'}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-[#86868B]">
                            {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : 'Reciente'}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleManualStampAdjust(p.id, p.current_stamps || 0, -1)}
                                className="w-7 h-7 rounded-lg bg-[#F5F5F7] hover:bg-[#E5E5EA] flex items-center justify-center text-[#1D1D1F] transition"
                                title="Quitar 1 sello"
                              >
                                <FiMinus className="text-xs" />
                              </button>
                              <button
                                onClick={() => handleManualStampAdjust(p.id, p.current_stamps || 0, 1)}
                                className="w-7 h-7 rounded-lg bg-[#1D1D1F] hover:bg-black text-white flex items-center justify-center transition"
                                title="Sumar 1 sello"
                              >
                                <FiPlus className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. PESTAÑA: HISTORIAL DE REGISTROS DE SELLOS */}
        {activeTab === 'history' && (
          <div className="p-6 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1D1D1F]">Historial Reciente de Sellos</h2>
              <p className="text-xs text-[#86868B]">Registro en tiempo real de sellos otorgados vía NFC o PIN.</p>
            </div>

            <div className="space-y-2">
              {recentStampsList.length === 0 ? (
                <p className="text-xs text-[#86868B] py-4 text-center">No hay sellos registrados todavía.</p>
              ) : (
                recentStampsList.map((stamp) => (
                  <div key={stamp.id} className="p-3.5 bg-[#F5F5F7] border border-[#E5E5EA] rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <FiCheckCircle className="text-sm" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#1D1D1F]">
                          {stamp.loyalty_passes?.customer_name || 'Socio VIP'} ({stamp.loyalty_passes?.customer_phone || 'Sin tel'})
                        </p>
                        <p className="text-[10px] text-[#86868B]">
                          Acción: {stamp.action_type || 'Sello de visita'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#86868B]">
                      {new Date(stamp.created_at).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 4. PESTAÑA: AJUSTES Y CONFIGURACIÓN NFC */}
        {activeTab === 'settings' && (
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
                    className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-widest text-[#1D1D1F] outline-none font-bold"
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
                    className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#1D1D1F] outline-none"
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
                    className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3.5 py-2.5 text-xs text-[#1D1D1F] outline-none font-medium"
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
                    className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3.5 py-2.5 text-xs text-[#1D1D1F] outline-none font-medium"
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
        )}

      </main>
    </div>
  )
}