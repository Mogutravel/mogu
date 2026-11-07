'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  FiTrendingUp, 
  FiDollarSign, 
  FiShoppingBag, 
  FiUsers, 
  FiClock, 
  FiArrowLeft, 
  FiRefreshCw,
  FiAward,
  FiPieChart,
  FiCalendar
} from 'react-icons/fi'

interface OrderItem {
  product_name: string
  quantity: number
  unit_price: number
}

interface Order {
  id: string
  store_slug: string
  table_number: number
  status: string
  total_amount: number
  created_at: string
  payment_method?: string
  items?: OrderItem[]
}

export default function RestaurantMetricsPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'hoy' | '7dias' | 'mes'>('7dias')
  const [orders, setOrders] = useState<Order[]>([])

  const fetchMetricsData = async () => {
    if (!slug) return
    setLoading(true)
    try {
      // Definir rango de fechas según el filtro seleccionado
      const now = new Date()
      let startDate = new Date()

      if (timeRange === 'hoy') {
        startDate.setHours(0, 0, 0, 0)
      } else if (timeRange === '7dias') {
        startDate.setDate(now.getDate() - 7)
      } else if (timeRange === 'mes') {
        startDate.setMonth(now.getMonth() - 1)
      }

      // Consultar órdenes pagadas o completadas en el rango
      const { data: ordersData, error: ordersErr } = await supabase
        .from('orders')
        .select('*')
        .eq('store_slug', slug)
        .gte('created_at', startDate.toISOString())

      if (ordersErr) throw ordersErr

      const orderIds = (ordersData || []).map((o) => o.id)
      let itemsData: OrderItem[] = []

      if (orderIds.length > 0) {
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds)
        itemsData = items || []
      }

      const fullOrders = (ordersData || []).map((ord) => ({
        ...ord,
        items: itemsData.filter((i: any) => i.order_id === ord.id),
      }))

      setOrders(fullOrders)
    } catch (err) {
      console.error('Error al cargar métricas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetricsData()
  }, [slug, timeRange])

  // --- CÁLCULOS ANALÍTICOS ---
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0)
  const totalOrdersCount = orders.length
  const averageTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0

  // Producto más vendido
  const productSalesMap: { [key: string]: { quantity: number; revenue: number } } = {}
  orders.forEach((ord) => {
    ord.items?.forEach((item) => {
      if (!productSalesMap[item.product_name]) {
        productSalesMap[item.product_name] = { quantity: 0, revenue: 0 }
      }
      productSalesMap[item.product_name].quantity += item.quantity
      productSalesMap[item.product_name].revenue += item.quantity * item.unit_price
    })
  })

  const topProducts = Object.entries(productSalesMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.quantity - a.quantity)

  const formatCLP = (amount: number) =>
    amount.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    })

  return (
    <div className="min-h-screen bg-[#09090B] text-white font-sans p-6 md:p-10 space-y-8">
      {/* Cabecera */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272A] pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/admin/${slug}`)}
            className="p-2.5 bg-[#18181B] border border-[#27272A] rounded-xl text-white/70 hover:text-white transition cursor-pointer"
          >
            <FiArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <FiTrendingUp className="text-emerald-400" /> Panel de Métricas & Rendimiento
            </h1>
            <p className="text-xs text-white/50 mt-1">
              Analítica de negocio en tiempo real para <span className="text-emerald-400 font-bold uppercase">{slug}</span>
            </p>
          </div>
        </div>

        {/* Filtros de Tiempo y Refrescar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-[#18181B] border border-[#27272A] p-1 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setTimeRange('hoy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                timeRange === 'hoy' ? 'bg-emerald-500 text-black shadow-lg' : 'text-white/60 hover:text-white'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setTimeRange('7dias')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                timeRange === '7dias' ? 'bg-emerald-500 text-black shadow-lg' : 'text-white/60 hover:text-white'
              }`}
            >
              Últimos 7 días
            </button>
            <button
              onClick={() => setTimeRange('mes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                timeRange === 'mes' ? 'bg-emerald-500 text-black shadow-lg' : 'text-white/60 hover:text-white'
              }`}
            >
              Este Mes
            </button>
          </div>

          <button
            onClick={fetchMetricsData}
            className="p-2.5 bg-[#18181B] border border-[#27272A] rounded-xl text-white/70 hover:text-white transition cursor-pointer"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* TARJETAS DE KPIs PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-[#141416] border border-[#27272A] rounded-3xl p-6 space-y-3 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">Ventas Totales</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg">
              <FiDollarSign />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">{formatCLP(totalRevenue)}</h2>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1"> ingresos en el periodo seleccionado</p>
          </div>
        </div>

        <div className="bg-[#141416] border border-[#27272A] rounded-3xl p-6 space-y-3 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">Comandas Procesadas</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center text-lg">
              <FiShoppingBag />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">{totalOrdersCount}</h2>
            <p className="text-[11px] text-sky-400 font-semibold mt-1"> pedidos atendidos con éxito</p>
          </div>
        </div>

        <div className="bg-[#141416] border border-[#27272A] rounded-3xl p-6 space-y-3 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/50">Ticket Promedio</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-lg">
              <FiPieChart />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">{formatCLP(averageTicket)}</h2>
            <p className="text-[11px] text-purple-400 font-semibold mt-1"> valor promedio por orden</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE PRODUCTOS ESTRELLA (RANKING DE VENTAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#141416] border border-[#27272A] rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-amber-400">
              <FiAward /> Ranking de Productos Más Vendidos
            </h3>
            <span className="text-xs text-white/50">Por volumen de unidades</span>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {topProducts.length === 0 ? (
              <p className="text-xs text-white/40 text-center py-10">No hay datos de ventas registrados para este periodo.</p>
            ) : (
              topProducts.map((prod, index) => (
                <div key={prod.name} className="flex items-center justify-between p-3.5 bg-[#1B1B1E] rounded-2xl border border-[#27272A]">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      index === 0 ? 'bg-amber-500 text-black' : index === 1 ? 'bg-zinc-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-neutral-800 text-white/60'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold">{prod.name}</p>
                      <p className="text-xs text-white/40">{prod.quantity} unidades vendidas</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-black text-emerald-400">
                    {formatCLP(prod.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RESUMEN OPERATIVO / INSIGHTS */}
        <div className="bg-[#141416] border border-[#27272A] rounded-3xl p-6 space-y-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-[#27272A] pb-4">
              <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-sky-400">
                <FiTrendingUp /> Insights & Recomendaciones de Operación
              </h3>
              <p className="text-xs text-white/50 mt-1">Análisis automatizado para la toma de decisiones</p>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-1">
                <p className="text-xs font-bold text-emerald-400">🚀 Producto Estrella</p>
                <p className="text-xs text-white/80">
                  {topProducts.length > 0 
                    ? `El plato "${topProducts[0].name}" lidera las ventas con ${topProducts[0].quantity} unidades. Asegúrate de tener stock suficiente en cocina para las horas peak.`
                    : 'Aún no hay suficientes datos para determinar el plato estrella.'}
                </p>
              </div>

              <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-2xl space-y-1">
                <p className="text-xs font-bold text-sky-400">💡 Optimización de Turnos</p>
                <p className="text-xs text-white/80">
                  El ticket promedio actual es de <span className="font-bold">{formatCLP(averageTicket)}</span>. Puedes incentivar el cross-selling (venta cruzada) de postres o aperitivos en la carta digital para elevar este indicador un 15%.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#27272A] text-center">
            <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold">
              Plataforma Mogu • Analítica Profesional de Restaurantes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}