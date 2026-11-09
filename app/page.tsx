import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import PhoneMockup from '@/components/PhoneMockup'

export const revalidate = 0

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
  const planes = await getPlans()

  // Preguntas Frecuentes estructuradas para GEO / Motores de IA actualizadas con datos reales
  const faqs = [
    {
      question: "¿Qué es la plataforma Mogu?",
      answer: "Mogu SpA es un software integral de gestión y operaciones para restaurantes, cafés y locales gastronómicos. Centraliza la caja registradora, los garzones, la administración y los pedidos de los clientes en tiempo real."
    },
    {
      question: "¿Cómo se conectan la caja y los garzones en Mogu?",
      answer: "Mogu sincroniza las comandas al instante entre el personal de salón (garzones) y el punto de venta o caja, permitiendo un seguimiento del estado de los pedidos y métricas de ventas en tiempo real."
    },
    {
      question: "¿Qué es la comunidad Mogu Travel y los Mogu Puntos?",
      answer: "Es la red internacional de fidelización de Mogu que conecta locales gastronómicos con una comunidad global de viajeros, permitiendo acumular y canjear Mogu Puntos por incentivos de consumo."
    },
    {
      question: "¿Cuáles son los planes de Mogu para restaurantes?",
      answer: "Ofrecemos el Plan Mogu Start ($0, ideal con perfil digital y enlace personalizado), Plan Mogu Pro ($79.900 + IVA/año, con carta o menú digital QR/NFC y gestión de promociones) y Mogu Ecosystem ($119.900 + IVA/año, que incluye caja registradora, módulo de garzones y sala, y KDS en tiempo real)."
    }
  ]

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <div style={{ backgroundColor: '#0E0C0A', color: '#D4CEC7', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }} className="font-sans">
      
      {/* Datos Estructurados para IA / Motores de Búsqueda */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      {/* 🌟 HERO & FULL-PAGE GRADIENT ESTILO REMOTE */}
      <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-[#4c1d95] via-[#1e40af] to-[#0E0C0A] opacity-90 pointer-events-none -z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-gradient-to-r from-purple-500/15 via-cyan-400/15 to-blue-600/15 blur-[160px] pointer-events-none -z-0" />

      <div className="relative z-10">
        
        {/* 1. HEADER / NAVBAR */}
        <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl px-6 py-3.5 flex items-center justify-between z-50 bg-[#0E0C0A]/80 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center shadow-inner group-hover:border-white/40 transition">
              <img 
                src="/logo-mogu.png" 
                alt="Mogu Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
            <span className="text-lg font-black tracking-widest text-white">
              MOGU<span className="text-cyan-400">.</span>
            </span>
          </Link>

          {/* Navegación del Header con accesos directos */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-white/80 md:flex">
            <Link href="/cafeterias" className="transition hover:text-white">Cafés & Restaurantes</Link>
            <Link href="/comida-rapida" className="transition hover:text-white">Comida Rápida</Link>
            <Link href="/mogutravel" className="transition hover:text-cyan-300 font-semibold text-cyan-400">Mogu Travel ✈️</Link>
            <Link href="#ecosistema" className="transition hover:text-white">Planes</Link>
            <Link href="#faq" className="transition hover:text-white">FAQ</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-xs font-semibold text-white/80 hover:text-white transition">
              Iniciar Sesión
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2 bg-white hover:bg-slate-100 text-[#0E0C0A] text-xs font-bold rounded-xl transition shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] flex items-center gap-1.5"
            >
              Acceso Local 🚀
            </Link>
          </div>
        </header>

        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden px-6 pt-36 pb-16 md:pt-44 md:pb-24">
          
          <div className="mx-auto max-w-7xl text-center mb-6 select-none">
            <h2 className="text-6xl sm:text-8xl lg:text-[10rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-cyan-100 uppercase opacity-95 leading-none">
              mogu
            </h2>
          </div>

          <div className="mx-auto max-w-5xl text-center space-y-6 relative z-20">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-teal-200 leading-[1.08] drop-shadow-md">
              El sistema operativo interno <br className="hidden sm:block" />
              para tu restaurante o café.
            </h1>

            <p className="text-base sm:text-lg text-white/95 max-w-2xl mx-auto font-normal leading-relaxed">
              Mogu centraliza la operación de tu local: conecta la caja registradora, optimiza la atención de los garzones, gestiona pedidos en tiempo real y potencia la fidelización con <strong className="text-white">Mogu Puntos</strong> y la red <strong className="text-white">Mogu Travel</strong>.
            </p>

            {/* 🌟 3 BOTONES / TARJETAS INTERACTIVAS DE NICHOS */}
            <div className="pt-6 max-w-4xl mx-auto">
              <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-300 block mb-4">
                Explora las soluciones especializadas de Mogu:
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <Link 
                  href="/cafeterias"
                  className="group p-5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 hover:border-cyan-400/65 transition-all duration-300 backdrop-blur-xl shadow-lg flex flex-col justify-between hover:-translate-y-1"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center text-lg mb-3 border border-cyan-400/30 group-hover:scale-110 transition-transform">
                      ☕
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      Cafés & Restaurantes
                    </h3>
                    <p className="text-[11px] text-white/70 mt-1 leading-snug">
                      Software de gestión y comanderos para salones y cafeterías.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mt-4 flex items-center gap-1">
                    Ver solución →
                  </span>
                </Link>

                <Link 
                  href="/comida-rapida"
                  className="group p-5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 hover:border-amber-400/65 transition-all duration-300 backdrop-blur-xl shadow-lg flex flex-col justify-between hover:-translate-y-1"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center text-lg mb-3 border border-amber-400/30 group-hover:scale-110 transition-transform">
                      🍕
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      Comida Rápida
                    </h3>
                    <p className="text-[11px] text-white/70 mt-1 leading-snug">
                      Pedidos con retiro o delivery para sushi, pizzas, hamburguesas y más.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mt-4 flex items-center gap-1">
                    Ver solución →
                  </span>
                </Link>

                <Link 
                  href="/mogutravel"
                  className="group p-5 rounded-2xl bg-gradient-to-b from-purple-900/40 to-cyan-900/40 hover:from-purple-900/60 hover:to-cyan-900/60 border border-cyan-400/40 hover:border-cyan-300 transition-all duration-300 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col justify-between hover:-translate-y-1"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-purple-400/20 text-purple-300 flex items-center justify-center text-lg mb-3 border border-purple-400/30 group-hover:scale-110 transition-transform">
                      ✈️
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      Mogu Travel
                    </h3>
                    <p className="text-[11px] text-white/70 mt-1 leading-snug">
                      La red internacional de fidelización para viajeros y Mogu Puntos.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider mt-4 flex items-center gap-1">
                    Explorar Red →
                  </span>
                </Link>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto rounded-xl bg-white hover:bg-slate-100 px-8 py-4 text-xs font-bold uppercase tracking-wider text-[#0E0C0A] transition-all text-center shadow-2xl border border-white/20 hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                Comenzar ahora →
              </Link>
              <Link
                href="#ecosistema"
                className="w-full sm:w-auto rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white transition-all text-center backdrop-blur-md"
              >
                Ver Planes y Precios
              </Link>
            </div>
          </div>

          <div className="mt-16 flex justify-center relative z-25">
            <PhoneMockup />
          </div>

        </section>

        {/* 3. TARJETAS DE CARACTERÍSTICAS OPERATIVAS */}
        <section className="mx-auto max-w-7xl px-6 py-20 relative z-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">Operación</span>
                <h3 className="text-lg font-extrabold text-white mt-4 mb-2">Caja y Garzones Conectados</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Sincronización instantánea de comandas, control de mesas y actualización de ventas directo con el punto de venta.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">01 / MOGU CORE</div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">Pedidos</span>
                <h3 className="text-lg font-extrabold text-white mt-4 mb-2">Menú & E-Commerce Dinámico</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Cartas digitales interactivas donde tus clientes visualizan platos y hacen seguimiento de su pedido en tiempo real.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">02 / INTERACTIVE</div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">Fidelización</span>
                <h3 className="text-lg font-extrabold text-white mt-4 mb-2">Mogu Puntos & Travel</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Premia la frecuencia con Mogu Puntos y conecta tu local a la red internacional de viajeros Mogu Travel.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">03 / LOYALTY NETWORK</div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">Soporte</span>
                <h3 className="text-lg font-extrabold text-white mt-4 mb-2">Infraestructura Cloud</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Actualiza precios, productos y configuraciones al instante de forma segura desde nuestra plataforma backend.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">04 / REAL-TIME</div>
            </div>

          </div>
        </section>

        {/* 4. PLANES ANUALES DINÁMICOS DESDE SUPABASE */}
        <section id="ecosistema" className="mx-auto max-w-7xl px-6 py-28 relative z-20 border-t border-white/15">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest uppercase bg-white/10 text-cyan-300 px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
              Planes Mogu SpA
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">Planes de Software y Operaciones</h2>
            <p className="text-[#D4CEC7] text-sm md:text-base font-normal mt-3">
              Selecciona el nivel ideal para tu restaurante o café, adaptado a tu volumen de productos y herramientas de caja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
            {planes.map((plan) => {
              const isPopular = plan.slug === 'mogu-ecosystem' || plan.badge?.includes('POPULAR')

              if (isPopular) {
                return (
                  <div 
                    key={plan.id}
                    className="p-8 rounded-3xl bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-xl border-2 border-cyan-400 shadow-[0_0_50px_-10px_rgba(6,182,212,0.4)] relative flex flex-col justify-between md:-translate-y-3"
                  >
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-extrabold uppercase px-4 py-1.5 rounded-full tracking-widest shadow-lg">
                        ⭐ MÁS POPULAR
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase px-3.5 py-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 tracking-wider">
                        {plan.name}
                      </span>
                      <h3 className="text-2xl font-bold text-white mt-4">{plan.name}</h3>
                      <div className="flex items-baseline gap-2 mt-2">
                        <p className="text-3xl font-extrabold text-white">
                          {formatPrice(plan.price)}
                        </p>
                        {plan.original_price && (
                          <span className="text-xs text-white/50 line-through">
                            {formatPrice(plan.original_price)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#D4CEC7] block font-medium mt-1">+ IVA / pago {plan.interval}</span>
                      
                      <ul className="space-y-3.5 mt-6 text-xs font-normal text-white">
                        {plan.features?.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2.5">
                            <span className="text-cyan-400 font-bold">✓</span> {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link
                      href={`/checkout/${plan.slug}`}
                      className="w-full mt-8 py-3.5 text-xs font-bold uppercase tracking-wider rounded-2xl bg-white hover:bg-slate-100 text-[#0E0C0A] text-center transition-all shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-[1.02] block"
                    >
                      Elegir {plan.name} →
                    </Link>
                  </div>
                )
              }

              return (
                <div 
                  key={plan.id}
                  className="p-8 rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/15 flex flex-col justify-between transition-all hover:border-white/30 shadow-xl"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase px-3.5 py-1 rounded-full bg-white/10 text-white tracking-wider">
                      {plan.name}
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-4">{plan.name}</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                      <p className="text-3xl font-extrabold text-white">
                        {formatPrice(plan.price)}
                      </p>
                      {plan.original_price && (
                        <span className="text-xs text-white/50 line-through">
                          {formatPrice(plan.original_price)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#D4CEC7] block font-medium mt-1">+ IVA / pago {plan.interval}</span>
                    
                    <ul className="space-y-3.5 mt-6 text-xs font-normal text-white">
                      {plan.features?.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2.5">
                          <span className="text-cyan-400 font-bold">✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={`/checkout/${plan.slug}`}
                    className="w-full mt-8 py-3.5 text-xs font-bold uppercase tracking-wider rounded-2xl bg-white/10 hover:bg-white hover:text-[#0E0C0A] text-white text-center transition-all border border-white/20 shadow-md block"
                  >
                    Elegir {plan.name} →
                  </Link>
                </div>
              )
            })}
          </div>
        </section>

        {/* 5. SECCIÓN MOGU PUNTOS & FIDELIZACIÓN */}
        <section className="mx-auto max-w-7xl px-6 py-20 relative z-25 border-t border-white/15">
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-purple-900/40 via-cyan-900/30 to-blue-900/40 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <span className="text-xs font-extrabold uppercase px-3.5 py-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 tracking-wider">
                Fidelización & Recompensas
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Haz que tus clientes vuelvan con Mogu Puntos
              </h2>
              <p className="text-sm md:text-base text-white/80 leading-relaxed font-normal">
                Cada pedido en tu restaurante o café otorga <strong>Mogu Puntos</strong> acumulables. Conecta tu negocio a la red global <strong>Mogu Travel</strong> e impulsa la retención de clientes sin complicaciones.
              </p>
            </div>
            <div className="w-full md:w-auto text-center">
              <Link
                href="/mogutravel"
                className="w-full sm:w-auto inline-block px-8 py-4 bg-cyan-400 hover:bg-cyan-300 text-[#0E0C0A] font-extrabold rounded-2xl transition shadow-lg text-xs uppercase tracking-wider"
              >
                Explorar Mogu Travel →
              </Link>
            </div>
          </div>
        </section>

        {/* 6. TESTIMONIOS */}
        <section id="testimonios" className="mx-auto max-w-7xl px-6 py-28 relative z-20 border-t border-white/15">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest uppercase bg-white/10 text-cyan-300 px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
              Casos de Éxito
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">Lo que dicen nuestros clientes</h2>
            <p className="text-[#D4CEC7] text-sm md:text-base font-normal mt-3">
              Locales gastronómicos y cafeterías que ya conectaron su operación interna con Mogu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="p-8 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 text-sm mb-4">★★★★★</div>
                <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed italic">
                  &ldquo;La integración entre los garzones y la caja cambió por completo nuestro ritmo de atención. Los pedidos entran limpios y ordenados en tiempo real.&rdquo;
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center font-bold text-white text-xs">
                  CR
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Carlos Ramírez</h4>
                  <span className="text-[10px] text-cyan-300 font-medium">Café & Bistró Santiago</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 text-sm mb-4">★★★★★</div>
                <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed italic">
                  &ldquo;Poder actualizar la carta de productos al instante y ofrecer la comunidad de Mogu Travel y Mogu Puntos nos da una retención de clientes increíble.&rdquo;
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center font-bold text-white text-xs">
                  FV
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Fernanda Valenzuela</h4>
                  <span className="text-[10px] text-cyan-300 font-medium">Cafetería de Especialidad</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 text-sm mb-4">★★★★★</div>
                <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed italic">
                  &ldquo;Tener el control centralizado de la administración y la visualización de pedidos para el cliente final ha optimizado nuestro servicio de forma única.&rdquo;
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center font-bold text-white text-xs">
                  MS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Matías Soto</h4>
                  <span className="text-[10px] text-cyan-300 font-medium">Gastronomía & Eventos</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. ¿CÓMO FUNCIONA? */}
        <section id="como-funciona" className="mx-auto max-w-7xl px-6 py-28 relative z-20 border-t border-white/15">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest uppercase bg-white/10 text-cyan-300 px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
              Implementación Rápida
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">Simple para el equipo, impecable para el cliente</h2>
            <p className="text-[#D4CEC7] text-sm md:text-base font-normal mt-3">
              Conecta tu local al sistema operativo de Mogu en pocos minutos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="p-8 rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-cyan-400 font-bold flex items-center justify-center text-sm mb-6 border border-white/20 shadow-inner">01</div>
              <h3 className="text-lg font-bold text-white mb-2">Configura tu Local</h3>
              <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed">
                Registra tu negocio, define tu menú o catálogo interactivo y establece los accesos para caja y garzones.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-cyan-400 font-bold flex items-center justify-center text-sm mb-6 border border-white/20 shadow-inner">02</div>
              <h3 className="text-lg font-bold text-white mb-2">Conecta la Operación</h3>
              <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed">
                Sincroniza comandas en tiempo real y permite que los clientes sigan sus pedidos de forma digital y fluida.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-cyan-400 font-bold flex items-center justify-center text-sm mb-6 border border-white/20 shadow-inner">03</div>
              <h3 className="text-lg font-bold text-white mb-2">Fideliza y Crece</h3>
              <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed">
                Integra Mogu Puntos y la comunidad Mogu Travel para escalar tu servicio gastronómico sin límites.
              </p>
            </div>
          </div>
        </section>

        {/* 8. PREGUNTAS FRECUENTES (FAQ / GEO) */}
        <section id="faq" className="mx-auto max-w-7xl px-6 py-28 relative z-20 border-t border-white/15">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest uppercase bg-white/10 text-cyan-300 px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
              Respuestas Clave
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">Preguntas Frecuentes</h2>
            <p className="text-[#D4CEC7] text-sm md:text-base font-normal mt-3">
              Todo lo que necesitas saber sobre Mogu SpA y nuestra plataforma de operaciones gastronómicas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-3">{faq.question}</h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 9. FOOTER */}
        <footer id="contacto" className="border-t border-white/15 bg-[#0E0C0A]/80 backdrop-blur-md py-12 relative z-20">
          <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <span className="text-lg font-black text-white tracking-widest">MOGU<span className="text-cyan-400">.</span></span>
              <p className="mt-1 text-xs text-[#D4CEC7] font-medium">
                © {new Date().getFullYear()} Mogu SpA. Todos los derechos reservados. Cumplimiento Ley N° 19.496.
              </p>
            </div>
            <div className="flex gap-6 text-xs font-medium text-white/90">
              <Link href="/terminos" className="hover:text-white transition">Términos</Link>
              <Link href="/privacidad" className="hover:text-white transition">Privacidad</Link>
              <Link href="/soporte" className="hover:text-white transition">Soporte</Link>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}