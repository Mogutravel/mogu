'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  name: string
  category: string
  price: number
  image_url: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params?.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Estados para la personalización y datos cliente
  const [cardName, setCardName] = useState('')
  const [cardTitle, setCardTitle] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  
  // Selección de Forma de Pago y Cantidad
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia'>('Transferencia')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return
      setLoading(true)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) {
        console.error('Error al cargar el producto:', error)
      } else {
        setProduct(data)
      }
      setLoading(false)
    }

    fetchProduct()
  }, [productId])

  const handleCreateOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!product) return

    // Validaciones básicas de campos obligatorios
    if (!cardName.trim() || !phone.trim() || !email.trim()) {
      alert('Por favor completa todos los campos obligatorios (*).')
      return
    }

    setSubmitting(true)

    try {
      const totalPrice = product.price * quantity

      // 1. Guardar el pedido en Supabase
      const { data: order, error } = await supabase
        .from('orders')
        .insert([
          {
            product_id: product.id,
            product_name: product.name,
            quantity,
            unit_price: product.price,
            total_price: totalPrice,
            card_name: cardName,
            card_title: cardTitle,
            phone,
            email,
            shipping_address: shippingAddress.trim() || 'No especificada',
            payment_method: paymentMethod,
            status: 'pendiente',
          },
        ])
        .select()
        .single()

      if (error) {
        throw error
      }

      // 2. Enviar datos del pedido a tu correo electrónico vía Formspree
      const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mzeddgdw'

      const emailResponse = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `Nuevo Pedido MOGU - #${order.id.slice(0, 8)}`,
          Producto: product.name,
          Cantidad: quantity,
          Total: `$${totalPrice.toLocaleString('es-CL')} CLP`,
          Forma_de_Pago: paymentMethod,
          Nombre_Tarjeta: cardName,
          Cargo_Empresa: cardTitle || 'N/A',
          Telefono_Cliente: phone,
          Email_Cliente: email,
          Direccion_Envio: shippingAddress.trim() || 'No especificada',
          ID_Pedido: order.id
        })
      })

      if (!emailResponse.ok) {
        console.warn('El pedido se guardó en Supabase pero hubo un detalle al enviar el correo.')
      }

      alert('¡Pedido realizado con éxito! Nos pondremos en contacto contigo a la brevedad.')
      
      // Redirigir a la página principal tras completar la compra
      router.push('/')

    } catch (error: any) {
      console.error('Error al procesar el pedido:', error)
      alert(`Error al procesar: ${error?.message || 'Revisa la consola'}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-400">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
        <Link
          href="/"
          className="px-6 py-2 bg-emerald-500 text-black font-semibold rounded-full hover:bg-emerald-400 transition"
        >
          Volver a la tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Navegación */}
      <header className="border-b border-neutral-800 bg-black/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-neutral-400 hover:text-white transition flex items-center gap-2">
            ← Volver al catálogo
          </Link>
          <div className="text-lg font-bold tracking-widest">MOGU</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* VISTA PREVIA INTERACTIVA DE LA TARJETA */}
          <div className="flex flex-col items-center justify-center sticky top-28">
            <div className="w-full max-w-md aspect-[1.586/1] rounded-2xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-neutral-800 group transition-all duration-300 hover:border-neutral-700">
              
              <div className="absolute -right-20 -top-20 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex justify-between items-start z-10">
                <span className="font-bold text-xl tracking-widest text-white">MOGU</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 bg-amber-500/20 border border-amber-500/40 rounded flex items-center justify-center">
                    <div className="w-4 h-3 border border-amber-500/60 rounded-sm" />
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono tracking-wider">NFC</span>
                </div>
              </div>

              <div className="z-10 space-y-0.5">
                <p className="text-xl font-semibold tracking-wide text-white">
                  {cardName || 'Tu Nombre'}
                </p>
                <p className="text-sm text-neutral-400 font-light">
                  {cardTitle || 'Tu Cargo / Empresa'}
                </p>
                <p className="text-xs text-emerald-400 font-light pt-1">
                  {phone || 'Tu Teléfono'}
                </p>
                <p className="text-xs text-neutral-400 font-light">
                  {email || 'Tu Correo Electrónico'}
                </p>
              </div>

              <div className="flex justify-between items-end z-10 text-[10px] text-neutral-500 tracking-wider">
                <span>mogu.cl/{cardName ? cardName.toLowerCase().replace(/\s+/g, '') : 'tu-link'}</span>
                <span>TAP TO CONNECT</span>
              </div>
            </div>
          </div>

          {/* FORMULARIO DE PERSONALIZACIÓN Y COMPRA */}
          <form onSubmit={handleCreateOrder} className="space-y-8 bg-neutral-900/40 p-8 rounded-2xl border border-neutral-800/80">
            <div>
              <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">{product.category}</span>
              <h1 className="text-3xl font-extrabold mt-1 text-white">{product.name}</h1>
              <p className="text-2xl font-bold text-white mt-3">
                ${product.price.toLocaleString('es-CL')} <span className="text-xs text-neutral-400 font-normal">CLP</span>
              </p>
            </div>

            <hr className="border-neutral-800" />

            {/* Campos de Datos Cliente */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-neutral-300 tracking-wide uppercase">1. Datos cliente</h2>
              
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Ej: Ignacia González"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition"
                  maxLength={30}
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Cargo / Empresa</label>
                <input
                  type="text"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  placeholder="Ej: Founder & CEO"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition"
                  maxLength={35}
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Teléfono *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: +56 9 1234 5678"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Correo electrónico *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ej: ignacia@ejemplo.cl"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Dirección de envío (Opcional)</label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Ej: Av. Providencia 1234, Depto 501, Santiago"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Selección de Forma de Pago */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-neutral-300 tracking-wide uppercase">2. Forma de pago</h2>
              <div className="flex gap-3">
                {(['Efectivo', 'Tarjeta', 'Transferencia'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 py-2.5 px-3 rounded-lg border text-xs font-medium transition flex items-center justify-center gap-2 ${
                      paymentMethod === method
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Cantidad y Botón de Confirmación */}
            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-300">Cantidad</span>
                <div className="flex items-center border border-neutral-800 rounded-lg bg-neutral-900">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-neutral-400 hover:text-white transition"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-semibold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-neutral-400 hover:text-white transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCreateOrder()}
                disabled={submitting}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-700 disabled:cursor-not-allowed text-black font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? 'Procesando pedido...' : `Realizar Pedido • $${(product.price * quantity).toLocaleString('es-CL')} CLP`}
              </button>
            </div>

          </form>

        </div>
      </main>
    </div>
  )
}