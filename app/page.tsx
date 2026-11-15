import Link from 'next/link'
import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import PhoneMockup from '@/components/PhoneMockup'
import Navbar from '@/components/Navbar'
import PricingSection from '@/components/PricingSection'
import {
  ArrowRight,
  Check,
  Star,
  Coffee,
  Flame,
  Globe,
  Stamp,
  Compass,
  Smartphone,
  ShoppingBag,
  Monitor,
  LayoutGrid,
  QrCode,
  BarChart3,
  Lock,
  Sliders,
} from 'lucide-react'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'Mogu - Sistema Operativo Interno para Restaurantes y Cafés',
  description:
    'Mogu centraliza la operación de tu local: conecta la caja registradora, optimiza la atención de garzones, gestiona pedidos en tiempo real con retiro y delivery, y potencia la fidelización con Mogu Puntos y Mogu Travel.',
  keywords: [
    'software restaurante',
    'comandas caja garzones',
    'carta digital qr',
    'pedidos retiro y delivery',
    'kds cocina',
    'mogu travel',
    'gestion cafeterias',
  ],
  openGraph: {
    title: 'Mogu - Sistema Operativo para Restaurantes y Cafés',
    description:
      'Centraliza caja, garzones, cocina y pedidos online con retiro y delivery en tiempo real. Descubre Mogu Travel y los planes para tu local.',
    url: 'https://mogu.cl',
    siteName: 'Mogu SpA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mogu - Sistema Operativo para Restaurantes y Cafés',
    description:
      'Centraliza caja, garzones, cocina y pedidos online con retiro y delivery en tiempo real. Descubre Mogu Travel y los planes para tu local.',
  },
}

interface Plan {
  id: string
  name: string
  slug: string
  price: number
  original_price: number | null
  badge: string | null
  interval: string
  subtitle?: string
  features: string[]
}

const DEFAULT_START_PLAN: Plan = {
  id: 'mogu-start',
  name: 'Mogu Start',
  slug: 'mogu-start',
  price: 0,
  original_price: null,
  badge: 'GRATIS PARA SIEMPRE',
  interval: 'mensual',
  subtitle: 'Tu identidad gastronómica en un solo enlace inteligente.',
  features: [
    'Perfil digital optimizado (mogu.cl/tu-local)',
    'Enlaces externos ilimitados (Instagram, WhatsApp, ubicación, web)',
    'Diseño 100% adaptado a dispositivos móviles',
    'Código QR descargable para compartir tu perfil',
  ],
}

const DEFAULT_MONTHLY_PLANS: Plan[] = [
  {
    id: 'mogu-core',
    name: 'Mogu Core',
    slug: 'mogu-core',
    price: 14990,
    original_price: null,
    badge: 'NÚCLEO DIGITAL',
    interval: 'mensual',
    subtitle: 'Digitaliza tu carta y olvídate de reimprimir precios.',
    features: [
      'Todo lo incluido en Mogu Start',
      'Menú digital interactivo con código QR',
      'Hasta 100 productos activos en catálogo',
      'Actualización de precios y disponibilidad en tiempo real',
      'Gestión de categorías, fotos y modificadores de productos',
      'Personalización con los colores y logo de tu marca',
    ],
  },
  {
    id: 'mogu-pro',
    name: 'Mogu Pro',
    slug: 'mogu-pro',
    price: 29900,
    original_price: null,
    badge: 'MÁS ELEGIDO • 0% COMISIÓN',
    interval: 'mensual',
    subtitle: 'Tu propia app de pedidos y sistema de fidelización sin intermediarios.',
    features: [
      'Todo lo incluido en Mogu Core',
      'App web de pedidos dedicada para retiro en local y delivery propio',
      'Pedidos directos al WhatsApp de tu local (¡Conserva el 100% de tu margen con 0% de comisión!)',
      'Catálogo optimizado de hasta 150 productos activos',
      'Fidelización integrada: Motor de Mogu Puntos + Red Mogu Travel',
    ],
  },
  {
    id: 'mogu-ecosystem',
    name: 'Mogu Ecosystem',
    slug: 'mogu-ecosystem',
    price: 49900,
    original_price: null,
    badge: 'OPERACIÓN TOTAL',
    interval: 'mensual',
    subtitle: 'Control absoluto de tu salón, cocina y caja con catálogo ilimitado.',
    features: [
      'Todo lo incluido en Mogu Pro',
      'Catálogo de productos 100% ilimitado (sin restricciones)',
      'Ecosistema operativo en vivo: Sincronización instantánea entre Caja, Cocina (KDS), Garzones y Admin',
      'Analítica financiera avanzada, cierres seguros por PIN y métricas de ventas',
      'Hasta 10 estaciones conectadas y visibilidad destacada en Mogu Travel',
    ],
  },
]

