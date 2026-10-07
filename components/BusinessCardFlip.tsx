'use client'

import React, { useState } from 'react'

interface BusinessCardProps {
  businessName: string
  category: string
  phone: string
  slug: string
}

export default function BusinessCardFlip({ businessName, category, phone, slug }: BusinessCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className="w-full flex flex-col items-center py-6">
      {/* Contenedor interactivo 3D */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full max-w-sm aspect-[1.586/1] relative cursor-pointer group select-none"
        style={{ perspective: '1000px' }}
      >
        <div 
          className="w-full h-full relative duration-700 rounded-2xl shadow-2xl transition-transform"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* CARA FRONTAL (NEGOCIO / PYME) */}
          <div 
            className="absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-neutral-700/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Resplandor esmeralda corporativo */}
            <div className="absolute -right-16 -top-16 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-start z-10">
              <span className="font-extrabold text-lg tracking-widest text-white">MOGU<span className="text-emerald-500">.</span></span>
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-5 bg-amber-500/20 border border-amber-500/40 rounded flex items-center justify-center">
                  <div className="w-3.5 h-2.5 border border-amber-500/60 rounded-sm" />
                </div>
                <span className="text-[9px] text-neutral-400 font-mono tracking-wider">NFC</span>
              </div>
            </div>

            <div className="z-10 space-y-1">
              <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {category || 'Comercio / PyME'}
              </span>
              <p className="text-xl font-black tracking-wide text-white">
                {businessName || 'Nombre del Negocio'}
              </p>
              <p className="text-[11px] text-neutral-400 font-light">
                {phone || '+56 9 0000 0000'}
              </p>
            </div>

            <div className="flex justify-between items-end z-10 text-[9px] text-neutral-500 tracking-wider font-mono">
              <span>mogu.cl/{slug}</span>
              <span className="text-emerald-400/90 font-medium animate-pulse">↻ Toca para ver QR</span>
            </div>
          </div>

          {/* CARA TRASERA (ACCESO DIRECTO / QR COMERCIAL) */}
          <div 
            className="absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-black border border-emerald-500/30 shadow-[0_10px_30px_rgba(16,185,129,0.15)]"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="flex justify-between items-center z-10">
              <span className="font-extrabold text-xs tracking-widest text-emerald-400 uppercase">Acceso Comercial</span>
              <span className="text-[9px] text-neutral-500 font-mono">NFC & QR</span>
            </div>

            {/* Simulación visual de Código QR comercial */}
            <div className="flex items-center justify-center my-auto">
              <div className="w-20 h-20 bg-white p-1.5 rounded-xl flex items-center justify-center shadow-inner">
                <div className="w-full h-full border-2 border-black rounded-lg flex items-center justify-center bg-[radial-gradient(#000_30%,transparent_31%)] bg-[size:6px_6px]" />
              </div>
            </div>

            <div className="text-center z-10">
              <p className="text-[10px] text-neutral-300 font-medium">Escanea para ver catálogo y contacto</p>
              <p className="text-[9px] text-neutral-500 mt-0.5">↻ Toca de nuevo para volver al frente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}