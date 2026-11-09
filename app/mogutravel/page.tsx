import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mogu Travel | La Red Internacional de Fidelización para Viajeros',
  description: 'Conecta tu local a la red global Mogu Travel. Permite que viajeros y clientes acumulen Mogu Puntos en hostels, restaurantes y cafés por el mundo.',
  keywords: [
    'mogu travel',
    'red de fidelizacion viajeros',
    'mogu puntos hostel restaurante',
    'pasaporte digital viajeros'
  ],
  openGraph: {
    title: 'Mogu Travel | La Red Internacional de Fidelización para Viajeros',
    description: 'Comunidad global de viajeros y pasaporte de fidelización Mogu Puntos.',
    url: 'https://mogu.cl/mogutravel',
  }
}

export default function MoguTravelPage() {
  return (
    <div className="min-h-screen bg-[#0E0C0A] text-[#D4CEC7] relative overflow-hidden font-sans">
      <div className="fixed inset-0 bg-gradient-to-b from-[#4c1d95]/40 via-[#1e40af]/20 to-[#0E0C0A] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <header className="mb-12">
          <Link href="/" className="text-xs font-bold text-cyan-400 uppercase tracking-widest hover:underline">
            ← Volver a Mogu
          </Link>
          <span className="block mt-4 text-xs font-bold uppercase tracking-widest text-cyan-300 bg-white/10 px-3.5 py-1 rounded-full w-fit border border-white/10">
            Global Network
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-4 tracking-tight leading-tight">
            La red internacional de fidelización para viajeros
          </h1>
          <p className="text-lg text-white/80 mt-4 max-w-2xl">
            Una comunidad que trasciende fronteras. Conecta tu negocio gastronómico con nómadas y mochileros que usan el pasaporte <strong>Mogu Travel</strong> para acumular y canjear <strong>Mogu Puntos</strong> en hostales y locales asociados.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-16">
          <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/15 backdrop-blur-xl">
            <span className="text-cyan-400 font-bold text-sm">01 / Comunidad Global</span>
            <h3 className="text-xl font-bold text-white mt-2 mb-2">Red de Viajeros</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Atrae turistas e integrantes de la comunidad Mogu Travel que buscan locales gastronómicos y hostales recomendados.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/15 backdrop-blur-xl">
            <span className="text-cyan-400 font-bold text-sm">02 / Sistema Mogu Puntos</span>
            <h3 className="text-xl font-bold text-white mt-2 mb-2">Puntos Internacionales</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Los usuarios acumulan Mogu Puntos viajando y consumiendo en negocios adheridos, desbloqueando beneficios exclusivos.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/15 backdrop-blur-xl">
            <span className="text-cyan-400 font-bold text-sm">03 / Presencia Internacional</span>
            <h3 className="text-xl font-bold text-white mt-2 mb-2">Ecosistema Mogu SpA</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Posiciona tu marca en una red colaborativa pensada para crecer en hostels y experiencias alrededor del mundo.
            </p>
          </div>
        </section>

        <div className="text-center pt-8">
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-white text-[#0E0C0A] font-extrabold rounded-2xl hover:bg-slate-100 transition shadow-lg text-sm uppercase tracking-wider"
          >
            Sumar mi local a Mogu Travel →
          </Link>
        </div>
      </div>
    </div>
  )
}