import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sistema de Pedidos Retiro y Delivery para Comida Rápida | Mogu',
  description: 'Plataforma para locales de comida rápida (pizzas, sushi, hamburguesas, completos). Pedidos directos para retiro o delivery con acumulación de Mogu Puntos.',
  keywords: [
    'delivery comida rapida chile',
    'sistema pedidos sushi pizza',
    'software hamburguesas completos',
    'mogu puntos delivery'
  ],
  openGraph: {
    title: 'Sistema de Pedidos Retiro y Delivery para Comida Rápida | Mogu',
    description: 'Gestión rápida de pedidos para retiro y delivery sin comisiones abusivas.',
    url: 'https://mogu.cl/comida-rapida',
  }
}

export default function ComidaRapidaPage() {
  return (
    <div className="min-h-screen bg-[#0E0C0A] text-[#D4CEC7] relative overflow-hidden font-sans">
      <div className="fixed inset-0 bg-gradient-to-b from-[#4c1d95]/40 via-[#1e40af]/20 to-[#0E0C0A] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <header className="mb-12">
          <Link href="/" className="text-xs font-bold text-cyan-400 uppercase tracking-widest hover:underline">
            ← Volver a Mogu
          </Link>
          <span className="block mt-4 text-xs font-bold uppercase tracking-widest text-cyan-300 bg-white/10 px-3.5 py-1 rounded-full w-fit border border-white/10">
            Fast Food & Takeaway
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mt-4 tracking-tight leading-tight">
            Sistema de pedidos con retiro o delivery para locales de comida rápida
          </h1>
          <p className="text-lg text-white/80 mt-4 max-w-2xl">
            Optimizado para sushi, pizzas, hamburguesas, completos y más. Recibe compras directas para retiro o despacho y premia cada pedido con <strong>Fidelización Mogu Puntos</strong>.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-16">
          <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/15 backdrop-blur-xl">
            <span className="text-cyan-400 font-bold text-sm">01 / Retiro & Delivery</span>
            <h3 className="text-xl font-bold text-white mt-2 mb-2">Ventas Directas</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Permite a tus clientes ordenar desde su celular para pasar a retirar por caja o programar despachos a domicilio.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/15 backdrop-blur-xl">
            <span className="text-cyan-400 font-bold text-sm">02 / Mogu Puntos</span>
            <h3 className="text-xl font-bold text-white mt-2 mb-2">Premios por Cada Pedido</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Tus clientes suman Mogu Puntos en cada compra de comida rápida, asegurando que vuelvan a pedir directamente en tu local.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.05] border border-white/15 backdrop-blur-xl">
            <span className="text-cyan-400 font-bold text-sm">03 / Velocidad de Caja</span>
            <h3 className="text-xl font-bold text-white mt-2 mb-2">Despacho Ultrarrápido</h3>
            <p className="text-xs text-white/70 leading-relaxed">
              Interfaz ágil diseñada para alto volumen de ventas en barra y cocina rápida.
            </p>
          </div>
        </section>

        <div className="text-center pt-8">
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-white text-[#0E0C0A] font-extrabold rounded-2xl hover:bg-slate-100 transition shadow-lg text-sm uppercase tracking-wider"
          >
            Activar Mogu Comida Rápida →
          </Link>
        </div>
      </div>
    </div>
  )
}