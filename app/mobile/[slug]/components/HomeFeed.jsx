'use client';

import { Plus, Flame, Star, CheckCircle2 } from 'lucide-react';

export default function HomeFeed({ store, categories, onAddToCart }) {
  // Normalizamos store_config
  const config = Array.isArray(store?.store_config) ? store.store_config[0] : store?.store_config;

  const allItems = categories.flatMap((cat) => cat.menu_items || []).filter((item) => item.active);

  // 1. Plato del día
  const featuredItem = config?.daily_special_item_id
    ? allItems.find((item) => item.id === config.daily_special_item_id)
    : allItems[0] || null;

  // 2. Favoritos / Más pedidos
  const favoriteItems =
    config?.favorite_item_ids && config.favorite_item_ids.length > 0
      ? allItems.filter((item) => config.favorite_item_ids.includes(item.id))
      : allItems.slice(1, 5);

  // 3. Configuración de Secciones
  const sections = config?.sections_config || {
    promoCarousel: true,
    dailySpecial: true,
    favorites: true,
  };

  // 4. Banners y Textos Comerciales
  const banners = config?.banners_list || [];
  
  const showHero = config ? config.hero_active : true;
  const heroImage = config?.hero_image || store.catalog_hero_image;
  const heroTitle = config?.hero_title || store.catalog_hero_title;
  const heroSubtitle = config?.hero_subtitle || store.catalog_hero_subtitle;

  // 5. Estilos dinámicos del editor visual
  const primaryColor = config?.primary_color || '#10B981';
  const buttonColor = config?.button_color || primaryColor;
  const borderRadius = config?.border_radius || 'rounded-2xl';
  const shadowStyle = config?.shadow_style || 'shadow-sm';

  return (
    <div className="space-y-6 pb-8">
      
      {/* 1. GESTOR DE BANNERS O HERO PROMOCIONAL */}
      {sections.promoCarousel && (
        banners.length > 0 ? (
          <div className="space-y-3.5">
            {banners.map((banner, index) => (
              <div key={banner.id || index} className={`relative overflow-hidden ${shadowStyle} bg-zinc-900 text-white group ${borderRadius}`}>
                {banner.image ? (
                  <img 
                    src={banner.image} 
                    alt={banner.title || "Promoción Especial"} 
                    className="w-full h-52 object-cover brightness-95 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div 
                    className="w-full h-40 flex items-center justify-center p-4 text-center font-bold text-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {banner.title}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4">
                  <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full w-max mb-1.5 uppercase tracking-wider">
                    Promoción Exclusiva
                  </span>
                  <h3 className="text-lg font-black tracking-tight leading-tight text-white drop-shadow">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-xs text-zinc-200 mt-1 line-clamp-2 leading-relaxed">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          showHero && (
            heroImage ? (
              <div className={`relative overflow-hidden ${shadowStyle} bg-zinc-900 text-white group ${borderRadius}`}>
                <img 
                  src={heroImage} 
                  alt={heroTitle || "Promoción Especial"} 
                  className="w-full h-52 object-cover brightness-95 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4">
                  <span 
                    className="text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full w-max mb-1.5 uppercase tracking-wider shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Promoción Exclusiva
                  </span>
                  <h3 className="text-lg font-black tracking-tight leading-tight text-white drop-shadow">
                    {heroTitle || "¡Oferta especial de hoy!"}
                  </h3>
                  <p className="text-xs text-zinc-100 mt-1 line-clamp-2 leading-relaxed">
                    {heroSubtitle || "Disfruta de los mejores sabores preparados especialmente para ti."}
                  </p>
                  {featuredItem && (
                    <button 
                      onClick={() => onAddToCart(featuredItem)}
                      className="mt-3.5 bg-white text-zinc-900 hover:bg-zinc-100 font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-lg w-max transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Pedir Ahora</span>
                      <span>🛒</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className={`relative overflow-hidden ${shadowStyle} text-white p-5 ${borderRadius}`} style={{ backgroundColor: primaryColor }}>
                <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full w-max mb-2 inline-block uppercase tracking-wider">
                  Especial del Día
                </span>
                <h3 className="text-xl font-black tracking-tight">{heroTitle || "¡Descubre el sabor de la casa!"}</h3>
                <p className="text-xs text-white/90 mt-1">
                  {heroSubtitle || "Productos frescos y elaborados al instante para acompañar tu día."}
                </p>
              </div>
            )
          )
        )
      )}

      {/* 2. SECCIÓN «PLATO DEL DÍA» */}
      {sections.dailySpecial && featuredItem && (
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-zinc-900 text-base tracking-tight flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm shadow-sm">
                <Flame size={16} />
              </span>
              Plato del Día
            </h3>
            <span 
              className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg border shadow-sm"
              style={{
                backgroundColor: `${primaryColor}12`,
                borderColor: `${primaryColor}25`,
                color: primaryColor,
              }}
            >
              Imprescindible
            </span>
          </div>

          <div className={`group bg-white overflow-hidden border border-zinc-200/80 transition-all ${borderRadius} ${shadowStyle}`}>
            {featuredItem.image_url && (
              <div className="relative h-44 overflow-hidden bg-zinc-100">
                <img 
                  src={featuredItem.image_url} 
                  alt={featuredItem.name} 
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                <div 
                  className="absolute top-3 right-3 text-white font-black text-xs px-3 py-1.5 shadow-lg rounded-xl border border-white/20"
                  style={{ backgroundColor: primaryColor }}
                >
                  ${Number(featuredItem.price).toLocaleString('es-CL')}
                </div>
              </div>
            )}
            <div className="p-4">
              <h4 className="font-extrabold text-zinc-900 text-base tracking-tight">{featuredItem.name}</h4>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{featuredItem.description}</p>
              
              <div className="mt-4 flex items-center justify-between">
                <span 
                  className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md"
                  style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                >
                  <CheckCircle2 size={13} />
                  <span>Disponible ahora</span>
                </span>
                <button
                  onClick={() => onAddToCart(featuredItem)}
                  className="text-white text-xs font-extrabold px-4 py-2.5 shadow-md transition-all active:scale-95 flex items-center gap-1.5 rounded-xl cursor-pointer"
                  style={{ 
                    backgroundColor: buttonColor,
                    boxShadow: `0 6px 16px -4px ${buttonColor}80`
                  }}
                >
                  <span>Agregar al Carrito</span>
                  <Plus size={16} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. SECCIÓN «LOS FAVORITOS / MÁS PEDIDOS» */}
      {sections.favorites && favoriteItems.length > 0 && (
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-zinc-900 text-base tracking-tight flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-sm shadow-sm">
                <Star size={16} />
              </span>
              Los Más Pedidos
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {favoriteItems.map((item) => (
              <div 
                key={item.id} 
                className={`group bg-white border border-zinc-200/80 overflow-hidden flex flex-col justify-between transition-all hover:border-zinc-300 ${borderRadius} ${shadowStyle}`}
              >
                <div>
                  {item.image_url ? (
                    <div className="relative h-32 w-full overflow-hidden bg-zinc-50">
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-32 w-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs font-medium">
                      Sin foto
                    </div>
                  )}
                  <div className="p-3 pb-2">
                    <h4 className="font-extrabold text-zinc-900 text-xs line-clamp-1 tracking-tight">{item.name}</h4>
                    <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5 leading-tight">{item.description}</p>
                  </div>
                </div>

                <div className="p-3 pt-0 flex items-center justify-between mt-2">
                  <span 
                    className="font-black text-xs tracking-tight"
                    style={{ color: primaryColor }}
                  >
                    ${Number(item.price).toLocaleString('es-CL')}
                  </span>
                  <button
                    onClick={() => onAddToCart(item)}
                    className="text-white w-8 h-8 rounded-xl flex items-center justify-center font-black shadow-md transition-transform active:scale-90 cursor-pointer"
                    style={{ backgroundColor: buttonColor }}
                    title="Agregar al carrito"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}