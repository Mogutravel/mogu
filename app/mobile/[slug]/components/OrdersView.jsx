'use client';

import { ReceiptText, Utensils, ArrowRight } from 'lucide-react';

export default function OrdersView({ storeConfig, onExploreMenu }) {
  const primaryColor = storeConfig?.primary_color || '#10B981';
  const buttonColor = storeConfig?.button_color || primaryColor;
  const borderRadius = storeConfig?.border_radius || 'rounded-2xl';
  const shadowStyle = storeConfig?.shadow_style || 'shadow-sm';

  return (
    <div className="pb-6">
      {/* Encabezado de sección con jerarquía editorial adaptada al color del negocio */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span
            className="text-[10px] font-extrabold uppercase tracking-[0.2em]"
            style={{ color: primaryColor }}
          >
            Seguimiento en vivo
          </span>
          <h2 className="text-xl font-black tracking-tight text-zinc-900">
            Mis Pedidos
          </h2>
        </div>
      </div>

      {/* Tarjeta de estado vacío (Empty State) nivel App Nativa */}
      <div
        className={`relative overflow-hidden bg-white/95 backdrop-blur-sm border border-zinc-200/80 p-8 flex flex-col items-center justify-center text-center ${shadowStyle} ${borderRadius}`}
      >
        {/* Resplandor ambiental dinámico basado en el color de la tienda */}
        <div
          className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-36 h-36 rounded-full opacity-15 blur-2xl transition-colors duration-500"
          style={{ backgroundColor: primaryColor }}
        />

        {/* Ícono protagonista enmarcado con el color dinámico */}
        <div
          className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border shadow-inner transition-colors duration-500"
          style={{
            backgroundColor: `${primaryColor}12`,
            borderColor: `${primaryColor}25`,
            color: primaryColor,
          }}
        >
          <ReceiptText size={28} strokeWidth={2} />
        </div>

        <h3 className="relative z-10 text-base font-black tracking-tight text-zinc-900">
          No tienes pedidos activos
        </h3>

        <p className="relative z-10 text-xs text-zinc-500 mt-1.5 max-w-[240px] leading-relaxed">
          Ahora mismo no tienes ninguna orden en preparación, pero la cocina está lista para ti.
        </p>

        {/* Botón de llamada a la acción adaptado al botón del comercio */}
        {onExploreMenu && (
          <button
            onClick={onExploreMenu}
            className="relative z-10 mt-5 px-5 py-2.5 rounded-xl text-white text-xs font-extrabold tracking-tight flex items-center gap-2 shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
            style={{
              backgroundColor: buttonColor,
              boxShadow: `0 8px 20px -6px ${buttonColor}90`,
            }}
          >
            <Utensils size={14} />
            <span>Ver el menú</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}