import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Flame, ShoppingBag, Stamp, Check, Smartphone } from 'lucide-react'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Sistema de Pedidos Retiro y Delivery para Comida Rápida | Mogu',
  description:
    'Plataforma para locales de comida rápida (pizzas, sushi, hamburguesas, completos). Cuenta con su propia app de pedidos para los clientes, sin descargas, con 0% de comisión y Mogu Puntos.',
  keywords: [
    'delivery comida rapida chile',
    'sistema pedidos sushi pizza',
    'software hamburguesas completos',
    'app de pedidos para clientes',
    'mogu pro',
  ],
  openGraph: {
    title: 'Sistema de Pedidos Retiro y Delivery para Comida Rápida | Mogu',
    description: 'Gestión rápida de pedidos con tu propia app para clientes, retiro y delivery sin comisiones abusivas.',
    url: 'https://mogu.cl/comida-rapida',
  },
}

export default function ComidaRapidaPage() {
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
      <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-[#4c1d95]/40 via-[#1e40af]/20 to-[#0E0C0A] pointer-events-none -z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-gradient-to-r from-purple-500/15 via-cyan-400/15 to-blue-600/15 blur-[160px] pointer-events-none -z-0" />

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-6xl mx-auto px-6 pt-36 pb-24">
          <header className="mb-16">
            <Link
              href="/"
              className="text-xs font-bold text-cyan-400 uppercase tracking-widest hover:underline flex items-center gap-1.5 w-fit mb-6"
            >
              ← Volver al inicio de Mogu
            </Link>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-300 bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/20">
              <Flame className="w-3.5 h-3.5" />
              <span>Fast Food & Takeaway</span>
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-white mt-6 tracking-tight leading-[1.1]">
              Sistema de pedidos con retiro o delivery para locales de comida rápida
            </h1>
            <p className="text-base sm:text-lg text-white/80 mt-6 max-w-3xl leading-relaxed">
              Optimizado para sushi, pizzas, hamburguesas, completos y más. <strong className="text-white">Mogu cuenta con su propia app de pedidos para tus clientes</strong>: una plataforma web móvil personalizada que no requiere descargas, con <strong className="text-white">0% de comisión por venta</strong> directo a tu WhatsApp y potenciada por <strong className="text-white">Mogu Puntos</strong> y <strong className="text-white">Mogu Travel</strong>.
            </p>
          </header>

          {/* 3 PILARES OPERATIVOS */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <div className="p-8 rounded-3xl bg-white/[0.05] border border-white/15 backdrop-blur-xl flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center mb-4 border border-amber-400/30">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">01 / App de Pedidos Propia</span>
                <h3 className="text-xl font-bold text-white mt-2 mb-3">Tu Propia App para Clientes</h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Mogu provee su propia app de pedidos web para tus clientes, sin instalaciones complejas. Permíteles ordenar desde su celular con un carrito inteligente para retiro en mostrador o delivery propio.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                0% Comisión por Venta
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.07] border border-amber-400/40 backdrop-blur-xl shadow-[0_0_30px_rgba(245,158,11,0.12)] flex flex-col justify-between md:-translate-y-2">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#0E0C0A] flex items-center justify-center mb-4 shadow-md font-bold">
                  <Stamp className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">02 / Fidelización Pro</span>
                <h3 className="text-xl font-bold text-white mt-2 mb-3">Mogu Puntos & Mogu Travel</h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  Tus clientes suman Mogu Puntos en cada compra de comida rápida dentro de su propia app, asegurando recompra, mientras tu local se conecta a la comunidad viajera de Mogu Travel.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                Retención de Clientes
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.05] border border-white/15 backdrop-blur-xl flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center mb-4 border border-amber-400/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">03 / Alta Capacidad</span>
                <h3 className="text-xl font-bold text-white mt-2 mb-3">Hasta 150 Productos en Catálogo</h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Organiza tu carta con modificadores, ingredientes adicionales y tamaños de porción para que el cliente arme su pedido exacto en segundos desde la app.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                Gestión de Menú Ágil
              </div>
            </div>
          </section>

          {/* BLOQUE DE BENEFICIOS CLAVE */}
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white/[0.08] to-amber-950/20 border border-white/15 backdrop-blur-xl mb-16">
            <h3 className="text-2xl font-extrabold text-white mb-6">
              Diseñado para la velocidad y el alto volumen de despacho
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-white/80">
                  <strong className="text-white">100% de tu margen:</strong> Al usar tu propia app de pedidos Mogu, cada peso de tu venta online va directo a tu caja sin intermediarios.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-white/80">
                  <strong className="text-white">Autogestión de stock:</strong> Oculta platos o ingredientes agotados al instante desde cualquier celular.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-white/80">
                  <strong className="text-white">Identidad propia en la app:</strong> Tu local con su propio enlace web, colores y logotipo corporativo visible para el cliente.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-white/80">
                  <strong className="text-white">Ecosistema escalable:</strong> Da el salto al plan Ecosystem cuando necesites pantalla KDS en cocina y control de salón.
                </p>
              </div>
            </div>
          </div>

          {/* CALL TO ACTION FINAL */}
          <div className="text-center pt-4 space-y-6">
            <Link
              href="/checkout/mogu-start"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0E0C0A] font-extrabold rounded-2xl hover:bg-slate-100 transition shadow-2xl text-xs uppercase tracking-wider"
            >
              <span>Comienza gratis con Mogu Start</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="block">
              <Link href="/#ecosistema" className="text-xs text-amber-300 hover:underline font-medium">
                O revisa los planes Mogu Pro y Ecosystem para potenciar tu delivery →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}