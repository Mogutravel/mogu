'use client';

import { Plus, Sparkles, UtensilsCrossed } from 'lucide-react';

export default function MenuCatalog({ categories, activeCategory, onAddToCart, storeConfig }) {
  const currentCategory = categories.find((cat) => cat.id === activeCategory);
  const activeItems = currentCategory?.menu_items?.filter((item) => item.active) || [];

  // Configuración visual dinámica con valores seguros
  const primaryColor = storeConfig?.primary_color || '#10B981';
  const buttonColor = storeConfig?.button_color || primaryColor;
  const borderRadius = storeConfig?.border_radius || 'rounded-2xl';
  const shadowStyle = storeConfig?.shadow_style || 'shadow-sm';

  return (
    <div className="pb-6">
      {/* Banner VIP de Mogu Travel */}
      <div
        className={`relative overflow-hidden border p-4 mb-5 flex justify-between items-center transition-all ${shadowStyle} ${borderRadius}`}
        style={{
          background: `linear-gradient(135deg, ${primaryColor}18 0%, ${primaryColor}08 100%)`,
          borderColor: `${primaryColor}35`,
        }}
      >
        {/* Destello decorativo de fondo */}
        <div
          className="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-xl"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} style={{ color: primaryColor }} />
            <span
              className="text-[10px] font-extrabold uppercase tracking-[0.18em]"
              style={{ color: primaryColor }}
            >
              Comunidad Mogu Travel
            </span>
          </div>
          <p className="font-black text-zinc-900 text-base tracking-tight mt-0.5">
            ¡Hola, Viajero!
          </p>
        </div>

        <div
          className="relative z-10 text-white text-xs px-3.5 py-2 rounded-xl font-black shadow-md flex items-center gap-1.5 tracking-tight"
          style={{
            backgroundColor: primaryColor,
            boxShadow: `0 6px 16px -4px ${primaryColor}80`,
          }}
        >
          <span>⭐</span>
          <span>0 Puntos</span>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="space-y-3.5">
        {activeItems.length === 0 ? (
          <div className={`bg-white/60 border border-dashed border-zinc-200 p-10 flex flex-col items-center justify-center text-center ${borderRadius}`}>
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
              <UtensilsCrossed size={22} />
            </div>
            <p className="font-bold text-zinc-700 text-sm">Categoría sin productos</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-[200px]">
              Pronto agregaremos nuevas opciones deliciosas aquí.
            </p>
          </div>
        ) : (
          activeItems.map((item) => (
            <div
              key={item.id}
              className={`group bg-white p-3.5 border border-zinc-100/90 hover:border-zinc-200 transition-all duration-200 flex justify-between items-stretch gap-3.5 ${shadowStyle} ${borderRadius}`}
            >
              {/* Información del producto (Izquierda) */}
              <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                <div>
                  <h3 className="font-extrabold text-zinc-900 text-[15px] leading-snug tracking-tight group-hover:text-black transition-colors">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Precio formateado con impacto */}
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className="font-black text-[15px] tracking-tight"
                    style={{ color: primaryColor }}
                  >
                    ${Number(item.price).toLocaleString('es-CL')}
                  </span>
                </div>
              </div>

              {/* Imagen + Botón Flotante Integrado (Derecha) */}
              {item.image_url ? (
                <div className="relative w-24 h-24 flex-shrink-0">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className={`w-full h-full object-cover border border-zinc-100 shadow-sm transition-transform duration-300 group-hover:scale-[1.03] ${borderRadius}`}
                  />
                  <button
                    onClick={() => onAddToCart(item)}
                    className="absolute -bottom-1.5 -right-1.5 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer"
                    style={{ backgroundColor: buttonColor }}
                    title="Agregar al carrito"
                    aria-label={`Agregar ${item.name} al carrito`}
                  >
                    <Plus size={18} strokeWidth={3} />
                  </button>
                </div>
              ) : (
                /* Si el producto no tiene foto, el botón se alinea limpio al centro derecho */
                <div className="flex items-center justify-center pl-1">
                  <button
                    onClick={() => onAddToCart(item)}
                    className="text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-105 active:scale-90 cursor-pointer"
                    style={{ backgroundColor: buttonColor }}
                    title="Agregar al carrito"
                    aria-label={`Agregar ${item.name} al carrito`}
                  >
                    <Plus size={20} strokeWidth={3} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}