const DEFAULT_ANNUAL_PLANS: Plan[] = [
  {
    id: 'mogu-core-anual',
    name: 'Mogu Core',
    slug: 'mogu-core-anual',
    price: 149900,
    original_price: 179880,
    badge: '2 MESES GRATIS',
    interval: 'anual',
    subtitle: 'Digitaliza tu carta y olvídate de reimprimir precios todo el año.',
    features: [
      'Todo lo incluido en Mogu Start',
      'Menú digital interactivo con código QR',
      'Hasta 100 productos activos en catálogo',
      'Actualización de precios y disponibilidad en tiempo real',
      'Gestión de categorías, fotos y modificadores de productos',
      'Personalización con los colores y logo de tu marca',
    ],
  },
  {
    id: 'mogu-pro-anual',
    name: 'Mogu Pro',
    slug: 'mogu-pro-anual',
    price: 299900,
    original_price: 358800,
    badge: 'MÁS ELEGIDO • AHORRA $58.900',
    interval: 'anual',
    subtitle: 'Tu propia app de pedidos y sistema de fidelización sin intermediarios.',
    features: [
      'Todo lo incluido en Mogu Core',
      'App web de pedidos dedicada para retiro en local y delivery propio',
      'Pedidos directos al WhatsApp de tu local (¡Conserva el 100% de tu margen con 0% de comisión!)',
      'Catálogo optimizado de hasta 150 productos activos',
      'Fidelización integrada: Motor de Mogu Puntos + Red Mogu Travel',
    ],
  },
  {
    id: 'mogu-ecosystem-anual',
    name: 'Mogu Ecosystem',
    slug: 'mogu-ecosystem-anual',
    price: 399000,
    original_price: 598800,
    badge: 'OPERACIÓN TOTAL • AHORRA $199.800',
    interval: 'anual',
    subtitle: 'Control absoluto de tu salón, cocina y caja con catálogo ilimitado.',
    features: [
      'Todo lo incluido en Mogu Pro',
      'Catálogo de productos 100% ilimitado (sin restricciones)',
      'Ecosistema operativo en vivo: Sincronización instantánea entre Caja, Cocina (KDS), Garzones y Admin',
      'Analítica financiera avanzada, cierres seguros por PIN y métricas de ventas',
      'Hasta 10 estaciones conectadas y visibilidad destacada en Mogu Travel',
    ],
  },
]

async function getStartPlan(): Promise<Plan> {
  try {
    const { data } = await supabase
      .from('plans')
      .select('*')
      .eq('slug', 'mogu-start')
      .single()
    return data ? { ...DEFAULT_START_PLAN, ...data } : DEFAULT_START_PLAN
  } catch {
    return DEFAULT_START_PLAN
  }
}

