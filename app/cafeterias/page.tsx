import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Coffee, QrCode, Smartphone, Stamp, Check } from 'lucide-react'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Software de Gestión y Comanderos para Restaurantes y Cafeterías | Mogu',
  description:
    'Sistema operativo integral para restaurantes y cafeterías de especialidad. Conecta caja, garzones, comandas y acumulación de Mogu Puntos y Mogu Travel en tiempo real.',
  keywords: [
    'software cafeterias chile',
    'software restaurantes',
    'comanderos digitales',
    'fidelizacion mogu puntos',
    'sistema pos cafeterias',
    'mogu travel',
  ],
  openGraph: {
    title: 'Software de Gestión y Comanderos para Restaurantes y Cafeterías | Mogu',
    description: 'Gestión operativa, control de salón y programa de fidelización Mogu Puntos y Mogu Travel para tu local.',
    url: 'https://mogu.cl/cafeterias',
  },
}

export default function CafeteriasPage() {
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
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300 bg-cyan-400/10 px-4 py-1.5 rounded-full border border-cyan-400/20">
              <Coffee className="w-3.5 h-3.5" />
              <span>Cafés & Restaurantes</span>
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-white mt-6 tracking-tight leading-[1.1]">
              Software de gestión y comanderos para salones y cafeterías
            </h1>
            <p className="text-base sm:text-lg text-white/80 mt-6 max-w-3xl leading-relaxed">
              Sincroniza comandas de salón en tiempo real entre garzones y caja, agiliza la atención en barra y potencia la retención de clientes con la fidelización de <strong className="text-white">Mogu Puntos</strong> y la red global de <strong className="text-white">Mogu Travel</strong>.
            </p>
          </header>

          {/* 3 PILARES OPERATIVOS */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <div className="p-8 rounded-3xl bg-white/[0.05] border border-white/15 backdrop-blur-xl flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center mb-4 border border-cyan-400/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">01 / Salón & Comandas</span>
                <h3 className="text-xl font-bold text-white mt-2 mb-3">Garzones y Caja Conectados</h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Toma pedidos en mesa desde smartphones o tablets y envía el ticket automáticamente a la barra de café o cocina sin demoras ni errores de papel.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                Sincronización en Vivo
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.07] border border-cyan-400/40 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col justify-between md:-translate-y-2">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-400 text-[#0E0C0A] flex items-center justify-center mb-4 shadow-md font-bold">
                  <Stamp className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">02 / Fidelización Global</span>
                <h3 className="text-xl font-bold text-white mt-2 mb-3">Mogu Puntos & Mogu Travel</h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  Premia la frecuencia de tus clientes locales con Mogu Puntos e integra tu cafetería a la red internacional de viajeros de Mogu Travel para atraer nuevo público.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                Comunidad Activa
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.05] border border-white/15 backdrop-blur-xl flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center mb-4 border border-cyan-400/30">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">03 / Menú Inteligente</span>
                <h3 className="text-xl font-bold text-white mt-2 mb-3">Carta Digital Interactiva</h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Actualiza especialidades de café de temporada, precios o platos agotados al instante desde tu panel sin necesidad de reimprimir cartas físicas ni tótems.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                Autogestión Instantánea
              </div>
            </div>
          </section>

          {/* BLOQUE DE BENEFICIOS ADICIONALES */}
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white/[0.08] to-cyan-950/20 border border-white/15 backdrop-blur-xl mb-16">
            <h3 className="text-2xl font-extrabold text-white mb-6">
              Diseñado para optimizar cada rincón de tu cafetería
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-white/80">
                  <strong className="text-white">Cierres de caja seguros:</strong> Desglose de ingresos por efectivo, tarjeta POS y transferencias protegido por PIN.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-white/80">
                  <strong className="text-white">Pantalla KDS en cocina:</strong> Comandas organizadas por orden de llegada para reducir tiempos de espera en barra.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-white/80">
                  <strong className="text-white">Identidad visual propia:</strong> Adapta logotipos, colores y enlaces de contacto directo a la estética de tu local.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-white/80">
                  <strong className="text-white">0% comisión por venta:</strong> Quédate con el 100% de tus ingresos sin cobros por porcentaje de pedido.
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
              <Link href="/#ecosistema" className="text-xs text-cyan-300 hover:underline font-medium">
                O revisa los planes Pro y Ecosystem para automatizar todo tu salón →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}