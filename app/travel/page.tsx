'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { 
  FiCompass, 
  FiGlobe, 
  FiAward, 
  FiMapPin, 
  FiSmartphone, 
  FiGift, 
  FiUsers, 
  FiArrowRight,
  FiZap,
  FiShield
} from 'react-icons/fi'

export default function MoguTravelOnboardingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#0E0C0A] text-[#F2F2EE] font-sans p-4 md:p-8 pb-32 overflow-hidden relative">
      {/* Glow de fondo (Estética Dark Glow / Industrial) */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#FF7A45]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-10 relative z-10">

        {/* HEADER / BADGE SUPERIOR */}
        <div className="flex flex-col items-center text-center space-y-3 pt-6">
          <span className="bg-[#FF7A45]/15 text-[#FF7A45] border border-[#FF7A45]/30 text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-2 uppercase tracking-widest">
            <FiCompass className="animate-spin-slow" /> Mogu Travel Network
          </span>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            La comunidad global para <span className="text-[#FF7A45]">viajeros & gastronomía</span>
          </h1>

          <p className="text-sm text-white/60 max-w-md">
            Conecta con hostels, restobares y cafés aliados en todo el mundo. Colecciona sellos digitales en tu pasaporte y desbloquea recompensas en cada destino.
          </p>
        </div>

        {/* HERO CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => router.push('/travel/passport')}
            className="w-full sm:w-auto px-8 py-4 bg-[#FF7A45] hover:bg-[#FF652D] text-black font-extrabold text-sm rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-[#FF7A45]/20"
          >
            Abrir mi Pasaporte Digital <FiArrowRight />
          </button>

          <button
            onClick={() => router.push('/travel/explore')}
            className="w-full sm:w-auto px-8 py-4 bg-[#141210] border border-[#2E2A27] hover:border-white/30 text-white font-extrabold text-sm rounded-2xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            Explorar Red de Aliados <FiGlobe />
          </button>
        </div>

        {/* TARJETAS DE CARACTERÍSTICAS (COMO FUNCIONA) */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#FF7A45] text-center">
            ¿Cómo funciona la experiencia?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#141210] border border-[#2E2A27] rounded-3xl p-6 space-y-3 shadow-xl relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-[#FF7A45]/10 border border-[#FF7A45]/30 flex items-center justify-center text-xl text-[#FF7A45]">
                <FiSmartphone />
              </div>
              <h3 className="text-base font-extrabold">1. Escanea en Mesa</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Pide tu orden escaneando los tótems QR/NFC físicos en cualquier restaurante o cafetería mōgu.
              </p>
            </div>

            <div className="bg-[#141210] border border-[#2E2A27] rounded-3xl p-6 space-y-3 shadow-xl relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl text-amber-400">
                <FiMapPin />
              </div>
              <h3 className="text-base font-extrabold">2. Sella tu Ciudad</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Cada consumo validado registra un timbre conmemorativo de la ciudad en tu pasaporte digital.
              </p>
            </div>

            <div className="bg-[#141210] border border-[#2E2A27] rounded-3xl p-6 space-y-3 shadow-xl relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl text-emerald-400">
                <FiGift />
              </div>
              <h3 className="text-base font-extrabold">3. Canjea Puntos</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Obtén descuentos en estadías de hostels, platos de cortesía y beneficios exclusivos para viajeros.
              </p>
            </div>
          </div>
        </div>

        {/* COMUNIDAD Y MANIFIESTO NOMADA */}
        <div className="bg-gradient-to-br from-[#1B1917] via-[#141210] to-[#0E0C0A] border border-[#2E2A27] rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF7A45]/20 flex items-center justify-center text-[#FF7A45] text-lg">
              <FiUsers />
            </div>
            <div>
              <h3 className="text-lg font-black">Comunidad Backpackers & Couchsurfing</h3>
              <p className="text-xs text-white/50">Una red pensada por y para trotamundos</p>
            </div>
          </div>

          <p className="text-xs text-white/70 leading-relaxed">
            Mogu Travel conecta el ecosistema de locales gastronómicos con la cultura del viaje colaborativo. Al consumir en la red mōgu, acumulas beneficios reconocidos en albergues, hostels y comunidades de viajeros de múltiples países.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-t border-white/10 pt-4">
            <div>
              <p className="text-lg font-black text-[#FF7A45] font-mono">100%</p>
              <p className="text-[10px] text-white/40 uppercase font-bold">Gratuito</p>
            </div>
            <div>
              <p className="text-lg font-black text-amber-400 font-mono">15+</p>
              <p className="text-[10px] text-white/40 uppercase font-bold">Ciudades</p>
            </div>
            <div>
              <p className="text-lg font-black text-emerald-400 font-mono">50+</p>
              <p className="text-[10px] text-white/40 uppercase font-bold">Aliados</p>
            </div>
            <div>
              <p className="text-lg font-black text-sky-400 font-mono">Global</p>
              <p className="text-[10px] text-white/40 uppercase font-bold">Comunidad</p>
            </div>
          </div>
        </div>

        {/* BANNER INFERIOR DE ACCESO RÁPIDO */}
        <div className="flex items-center justify-between bg-[#141210] border border-[#2E2A27] rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <FiAward className="text-amber-400 text-xl" />
            <div>
              <p className="text-xs font-bold">¿Tienes puntos acumulados?</p>
              <p className="text-[10px] text-white/50">Revisa el catálogo de premios disponibles</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/travel/rewards')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black rounded-xl transition cursor-pointer"
          >
            Ver Recompensas
          </button>
        </div>

      </div>
    </div>
  )
}