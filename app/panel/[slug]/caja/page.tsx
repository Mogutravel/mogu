'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  FiGrid, 
  FiDollarSign, 
  FiCheckCircle, 
  FiX, 
  FiRefreshCw, 
  FiArrowLeft,
  FiBell,
  FiTruck,
  FiPackage
} from 'react-icons/fi'

interface TableItem {
  id: string
  store_slug: string
  table_number: number
  status: 'disponible' | 'ocupada' | 'llamando' | 'cuenta'
  call_status?: 'garzon' | 'cuenta' | null
  current_order_id?: string | null
}

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
  status: 'recibido' | 'preparando' | 'listo' | 'entregado' | 'pagado'
  total_amount: number
  created_at: string
  items?: OrderItem[]
}

export default function CajaMesasPanel() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [tables, setTables] = useState<TableItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null)
  const [tableOrders, setTableOrders] = useState<Order[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevLlamadasRef = useRef<string>('')

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
  }, [])

  const fetchData = async () => {
    if (!slug) return
    try {
      const { data: ordersData, error: ordersErr } = await supabase
        .from('orders')
        .select('*')
        .eq('store_slug', slug)
        .in('status', ['recibido', 'preparando', 'listo', 'entregado'])

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

      const { data: tablesData, error: tablesErr } = await supabase
        .from('tables')
        .select('*')
        .eq('store_slug', slug)
        .order('table_number', { ascending: true })

      if (tablesErr) throw tablesErr

      if (!tablesData || tablesData.length === 0) {
        setTables([
          {
            id: 'table-1',
            store_slug: slug,
            table_number: 1,
            status: fullOrders.some(o => o.table_number === 1) ? 'ocupada' : 'disponible',
            call_status: null
          }
        ])
      } else {
        const currentLlamadasStr = JSON.stringify(tablesData.map(t => t.call_status))
        if (prevLlamadasRef.current && prevLlamadasRef.current !== currentLlamadasStr) {
          const hasNewCall = tablesData.some(t => t.call_status === 'garzon' || t.call_status === 'cuenta')
          if (hasNewCall) {
            audioRef.current?.play().catch(() => {})
          }
        }
        prevLlamadasRef.current = currentLlamadasStr

        const syncedTables = tablesData.map(t => {
          const hasActiveOrders = fullOrders.some(o => o.table_number === t.table_number)
          const finalStatus = (!hasActiveOrders && t.status !== 'llamando') ? 'disponible' : t.status
          
          return {
            ...t,
            status: finalStatus
          }
        })

        setTables(syncedTables)
      }
    } catch (err) {
      console.error('Error al sincronizar caja:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!slug) return
    fetchData()

    const interval = setInterval(() => {
      fetchData()
    }, 3000)

    const channel = supabase
      .channel(`caja-realtime-global-${slug}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `store_slug=eq.${slug}` },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables', filter: `store_slug=eq.${slug}` },
        () => fetchData()
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [slug])

  const handleMarkAsDelivered = async (orderId: string, tableNumber: number) => {
    try {
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'entregado' })
        .eq('id', orderId)

      if (orderError) throw orderError

      await supabase
        .from('tables')
        .update({ status: 'ocupada' })
        .eq('store_slug', slug)
        .eq('table_number', tableNumber)

      fetchData()
    } catch (err) {
      console.error('Error al marcar entregado:', err)
      alert('No se pudo actualizar el estado de la comanda.')
    }
  }

  const handleOpenTableModal = (table: TableItem) => {
    setSelectedTable(table)
    const activeOrdersForTable = orders.filter(
      (o) => o.table_number === table.table_number && o.status !== 'pagado'
    )
    setTableOrders(activeOrdersForTable)
    setIsModalOpen(true)
  }

  const handleDismissCall = async (tableNumber: number) => {
    try {
      await supabase
        .from('tables')
        .update({ call_status: null, status: 'ocupada' })
        .eq('store_slug', slug)
        .eq('table_number', tableNumber)

      await supabase
        .from('table_calls')
        .delete()
        .eq('store_slug', slug)
        .eq('table_number', tableNumber)

      fetchData()
    } catch (err) {
      console.error('Error al desmarcar y limpiar llamada:', err)
    }
  }

  // ⚡ PROCESAR PAGO: FORZAR EL BORRADO FÍSICO DE LAS TABLAS ORDERS Y ORDER_ITEMS
  const handleProcessPayment = async (paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia') => {
    if (!selectedTable) return

    try {
      const orderIds = tableOrders.map((o) => o.id)

      if (orderIds.length > 0) {
        // 1. Forzar borrado directo de ítems asociados a estas órdenes
        const { error: itemsErr } = await supabase
          .from('order_items')
          .delete()
          .in('order_id', orderIds)

        if (itemsErr) console.warn('Aviso al borrar order_items:', itemsErr.message)

        // 2. Forzar borrado directo de las órdenes principales de la mesa
        const { error: ordErr } = await supabase
          .from('orders')
          .delete()
          .in('id', orderIds)

        if (ordErr) {
          console.warn('Aviso al borrar orders, aplicando respaldo:', ordErr.message)
          // Respaldo por si hay directiva estricta de RLS
          await supabase.from('orders').update({ status: 'pagado' }).in('id', orderIds)
        }
      }

      // 3. Forzar de forma adicional el borrado de cualquier orden huérfana ligada a esta mesa por número
      await supabase
        .from('orders')
        .delete()
        .eq('store_slug', slug)
        .eq('table_number', selectedTable.table_number)

      // 4. Liberar la mesa de forma permanente a 'disponible'
      const { error: tableError } = await supabase
        .from('tables')
        .upsert([{
          store_slug: slug,
          table_number: selectedTable.table_number,
          status: 'disponible', 
          current_order_id: null,
          call_status: null 
        }], { onConflict: 'store_slug,table_number' })

      if (tableError) throw tableError

      // 5. Limpiar llamadas pendientes
      await supabase
        .from('table_calls')
        .delete()
        .eq('store_slug', slug)
        .eq('table_number', selectedTable.table_number)

      // 6. Limpieza instantánea en el estado de React
      setOrders((prev) => prev.filter((o) => !orderIds.includes(o.id)))
      setTableOrders([])
      setIsModalOpen(false)
      setSelectedTable(null)
      
      await fetchData()

      alert(`✨ Pago con ${paymentMethod} registrado. ¡Mesa ${selectedTable.table_number} liberada y registros borrados!`)
    } catch (err: any) {
      console.error('Error al procesar pago y forzar borrado:', err)
      alert(`Hubo un error al procesar el pago: ${err?.message || 'Error desconocido'}`)
    }
  }

  const calculateTotal = () => {
    return tableOrders.reduce((acc, order) => {
      const orderSum = order.items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || order.total_amount || 0
      return acc + orderSum
    }, 0)
  }

  const readyOrders = orders.filter((o) => o.status === 'listo')

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
              <FiGrid className="text-emerald-400" /> Control de Caja y Salón
            </h1>
            <p className="text-xs text-white/50 mt-1">
              Monitoreo en tiempo real para <span className="text-emerald-400 font-bold uppercase">{slug}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            En Vivo
          </span>
          <button
            onClick={fetchData}
            className="p-2.5 bg-[#18181B] border border-[#27272A] rounded-xl text-white/70 hover:text-white transition cursor-pointer"
          >
            <FiRefreshCw />
          </button>
        </div>
      </header>

      {/* SECCIÓN DE PLATOS LISTOS EN BARRA */}
      {readyOrders.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <FiPackage className="animate-bounce" /> Platos listos en cocina (Para entregar a mesa)
            </h2>
            <span className="bg-amber-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full">
              {readyOrders.length} Pendiente{readyOrders.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyOrders.map((order) => (
              <div key={order.id} className="bg-[#141416] border border-amber-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black bg-amber-500 text-black px-2 py-0.5 rounded-lg">
                    Mesa {order.table_number}
                  </span>
                  <span className="text-[11px] text-white/50 font-mono">
                    #{order.id.substring(0, 5)}
                  </span>
                </div>

                <div className="space-y-1">
                  {order.items?.map((item) => (
                    <p key={item.id} className="text-xs font-semibold">
                      - {item.quantity}x {item.product_name}
                    </p>
                  ))}
                </div>

                <button
                  onClick={() => handleMarkAsDelivered(order.id, order.table_number)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <FiTruck /> Marcar Entregado ✓
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GRILLA DE MESAS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {tables.map((table) => {
          const isOccupied = table.status === 'ocupada'
          const isCalling = table.call_status === 'garzon' || table.call_status === 'cuenta'

          return (
            <div
              key={table.id || table.table_number}
              onClick={() => handleOpenTableModal(table)}
              className={`p-5 rounded-3xl border cursor-pointer transition-all duration-300 flex flex-col justify-between h-44 shadow-xl relative overflow-hidden ${
                isCalling
                  ? 'bg-amber-500/10 border-amber-500 animate-pulse shadow-amber-500/20'
                  : isOccupied
                  ? 'bg-[#18181B] border-emerald-500/50 hover:border-emerald-400 shadow-emerald-500/5'
                  : 'bg-[#141416] border-[#27272A] hover:border-white/30 text-white/50'
              }`}
            >
              {isCalling && (
                <div className="absolute top-0 inset-x-0 bg-amber-500 text-black text-[10px] font-black uppercase text-center py-0.5 tracking-wider flex items-center justify-center gap-1">
                  <FiBell /> {table.call_status === 'cuenta' ? 'Pide Cuenta' : 'Llama Garzón'}
                </div>
              )}

              <div className="flex items-start justify-between mt-2">
                <span className="text-xs font-black uppercase tracking-wider text-white/70">
                  Mesa {table.table_number}
                </span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isCalling ? 'bg-amber-400 animate-ping' : isOccupied ? 'bg-emerald-400' : 'bg-neutral-600'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <p className="text-lg font-black text-white">
                  {isCalling ? '¡Atención!' : isOccupied ? 'Ocupada' : 'Disponible'}
                </p>
                <p className="text-[11px] text-white/50">
                  {isCalling ? 'Requiere asistencia' : isOccupied ? 'Con consumo activo' : 'Lista para asignar'}
                </p>
              </div>

              {isCalling && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDismissCall(table.table_number)
                  }}
                  className="mt-2 w-full py-1 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-extrabold rounded-lg transition cursor-pointer"
                >
                  Atendido ✓
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* MODAL DE GESTIÓN Y PAGO DE MESA */}
      {isModalOpen && selectedTable && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#141416] border border-[#27272A] rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
              <div>
                <h3 className="text-lg font-black">Mesa {selectedTable.table_number}</h3>
                <p className="text-xs text-white/50">Detalle de cuenta y cierre de mesa</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-white/50 hover:text-white rounded-xl transition cursor-pointer"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {tableOrders.length === 0 ? (
                <p className="text-xs text-white/40 text-center py-6">No hay consumos activos en esta mesa.</p>
              ) : (
                tableOrders.map((ord) => (
                  <div key={ord.id} className="p-3 bg-[#1B1B1E] rounded-2xl border border-[#27272A] space-y-2">
                    <div className="flex justify-between text-xs font-bold text-white/70">
                      <span>Comanda #{ord.id.substring(0, 5)}</span>
                      <span className="uppercase px-2 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-400">
                        {ord.status}
                      </span>
                    </div>
                    {ord.items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.product_name}</span>
                        <span className="font-mono">${(item.quantity * item.unit_price).toLocaleString('es-CL')}</span>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-[#27272A] pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50 font-bold uppercase">Total Cuenta</span>
                <span className="text-2xl font-black text-emerald-400">
                  ${calculateTotal().toLocaleString('es-CL')}
                </span>
              </div>

              <p className="text-[11px] text-white/50 text-center uppercase tracking-wider font-bold">
                Cerrar cuenta y registrar pago (Libera la mesa y limpia QR/NFC)
              </p>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleProcessPayment('Efectivo')}
                  className="py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-2xl transition cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  Efectivo
                </button>
                <button
                  onClick={() => handleProcessPayment('Tarjeta')}
                  className="py-3 bg-sky-500 hover:bg-sky-400 text-black font-extrabold text-xs rounded-2xl transition cursor-pointer shadow-lg shadow-sky-500/10"
                >
                  Tarjeta
                </button>
                <button
                  onClick={() => handleProcessPayment('Transferencia')}
                  className="py-3 bg-purple-500 hover:bg-[#A855F7] text-black font-extrabold text-xs rounded-2xl transition cursor-pointer shadow-lg shadow-purple-500/10"
                >
                  Transf.
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}