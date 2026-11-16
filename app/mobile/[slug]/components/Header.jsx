'use client';

export default function Header({ store }) {
  const config = Array.isArray(store?.store_config) ? store.store_config[0] : store?.store_config;
  const primaryColor = config?.primary_color || '#10B981';

  return (
    <header className="relative w-full pt-8 pb-6 px-4 flex flex-col items-center justify-center overflow-hidden">
      {/* Resplandor ambiental superior dinámico basado en el color del comercio */}
      <div
        className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-[140%] h-52 rounded-full opacity-20 blur-3xl transition-colors duration-500"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Línea de acento lumínico superior */}
      <div
        className="absolute top-0 inset-x-0 h-[2px] opacity-70"
        style={{
          background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
        }}
      />

      {/* Contenedor Hero Centralizado */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-[320px]">
        
        {/* Logo protagonista con marco de diseño refinado */}
        <div
          className="relative w-20 h-20 rounded-[24px] p-[2px] transition-transform duration-300 hover:scale-[1.03] shadow-[0_16px_36px_rgba(0,0,0,0.18)]"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}88, rgba(255,255,255,0.15))`,
          }}
        >
          <div className="w-full h-full rounded-[22px] overflow-hidden bg-[#0C0A09] flex items-center justify-center shadow-inner">
            {store?.avatar_url ? (
              <img
                src={store.avatar_url}
                alt={store?.full_name || 'Logo'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">🏪</span>
            )}
          </div>
        </div>

        {/* Sello de marca editorial */}
        <span className="mt-3.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
          Experiencia Gastronómica
        </span>

        {/* Nombre de la tienda */}
        <h1 className="mt-1 text-xl font-black tracking-tight text-zinc-900 leading-tight line-clamp-2 drop-shadow-sm">
          {store?.full_name || 'Mogu Store'}
        </h1>

        {/* Línea divisoria con degradado de marca */}
        <div 
          className="mt-3 h-[3px] w-10 rounded-full opacity-90 transition-all duration-300"
          style={{ 
            background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)` 
          }}
        />
      </div>
    </header>
  );
}