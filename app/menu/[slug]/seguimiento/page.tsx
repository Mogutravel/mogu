'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  FiClock,
  FiCheckCircle,
  FiCoffee,
  FiShoppingBag,
  FiArrowLeft,
  FiBell,
  FiDollarSign,
  FiX,
  FiFileText
} from 'react-icons/fi'

interface OrderItem {
  id: string
  order_id: string
  product_name: string
  quantity: number
  unit_price: number
}

interface Order {
  id: string
  store_slug: string
  table_number: number
  status: 'recibido' | 'preparando' | 'listo' | 'entregado' | 'pagado' | 'cancelado'
  total_amount: number
  created_at: string
  items?: OrderItem[]
}

const STATUS_STEPS = [
  { key: 'recibido', label: 'Pedido recibido', desc: 'Enviado a la cocina' },
  { key: 'preparando', label: 'En preparación', desc: 'El equipo está cocinando' },
  { key: 'listo', label: 'Listo para servir', desc: 'Tu pedido va en camino' },
  { key: 'entregado', label: 'Entregado', desc: '¡Que lo disfrutes!' },
]

export default function OrderTrackingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const slug = params?.slug as string
  const currentOrderId = searchParams?.get('orderId')

  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [tableOrders, setTableOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Estados para llamados y modal de la cuenta
  const [callingWaiter, setCallingWaiter] = useState(false)
  const [requestingBill, setRequestingBill] = useState(false)
  const [callStatusMsg, setCallStatusMsg] = useState('')
  const [isBillModalOpen, setIsBillModalOpen] = useState(false)

  useEffect(() => {
    if (!currentOrderId || !slug) {
      setError('No se encontró el identificador del pedido.')
      setLoading(false)
      return
    }

    async function verifyAndLoadOrder() {
      try {
        // 1. Verificar si la orden realmente existe en Supabase (si ya fue pagada y borrada en caja, dará error/null)
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .select('*')
          .eq('id', currentOrderId)
          .maybeSingle()

        if (orderErr || !orderData) {
          localStorage.removeItem(`mogu_active_order_${slug}`)
          localStorage.removeItem(`mogu_table_${slug}`)
          router.push(`/menu/${slug}`)
          return
        }

        setCurrentOrder(orderData)

        // 2. Cargar TODAS las órdenes activas de esa misma mesa y tienda
        const { data: allOrdersData, error: allOrdersErr } = await supabase
          .from('orders')
          .select('*')
          .eq('store_slug', orderData.store_slug)
          .eq('table_number', orderData.table_number)
          .in('status', ['recibido', 'preparando', 'listo', 'entregado'])
          .order('created_at', { ascending: true })

        if (allOrdersErr) throw allOrdersErr

        const orderIds = (allOrdersData || []).map((o) => o.id)
        let itemsData: OrderItem[] = []

        if (orderIds.length > 0) {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds)
          itemsData = items || []
        }

        const fullOrders = (allOrdersData || []).map((ord) => ({
          ...ord,
          items: itemsData.filter((i) => i.order_id === ord.id),
        }))

        setTableOrders(fullOrders)
      } catch (err: any) {
        console.error(err)
        setError('No fue posible cargar el detalle del pedido.')
      } finally {
        setLoading(false)
      }
    }

    verifyAndLoadOrder()

    // Suscripción Realtime: UPDATE (cambio de estado en cocina) y DELETE (cuando pagan y se borra)
    const channel = supabase
      .channel(`order-status-${currentOrderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${currentOrderId}`,
        },
        (payload) => {
          if (payload.new) {
            setCurrentOrder((prev) => (prev ? { ...prev, ...payload.new } : (payload.new as Order)))
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${currentOrderId}`,
        },
        () => {
          localStorage.removeItem(`mogu_active_order_${slug}`)
          localStorage.removeItem(`mogu_table_${slug}`)
          router.push(`/menu/${slug}`)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentOrderId, slug, router])

  // Función para enviar llamado (Garzón o Cuenta)
  const handleTableCall = async (type: 'garzon' | 'cuenta') => {
    if (!currentOrder) return
    if (type === 'garzon') setCallingWaiter(true)
    if (type === 'cuenta') setRequestingBill(true)

    try {
      const { data: existingTable } = await supabase
        .from('tables')
        .select('id')
        .eq('store_slug', currentOrder.store_slug)
        .eq('table_number', Number(currentOrder.table_number))
        .maybeSingle()

      if (existingTable) {
        const { error } = await supabase
          .from('tables')
          .update({ 
            call_status: type, 
            status: 'llamando' 
          })
          .eq('id', existingTable.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('tables')
          .insert([{
            store_slug: currentOrder.store_slug,
            table_number: Number(currentOrder.table_number),
            status: 'llamando',
            call_status: type
          }])

        if (error) throw error
      }

      if (type === 'cuenta') {
        setIsBillModalOpen(true)
      }

      setCallStatusMsg(
        type === 'garzon'
          ? '🔔 ¡Garzón notificado! Se acercará a tu mesa en unos momentos.'
          : '💳 ¡Cuenta solicitada! El personal de caja se acercará pronto.'
      )

      setTimeout(() => setCallStatusMsg(''), 6000)
    } catch (err) {
      console.error('Error al enviar llamado:', err)
      alert('No se pudo enviar la solicitud. Inténtalo de nuevo.')
    } finally {
      setCallingWaiter(false)
      setRequestingBill(false)
    }
  }

  const formatCLP = (amount: number) =>
    amount.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    })

  const getStepIndex = (currentStatus?: string) => {
    switch (currentStatus) {
      case 'recibido':
        return 0
      case 'preparando':
        return 1
      case 'listo':
        return 2
      case 'entregado':
        return 3
      default:
        return 0
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-[#F2F2EE] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#FF7A45] animate-spin" />
        <span className="mt-4 text-xs uppercase tracking-widest text-white/50">
          Cargando estado del pedido...
        </span>
      </div>
    )
  }

  if (error || !currentOrder) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-[#F2F2EE] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h1 className="text-xl font-bold">Error de seguimiento</h1>
        <p className="text-sm text-white/50">{error || 'Pedido no encontrado'}</p>
        <a
          href={`/menu/${slug}`}
          className="px-5 py-2.5 bg-[#FF7A45] text-black text-xs font-semibold rounded-full hover:brightness-110 transition"
        >
          Volver a la carta
        </a>
      </div>
    )
  }

  const currentStep = getStepIndex(currentOrder.status)

  // Calcular el total acumulado de todas las comandas de la mesa
  const totalTableAmount = tableOrders.reduce((acc, ord) => {
    const orderSum = ord.items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || ord.total_amount || 0
    return acc + orderSum
  }, 0)

  // Ítems de la orden actual para la tarjeta principal
  const currentOrderItems = tableOrders.find(o => o.id === currentOrder.id)?.items || []

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F2F2EE] font-sans flex flex-col items-center p-4 md:p-8 pb-20">
      <div className="w-full max-w-md space-y-6">
        {/* Cabecera */}
        <div className="flex items-center justify-between">
          <a
            href={`/menu/${slug}`}
            className="flex items-center gap-2 text-xs font-medium text-white/60 hover:text-white transition"
          >
            <FiArrowLeft /> Volver a la carta
          </a>

          <span className="bg-amber-500/15 text-amber-500 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
            📍 Mesa {currentOrder.table_number}
          </span>
        </div>

        {/* Mensaje flotante de confirmación de llamado */}
        {callStatusMsg && (
          <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-2xl text-xs font-semibold text-center animate-bounce">
            {callStatusMsg}
          </div>
        )}

        {/* Tarjeta Principal de Estado */}
        <div className="bg-[#141416] border border-[#26262A] rounded-3xl p-6 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-[#FF7A45]/10 text-[#FF7A45] rounded-full flex items-center justify-center mx-auto text-2xl">
            {currentOrder.status === 'entregado' ? <FiCheckCircle /> : <FiCoffee className="animate-pulse" />}
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight capitalize">
              {STATUS_STEPS[currentStep].label}
            </h1>
            <p className="text-xs text-white/50 mt-1">
              {STATUS_STEPS[currentStep].desc}
            </p>
          </div>

          {/* Barra de Progreso */}
          <div className="pt-4 space-y-4">
            <div className="flex justify-between items-center relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#26262A] -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-1 bg-[#FF7A45] -translate-y-1/2 z-0 transition-all duration-500"
                style={{
                  width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`,
                }}
              />

              {STATUS_STEPS.map((step, idx) => {
                const isDone = idx <= currentStep
                return (
                  <div
                    key={step.key}
                    className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-[#FF7A45] text-black shadow-lg shadow-[#FF7A45]/30'
                        : 'bg-[#1B1B1E] text-white/40 border border-[#26262A]'
                    }`}
                  >
                    {idx + 1}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* BOTONES DE ASISTENCIA EN MESA */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleTableCall('garzon')}
            disabled={callingWaiter}
            className="py-3.5 px-4 bg-[#18181B] hover:bg-[#27272A] border border-[#26262A] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <FiBell className="text-[#FF7A45] text-base" />
            <span>{callingWaiter ? 'Avisando...' : 'Llamar Garzón'}</span>
          </button>

          <button
            onClick={() => handleTableCall('cuenta')}
            disabled={requestingBill}
            className="py-3.5 px-4 bg-[#18181B] hover:bg-[#27272A] border border-[#26262A] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <FiDollarSign className="text-emerald-400 text-base" />
            <span>{requestingBill ? 'Pidiendo...' : 'Pedir Cuenta'}</span>
          </button>
        </div>

        {/* Resumen del último pedido actual */}
        <div className="bg-[#141416] border border-[#26262A] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#26262A] pb-3">
            <FiShoppingBag className="text-[#FF7A45]" />
            <h2 className="text-sm font-bold">Detalle de la comanda actual</h2>
          </div>

          <div className="space-y-3 divide-y divide-[#26262A]">
            {currentOrderItems.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold">{item.product_name}</p>
                  <p className="text-xs text-white/40">Cantidad: {item.quantity}</p>
                </div>
                <span className="font-bold">{formatCLP(item.unit_price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#26262A] pt-4 flex justify-between items-center">
            <span className="text-sm font-bold">Total acumulado en mesa</span>
            <span className="text-xl font-black text-[#FF7A45]">{formatCLP(totalTableAmount)}</span>
          </div>
        </div>

        <p className="text-[11px] text-center text-white/40">
          💡 Esta pantalla se actualiza en tiempo real automáticamente. Paga al finalizar en la caja del local.
        </p>

        {/* MODAL DETALLE DE CUENTA */}
        {isBillModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#141416] border border-[#26262A] rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#26262A] pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <FiFileText />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">Cuenta Mesa {currentOrder.table_number}</h3>
                    <p className="text-[11px] text-white/50">Resumen total de consumos</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBillModalOpen(false)}
                  className="p-1.5 text-white/50 hover:text-white rounded-xl transition cursor-pointer"
                >
                  <FiX className="text-base" />
                </button>
              </div>

              {/* Lista de todas las comandas de la mesa */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {tableOrders.map((ord) => (
                  <div key={ord.id} className="p-3 bg-[#1B1B1E] rounded-2xl border border-[#26262A] space-y-2">
                    <div className="flex justify-between text-xs font-bold text-white/70">
                      <span>Comanda #{ord.id.substring(0, 5)}</span>
                      <span className="uppercase px-2 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-400">
                        {ord.status}
                      </span>
                    </div>
                    {ord.items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.product_name}</span>
                        <span className="font-mono">{formatCLP(item.quantity * item.unit_price)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Total y botón de cerrar */}
              <div className="border-t border-[#26262A] pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/60 uppercase">Total Cuenta</span>
                  <span className="text-2xl font-black text-emerald-400">{formatCLP(totalTableAmount)}</span>
                </div>

                <button
                  onClick={() => setIsBillModalOpen(false)}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer shadow-lg"
                >
                  Entendido, esperar en mesa
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}