'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { processTransferCheckout } from '@/app/actions/checkout'

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

  // Cantidade fija por transferencia
  const [quantity, setQuantity] = useState(1)

  // Estado para las instrucciones de transferencia y pantalla de éxito con credenciales
  const [step, setStep] = useState<'form' | 'instructions'>('form')
  const [successData, setSuccessData] = useState<{ slug: string; email: string; tempPassword: string } | null>(null)

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

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!product) return

    // Validaciones básicas de campos obligatorios
    if (!cardName.trim() || !phone.trim() || !email.trim()) {
      alert('Por favor completa todos los campos obligatorios (*).')
      return
    }

    // Pasamos a la pantalla con los datos bancarios y creación de cuenta
    setStep('instructions')
  }

  const handleConfirmTransfer = async () => {
    if (!product) return
    setSubmitting(true)

    try {
      // Ejecutamos la Server Action que crea la cuenta, perfil y orden en Supabase de forma segura
      const result = await processTransferCheckout({
        fullName: cardName,
        email,
        phone,
        productId: product.id,
      })

      if (result.success && result.slug && result.email && result.tempPassword) {
        // Iniciar sesión automáticamente en el cliente de Supabase del navegador
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: result.email,
          password: result.tempPassword,
        })

        if (loginError) {
          alert('Cuenta creada con éxito, pero hubo un problema al autenticar automáticamente. Por favor inicia sesión.')
          router.push('/login')
          return
        }

        // Guardamos los datos para mostrar la tarjeta de bienvenida con credenciales
        setSuccessData({
          slug: result.slug,
          email: result.email,
          tempPassword: result.tempPassword,
        })
      } else {
        alert(result.message || 'Error al procesar la solicitud.')
        setStep('form')
      }
    } catch (error: any) {
      console.error('Error al procesar el pedido:', error)
      alert(`Error al procesar: ${error?.message || 'Revisa la consola'}`)
      setStep('form')
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

  // PANTALLA DE BIENVENIDA PROFESIONAL CON CREDENCIALES (DESPUÉS DE TRANSFERIR)
  if (successData) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 p-6 sm:p-8 rounded-3xl space-y-6 text-center shadow-2xl">
          
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>

          <div className="space-y-2">
            <h1 className="text-lg font-extrabold text-white">¡Pedido y cuenta creados con éxito!</h1>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Hemos registrado tu orden por transferencia. Para que personalices tu tarjeta de inmediato, <strong className="text-white">ya hemos creado y activado tu cuenta de acceso</strong>.
            </p>
          </div>

          {/* Tarjeta de Credenciales */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-left space-y-2.5 text-xs">
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Tus datos de acceso:</p>
            <div className="flex justify-between items-center text-neutral-300 border-b border-neutral-900 pb-1.5">
              <span className="text-neutral-500">Correo:</span>
              <span className="font-mono text-white">{successData.email}</span>
            </div>
            <div className="flex justify-between items-center text-neutral-300">
              <span className="text-neutral-500">Contraseña temporal:</span>
              <span className="font-mono bg-neutral-900 px-2 py-0.5 rounded text-emerald-300">{successData.tempPassword}</span>
            </div>
            <p className="text-[10px] text-neutral-500 pt-1 italic">
              Guarda esta contraseña por si deseas iniciar sesión desde otro dispositivo más adelante.
            </p>
          </div>

          <button
            onClick={() => router.push(`/admin/${successData.slug}`)}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition cursor-pointer"
          >
            Ir a configurar mi tarjeta digital ↗
          </button>
        </div>
      </div>
    )
  }

  const totalPrice = product.price * quantity

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
                <span>mogu.cl/{cardName ? cardName.toLowerCase().replace(/[^a-z0-9]/g, '') : 'tu-link'}</span>
                <span>TAP TO CONNECT</span>
              </div>
            </div>
          </div>

          {/* FORMULARIO DE PERSONALIZACIÓN Y COMPRA */}
          <div className="bg-neutral-900/40 p-8 rounded-2xl border border-neutral-800/80">
            <div>
              <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">{product.category}</span>
              <h1 className="text-3xl font-extrabold mt-1 text-white">{product.name}</h1>
              <p className="text-2xl font-bold text-white mt-3">
                ${product.price.toLocaleString('es-CL')} <span className="text-xs text-neutral-400 font-normal">CLP</span>
              </p>
            </div>

            <hr className="border-neutral-800 my-6" />

            {step === 'form' ? (
              <form onSubmit={handleInitialSubmit} className="space-y-6">
                {/* Campos de Datos Cliente */}
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-neutral-300 tracking-wide uppercase">1. Datos cliente y tarjeta</h2>
                  
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
                    <label className="block text-xs text-neutral-400 mb-1">Correo electrónico (Tu usuario de acceso) *</label>
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

                {/* Método de Pago Fijo (Solo Transferencia) */}
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-neutral-300 tracking-wide uppercase">2. Método de pago</h2>
                  <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">Transferencia Bancaria</span>
                    </div>
                    <span className="text-[11px] text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded-md border border-neutral-800">
                      Activación inmediata ⚡
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 italic">
                    * Por el momento, todas nuestras operaciones y activaciones instantáneas se procesan exclusivamente mediante transferencia bancaria.
                  </p>
                </div>

                {/* Cantidad y Botón de Confirmación */}
                <div className="pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-300">Cantidad</span>
                    <div className="flex items-center border border-neutral-800 rounded-lg bg-neutral-900">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1.5 text-neutral-400 hover:text-white transition cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-4 text-sm font-semibold">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-1.5 text-neutral-400 hover:text-white transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Comprar • ${totalPrice.toLocaleString('es-CL')} CLP
                  </button>
                </div>
              </form>
            ) : (
              /* PASO 2: DATOS DE TRANSFERENCIA BANCARIA */
              <div className="space-y-6">
                <div className="border-b border-neutral-800 pb-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    2. Realiza tu Transferencia Bancaria
                  </h2>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Transfiere el monto exacto a nuestra cuenta corriente.
                  </p>
                </div>

                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2 text-xs text-neutral-300">
                  <p><span className="text-neutral-500">Banco:</span> Banco Falabella</p>
                  <p><span className="text-neutral-500">Tipo de Cuenta:</span> Corriente</p>
                  <p><span className="text-neutral-500">N° de Cuenta:</span> 19802087337</p>
                  <p><span className="text-neutral-500">RUT:</span> 17984728-0</p>
                  <p><span className="text-neutral-500">Razón Social:</span> Mogu SpA</p>
                  <p><span className="text-neutral-500">Correo:</span> pagos@mogu.cl</p>
                  <div className="pt-2 border-t border-neutral-800 flex justify-between items-center font-bold text-white">
                    <span>Total a pagar:</span>
                    <span className="text-emerald-400 text-sm">${totalPrice.toLocaleString('es-CL')} CLP</span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed bg-emerald-500/5 border border-emerald-500/20 p-3.5 rounded-2xl">
                  💡 Al hacer clic en <strong className="text-white">"Ya transferí / Configurar mi tarjeta"</strong>, crearemos tu cuenta al instante para que comiences a personalizar tu diseño mientras validamos tu comprobante.
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="w-1/3 py-3 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleConfirmTransfer}
                    className="w-2/3 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition cursor-pointer flex items-center justify-center"
                  >
                    {submitting ? 'Creando cuenta...' : 'Ya transferí / Configurar'}
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  )
}