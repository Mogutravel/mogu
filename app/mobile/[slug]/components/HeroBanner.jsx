import React, { useState } from 'react';

export default function HeroBanner({ store, onActionClick }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!store?.catalog_hero_image) return null;

  return (
    <div
      onClick={onActionClick}
      role={onActionClick ? 'button' : 'region'}
      tabIndex={onActionClick ? 0 : undefined}
      className="group relative mb-6 w-full h-56 sm:h-64 md:h-72 rounded-[28px] overflow-hidden bg-zinc-950 shadow-[0_20px_50px_-15px_rgba(6,78,59,0.45)] ring-1 ring-white/15 transition-all duration-500 ease-out hover:shadow-[0_25px_60px_-12px_rgba(16,185,129,0.4)] active:scale-[0.985] cursor-pointer select-none"
    >
      {/* 1. Skeleton / Shimmer de carga */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 animate-pulse" />
      )}

      {/* 2. Imagen de fondo con efecto Ken Burns / Zoom cinemático */}
      <img
        src={store.catalog_hero_image}
        alt={store.catalog_hero_title || 'Banner Promocional'}
        onLoad={() => setImageLoaded(true)}
        className={`w-full h-full object-cover object-center transition-all duration-1000 ease-out group-hover:scale-105 ${
          imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
      />

      {/* 3. Iluminación ambiental y viñeta cinemática multicapa */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/60 via-transparent to-emerald-500/10 mix-blend-multiply" />

      {/* 4. Efecto de reflejo de luz (Light Sweep) en hover */}
      <div className="pointer-events-none absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-1000 group-hover:left-[125%] group-hover:opacity-100" />

      {/* 5. Badge superior flotante (Glassmorphism) */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase text-emerald-100 bg-black/40 backdrop-blur-md border border-white/15 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          {store.catalog_hero_badge || 'Destacado'}
        </span>
      </div>

      {/* 6. Contenido principal con jerarquía editorial y CTA */}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex items-end justify-between gap-4">
        <div className="max-w-[82%] space-y-1.5">
          {store.catalog_hero_title && (
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-[1.1] text-white drop-shadow-sm">
              {store.catalog_hero_title}
            </h2>
          )}

          {store.catalog_hero_subtitle && (
            <p className="text-xs sm:text-sm font-medium text-zinc-200/90 line-clamp-2 leading-relaxed">
              {store.catalog_hero_subtitle}
            </p>
          )}
        </div>

        {/* Botón circular táctil con micro-interacción */}
        <div className="shrink-0 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/15 hover:bg-emerald-500 text-white backdrop-blur-md border border-white/25 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:border-emerald-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-0.5"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* 7. Borde interior sutil (Inner Highlight estilo iOS) */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/15" />
    </div>
  );
}