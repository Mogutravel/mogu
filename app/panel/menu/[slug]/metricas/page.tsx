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
  FiCalendar
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

  useEffect(() => {
    if (!slug) return
    fetchSalesHistory()

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
  }, [slug])

  // Cálculos de Métricas Globales
  const totalVentasGlobal = salesHistory.reduce((acc, curr) => acc + Number(curr.total_amount), 0)
  const totalTransacciones = salesHistory.length
  const totalEfectivo = salesHistory.filter(s => s.payment_method === 'Efectivo').reduce((acc, curr) => acc + Number(curr.total_amount), 0)
  const totalTarjeta = salesHistory.filter(s => s.payment_method === 'Tarjeta').reduce((acc, curr) => acc + Number(curr.total_amount), 0)
  const totalTransferencia = salesHistory.filter(s => s.payment_method === 'Transferencia').reduce((acc, curr) => acc + Number(curr.total_amount), 0)

  return (
    <div className="min-h-screen bg-[#09090B] text-white font-sans p-6 space-y-8">
      {/* Cabecera */}
      <header className="flex items-center justify-between border-b border-[#27272A] pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/admin/${slug}`)}
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
                    <span className="text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2.5 py-0.5 rounded-lg">
                      {sale.payment_method}
                    </span>
                  </div>

                  <div className="text-xs text-white/50 flex items-center gap-1.5 font-mono pt-1">
                    <FiClock className="text-white/40" />
                    {new Date(sale.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} hrs 
                    <span className="text-white/30">• {new Date(sale.created_at).toLocaleDateString('es-CL')}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#27272A]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">Detalle de productos:</p>
                  <div className="space-y-1 pl-2 border-l-2 border-emerald-500/30 max-h-36 overflow-y-auto pr-1">
                    {sale.items_summary?.map((group: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        {group.items?.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between text-xs text-white/80">
                            <span>{item.quantity}x {item.product_name}</span>
                            <span className="font-mono">${(item.quantity * item.unit_price).toLocaleString('es-CL')}</span>
                          </div>
                        ))}
                      </div>
                    ))}
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