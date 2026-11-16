'use client';

import { Phone, Store, Globe, Sparkles, MapPin } from 'lucide-react';

export default function ProfileView({ store }) {
  const config = Array.isArray(store?.store_config) ? store.store_config[0] : store?.store_config;
  const primaryColor = config?.primary_color || '#10B981';
  const buttonColor = config?.button_color || primaryColor;
  const borderRadius = config?.border_radius || 'rounded-2xl';
  const shadowStyle = config?.shadow_style || 'shadow-sm';

  return (
    <div className="pb-6 space-y-4">
      {/* Encabezado editorial de sección */}
      <div>
        <span
          className="text-[10px] font-extrabold uppercase tracking-[0.2em]"
          style={{ color: primaryColor }}
        >
          Información del local
        </span>
        <h2 className="text-xl font-black tracking-tight text-zinc-900">
          Perfil de la Tienda
        </h2>
      </div>

      {/* Tarjeta Principal de Identidad del Comercio */}
      <div
        className={`relative overflow-hidden bg-white/95 backdrop-blur-sm border border-zinc-200/80 p-6 text-center ${borderRadius} ${shadowStyle}`}
      >
        {/* Resplandor ambiental superior dinámico */}
        <div
          className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-36 rounded-full opacity-15 blur-2xl transition-colors duration-500"
          style={{ backgroundColor: primaryColor }}
        />

        {/* Avatar / Logo enmarcado con degradado de marca */}
        <div
          className="relative z-10 w-20 h-20 rounded-[24px] p-[2px] mx-auto shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}90, rgba(255,255,255,0.2))`,
          }}
        >
          <div className="w-full h-full rounded-[22px] overflow-hidden bg-[#0C0A09] flex items-center justify-center">
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

        {/* Nombre del comercio */}
        <h3 className="relative z-10 mt-4 text-lg font-black tracking-tight text-zinc-900 leading-tight">
          {store?.full_name || 'Mogu Store'}
        </h3>

        {/* Badges de modalidad y red */}
        <div className="relative z-10 mt-2.5 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200/70">
            <Store size={12} style={{ color: primaryColor }} />
            <span>Recoger en Local</span>
          </span>

          <span
            className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full border"
            style={{
              backgroundColor: `${primaryColor}12`,
              borderColor: `${primaryColor}25`,
              color: primaryColor,
            }}
          >
            <Sparkles size={11} />
            <span>Mogu Travel</span>
          </span>
        </div>

        {/* Separador sutil */}
        <div className="my-5 h-[1px] w-full bg-zinc-100" />

        {/* Bloque de detalles operativos */}
        <div className="relative z-10 space-y-2.5 text-left">
          {store?.address && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50/80 border border-zinc-100">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                <MapPin size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Ubicación
                </p>
                <p className="text-xs font-bold text-zinc-800 truncate">
                  {store.address}
                </p>
              </div>
            </div>
          )}

          {/* Botón interactivo de teléfono o estado no registrado */}
          {store?.phone ? (
            <a
              href={`tel:${store.phone}`}
              className="w-full py-3 px-4 rounded-xl text-white text-xs font-extrabold tracking-tight flex items-center justify-center gap-2 shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-95"
              style={{
                backgroundColor: buttonColor,
                boxShadow: `0 8px 20px -6px ${buttonColor}85`,
              }}
            >
              <Phone size={15} strokeWidth={2.5} />
              <span>Llamar al local: {store.phone}</span>
            </a>
          ) : (
            <div className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 text-zinc-500 text-xs font-bold flex items-center justify-center gap-2">
              <Phone size={14} className="opacity-60" />
              <span>Teléfono no registrado</span>
            </div>
          )}
        </div>
      </div>

      {/* Pie de respaldo tecnológico */}
      <div className="flex items-center justify-center gap-1.5 pt-1 opacity-60">
        <Globe size={12} style={{ color: primaryColor }} />
        <span className="text-[11px] font-semibold text-zinc-500">
          Comercio afiliado a la red <strong className="text-zinc-700">Mogu</strong>
        </span>
      </div>
    </div>
  );
}