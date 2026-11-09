import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Software de Gestión y Comanderos para Restaurantes y Cafeterías | Mogu',
  description: 'Sistema operativo integral para restaurantes y cafeterías de especialidad. Conecta caja, garzones, comandas y acumulación de Mogu Puntos en tiempo real.',
  keywords: [
    'software cafeterias chile',
    'software restaurantes',
    'comanderos digitales',
    'fidelizacion mogu puntos',
    'sistema pos cafeterias'
  ],
  openGraph: {
    title: 'Software de Gestión y Comanderos para Restaurantes y Cafeterías | Mogu',
    description: 'Gestión operativa, control de salón y programa de fidelización Mogu Puntos para tu local.',
    url: 'https://mogu.cl/cafeterias',
  }
}

export default function CafeteriasPage() {
  return (
    <div className="min-h-screen bg-[#0E0C0A] text-[#D4CEC7] relative overflow-hidden font-sans">
      <div className="fixed inset-0 bg-gradient-to-b from-[#4c1d95]/40 via-[#1e40af]/20 to-[#0E0C0A] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <header className="mb-12">
          <Link href="/" className="text-xs font-bold text-cyan-400 uppercase tracking-widest hover:underline">
            ← Volver a Mogu
          </Link>
          <span className="block mt-4 text-xs font-bold uppercase tracking-widest text-cyan-300 bg-white/10 px-3.5 py-1 rounded-full w-fit border border-white/10">
            Restaurantes & Cafés
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-4 tracking-tight leading-tight">
            Software de gestión y comanderos para restaurantes y cafeterías
          </h1>
          <p className="text-lg text-white/80 mt-4 max-w-2xl">
            Sincroniza comandas de salón en tiempo real entre garzones y caja, mientras recompensas a tus clientes frecuentes con el sistema de <strong>Fidelización Mogu Puntos</strong>.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-16">
          <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/15 backdrop-blur-xl">
            <span className="text-cyan-400 font-bold text-sm">01 / Salón & Comandas</span>
            <h3 className="text-xl font-bold text-white mt-2 mb-2">Garzones y Caja Conectados</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Toma pedidos en mesa desde smartphones y envía el ticket automáticamente a la barra de café o cocina sin demoras.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/15 backdrop-blur-xl">
            <span className="text-cyan-400 font-bold text-sm">02 / Mogu Puntos</span>
            <h3 className="text-xl font-bold text-white mt-2 mb-2">Fidelización Automática</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Cada consumo permite a los clientes acumular Mogu Puntos canjeables por promociones, incentivos y recompensas en tu local.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/15 backdrop-blur-xl">
            <span className="text-cyan-400 font-bold text-sm">03 / Menú Inteligente</span>
            <h3 className="text-xl font-bold text-white mt-2 mb-2">Carta Digital Interactiva</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Actualiza platos, especialidades de café y precios al instante sin reimprimir cartas ni totems.
            </p>
          </div>
        </section>

        <div className="text-center pt-8">
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-white text-[#0E0C0A] font-extrabold rounded-2xl hover:bg-slate-100 transition shadow-lg text-sm uppercase tracking-wider"
          >
            Comenzar con Mogu Restaurantes & Cafés →
          </Link>
        </div>
      </div>
    </div>
  )
}