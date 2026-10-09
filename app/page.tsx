import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import NetworkBackground from '@/components/NetworkBackground'
import PhoneMockup from '@/components/PhoneMockup'
import Card3D from '@/components/Card3D'

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

interface Plan {
  id: string
  name: string
  slug: string
  price: number
  original_price: number | null
  badge: string | null
  interval: string
  features: string[]
}

async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .neq('category', 'Software Cloud')
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

async function getPlans(): Promise<Plan[]> {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })

    if (error) {
      console.error('Error cargando planes Cloud:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Error de conexión planes:', err)
    return []
  }
}

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function Home() {
  const productos = await getProducts()
  const planes = await getPlans()

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-neutral-800 selection:text-white relative overflow-hidden">
      {/* FONDO INMERSIVO GENERATIVO */}
      <NetworkBackground />

      <div className="relative z-10">
        
        {/* 1. HEADER FLOTANTE / NAVBAR */}
        <header className="sticky top-0 z-50 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:border-emerald-500/50 transition">
                <img 
                  src="/logo-mogu.png" 
                  alt="Mogu Logo" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <span className="text-xl font-black tracking-wider text-white">
                MOGU<span className="text-emerald-500">.</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-300 md:flex">
              <Link href="#ecosistema" className="transition hover:text-white">Plataforma Cloud</Link>
              <Link href="#como-funciona" className="transition hover:text-white">¿Cómo funciona?</Link>
              <Link href="#productos" className="transition hover:text-white">Tarjetas NFC</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/login" className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white rounded-xl transition backdrop-blur-xl">
                Iniciar Sesión
              </Link>
              <Link href="/login" className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-xs font-extrabold uppercase tracking-wider rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                Crear mi Perfil 🚀
              </Link>
            </div>
          </div>
        </header>

        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden px-6 py-24 md:py-36">
          <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[450px] w-[750px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/15 blur-[150px]" />
          <div className="pointer-events-none absolute left-1/4 top-1/2 -z-10 h-[300px] w-[400px] rounded-full bg-teal-500/10 blur-[120px]" />

          <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 text-center lg:text-left space-y-8">
              
              {/* BADGE / PASTILLA EDITORIAL EXCLUSIVA */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-500/30 bg-neutral-900/80 text-emerald-300 text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_25px_rgba(16,185,129,0.2)] backdrop-blur-xl mx-auto lg:mx-0">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Diseño</span>
                <span className="text-emerald-500/40">/</span>
                <span>Tecnología</span>
                <span className="text-emerald-500/40">/</span>
                <span>Creatividad</span>
              </div>

              {/* TÍTULO PRINCIPAL (SIN PUNTO Y SIN ILUMINACIÓN EN 'AQUÍ') */}
              <div className="space-y-3">
                <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl lg:text-7xl leading-[1.05]">
                  Tu próximo nivel digital <br className="hidden sm:block" />
                  comienza aquí
                </h1>
              </div>

              {/* DESCRIPCIÓN */}
              <p className="text-base text-neutral-300 md:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Impulsa tu negocio con una plataforma SaaS de alto rendimiento y tarjetas NFC inteligentes. Gestiona tu identidad, menús y catálogos en tiempo real con un diseño impecable.
              </p>

              {/* BOTONES DE LLAMADA A LA ACCIÓN */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="#ecosistema"
                  className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 px-8 py-4 text-xs font-black uppercase tracking-wider text-black transition-all hover:scale-[1.02] active:scale-98 shadow-[0_0_30px_rgba(16,185,129,0.4)] text-center"
                >
                  Explorar Planes Cloud ✨
                </Link>
                <Link
                  href="#como-funciona"
                  className="w-full sm:w-auto rounded-2xl border border-neutral-800 bg-neutral-900/80 px-8 py-4 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-neutral-800 hover:border-neutral-700 active:scale-98 text-center backdrop-blur-md"
                >
                  ¿Cómo funciona?
                </Link>
              </div>

              {/* CONFIANZA / AVISO INFERIOR */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-3 text-xs text-neutral-400">
                <div className="flex -space-x-1.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[9px] font-bold text-emerald-400">✓</div>
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[9px] font-bold text-emerald-400">✓</div>
                </div>
                <span>Soporte técnico de 1 año incluido en todos los planes ⚡</span>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <PhoneMockup />
            </div>

          </div>
        </section>

        {/* 3. PLANES PLATAFORMA CLOUD MOGU (DINÁMICOS DESDE SUPABASE) */}
        <section id="ecosistema" className="mx-auto max-w-7xl px-6 py-20 border-t border-neutral-900">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-emerald-400 font-semibold text-xs tracking-widest uppercase">Plataforma Cloud Mogu</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mt-3">Planes de Ecosistema Digital</h2>
            <p className="text-neutral-400 text-sm md:text-base mt-4">
              Selecciona el plan perfecto para tu marca con diseño editorial de alta gama y gestión en tiempo real.
            </p>
          </div>

          {planes.length === 0 ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-12 text-center">
              <p className="text-neutral-400">Cargando planes de Supabase o no hay registros disponibles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {planes.map((plan) => {
                const isProAnnual = plan.slug === 'pro-anual'

                return (
                  <div
                    key={plan.id}
                    className={`p-6 rounded-3xl flex flex-col justify-between gap-6 transition backdrop-blur-sm ${
                      isProAnnual
                        ? 'border-2 border-emerald-500 bg-neutral-900/90 shadow-[0_0_35px_rgba(16,185,129,0.2)] scale-[1.02] relative'
                        : 'border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                    }`}
                  >
                    {isProAnnual && (
                      <div className="absolute right-4 top-4">
                        <span className="bg-emerald-500 text-black text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                          Recomendado ⭐
                        </span>
                      </div>
                    )}

                    <div>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        isProAnnual ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-300'
                      }`}>
                        {plan.badge || 'Plan'}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-3">{plan.name}</h3>
                      <p className="text-2xl font-black text-emerald-400 mt-2">
                        {formatPrice(plan.price)}{' '}
                        <span className="text-xs font-normal text-neutral-400">
                          / {plan.interval === 'month' ? 'mes' : 'año'}
                        </span>
                      </p>
                      
                      <ul className="space-y-2.5 mt-6 text-xs text-neutral-300">
                        {plan.features.map((feature, idx) => {
                          const isNegative = feature.toLowerCase().includes('no incluye')
                          return (
                            <li key={idx} className={`flex items-center gap-2 ${isNegative ? 'text-neutral-500 line-through pt-1' : ''}`}>
                              <span className={isNegative ? 'text-neutral-600 font-bold' : 'text-emerald-400 font-bold'}>
                                {isNegative ? '—' : '✓'}
                              </span>
                              <span>{feature}</span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>

                    <Link
                      href={`/producto/${plan.id}`}
                      className={`w-full py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition text-center shadow-lg ${
                        isProAnnual
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:opacity-90'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                      }`}
                    >
                      Elegir {plan.name} 🚀
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* 4. SECCIÓN: ¿CÓMO FUNCIONA? */}
        <section id="como-funciona" className="mx-auto max-w-7xl px-6 py-20 bg-neutral-950/60 backdrop-blur-sm border-t border-neutral-900">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-emerald-400 font-semibold text-xs tracking-widest uppercase">Tecnología Web App</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mt-3">Simple para ti, impecable para tus clientes</h2>
            <p className="text-neutral-400 text-sm md:text-base mt-4">
              Lanza tu ecosistema digital en menos de 5 minutos y edítalo cuantas veces quieras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-8 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg mb-6">01</div>
              <h3 className="text-lg font-bold text-white mb-2">Crea tu Cuenta</h3>
              <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                Elige tu enlace personalizado y configura el estilo visual de tu perfil o carta interactiva.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-8 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg mb-6">02</div>
              <h3 className="text-lg font-bold text-white mb-2">Publica y Comparte</h3>
              <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                Añade tus platos, servicios y redes sociales. Compártelo en Instagram, WhatsApp o código QR.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-8 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg mb-6">03</div>
              <h3 className="text-lg font-bold text-white mb-2">Crece sin Límites</h3>
              <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                Actualiza precios e información al instante desde cualquier celular o computador.
              </p>
            </div>
          </div>
        </section>

        {/* 5. SECCIÓN DE TARJETAS NFC FÍSICAS */}
        <section id="productos" className="mx-auto max-w-7xl px-6 py-20 border-t border-neutral-900">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <span className="text-emerald-400 font-semibold text-xs tracking-widest uppercase">Colección Física Opcional</span>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl mt-1">
              Tarjetas NFC
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Diseñadas para locales, profesionales y PyMEs con tecnología contactless y código QR.
            </p>
          </div>

          {productos.length === 0 ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-12 text-center">
              <p className="text-neutral-400">Cargando productos de Supabase o no hay registros disponibles.</p>
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
                        ? 'border-2 border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.2)] bg-neutral-900/90 scale-[1.02]'
                        : 'border border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <Card3D 
                        imageSrc="/tarjeta-google.png" 
                        altText={producto.name}
                        badgeText={isPopular ? "⭐ Destacado" : producto.badge}
                      />

                      <span className="text-xs font-semibold text-neutral-500 block mb-1">
                        {producto.category}
                      </span>
                      <h3 className="text-lg font-bold text-white mb-4">{producto.name}</h3>

                      <ul className="space-y-3 mb-8 text-xs text-neutral-300">
                        {producto.price === 14990 ? (
                          <>
                            <li className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">⚡</span>
                              <span>Enlace directo a reseñas 5 estrellas de Google.</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">📍</span>
                              <span>Ideal para mesas de negocios y locales.</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">🛡️</span>
                              <span>Incluye soporte y plataforma activa por 1 año.</span>
                            </li>
                          </>
                        ) : producto.price === 22990 ? (
                          <>
                            <li className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">💎</span>
                              <span>Tarjeta NFC física de alta durabilidad.</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">🌐</span>
                              <span>Perfil digital ilimitado + menú o carta interactiva.</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">⚡</span>
                              <span>Actualiza tus precios y productos en tiempo real.</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">🛡️</span>
                              <span>Soporte prioritario incluido por 1 año.</span>
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">🚀</span>
                              <span>Ecosistema Pro para marcas consolidadas.</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">📊</span>
                              <span>Catálogo interactivo con analíticas detalladas.</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">✨</span>
                              <span>Diseño y acabados premium exclusivos.</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">🛡️</span>
                              <span>Soporte preferencial dedicado por 1 año.</span>
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
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:opacity-90 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
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