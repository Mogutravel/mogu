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

// Función para obtener productos desde Supabase y excluir la suscripción digital del grid principal
async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .neq('category', 'Software Cloud') // Excluye el software cloud del grid de tarjetas físicas
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
        {/* 1. HEADER FLOTANTE / NAVBAR CON BRANDING OPTIMIZADO */}
        <header className="sticky top-0 z-50 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            
            {/* LOGOTIPO HORIZONTAL MOGU */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <div className="w-full h-full bg-neutral-950 rounded-[6px] flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>
              <span className="text-xl font-black tracking-wider text-white">
                MOGU<span className="text-emerald-500">.</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-300 md:flex">
              <Link href="#productos" className="transition hover:text-white">
                Productos
              </Link>
              <Link href="#como-funciona" className="transition hover:text-white">
                ¿Cómo funciona?
              </Link>
              <Link href="#faq" className="transition hover:text-white">
                Preguntas Frecuentes
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <button className="relative rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:border-neutral-500 hover:bg-neutral-800">
                Carrito
                <span className="ml-2 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-black">
                  0
                </span>
              </button>

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
              Ecosistema Digital y Tarjetas NFC en Chile
            </span>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl">
              Tu identidad profesional y comercial en un solo <span className="text-emerald-400">tap</span>.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base text-neutral-400 md:text-lg">
              Tarjetas inteligentes para tu negocio presencial y perfiles digitales profesionales optimizados para tus redes sociales. Todo integrado en una sola plataforma.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="#productos"
                className="w-full rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-black transition hover:bg-neutral-200 sm:w-auto"
              >
                Ver Opciones y Planes
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
              Sin aplicaciones, sin fricción. Comparte tu menú, redes y contactos de forma instantánea.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-8 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg mb-6">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Haz TAP o usa tu Link</h3>
              <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                Acerca tu tarjeta física con chip NFC al celular de tu cliente o comparte tu enlace digital personalizado en tu biografía.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-8 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg mb-6">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Abre tu Perfil y Menú</h3>
              <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                Se despliega de inmediato tu página digital con botones de contacto, redes sociales, catálogos o cartas interactivas.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-8 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg mb-6">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Conecta y Vende Más</h3>
              <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                Tus clientes guardan tus datos en su agenda con un solo clic y tú actualizas precios o información en tiempo real.
              </p>
            </div>
          </div>
        </section>

        {/* 4. SECCIÓN DE TARJETAS FÍSICAS (SUPABASE + CRO) */}
        <section id="productos" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <span className="text-emerald-400 font-semibold text-xs tracking-widest uppercase">Colección Física</span>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl mt-1">
              Tarjetas NFC con 1 Año Incluido
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Diseñadas para locales, profesionales y PyMEs con tecnología contactless y código QR.
            </p>
          </div>

          {/* GRID DE PRODUCTOS FÍSICOS */}
          {productos.length === 0 ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-12 text-center">
              <p className="text-neutral-400">
                Cargando productos de Supabase o no hay registros disponibles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {productos.map((producto) => {
                const isPopular = producto.price === 22990 || producto.badge?.toLowerCase().includes('popular')

                return (
                  <div
                    key={producto.id}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 bg-neutral-900/60 backdrop-blur-sm ${
                      isPopular
                        ? 'border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-neutral-900/90'
                        : 'border border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {isPopular ? (
                      <div className="absolute right-4 top-4 z-10">
                        <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-black shadow-md">
                          Más Popular ⭐
                        </span>
                      </div>
                    ) : producto.badge ? (
                      <div className="absolute right-4 top-4 z-10">
                        <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-[10px] font-bold text-emerald-300">
                          {producto.badge}
                        </span>
                      </div>
                    ) : null}

                    <div>
                      {/* MOCKUP TARJETA */}
                      <div
                        className={`relative flex h-48 w-full items-center justify-center rounded-xl bg-gradient-to-br ${producto.gradient_color || 'from-neutral-800 to-neutral-900'} p-6 shadow-inner transition group-hover:scale-[1.02] mb-6`}
                      >
                        <div className="flex h-24 w-40 flex-col justify-between rounded-lg border border-white/20 bg-black/40 p-3 shadow-2xl backdrop-blur-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black tracking-widest text-white/80">MOGU</span>
                            <div className="h-3 w-4 rounded-xs bg-amber-400/80" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-medium text-white/70">Tu Negocio</p>
                            <p className="text-[7px] text-emerald-400">Tap to connect</p>
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-neutral-500 block mb-1">
                        {producto.category}
                      </span>
                      <h3 className="text-lg font-bold text-white mb-4">{producto.name}</h3>

                      {/* LISTA DE BENEFICIOS CON CHECKS */}
                      <ul className="space-y-2.5 mb-8 text-xs text-neutral-300">
                        {producto.price === 14990 ? (
                          <>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>Enlace directo a reseñas 5 estrellas de Google.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>Ideal para mesas de pastelerías, cafeterías y locales.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>Incluye 1 año de plataforma digital activa.</span>
                            </li>
                          </>
                        ) : producto.price === 22990 ? (
                          <>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>Tarjeta NFC física de alta durabilidad.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>Perfil digital ilimitado + menú o carta interactiva.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>Actualiza tus precios y productos en tiempo real.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>Soporte prioritario incluido por 1 año.</span>
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>Ecosistema Pro para marcas consolidadas.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>Catálogo interactivo con analíticas detalladas.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>Diseño y acabados premium exclusivos.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>Soporte preferencial dedicado (1 año).</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-800/80 pt-5 mt-auto">
                      <div>
                        {producto.original_price && (
                          <span className="text-xs text-neutral-500 line-through block">
                            {formatPrice(producto.original_price)}
                          </span>
                        )}
                        <span className="text-xs text-neutral-400 block">Pago único (1 año incl.)</span>
                        <span className="text-lg font-bold text-emerald-400">
                          {formatPrice(producto.price)}
                        </span>
                      </div>

                      <Link
                        href={`/producto/${producto.id}`}
                        className={`rounded-xl px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition shadow-lg ${
                          isPopular
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:opacity-90 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                            : 'bg-white text-black hover:bg-neutral-200'
                        }`}
                      >
                        Comprar
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* BANNER DE SUSCRIPCIÓN DIGITAL (MENSUAL Y ANUAL) */}
          <div className="mt-16 p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-neutral-900/90 via-neutral-900/50 to-emerald-950/30 backdrop-blur-md shadow-2xl space-y-8">
            <div className="text-center md:text-left">
              <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider rounded-full mb-2">
                Suscripción Digital ☁️
              </span>
              <h3 className="text-2xl font-black text-white">¿Solo necesitas tu perfil digital para redes sociales?</h3>
              <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed mt-1">
                Crea tu página web personalizada en <strong className="text-white">mogu.cl/tu-negocio</strong> con enlaces ilimitados y menús interactivos, sin necesidad de comprar una tarjeta física. Elige el plan que mejor se adapte a ti.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* OPCIÓN MENSUAL */}
              <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-950/60 flex flex-col justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-neutral-400">Plan Flexible</span>
                  <h4 className="text-base font-bold text-white">Suscripción Mensual</h4>
                  <p className="text-2xl font-black text-emerald-400 mt-2">$3.990 <span className="text-xs font-normal text-neutral-400">/ mes</span></p>
                </div>
                <Link
                  href="/producto/a29bacd6-9f4e-4a05-8bcb-66d30e3432fb"
                  className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition text-center border border-neutral-700 shadow-lg"
                >
                  Elegir Mensual 🚀
                </Link>
              </div>

              {/* OPCIÓN ANUAL (CON DESTACADO DE AHORRO) */}
              <div className="p-6 rounded-2xl border border-emerald-500/50 bg-emerald-950/20 flex flex-col justify-between gap-4 relative overflow-hidden">
                <div className="absolute right-3 top-3">
                  <span className="bg-emerald-500 text-black text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                    Ahorra 45% 🔥
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-emerald-400">Plan Profesional</span>
                  <h4 className="text-base font-bold text-white">Suscripción Anual</h4>
                  <p className="text-2xl font-black text-emerald-400 mt-2">$24.990 <span className="text-xs font-normal text-neutral-400">/ año</span></p>
                </div>
                <Link
                  href="/producto/bc4dd526-5de4-4ee1-8ef8-3caab7a46608"
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition text-center shadow-lg hover:opacity-90"
                >
                  Elegir Anual 🚀
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SECCIÓN DE PREGUNTAS FRECUENTES (FAQ) - ELIMINA FRICCIÓN CRO */}
        <section id="faq" className="mx-auto max-w-4xl px-6 py-20 border-t border-neutral-900">
          <div className="text-center mb-12">
            <span className="text-emerald-400 font-semibold text-xs tracking-widest uppercase">Resolviendo Dudas</span>
            <h2 className="text-2xl md:text-3xl font-black text-white mt-1">Preguntas Frecuentes</h2>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-950">
              <h3 className="text-sm font-bold text-white mb-1">¿Qué incluye la compra de una tarjeta física?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Adquieres tu tarjeta plástica o metálica de alta calidad con tecnología NFC y código QR, junto con 1 año completo de acceso a tu perfil digital, menús y analíticas sin cobros adicionales.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-950">
              <h3 className="text-sm font-bold text-white mb-1">¿Cómo actualizo mi menú o mis enlaces?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Ingresas a tu panel de control privado en Mogu con tu cuenta, y cualquier cambio en tus precios, productos o redes se actualiza de manera instantánea en tiempo real.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-950">
              <h3 className="text-sm font-bold text-white mb-1">¿Qué pasa al cumplirse el periodo de servicio?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Se te enviará una invitación para renovar tu membresía de forma sencilla para mantener tus enlaces y códigos activos, sin perder tu dirección web personalizada.
              </p>
            </div>
          </div>
        </section>

        {/* 6. FOOTER */}
        <footer id="contacto" className="border-t border-neutral-800 bg-neutral-950 py-12">
          <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <span className="text-xl font-black text-white">MOGU.</span>
              <p className="mt-1 text-xs text-neutral-500">
                © {new Date().getFullYear()} Mogu SpA. Todos los derechos reservados. Cumplimiento Ley N° 19.496.
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