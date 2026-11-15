'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  FiGrid, 
  FiArrowLeft, 
  FiRefreshCw, 
  FiTrendingUp, 
  FiDollarSign, 
  FiCreditCard, 
  FiShoppingBag, 
  FiClock,
  FiCalendar,
  FiLock
} from 'react-icons/fi'

interface SaleHistoryItem {
  id: string
  store_slug: string
  table_number: number
  total_amount: number
  payment_method: string
  items_summary: any[]
  created_at: string
}

export default function MetricasVentasPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [salesHistory, setSalesHistory] = useState<SaleHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isEcosystemPlan, setIsEcosystemPlan] = useState<boolean | null>(null)

  // 1. Verificar plan del comercio antes de cargar las métricas
  useEffect(() => {
    async function checkPlanAndFetch() {
      if (!slug) return
      try {
        setLoading(true)

        // Consultamos el perfil y su configuración de tienda / plan
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('slug', slug)
          .maybeSingle()

        if (!profileData) {
          setLoading(false)
          return
        }

        const { data: configData } = await supabase
          .from('store_config')
          .select('plan_tier, plan')
          .eq('profile_id', profileData.id)
          .maybeSingle()

        // Verificamos si el plan es ecosystem (ajusta según el campo que utilices en tu DB)
        const currentPlan = configData?.plan_tier || configData?.plan || '';
        const hasAccess = currentPlan.toLowerCase() === 'ecosystem';
        
        setIsEcosystemPlan(hasAccess)

        // Si tiene acceso, cargamos las ventas
        if (hasAccess) {
          await fetchSalesHistory()
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error('Error verificando plan o métricas:', err)
        setLoading(false)
      }
    }

    checkPlanAndFetch()
  }, [slug])

  const fetchSalesHistory = async () => {
    if (!slug) return
    try {
      const { data, error } = await supabase
        .from('table_sales_history')
        .select('*')
        .eq('store_slug', slug)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSalesHistory(data || [])
    } catch (err) {
      console.error('Error al cargar historial de métricas:', err)
    } finally {
      setLoading(false)
    }
  }

  // Realtime exclusivo si tiene el plan
  useEffect(() => {
    if (!slug || !isEcosystemPlan) return

    const channel = supabase
      .channel(`metrics-realtime-${slug}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'table_sales_history', filter: `store_slug=eq.${slug}` },
        (payload) => {
          setSalesHistory((prev) => [payload.new as SaleHistoryItem, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [slug, isEcosystemPlan])

  // Si está validando el plan
  if (isEcosystemPlan === null && loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white/50 text-xs font-sans">
        Verificando privilegios del plan...
      </div>
    )
  }

  // SI NO ES PLAN ECOSYSTEM: Bloquear pantalla con aviso profesional
  if (isEcosystemPlan === false) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white font-sans p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-[#141416] border border-[#27272A] rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 text-2xl">
            <FiLock />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black tracking-tight">Función Exclusiva de Mogu Ecosystem</h1>
            <p className="text-xs text-white/60 leading-relaxed">
              Las métricas avanzadas, el desglose de ventas por hora y los reportes detallados están disponibles únicamente para comercios con el plan <span className="text-emerald-400 font-bold">Mogu Ecosystem</span>.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => router.push(`/panel/menu/${slug}`)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
            >
              Volver al Panel Principal
            </button>
            <button
              onClick={() => router.push(`/admin/${slug}`)}
              className="w-full py-2.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-white/70 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Ir a Ajustes del Local
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Cálculos de Métricas Globales (Solo para Ecosystem)
  const totalVentasGlobal = salesHistory.reduce((acc, curr) => acc + Number(curr.total_amount), 0)
  const totalTransacciones = salesHistory.length
  const totalEfectivo = salesHistory.filter(s => s.payment_method?.toLowerCase() === 'efectivo').reduce((acc, curr) => acc + Number(curr.total_amount), 0)
  const totalTarjeta = salesHistory.filter(s => s.payment_method?.toLowerCase() === 'tarjeta').reduce((acc, curr) => acc + Number(curr.total_amount), 0)
  const totalTransferencia = salesHistory.filter(s => s.payment_method?.toLowerCase() === 'transferencia').reduce((acc, curr) => acc + Number(curr.total_amount), 0)

  return (
    <div className="min-h-screen bg-[#09090B] text-white font-sans p-6 space-y-8">
      {/* Cabecera */}
      <header className="flex items-center justify-between border-b border-[#27272A] pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/panel/menu/${slug}`)}
            className="p-2.5 bg-[#18181B] border border-[#27272A] rounded-xl text-white/70 hover:text-white transition cursor-pointer"
          >
            <FiArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <FiTrendingUp className="text-emerald-400" /> Métricas y Desglose de Ventas
            </h1>
            <p className="text-xs text-white/50 mt-1">
              Historial analítico de consumos por hora y métodos de pago para <span className="text-emerald-400 font-bold uppercase">{slug}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            En Vivo
          </span>
          <button
            onClick={fetchSalesHistory}
            className="p-2.5 bg-[#18181B] border border-[#27272A] rounded-xl text-white/70 hover:text-white transition cursor-pointer"
          >
            <FiRefreshCw />
          </button>
        </div>
      </header>

      {/* TARJETAS DE MÉTRICAS GLOBALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141416] border border-[#27272A] rounded-3xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-xs font-bold uppercase tracking-wider">Ventas Totales</span>
            <FiTrendingUp className="text-emerald-400 text-lg" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            ${totalVentasGlobal.toLocaleString('es-CL')}
          </p>
          <p className="text-[11px] text-white/40">{totalTransacciones} transacciones registradas</p>
        </div>

        <div className="bg-[#141416] border border-[#27272A] rounded-3xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-xs font-bold uppercase tracking-wider">Efectivo</span>
            <FiDollarSign className="text-emerald-400 text-lg" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            ${totalEfectivo.toLocaleString('es-CL')}
          </p>
          <p className="text-[11px] text-white/40">Pagos directos en caja</p>
        </div>

        <div className="bg-[#141416] border border-[#27272A] rounded-3xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-xs font-bold uppercase tracking-wider">Tarjeta / POS</span>
            <FiCreditCard className="text-sky-400 text-lg" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            ${totalTarjeta.toLocaleString('es-CL')}
          </p>
          <p className="text-[11px] text-white/40">Transbank / Terminales</p>
        </div>

        <div className="bg-[#141416] border border-[#27272A] rounded-3xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-white/50">
            <span className="text-xs font-bold uppercase tracking-wider">Transferencia</span>
            <FiShoppingBag className="text-purple-400 text-lg" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            ${totalTransferencia.toLocaleString('es-CL')}
          </p>
          <p className="text-[11px] text-white/40">Pagos digitales directos</p>
        </div>
      </div>

      {/* SECCIÓN DETALLADA: DESGLOSE HORA POR HORA Y MESA */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-white/70 flex items-center gap-2">
          <FiClock className="text-sky-400" /> Registro Detallado de Ventas por Mesa y Hora
        </h2>

        {loading ? (
          <p className="text-xs text-white/40 text-center py-12">Cargando métricas y registros históricos...</p>
        ) : salesHistory.length === 0 ? (
          <div className="bg-[#141416] border border-[#27272A] rounded-3xl p-12 text-center space-y-3">
            <FiCalendar className="text-4xl text-white/20 mx-auto" />
            <p className="text-sm font-bold text-white/60">Aún no hay ventas registradas en el sistema.</p>
            <p className="text-xs text-white/40">Las transacciones aparecerán aquí automáticamente en cuanto cierres una mesa desde el panel de caja.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salesHistory.map((sale) => (
              <div key={sale.id} className="bg-[#141416] border border-[#27272A] rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-xl">
                      Mesa {sale.table_number}
                    </span>
                    <span className="text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2.5 py-0.5 rounded-lg capitalize">
                      {sale.payment_method}
                    </span>
                  </div>

                  <div className="text-xs text-white/50 flex items-center gap-1.5 font-mono pt-1">
                    <FiClock className="text-white/40" />
                    <span>{new Date(sale.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} hrs</span>
                    <span className="text-white/30">{new Date(sale.created_at).toLocaleDateString('es-CL')}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#27272A]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">Detalle de productos:</p>
                  <div className="space-y-1 pl-2 border-l-2 border-emerald-500/30 max-h-36 overflow-y-auto pr-1">
                    {Array.isArray(sale.items_summary) && sale.items_summary.map((item: any, idx: number) => {
                      const productItems = item.items || [item]
                      return productItems.map((prod: any, i: number) => (
                        <div key={`${idx}-${i}`} className="flex justify-between text-xs text-white/80">
                          <span>{prod.quantity || 1}x {prod.product_name || prod.name}</span>
                          <span className="font-mono">${((prod.quantity || 1) * (prod.unit_price || prod.price || 0)).toLocaleString('es-CL')}</span>
                        </div>
                      ))
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#27272A]">
                  <span className="text-xs text-white/50 uppercase font-bold">Total Venta</span>
                  <span className="font-black text-emerald-400 font-mono text-base">${Number(sale.total_amount).toLocaleString('es-CL')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}