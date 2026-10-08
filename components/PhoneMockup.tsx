'use client'

import { useState } from 'react'

export default function PhoneMockup() {
  const [activeToast, setActiveToast] = useState<string | null>(null)
  const [activeModal, setActiveModal] = useState<'none' | 'catalog' | 'website'>('none')

  const showNotification = (msg: string) => {
    setActiveToast(msg)
    setTimeout(() => {
      setActiveToast(null)
    }, 2000)
  }

  return (
    <div className="relative mx-auto w-full max-w-[320px] rounded-[45px] border-[8px] border-neutral-800 bg-neutral-950 p-4 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
      {/* Notch / Isla superior simulada */}
      <div className="absolute left-1/2 top-2 h-4 w-28 -translate-x-1/2 rounded-full bg-neutral-900 border border-neutral-800" />

      {/* Pantalla del Perfil Mogu */}
      <div className="mt-6 flex flex-col items-center overflow-hidden rounded-[32px] bg-neutral-950 px-4 py-6 text-white min-h-[480px]">
        
        {/* Avatar / Hongo Mogu */}
        <div className="relative mb-3">
          <div className="relative h-20 w-20 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center">
            <div className="h-full w-full rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden">
              <div className="text-2xl">🍄</div>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-neutral-950 bg-emerald-400 animate-pulse" />
        </div>

        <h3 className="text-lg font-black tracking-tight text-white">Mogu</h3>
        <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase mt-0.5">
          Tarjeta Mogu Active
        </p>
        <p className="mt-1 text-center text-[11px] text-neutral-400 px-2 leading-relaxed">
          Comparte tu identidad digital con un solo Tap
        </p>

        {/* Botón Guardar en Contactos */}
        <button 
          onClick={() => showNotification('✨ Generando tarjeta de contacto vCard...')}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 py-3 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:opacity-95 active:scale-95 cursor-pointer"
        >
          ↓ Guardar en Contactos
        </button>

        {/* Lista de enlaces interactivos */}
        <div className="mt-6 w-full space-y-3">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/mogu_cl"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-full items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-xs font-semibold text-neutral-200 backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:bg-neutral-900 active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300 group-hover:text-emerald-400 transition">
                <span className="text-xs">📸</span>
              </div>
              <span>Instagram</span>
            </div>
            <span className="text-neutral-500 transition group-hover:translate-x-1 group-hover:text-emerald-400">→</span>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/56928689888"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-full items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-xs font-semibold text-neutral-200 backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:bg-neutral-900 active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300 group-hover:text-emerald-400 transition">
                <span className="text-xs">💬</span>
              </div>
              <span>Whatsapp</span>
            </div>
            <span className="text-neutral-500 transition group-hover:translate-x-1 group-hover:text-emerald-400">→</span>
          </a>

          {/* Website (Abre vista interna) */}
          <button
            onClick={() => setActiveModal('website')}
            className="group flex w-full items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-xs font-semibold text-neutral-200 backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:bg-neutral-900 active:scale-98 cursor-pointer w-full"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300 group-hover:text-emerald-400 transition">
                <span className="text-xs">🌐</span>
              </div>
              <span>Web site</span>
            </div>
            <span className="text-neutral-500 transition group-hover:translate-x-1 group-hover:text-emerald-400">→</span>
          </button>

          {/* Catálogo (Abre catálogo interno) */}
          <button
            onClick={() => setActiveModal('catalog')}
            className="group flex w-full items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-xs font-semibold text-neutral-200 backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:bg-neutral-900 active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300 group-hover:text-emerald-400 transition">
                <span className="text-xs">🛍️</span>
              </div>
              <span>Catalogo</span>
            </div>
            <span className="text-neutral-500 transition group-hover:translate-x-1 group-hover:text-emerald-400">→</span>
          </button>
        </div>

        {/* Botón inferior compartir perfil */}
        <button 
          onClick={() => showNotification('🔗 Enlace copiado al portapapeles')}
          className="mt-6 rounded-full border border-neutral-800 bg-neutral-900/40 px-4 py-1.5 text-[10px] font-medium text-neutral-400 transition hover:border-neutral-700 hover:text-neutral-200 cursor-pointer"
        >
          🔗 Compartir este Perfil
        </button>
      </div>

      {/* Modal de Catálogo */}
      {activeModal === 'catalog' && (
        <div className="absolute inset-0 z-30 rounded-[37px] bg-neutral-950/95 p-4 flex flex-col justify-between backdrop-blur-xl overflow-y-auto animate-fade-in">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Catálogo Mogu</span>
              <button 
                onClick={() => setActiveModal('none')}
                className="h-6 w-6 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl border border-emerald-500/50 bg-emerald-950/20 flex flex-col justify-between gap-2.5">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400">Más Popular ⭐</span>
                  <h4 className="text-xs font-bold text-white">Tarjeta Smart Business</h4>
                  <p className="text-base font-black text-emerald-400 mt-1">$22.990 <span className="text-[9px] font-normal text-neutral-400">/ pago único</span></p>
                </div>
                <a
                  href="/producto/bc4dd526-5de4-4ee1-8ef8-3caab7a46608"
                  className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition text-center shadow-md hover:opacity-90 block"
                >
                  Ver Opciones y Planes 🚀
                </a>
              </div>

              <div className="p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex flex-col justify-between gap-2.5">
                <div>
                  <span className="text-[10px] font-semibold text-neutral-400">Plan Profesional</span>
                  <h4 className="text-xs font-bold text-white">Suscripción Anual</h4>
                  <p className="text-base font-black text-emerald-400 mt-1">$24.990 <span className="text-[9px] font-normal text-neutral-400">/ year</span></p>
                </div>
                <a
                  href="/producto/bc4dd526-5de4-4ee1-8ef8-3caab7a46608"
                  className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition text-center border border-neutral-700 shadow-md block"
                >
                  Ver Opciones y Planes 🚀
                </a>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveModal('none')}
            className="w-full py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 text-[10px] font-bold rounded-xl hover:text-white transition mt-4 cursor-pointer"
          >
            ← Volver al Perfil
          </button>
        </div>
      )}

      {/* Modal / Vista Interna de Website (mogu.cl) */}
      {activeModal === 'website' && (
        <div className="absolute inset-0 z-30 rounded-[37px] bg-neutral-950/95 p-4 flex flex-col justify-between backdrop-blur-xl overflow-y-auto animate-fade-in">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <span className="text-[11px] font-mono text-neutral-400 truncate max-w-[180px]">🌐 mogu.cl</span>
              <button 
                onClick={() => setActiveModal('none')}
                className="h-6 w-6 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 font-bold text-lg shadow-lg">
                M
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-black text-white">Bienvenido a MOGU</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed px-2">
                  La plataforma líder de tarjetas NFC y perfiles digitales profesionales en Chile.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-left space-y-2 text-[11px]">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span>✓</span> <span>Tecnología Contactless</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span>✓</span> <span>Actualización en tiempo real</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span>✓</span> <span>Soporte 24/7 en Chile</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <a
              href="https://mogu.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition text-center shadow-md block"
            >
              Visitar Sitio Oficial ↗
            </a>
            <button
              onClick={() => setActiveModal('none')}
              className="w-full py-2 bg-neutral-900 border border-neutral-800 text-neutral-300 text-[10px] font-bold rounded-xl hover:text-white transition cursor-pointer"
            >
              ← Volver al Perfil
            </button>
          </div>
        </div>
      )}

      {/* Toast de Simulación */}
      {activeToast && (
        <div className="absolute inset-x-4 bottom-6 z-40 rounded-2xl border border-emerald-500/40 bg-neutral-900/95 px-4 py-3 text-center text-xs font-bold text-emerald-400 shadow-2xl backdrop-blur-md animate-fade-in">
          {activeToast}
        </div>
      )}
    </div>
  )
}