export default async function Home() {
  const startPlan = await getStartPlan()
  const monthlyPlans = DEFAULT_MONTHLY_PLANS
  const annualPlans = DEFAULT_ANNUAL_PLANS

  const faqs = [
    {
      question: '¿Qué es la plataforma Mogu?',
      answer:
        'Mogu SpA es un ecosistema integral de gestión y operaciones para restaurantes, cafés y locales gastronómicos. Centraliza la caja registradora, los garzones, la pantalla de cocina (KDS), el control administrativo y la app web para pedidos de los clientes en tiempo real.',
    },
    {
      question: '¿Mis clientes pueden hacer pedidos para retiro en local y delivery?',
      answer:
        'Sí. Cada local cuenta con su propia aplicación web móvil personalizada donde los clientes exploran la carta visual, arman su carrito y realizan pedidos tanto para consumo en mesa (vía QR o NFC) como para retiro en mostrador o envío a domicilio, sin descargas ni comisiones por venta.',
    },
    {
      question: '¿Cómo se conectan la caja, la cocina y los garzones en Mogu?',
      answer:
        'Cuando un cliente o garzón confirma una orden, la comanda llega al instante al KDS de cocina por orden de llegada y actualiza el estado de la mesa en el panel de caja y salón, registrando métricas de ventas desglosadas por medio de pago.',
    },
    {
      question: '¿Qué es la comunidad Mogu Travel y los Mogu Puntos?',
      answer:
        'Es la red internacional de fidelización incluida desde el plan Mogu Pro y Mogu Ecosystem que conecta locales gastronómicos con clientes frecuentes y una comunidad global de viajeros, permitiendo acumular y canjear Mogu Puntos por recompensas e incentivos de consumo.',
    },
    {
      question: '¿Puedo modificar mi carta, colores y precios por mi cuenta?',
      answer:
        'Sí. Desde tu panel de administración cuentas con un editor visual en tiempo real para cambiar colores de identidad, logotipo, banners promocionales, enlaces directos (WhatsApp, Instagram, Google Reviews) y activar o pausar platos agotados con un clic.',
    },
    {
      question: '¿Cuáles son los planes de Mogu para restaurantes?',
      answer:
        'Contamos con Mogu Start ($0, perfil digital con enlaces ilimitados), Mogu Core ($14.990 + IVA/mes, carta digital QR hasta 100 productos), Mogu Pro ($29.900 + IVA/mes, app de pedidos hasta 150 productos + comunidad y fidelización) y Mogu Ecosystem ($49.900 + IVA/mes, catálogo ilimitado + caja, garzones, KDS en tiempo real y fidelización). Todos los planes de pago cuentan con opción anual.',
    },
  ]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <div
      style={{
        backgroundColor: '#0E0C0A',
        color: '#D4CEC7',
        minHeight: '100vh',
        position: 'relative',
        overflowX: 'hidden',
      }}
      className="font-sans"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-[#4c1d95] via-[#1e40af] to-[#0E0C0A] opacity-90 pointer-events-none -z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-gradient-to-r from-purple-500/15 via-cyan-400/15 to-blue-600/15 blur-[160px] pointer-events-none -z-0" />

      <div className="relative z-10">
        <Navbar />

        {/* HERO SECTION */}
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
              Mogu centraliza la operación de tu local: conecta la caja registradora, optimiza la atención de los garzones, gestiona pedidos en tiempo real con retiro y delivery, y potencia la fidelización con <strong className="text-white">Mogu Puntos</strong> y la red <strong className="text-white">Mogu Travel</strong>.
            </p>

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
                    <div className="w-9 h-9 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center mb-3 border border-cyan-400/30 group-hover:scale-110 transition-transform">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      Cafés y Restaurantes
                    </h3>
                    <p className="text-[11px] text-white/70 mt-1 leading-snug">
                      Software de gestión y comanderos para salones y cafeterías.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mt-4 flex items-center gap-1">
                    Ver solución
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>

                <Link
                  href="/comida-rapida"
                  className="group p-5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 hover:border-amber-400/65 transition-all duration-300 backdrop-blur-xl shadow-lg flex flex-col justify-between hover:-translate-y-1"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center mb-3 border border-amber-400/30 group-hover:scale-110 transition-transform">
                      <Flame className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      Comida Rápida
                    </h3>
                    <p className="text-[11px] text-white/70 mt-1 leading-snug">
                      Pedidos con retiro o delivery para sushi, pizzas, hamburguesas y más.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mt-4 flex items-center gap-1">
                    Ver solución
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>

                <Link
                  href="/travel"
                  className="group p-5 rounded-2xl bg-gradient-to-b from-purple-900/40 to-cyan-900/40 hover:from-purple-900/60 hover:to-cyan-900/60 border border-cyan-400/40 hover:border-cyan-300 transition-all duration-300 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col justify-between hover:-translate-y-1"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-purple-400/20 text-purple-300 flex items-center justify-center mb-3 border border-purple-400/30 group-hover:scale-110 transition-transform">
                      <Globe className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      Mogu Travel
                    </h3>
                    <p className="text-[11px] text-white/70 mt-1 leading-snug">
                      La red internacional de fidelización para viajeros y Mogu Puntos.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider mt-4 flex items-center gap-1">
                    Explorar Red
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/checkout/mogu-start"
                className="group w-full sm:w-auto rounded-xl bg-white hover:bg-slate-100 px-8 py-4 text-xs font-bold uppercase tracking-wider text-[#0E0C0A] transition-all text-center shadow-2xl border border-white/20 hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span>Crea tu perfil digital gratis</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
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

        {/* SECCIÓN DIDÁCTICA: ECOSISTEMA TODO EN UNO Y FLUJO REAL */}
        <section id="ecosistema-completo" className="mx-auto max-w-7xl px-6 py-28 relative z-20 border-t border-white/15">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold tracking-widest uppercase bg-white/10 text-cyan-300 px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
              Ecosistema Todo en Uno
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Reemplaza sistemas antiguos y costosos por una plataforma ágil
            </h2>
            <p className="text-[#D4CEC7] text-sm md:text-base font-normal leading-relaxed">
              Así funciona Mogu en la operación diaria de tu local: conectamos la nueva App de pedidos de tus clientes directamente con tu cocina, garzones y caja en tiempo real.
            </p>
          </div>

          {/* PASO A PASO DIDÁCTICO DEL VIAJE DEL PEDIDO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="p-8 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="w-11 h-11 rounded-2xl bg-cyan-400/20 text-cyan-300 font-bold flex items-center justify-center text-sm border border-cyan-400/30">
                    01
                  </span>
                  <Smartphone className="w-5 h-5 text-cyan-300/70" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">El cliente pide sin fricciones</h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                  Tus clientes escanean el código QR o NFC en la mesa, o abren tu enlace web desde casa. Exploran la carta visual, arman su carrito y eligen consumo en salón, retiro en mostrador o envío a domicilio.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                Salón, Retiro en Local y Delivery
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.07] backdrop-blur-xl border border-cyan-400/45 shadow-[0_0_35px_rgba(6,182,212,0.18)] flex flex-col justify-between md:-translate-y-2">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="w-11 h-11 rounded-2xl bg-cyan-400 text-[#0E0C0A] font-extrabold flex items-center justify-center text-sm shadow-md">
                    02
                  </span>
                  <Monitor className="w-5 h-5 text-cyan-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">La orden entra directo a cocina</h3>
                <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-normal">
                  Al confirmar la compra, la comanda aparece al instante en el KDS de cocina organizada por orden de llegada. Eliminas papeles perdidos, evitas errores de transcripción y reduces tiempos de espera.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                Sincronización Instantánea KDS
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="w-11 h-11 rounded-2xl bg-cyan-400/20 text-cyan-300 font-bold flex items-center justify-center text-sm border border-cyan-400/30">
                    03
                  </span>
                  <BarChart3 className="w-5 h-5 text-cyan-300/70" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Control de caja y resultados</h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                  Supervisa mesas disponibles y ocupadas en vivo, cierra cuentas y revisa el desglose exacto de ingresos (efectivo, POS o transferencias) protegido por PIN de seguridad.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                Métricas Financieras en Vivo
              </div>
            </div>
          </div>

          {/* BLOQUE DESTACADO: NUEVA APP MÓVIL PARA TUS CLIENTES */}
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white/10 via-white/[0.04] to-cyan-950/30 backdrop-blur-xl border border-cyan-400/30 shadow-2xl mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold uppercase tracking-wider">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Nueva App Móvil del Cliente</span>
                </div>
                <h3 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">
                  Tu propia App de pedidos sin descargas ni comisiones por venta
                </h3>
                <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                  Entrega a tus clientes una plataforma moderna con tu propia identidad visual. Pueden ver platos destacados, acumular puntos, elegir retiro en local o delivery y finalizar su pedido en segundos.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#0E0C0A]/60 border border-white/10">
                    <h4 className="text-sm font-bold text-white mb-1">Retiro en Local y Delivery</h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Carrito inteligente integrado para gestionar pedidos para llevar, despacho a domicilio o consumo en sala.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0E0C0A]/60 border border-white/10">
                    <h4 className="text-sm font-bold text-white mb-1">Personalización Visual Total</h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Adapta colores, logotipo, banners promocionales y enlaces directos a WhatsApp, Instagram o Google Reviews.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0E0C0A]/60 border border-white/10">
                    <h4 className="text-sm font-bold text-white mb-1">Carta Digital Multi-Vista</h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Organiza categorías, destaca tus platos más pedidos y alterna entre vista clásica, moderna o tarjetas.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0E0C0A]/60 border border-white/10">
                    <h4 className="text-sm font-bold text-white mb-1">Saldo de Puntos y Recompensas</h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Cada pedido suma Mogu Puntos visibles en el perfil del cliente para incentivar compras recurrentes.
                    </p>
                  </div>
                </div>
              </div>

              {/* RESUMEN DE IMPACTO Y CONVERSIÓN */}
              <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#0E0C0A]/85 border border-white/15 space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                    Resultados en tu Negocio
                  </span>
                  <h4 className="text-lg font-extrabold text-white mt-1">
                    Por qué los locales migran a Mogu
                  </h4>
                </div>

                <ul className="space-y-4 text-xs text-white/85">
                  <li className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">0% comisiones por pedido</strong>
                      <span className="text-white/70">
                        A diferencia de las apps tradicionales de reparto, el margen completo de cada venta queda en tu local.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Autogestión en segundos</strong>
                      <span className="text-white/70">
                        Si un producto se agota, lo ocultas desde tu celular o computador y desaparece al instante de la carta.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Un solo sistema modular</strong>
                      <span className="text-white/70">
                        Reemplaza comanderos antiguos, cartas PDF estáticas y planillas manuales por un ecosistema conectado.
                      </span>
                    </div>
                  </li>
                </ul>

                <div className="pt-2">
                  <Link
                    href="/checkout/mogu-start"
                    className="group w-full py-3.5 px-6 rounded-xl bg-white hover:bg-slate-100 text-[#0E0C0A] text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>Crea tu perfil digital gratis</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* GRILLA DE 6 MÓDULOS OPERATIVOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    Cocina
                  </span>
                  <Monitor className="w-4 h-4 text-white/40" />
                </div>
                <h3 className="text-lg font-extrabold text-white mt-4 mb-2">KDS Cocina en Tiempo Real</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Pantalla de gestión de platos que recibe comandas de salón, retiro y delivery al instante. Ordena prioridades y agiliza el despacho.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">
                01 / KDS DISPLAY
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    Salón y Caja
                  </span>
                  <LayoutGrid className="w-4 h-4 text-white/40" />
                </div>
                <h3 className="text-lg font-extrabold text-white mt-4 mb-2">Control de Caja y Mesas en Vivo</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Visualiza en tiempo real qué mesas están disponibles, ocupadas o listas para cobrar, conectando garzones y caja sin demoras.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">
                02 / LIVE FLOOR & POS
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    Mesas Inteligentes
                  </span>
                  <QrCode className="w-4 h-4 text-white/40" />
                </div>
                <h3 className="text-lg font-extrabold text-white mt-4 mb-2">Gestión de QRs y Etiquetas NFC</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Administra mesas físicas y obtén códigos QR únicos y enlaces NFC para tótems de mesa con identificación automática.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">
                03 / QR & NFC MANAGER
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    Finanzas
                  </span>
                  <BarChart3 className="w-4 h-4 text-white/40" />
                </div>
                <h3 className="text-lg font-extrabold text-white mt-4 mb-2">Métricas y Desglose de Ventas</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Historial analítico en vivo con ventas totales separadas por efectivo, tarjeta POS y transferencias por mesa y hora.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">
                04 / SALES ANALYTICS
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    Seguridad
                  </span>
                  <Lock className="w-4 h-4 text-white/40" />
                </div>
                <h3 className="text-lg font-extrabold text-white mt-4 mb-2">Acceso Administrador por PIN</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Protege la información financiera, configuraciones críticas y cierres de caja mediante PIN numérico exclusivo.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">
                05 / ADMIN SECURITY
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    Autogestión
                  </span>
                  <Sliders className="w-4 h-4 text-white/40" />
                </div>
                <h3 className="text-lg font-extrabold text-white mt-4 mb-2">Editor Visual en Tiempo Real</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Personaliza colores, banners, enlaces oficiales y previsualiza en vivo cómo lucirá tu app en el celular del cliente.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">
                06 / LIVE STUDIO
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN MOGU TRAVEL */}
        <section className="mx-auto max-w-7xl px-6 py-28 relative z-25 border-t border-white/15">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-black uppercase px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-400/30 tracking-widest shadow-lg">
              Comunidad Global Mogu Travel
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Una red internacional que conecta viajeros y locales
            </h2>
            <p className="text-sm md:text-base text-white/70 leading-relaxed font-normal">
              Mogu Travel no es solo fidelización; es una comunidad en movimiento. Explora el ecosistema de pasaportes digitales, timbres oficiales y beneficios en cada ciudad y local aliado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="group p-8 rounded-3xl bg-gradient-to-b from-purple-950/40 via-[#141416] to-[#141416] border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Stamp className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-extrabold text-white group-hover:text-purple-300 transition-colors">
                  Pasaporte Digital del Viajero
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                  Visualiza tu perfil de viajero, rango actual, puntos acumulados y la grilla con todos los timbres oficiales desbloqueados al pagar en locales aliados alrededor del mundo.
                </p>
              </div>

              <div className="pt-8">
                <Link
                  href="/travel/passport"
                  className="w-full py-3.5 px-6 rounded-2xl bg-purple-600/20 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Abrir mi Pasaporte</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            <div className="group p-8 rounded-3xl bg-gradient-to-b from-cyan-950/40 via-[#141416] to-[#141416] border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Compass className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                  Red Global de Aliados y Nómadas
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                  Descubre cómo los cafés, restaurantes y hostels se conectan a través de Mogu Travel para ofrecer experiencias transfronterizas y recompensas exclusivas.
                </p>
              </div>

              <div className="pt-8">
                <Link
                  href="/travel"
                  className="w-full py-3.5 px-6 rounded-2xl bg-cyan-600/20 hover:bg-cyan-500 text-cyan-200 hover:text-black border border-cyan-500/40 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Explorar la Red</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* COMPONENTE INTERACTIVO DE PRECIOS Y PLANES (MENSUAL / ANUAL) */}
        <PricingSection
          startPlan={startPlan}
          monthlyPlans={DEFAULT_MONTHLY_PLANS}
          annualPlans={DEFAULT_ANNUAL_PLANS}
        />

        {/* TESTIMONIOS */}
        <section id="testimonios" className="mx-auto max-w-7xl px-6 py-28 relative z-20 border-t border-white/15">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest uppercase bg-white/10 text-cyan-300 px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
              Casos de Éxito
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-[#D4CEC7] text-sm md:text-base font-normal mt-3">
              Locales gastronómicos y cafeterías que ya conectaron su operación interna con Mogu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="p-8 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
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
                  <span className="text-[10px] text-cyan-300 font-medium">Café y Bistró Santiago</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
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
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
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
                  <span className="text-[10px] text-cyan-300 font-medium">Gastronomía y Eventos</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section id="como-funciona" className="mx-auto max-w-7xl px-6 py-28 relative z-20 border-t border-white/15">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest uppercase bg-white/10 text-cyan-300 px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
              Implementación Rápida
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
              Simple para el equipo, impecable para el cliente
            </h2>
            <p className="text-[#D4CEC7] text-sm md:text-base font-normal mt-3">
              Conecta tu local al sistema operativo de Mogu en pocos minutos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="p-8 rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-cyan-400 font-bold flex items-center justify-center text-sm mb-6 border border-white/20 shadow-inner">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Configura tu Local</h3>
              <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed">
                Registra tu negocio, define tu menú o catálogo interactivo y establece los accesos para caja y garzones.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-cyan-400 font-bold flex items-center justify-center text-sm mb-6 border border-white/20 shadow-inner">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Sincroniza Operación</h3>
              <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed">
                Conecta las comandas del salón directo con la caja y mantén las métricas en tiempo real actualizadas.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-cyan-400 font-bold flex items-center justify-center text-sm mb-6 border border-white/20 shadow-inner">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Fideliza y Escala</h3>
              <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed">
                Integra a tus clientes a Mogu Puntos y formen parte de la comunidad global de Mogu Travel.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-5xl px-6 py-28 relative z-20 border-t border-white/15">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest uppercase bg-white/10 text-cyan-300 px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
              Resolución de Dudas
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
              Preguntas Frecuentes
            </h2>
            <p className="text-[#D4CEC7] text-sm md:text-base font-normal mt-3">
              Todo lo que necesitas saber sobre pedidos con retiro y delivery, operación interna y la comunidad Mogu Travel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30"
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">{faq.question}</h3>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                    {faq.answer}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">
                  FAQ 0{idx + 1} / MOGU
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/15 py-12 px-6 bg-[#0E0C0A]/90 relative z-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center">
                <img
                  src="/logo-mogu.png"
                  alt="Mogu Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-black tracking-widest text-white">
                MOGU<span className="text-cyan-400">.</span> SpA
              </span>
            </div>

            <p className="text-xs text-white/60">
              &copy; {new Date().getFullYear()} Mogu SpA. Todos los derechos reservados.
            </p>

            <div className="flex items-center gap-6 text-xs font-medium text-white/80">
              <Link href="/cafeterias" className="transition hover:text-cyan-300">
                Cafés y Restaurantes
              </Link>
              <Link href="/comida-rapida" className="transition hover:text-cyan-300">
                Comida Rápida
              </Link>
              <Link href="/travel" className="transition hover:text-cyan-300">
                Mogu Travel
              </Link>
              <Link href="/login" className="transition hover:text-cyan-300">
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}