'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FiClock, FiCheck, FiArrowLeft, FiCoffee, FiRefreshCw } from 'react-icons/fi'

interface OrderItem {
  id: string
  order_id: string
  product_name: string
  quantity: number
}

interface Order {
  id: string
  store_slug: string
  table_number: number
  status: 'recibido' | 'preparando' | 'listo' | 'entregado'
  created_at: string
  items?: OrderItem[]
}

// ⏱️ Componente de Cronómetro en Vivo para cada Comanda
function OrderTimer({ createdAt }: { createdAt: string }) {
  const [elapsed, setElapsed] = useState<string>('')
  const [minutes, setMinutes] = useState<number>(0)

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime()
      const created = new Date(createdAt).getTime()
      const diffMs = now - created

      if (diffMs < 0) {
        setElapsed('0m 0s')
        setMinutes(0)
        return
      }

      const totalSecs = Math.floor(diffMs / 1000)
      const mins = Math.floor(totalSecs / 60)
      const secs = totalSecs % 60

      setMinutes(mins)
      setElapsed(`${mins}m ${secs < 10 ? '0' : ''}${secs}s`)
    }

    calculateTime()
    const timerInterval = setInterval(calculateTime, 1000)
    return () => clearInterval(timerInterval)
  }, [createdAt])

  // Color dinámico según el tiempo de espera (Cambia a naranja a los 10 min y a rojo a los 20 min)
  let badgeColor = 'bg-white/10 text-white/70 border-white/10'
  if (minutes >= 10 && minutes < 20) {
    badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  } else if (minutes >= 20) {
    badgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
  }

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${badgeColor}`}>
      <FiClock className="text-xs" />
      <span>{elapsed || 'Calculando...'}</span>
    </div>
  )
}

export default function KdsKitchenPanel() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchKitchenOrders = async () => {
    if (!slug) return
    try {
      // La cocina solo ve comandas pendientes o en preparación (hasta que pasen a 'listo')
      const { data: ordersData, error: ordersErr } = await supabase
        .from('orders')
        .select('*')
        .eq('store_slug', slug)
        .in('status', ['recibido', 'preparando'])
        .order('created_at', { ascending: true })

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
        items: itemsData.filter((i) => i.order_id === ord.id),
      }))

      setOrders(fullOrders)
    } catch (err) {
      console.error('Error al cargar KDS:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!slug) return
    fetchKitchenOrders()

    const interval = setInterval(() => {
      fetchKitchenOrders()
    }, 3000)

    const channel = supabase
      .channel(`kitchen-kds-${slug}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `store_slug=eq.${slug}` },
        () => fetchKitchenOrders()
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [slug])

  // Cambiar estado de orden (Recibido -> Preparando -> Listo)
  const handleUpdateStatus = async (orderId: string, nextStatus: 'preparando' | 'listo') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: nextStatus })
        .eq('id', orderId)

      if (error) throw error
      fetchKitchenOrders()
    } catch (err) {
      console.error('Error al actualizar estado:', err)
      alert('No se pudo actualizar el estado de la comanda.')
    }
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white font-sans p-6 space-y-8">
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
              <FiCoffee className="text-amber-400" /> KDS • Cocina
            </h1>
            <p className="text-xs text-white/50 mt-1">
              Gestión de platos para <span className="text-amber-400 font-bold uppercase">{slug}</span>
            </p>
          </div>
        </div>

        <button
          onClick={fetchKitchenOrders}
          className="p-2.5 bg-[#18181B] border border-[#27272A] rounded-xl text-white/70 hover:text-white transition cursor-pointer"
        >
          <FiRefreshCw />
        </button>
      </header>

      {orders.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-3xl">🎉</p>
          <p className="text-sm font-bold text-white/50">No hay comandas pendientes en cocina por ahora.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`p-5 rounded-3xl border flex flex-col justify-between shadow-xl ${
                order.status === 'preparando'
                  ? 'bg-[#18181B] border-amber-500/50'
                  : 'bg-[#141416] border-[#27272A]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                  <span className="text-xs font-black bg-white/10 px-3 py-1 rounded-xl">
                    Mesa {order.table_number}
                  </span>

                  {/* ⏱️ Inserta el cronómetro en vivo */}
                  <OrderTimer createdAt={order.created_at} />
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    order.status === 'preparando' ? 'bg-amber-500/20 text-amber-400' : 'bg-neutral-800 text-white/60'
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm font-semibold">
                      <span>{item.quantity}x {item.product_name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-[#27272A] mt-4 flex gap-2">
                {order.status === 'recibido' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'preparando')}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase rounded-2xl transition cursor-pointer shadow-lg"
                  >
                    Iniciar Preparación
                  </button>
                )}
                {order.status === 'preparando' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'listo')}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase rounded-2xl transition cursor-pointer shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <FiCheck /> Marcar Listo
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}