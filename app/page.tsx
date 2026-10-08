import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import NetworkBackground from '@/components/NetworkBackground'

export const revalidate = 0 // Para asegurar que siempre cargue datos actualizados de Supabase

interface Product {
  id: string
  name: string
  category: string
  price: number
  original_price: number | null
  badge: string | null
  gradient_color: string
}

// Función para obtener productos desde la base de datos de Supabase
async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error cargando productos de Supabase:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Error de conexión:', err)
    return []
  }
}

// Función para dar formato de moneda chilena ($19.990)
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function Home() {
  const productos = await getProducts()

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-neutral-800 selection:text-white relative overflow-hidden">
      {/* FONDO INMERSIVO GENERATIVO DE NODOS NFC */}
      <NetworkBackground />

      {/* CONTENIDO PRINCIPAL EN CAPA SUPERIOR (Z-10) */}
      <div className="relative z-10">
        {/* 1. HEADER FLOTANTE / NAVBAR */}
        <header className="sticky top-0 z-50 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-2xl font-black tracking-wider text-white">
              MOGU<span className="text-emerald-500">.</span>
            </Link>

            <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-300 md:flex">
              <Link href="#productos" className="transition hover:text-white">
                Productos
              </Link>
              <Link href="#como-funciona" className="transition hover:text-white">
                ¿Cómo funciona?
              </Link>
              <Link href="#contacto" className="transition hover:text-white">
                Contacto
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <button className="relative rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:border-neutral-500 hover:bg-neutral-800">
                Carrito
                <span className="ml-2 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-black">
                  0
                </span>
              </button>

              {/* BOTONES DE AUTENTICACIÓN EN LA ESQUINA SUPERIOR DERECHA */}
              <Link
                href="/login"
                className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white rounded-xl transition backdrop-blur-xl"
              >
                Iniciar Sesión
              </Link>

              <Link
                href="/login"
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-xs font-extrabold uppercase tracking-wider rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
              >
                Crear Cuenta
              </Link>
            </div>
          </div>
        </header>

        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden px-6 py-20 md:py-32">
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />

          <div className="mx-auto max-w-5xl text-center">
            <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
              Nueva generación de tarjetas NFC
            </span>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl">
              Comparte tu identidad digital con un solo <span className="text-emerald-400">tap</span>.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base text-neutral-400 md:text-lg">
              Tarjetas inteligentes y soluciones sin contacto para profesionales y empresas en Chile. Conecta al instante sin aplicaciones.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="#productos"
                className="w-full rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-black transition hover:bg-neutral-200 sm:w-auto"
              >
                Ver Tarjetas
              </Link>
              <Link
                href="#como-funciona"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800 sm:w-auto"
              >
                Conocer más
              </Link>
            </div>
          </div>
        </section>

        {/* 3. SECCIÓN: ¿CÓMO FUNCIONA? */}
        <section id="como-funciona" className="mx-auto max-w-7xl px-6 py-20 border-t border-b border-neutral-900/80 bg-neutral-950/60 backdrop-blur-sm">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-emerald-400 font-semibold text-xs tracking-widest uppercase">Tecnología Contactless</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mt-3">¿Cómo funciona Mogu?</h2>
            <p className="text-neutral-400 text-sm md:text-base mt-4">
              Sin aplicaciones, sin fricción. Una experiencia rápida para compartir tus datos en segundos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Paso 1 */}
            <div className="flex flex-col items-center text-center p-8 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg mb-6">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Haz TAP o escanea</h3>
              <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                Acerca tu tarjeta Mogu a cualquier smartphone compatible con NFC o permite que escaneen el código QR dinámico.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="flex flex-col items-center text-center p-8 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg mb-6">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Abre tu Perfil Digital</h3>
              <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                Se desplegará automáticamente tu página con links, redes, PDF, datos bancarios o catálogo sin instalar nada.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="flex flex-col items-center text-center p-8 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg mb-6">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Conecta al Instante</h3>
              <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                Tu cliente o prospecto guarda tu contacto en su agenda con un solo clic. Actualiza tus datos cuando quieras en tiempo real.
              </p>
            </div>
          </div>
        </section>

        {/* 4. SECCIÓN DE PRODUCTOS (SUPABASE) */}
        <section id="productos" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl">
                Nuestra Colección
              </h2>
              <p className="mt-2 text-sm text-neutral-400">
                Tarjetas diseñadas con tecnología contactless NFC y código QR dinámico integrado.
              </p>
            </div>
          </div>

          {/* GRID DE PRODUCTOS */}
          {productos.length === 0 ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-12 text-center">
              <p className="text-neutral-400">
                Cargando productos de Supabase o no hay registros disponibles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {productos.map((producto) => (
                <div
                  key={producto.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-700 hover:bg-neutral-900"
                >
                  {producto.badge && (
                    <div className="absolute right-4 top-4 z-10">
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-[10px] font-bold text-emerald-300">
                        {producto.badge}
                      </span>
                    </div>
                  )}

                  {/* MOCKUP TARJETA */}
                  <div
                    className={`relative flex h-52 w-full items-center justify-center rounded-xl bg-gradient-to-br ${producto.gradient_color || 'from-neutral-800 to-neutral-900'} p-6 shadow-inner transition group-hover:scale-[1.02]`}
                  >
                    <div className="flex h-28 w-44 flex-col justify-between rounded-lg border border-white/20 bg-black/40 p-3 shadow-2xl backdrop-blur-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black tracking-widest text-white/80">MOGU</span>
                        <div className="h-3 w-4 rounded-xs bg-amber-400/80" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-medium text-white/70">Nombre Apellido</p>
                        <p className="text-[7px] text-emerald-400">Tap to connect</p>
                      </div>
                    </div>
                  </div>

                  {/* DETALLES DEL PRODUCTO */}
                  <div className="mt-5 flex flex-1 flex-col justify-between">
                    <div>
                      <span className="text-xs font-medium text-neutral-500">{producto.category}</span>
                      <h3 className="mt-1 text-lg font-bold text-white">{producto.name}</h3>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-neutral-800/80 pt-4">
                      <div>
                        {producto.original_price && (
                          <span className="text-xs text-neutral-500 line-through mr-2">
                            {formatPrice(producto.original_price)}
                          </span>
                        )}
                        <span className="text-lg font-bold text-emerald-400">
                          {formatPrice(producto.price)}
                        </span>
                      </div>

                      {/* ENLACE AL PERSONALIZADOR DINÁMICO */}
                      <Link
                        href={`/producto/${producto.id}`}
                        className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-emerald-400 hover:text-black"
                      >
                        Comprar
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 5. FOOTER */}
        <footer id="contacto" className="border-t border-neutral-800 bg-neutral-950 py-12">
          <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <span className="text-xl font-black text-white">MOGU.</span>
              <p className="mt-1 text-xs text-neutral-500">
                © {new Date().getFullYear()} Mogu SpA. Todos los derechos reservados.
              </p>
            </div>
            <div className="flex gap-6 text-xs text-neutral-400">
              <Link href="/terminos" className="hover:text-emerald-400 transition">Términos</Link>
              <Link href="/privacidad" className="hover:text-emerald-400 transition">Privacidad</Link>
              <Link href="/soporte" className="hover:text-emerald-400 transition">Soporte</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}