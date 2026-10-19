'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  FiGift, 
  FiSave, 
  FiCheck, 
  FiLoader, 
  FiUsers, 
  FiLock, 
  FiSliders, 
  FiExternalLink,
  FiAward,
  FiTrendingUp
} from 'react-icons/fi'

interface LoyaltyAdminPanelProps {
  sourceType?: 'tienda' | 'menu'
}

export default function LoyaltyAdminPanel({ sourceType = 'tienda' }: LoyaltyAdminPanelProps) {
  const params = useParams()
  const slug = params?.slug as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [message, setMessage] = useState('')

  // Formulario de Configuración del Programa
  const [programId, setProgramId] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [programName, setProgramName] = useState('Club de Fidelización')
  const [collectionTag, setCollectionTag] = useState('✦ MOGU PASS ✦')
  const [stampsRequired, setStampsRequired] = useState(10)
  const [rewardTitle, setRewardTitle] = useState('Premio Sorpresa')
  const [rewardDescription, setRewardDescription] = useState('¡Felicidades! Muestra este pase en caja para canjear.')
  const [validationPin, setValidationPin] = useState('1234')
  const [cardColorBg, setCardColorBg] = useState('#0A0A0C')
  const [cardColorAccent, setCardColorAccent] = useState('#10B981')

  // Datos y Métricas
  const [passesList, setPassesList] = useState<any[]>([])
  const [stampsHistoryList, setStampsHistoryList] = useState<any[]>([])

  useEffect(() => {
    async function loadAdminLoyalty() {
      if (!slug) return
      setLoading(true)

      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', slug)
          .single()

        if (!profileData) {
          setLoading(false)
          return
        }

        setProfile(profileData)

        // Cargar Programa
        const { data: prog } = await supabase
          .from('loyalty_programs')
          .select('*')
          .eq('profile_id', profileData.id)
          .maybeSingle()

        if (prog) {
          setProgramId(prog.id)
          setIsActive(prog.is_active)
          setProgramName(prog.program_name || 'Club de Fidelización')
          setCollectionTag(prog.collection_tag || '✦ MOGU PASS ✦')
          setStampsRequired(prog.stamps_required || 10)
          setRewardTitle(prog.reward_title || 'Premio Sorpresa')
          setRewardDescription(prog.reward_description || '')
          setValidationPin(prog.validation_pin || '1234')
          setCardColorBg(prog.card_color_bg || '#0A0A0C')
          setCardColorAccent(prog.card_color_accent || '#10B981')

          // Cargar Clientes Registrados (Pases)
          const { data: passes } = await supabase
            .from('loyalty_passes')
            .select('*')
            .eq('program_id', prog.id)
            .order('updated_at', { ascending: false })

          if (passes && passes.length > 0) {
            setPassesList(passes)

            // Cargar Historial de Sellos para las Métricas del Mes
            const passIds = passes.map((p) => p.id)
            const { data: history } = await supabase
              .from('loyalty_stamps')
              .select('*')
              .in('pass_id', passIds)

            if (history) setStampsHistoryList(history)
          }
        }
      } catch (err) {
        console.error('Error cargando panel de fidelización:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAdminLoyalty()
  }, [slug])

  // --- CÁLCULO DE MÉTRICAS ---
  const monthlyStampsCount = useMemo(() => {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    return stampsHistoryList.filter(
      (s) => s.action_type === 'ADD' && new Date(s.created_at) >= startOfMonth
    ).length
  }, [stampsHistoryList])

  const totalRedeemedRewards = useMemo(() => {
    return stampsHistoryList.filter((s) => s.action_type === 'REDEEM').length
  }, [stampsHistoryList])

  const topFrequentCustomers = useMemo(() => {
    return [...passesList]
      .sort((a, b) => b.current_stamps - a.current_stamps)
      .slice(0, 5)
  }, [passesList])

  // Guardar Cambios del Programa
  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    setMessage('')

    try {
      const payload = {
        profile_id: profile.id,
        program_name: programName.trim(),
        collection_tag: collectionTag.trim(),
        stamps_required: stampsRequired,
        reward_title: rewardTitle.trim(),
        reward_description: rewardDescription.trim(),
        validation_pin: validationPin.trim(),
        card_color_bg: cardColorBg,
        card_color_accent: cardColorAccent,
        is_active: isActive,
      }

      if (programId) {
        const { error } = await supabase
          .from('loyalty_programs')
          .update(payload)
          .eq('id', programId)

        if (error) throw error
      } else {
        const { data: newProg, error } = await supabase
          .from('loyalty_programs')
          .insert([payload])
          .select()
          .single()

        if (error) throw error
        if (newProg) setProgramId(newProg.id)
      }

      setMessage('✨ Configuración del programa guardada con éxito.')
      setTimeout(() => setMessage(''), 3500)
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  const publicPassUrl = sourceType === 'menu' ? `/menu/${slug}/pass` : `/catalogo/${slug}/pass`

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 font-sans pb-24">
      
      {/* CABECERA PANEL */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <FiGift className="text-emerald-500" />
            <span>Gestión de Fidelización Digital ({sourceType === 'menu' ? 'Menú' : 'Tienda'})</span>
          </h1>
          <p className="text-xs text-neutral-500">
            Configura reglas, revisa estadísticas de recompra y valida recompensas.
          </p>
        </div>

        <Link
          href={publicPassUrl}
          target="_blank"
          className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-semibold hover:bg-neutral-200 transition flex items-center gap-2 cursor-pointer"
        >
          <span>Ver Vista Cliente</span>
          <FiExternalLink />
        </Link>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <FiCheck />
          <span>{message}</span>
        </div>
      )}

      {/* MÉTRICAS DEL COMERCIO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
          <span className="text-xs text-neutral-500 font-semibold flex items-center gap-1.5">
            <FiTrendingUp className="text-emerald-500" />
            <span>Sellos Entregados Este Mes</span>
          </span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{monthlyStampsCount}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
          <span className="text-xs text-neutral-500 font-semibold flex items-center gap-1.5">
            <FiAward className="text-amber-500" />
            <span>Premios Canjeados</span>
          </span>
          <p className="text-2xl font-extrabold text-amber-500">{totalRedeemedRewards}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
          <span className="text-xs text-neutral-500 font-semibold flex items-center gap-1.5">
            <FiUsers className="text-blue-500" />
            <span>Clientes VIP Inscritos</span>
          </span>
          <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">{passesList.length}</p>
        </div>
      </div>

      {/* FORMULARIO DE CONFIGURACIÓN Y PREVISUALIZADOR */}
      <form onSubmit={handleSaveProgram} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
              <FiSliders />
              <span>Reglas del Programa</span>
            </h3>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
              <span>{isActive ? 'Programa Activo' : 'Inactivo'}</span>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                Etiqueta Superior de la Tarjeta
              </label>
              <input
                type="text"
                value={collectionTag}
                onChange={(e) => setCollectionTag(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                Número de Sellos Necesarios
              </label>
              <input
                type="number"
                min={3}
                max={20}
                value={stampsRequired}
                onChange={(e) => setStampsRequired(parseInt(e.target.value) || 10)}
                className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                Título del Premio Final
              </label>
              <input
                type="text"
                placeholder="Ej. Plato Principal Gratis / 20% OFF"
                value={rewardTitle}
                onChange={(e) => setRewardTitle(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs font-bold outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                PIN de Seguridad (Caja / Garzón)
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs" />
                <input
                  type="text"
                  maxLength={6}
                  value={validationPin}
                  onChange={(e) => setValidationPin(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-mono font-bold outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
              Instrucción o Descripción del Premio
            </label>
            <textarea
              rows={2}
              value={rewardDescription}
              onChange={(e) => setRewardDescription(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs outline-none resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold text-xs rounded-xl transition hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
              <span>{saving ? 'Guardando...' : 'Guardar Programa'}</span>
            </button>
          </div>
        </div>

        {/* PREVISUALIZADOR RÁPIDO DE LA TARJETA */}
        <div className="p-6 rounded-3xl bg-neutral-900 text-white border border-neutral-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">Vista Previa</span>
            
            <div 
              className="p-5 rounded-2xl border border-white/20 space-y-4 shadow-xl"
              style={{ background: cardColorBg }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[8px] uppercase tracking-widest text-neutral-400 font-bold block">{collectionTag}</span>
                  <h4 className="text-xs font-bold">{profile?.full_name || 'Mi Negocio'}</h4>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  3 / {stampsRequired}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: Math.min(10, stampsRequired) }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold border ${
                      i < 3 ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-black/40 border-white/10 text-neutral-600'
                    }`}
                  >
                    {i < 3 ? '✓' : i + 1}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-neutral-800 text-[11px] space-y-1">
              <span className="text-emerald-400 font-bold block">Premio:</span>
              <p className="font-semibold">{rewardTitle}</p>
            </div>
          </div>

          <div className="text-[10px] text-neutral-500 text-center border-t border-neutral-800 pt-3">
            PIN para validar en caja: <strong className="text-white font-mono">{validationPin}</strong>
          </div>
        </div>

      </form>

      {/* LISTA DE CLIENTES FRECUENTES */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
            <FiUsers className="text-emerald-500" />
            <span>Clientes Frecuentes Más Activos</span>
          </h3>
        </div>

        {topFrequentCustomers.length === 0 ? (
          <p className="text-xs text-neutral-400 text-center py-8">
            Aún no hay clientes registrados en este programa.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[10px] uppercase text-neutral-400 font-bold">
                  <th className="py-2 px-3">Cliente</th>
                  <th className="py-2 px-3">Teléfono</th>
                  <th className="py-2 px-3">Sellos Actuales</th>
                  <th className="py-2 px-3">Premios Obtenidos</th>
                  <th className="py-2 px-3">Última Visita</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                {topFrequentCustomers.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <td className="py-3 px-3 font-semibold">{p.customer_name || 'Cliente VIP'}</td>
                    <td className="py-3 px-3 font-mono text-neutral-500">{p.customer_phone}</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {p.current_stamps} / {stampsRequired} sellos
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-500">
                      🎁 {p.total_rewards_earned || 0}
                    </td>
                    <td className="py-3 px-3 text-neutral-400 text-[11px]">
                      {new Date(p.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}