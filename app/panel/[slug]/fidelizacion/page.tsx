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
  FiTrash2,
  FiGlobe
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
  
  const [passesList, setPassesList] = useState<any[]>([])
  const [recentStampsList, setRecentStampsList] = useState<any[]>([])
  const [rewardsList, setRewardsList] = useState<any[]>([])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'rewards' | 'history' | 'settings'>('overview')

  // Form states del programa
  const [validationPin, setValidationPin] = useState('1234')
  const [pointsPerVisit, setPointsPerVisit] = useState(15)
  const [nfcSecretKey, setNfcSecretKey] = useState('')
  const [collectionTag, setCollectionTag] = useState('')
  const [isActive, setIsActive] = useState(false)

  // Form state para crear/editar premios
  const [newRewardTitle, setNewRewardTitle] = useState('')
  const [newRewardDesc, setNewRewardDesc] = useState('')
  const [newRewardPoints, setNewRewardPoints] = useState(50)
  const [creatingReward, setCreatingReward] = useState(false)

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
          setPointsPerVisit(prog.points_per_visit || 15)
          const defaultNfc = prog.nfc_secret_key || `${slug}_nfc_${Math.random().toString(36).substring(2, 8)}`
          setNfcSecretKey(defaultNfc)
          setCollectionTag(prog.collection_tag || 'Club Mogu')
          setIsActive(prog.is_active ?? false)

          // 1. Obtener socios globales registrados en la red que han interactuado en este local
          const { data: passes } = await supabase
            .from('mogu_customers')
            .select(`
              *,
              mogu_wallets (
                total_mogu_points
              )
            `)
            .order('created_at', { ascending: false })

          setPassesList(passes || [])

          // 2. Obtener catálogo de premios de este local
          const { data: rewards } = await supabase
            .from('loyalty_rewards')
            .select('*')
            .eq('program_id', prog.id)
            .order('points_cost', { ascending: true })

          setRewardsList(rewards || [])

          // 3. Obtener historial de transacciones en este local
          const { data: transactions } = await supabase
            .from('loyalty_transactions')
            .select(`
              *,
              mogu_customers (
                full_name,
                phone
              )
            `)
            .eq('program_id', prog.id)
            .order('created_at', { ascending: false })
            .limit(50)

          setRecentStampsList(transactions || [])
        }
      }
    } catch (err) {
      console.error('Error cargando métricas de fidelización:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [slug])

  // CREAR PREMIO EN EL CATÁLOGO DEL LOCAL
  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!program?.id || !newRewardTitle.trim()) return

    setCreatingReward(true)
    try {
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .insert([{
          program_id: program.id,
          title: newRewardTitle.trim(),
          description: newRewardDesc.trim() || null,
          points_cost: Number(newRewardPoints),
          is_active: true
        }])
        .select()
        .single()

      if (error) {
        alert('❌ Error al crear premio: ' + error.message)
        return
      }

      if (data) {
        setRewardsList((prev) => [...prev, data])
        setNewRewardTitle('')
        setNewRewardDesc('')
        setNewRewardPoints(50)
      }
    } catch (err: any) {
      alert('❌ Error de conexión: ' + (err?.message || err))
    } finally {
      setCreatingReward(false)
    }
  }

  // ELIMINAR PREMIO DEL CATÁLOGO
  const handleDeleteReward = async (rewardId: string) => {
    if (!confirm('¿Seguro que deseas eliminar este premio del catálogo?')) return

    try {
      const { error } = await supabase
        .from('loyalty_rewards')
        .delete()
        .eq('id', rewardId)

      if (!error) {
        setRewardsList((prev) => prev.filter((r) => r.id !== rewardId))
      }
    } catch (err) {
      console.error('Error al eliminar premio:', err)
    }
  }

  // GUARDAR CONFIGURACIÓN GENERAL DEL LOCAL
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.id) return

    setSaving(true)
    setSaveSuccess(false)

    try {
      const payload = {
        profile_id: profile.id,
        validation_pin: validationPin,
        points_per_visit: Number(pointsPerVisit),
        nfc_secret_key: nfcSecretKey,
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
      (p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone || '').includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <FiRefreshCw className="w-8 h-8 text-[#86868B] animate-spin" />
          <span className="text-xs font-medium tracking-wide text-[#86868B]">Cargando Mogu Puntos Admin...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-[#E8E8ED] pb-20">
      
      {/* HEADER TIPO MACOS */}
      <header className="sticky top-0 z-50 bg-[#F5F5F7]/85 backdrop-blur-2xl border-b border-[#E5E5EA]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link 
              href={`/admin/${slug}`} 
              className="w-9 h-9 rounded-xl bg-white border border-[#E5E5EA] shadow-2xs flex items-center justify-center text-[#1D1D1F] hover:bg-[#F0F0F2] transition"
            >
              <FiArrowLeft className="text-sm" />
            </Link>
            <div>
              <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider flex items-center gap-1">
                <FiGlobe className="text-emerald-600" /> MoguTravel Points Network
              </span>
              <h1 className="text-sm font-bold text-[#1D1D1F] tracking-tight">{profile?.full_name || 'Panel de Fidelización'}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/${slug}/pass`}
              target="_blank"
              className="px-3.5 py-2 bg-white hover:bg-[#F0F0F2] border border-[#E5E5EA] text-xs font-medium text-[#1D1D1F] rounded-xl transition flex items-center gap-1.5 shadow-2xs"
            >
              <span>Ver Pase de Cliente</span>
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
            <FiActivity className="text-sm" /> Métricas
          </button>
          
          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'rewards'
                ? 'bg-[#1D1D1F] text-white shadow-2xs'
                : 'bg-white border border-[#E5E5EA] text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <FiGift className="text-sm" /> Catálogo de Premios ({rewardsList.length})
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-[#1D1D1F] text-white shadow-2xs'
                : 'bg-white border border-[#E5E5EA] text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <FiUsers className="text-sm" /> Viajeros Red Mogu ({passesList.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#1D1D1F] text-white shadow-2xs'
                : 'bg-white border border-[#E5E5EA] text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <FiClock className="text-sm" /> Historial de Transacciones
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#1D1D1F] text-white shadow-2xs'
                : 'bg-white border border-[#E5E5EA] text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <FiZap className="text-sm" /> Configuración & NFC
          </button>
        </div>

        {/* 1. PESTAÑA: RESUMEN Y MÉTRICAS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#86868B]">Viajeros Registrados</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FiUsers className="text-sm" />
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight text-[#1D1D1F]">{passesList.length}</p>
                <p className="text-[10px] text-emerald-600 font-medium">Billeteras Mogu activas</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#86868B]">Premios en Catálogo</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FiGift className="text-sm" />
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight text-[#1D1D1F]">{rewardsList.length}</p>
                <p className="text-[10px] text-[#86868B] font-medium">Opciones de canje publicadas</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#86868B]">Transacciones del Local</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FiAward className="text-sm" />
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight text-[#1D1D1F]">{recentStampsList.length}</p>
                <p className="text-[10px] text-[#86868B] font-medium">Sumas y canjes de puntos</p>
              </div>
            </section>
          </div>
        )}

        {/* 2. PESTAÑA: GESTIÓN DEL CATÁLOGO DE PREMIOS */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            {/* Formulario para agregar premio */}
            <div className="p-6 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
                <FiPlus className="text-emerald-600" /> Crear nuevo premio para este local
              </h2>

              <form onSubmit={handleCreateReward} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#86868B] mb-1">Título del Premio</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Café Espresso de cortesía"
                    value={newRewardTitle}
                    onChange={(e) => setNewRewardTitle(e.target.value)}
                    className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3 py-2 text-xs text-[#1D1D1F] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#86868B] mb-1">Descripción u Observaciones</label>
                  <input
                    type="text"
                    placeholder="Ej. Válido solo de lunes a viernes"
                    value={newRewardDesc}
                    onChange={(e) => setNewRewardDesc(e.target.value)}
                    className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3 py-2 text-xs text-[#1D1D1F] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#86868B] mb-1">Costo en Mogu Puntos</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      min={5}
                      value={newRewardPoints}
                      onChange={(e) => setNewRewardPoints(Number(e.target.value))}
                      className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3 py-2 text-xs font-bold text-[#1D1D1F] outline-none"
                    />
                    <button
                      type="submit"
                      disabled={creatingReward}
                      className="px-4 py-2 bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold rounded-xl transition shadow-2xs shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {creatingReward ? 'Guardando...' : 'Publicar'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Lista de premios del catálogo */}
            <div className="p-6 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-[#1D1D1F]">Premios Activos en el Local</h2>

              <div className="divide-y divide-[#E5E5EA]">
                {rewardsList.length === 0 ? (
                  <p className="text-xs text-[#86868B] py-4 text-center">No has publicado ningún premio todavía.</p>
                ) : (
                  rewardsList.map((reward) => (
                    <div key={reward.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[#1D1D1F]">{reward.title}</p>
                        <p className="text-[10px] text-[#86868B]">{reward.description || 'Sin condiciones adicionales'}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-lg text-xs">
                          {reward.points_cost} pts
                        </span>
                        <button
                          onClick={() => handleDeleteReward(reward.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition cursor-pointer"
                          title="Eliminar premio"
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. PESTAÑA: VIAJEROS / SOCIOS RED MOGU */}
        {activeTab === 'customers' && (
          <div className="p-6 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5EA] pb-4">
              <div>
                <h2 className="text-sm font-bold text-[#1D1D1F]">Directorio de Viajeros Mogu</h2>
                <p className="text-xs text-[#86868B]">Clientes conectados universalmente en la red MoguTravel.</p>
              </div>

              <div className="relative w-full sm:w-72">
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
                    <th className="py-3 px-2">Viajero / Socio</th>
                    <th className="py-3 px-2">Teléfono</th>
                    <th className="py-3 px-2">Nivel de Viajero</th>
                    <th className="py-3 px-2 text-right">Mogu Puntos Globales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5EA]">
                  {filteredPasses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-[#86868B]">
                        No se encontraron viajeros registrados.
                      </td>
                    </tr>
                  ) : (
                    filteredPasses.map((c) => (
                      <tr key={c.id} className="hover:bg-[#F5F5F7]/60 transition">
                        <td className="py-3 px-2 font-semibold text-[#1D1D1F]">{c.full_name}</td>
                        <td className="py-3 px-2 font-mono text-[#86868B]">{c.phone}</td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-0.5 bg-[#F5F5F7] border border-[#E5E5EA] rounded-full text-[10px] font-bold uppercase text-[#1D1D1F]">
                            {c.traveler_tier || 'Explorer'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-extrabold text-emerald-600 text-sm">
                          {c.mogu_wallets?.[0]?.total_mogu_points || 0} pts
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. PESTAÑA: HISTORIAL DE TRANSACCIONES DEL LOCAL */}
        {activeTab === 'history' && (
          <div className="p-6 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1D1D1F]">Historial de Puntos en este Local</h2>
              <p className="text-xs text-[#86868B]">Libro contable transaccional (Ledger) en tiempo real.</p>
            </div>

            <div className="space-y-2">
              {recentStampsList.length === 0 ? (
                <p className="text-xs text-[#86868B] py-4 text-center">No hay transacciones registradas todavía.</p>
              ) : (
                recentStampsList.map((t) => {
                  const isEarn = t.points_change > 0
                  return (
                    <div key={t.id} className="p-3.5 bg-[#F5F5F7] border border-[#E5E5EA] rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-[#1D1D1F]">
                          {t.mogu_customers?.full_name || 'Viajero'} ({t.mogu_customers?.phone || 'Sin tel'})
                        </p>
                        <p className="text-[10px] text-[#86868B]">{t.description || t.transaction_type}</p>
                      </div>

                      <div className="text-right">
                        <span className={`font-extrabold text-xs ${isEarn ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {isEarn ? `+${t.points_change}` : t.points_change} pts
                        </span>
                        <p className="text-[9px] font-mono text-[#86868B]">
                          {new Date(t.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* 5. PESTAÑA: CONFIGURACIÓN GENERAL */}
        {activeTab === 'settings' && (
          <section className="p-8 rounded-3xl bg-white border border-[#E5E5EA] shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5E5EA] pb-5 gap-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-emerald-200/60 mb-1">
                  MoguTravel Network ⚡
                </span>
                <h2 className="text-base font-bold text-[#1D1D1F] tracking-tight">Parámetros de Fidelización</h2>
                <p className="text-xs text-[#86868B]">Activa o pausa el servicio en tu local.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs' 
                    : 'bg-[#F5F5F7] text-[#86868B] border-[#E5E5EA]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-neutral-400'}`} />
                {isActive ? 'Programa Activo' : 'Pausado'}
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                  <p className="text-[10px] text-[#86868B] mt-1">Clave presencial para autorizar puntos en caja.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#86868B] mb-1.5 flex items-center gap-1">
                    <FiAward className="text-xs" /> Puntos otorgados por visita
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={pointsPerVisit}
                    onChange={(e) => setPointsPerVisit(Number(e.target.value))}
                    className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#1D1D1F] outline-none"
                    required
                  />
                  <p className="text-[10px] text-[#86868B] mt-1">Mogu Puntos ganados por cada validación de PIN.</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1D1D1F] flex items-center gap-1.5">
                    <FiWifi className="text-sm text-emerald-600" /> Enlace NFC para Acumulación Rápida
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
                    className="px-4 py-2 bg-white hover:bg-[#F0F0F2] border border-[#E5E5EA] text-xs font-semibold text-[#1D1D1F] rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
                  >
                    {copiedNfc ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                    <span>{copiedNfc ? 'Copiado' : 'Copiar URL'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#E5E5EA]">
                {saveSuccess ? (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <FiCheck /> ¡Configuración guardada correctamente!
                  </span>
                ) : <span />}

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold rounded-xl transition shadow-2xs cursor-pointer disabled:opacity-50 flex items-center gap-2 ml-auto"
                >
                  <FiSave className="text-sm" />
                  <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </section>
        )}

      </main>
    </div>
  )
}