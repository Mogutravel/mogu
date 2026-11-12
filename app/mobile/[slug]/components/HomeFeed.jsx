'use client';

export default function HomeFeed({ store, categories, onAddToCart }) {
  // Normalizamos store_config (puede llegar como objeto o array de 1 elemento según la relación en Supabase)
  const config = Array.isArray(store.store_config) ? store.store_config[0] : store.store_config;

  const allItems = categories.flatMap((cat) => cat.menu_items || []).filter((item) => item.active);

  // 1. Plato del día elegido por el admin en store_config (fallback al primer producto activo)
  const featuredItem = config?.daily_special_item_id
    ? allItems.find((item) => item.id === config.daily_special_item_id)
    : allItems[0] || null;

  // 2. Favoritos elegidos por el admin en store_config (fallback a los siguientes productos)
  const favoriteItems =
    config?.favorite_item_ids && config.favorite_item_ids.length > 0
      ? allItems.filter((item) => config.favorite_item_ids.includes(item.id))
      : allItems.slice(1, 5);

  // 3. Configuración de Secciones (Visibilidad controlada desde el editor)
  const sections = config?.sections_config || {
    welcomeBanner: true,
    promoCarousel: true,
    dailySpecial: true,
    favorites: true,
  };

  // 4. Banners y Textos Comerciales
  const welcomeMessage = config?.welcome_message || '¡Hola, Viajero!';
  const banners = config?.banners_list || [];
  
  // Fallback para banners antiguos si no hay banners en la lista nueva
  const showHero = config ? config.hero_active : true;
  const heroImage = config?.hero_image || store.catalog_hero_image;
  const heroTitle = config?.hero_title || store.catalog_hero_title;
  const heroSubtitle = config?.hero_subtitle || store.catalog_hero_subtitle;

  // 5. Estilos dinámicos extraídos del editor visual
  const primaryColor = config?.primary_color || '#065F46'; // Esmeralda por defecto
  const buttonColor = config?.button_color || '#047857';
  const borderRadius = config?.border_radius || 'rounded-2xl';
  const shadowStyle = config?.shadow_style || 'shadow-md';

  return (
    <div className="space-y-6 pb-6">
      
      {/* 1. WIDGET DE SALUDO Y PUNTOS (MOGU TRAVEL) */}
      {sections.welcomeBanner && (
        <div 
          className={`p-4 text-white ${shadowStyle} flex justify-between items-center transition-all ${borderRadius}`}
          style={{ backgroundColor: primaryColor }}
        >
          <div>
            <span className="text-[10px] tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-md font-bold text-white">
              Comunidad Mogu Travel
            </span>
            <h2 className="font-extrabold text-base mt-1">{welcomeMessage}</h2>
            <p className="text-xs text-white/80">Acumula puntos en {store.full_name}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-xl text-center shadow-inner">
            <span className="block text-xs text-white/80">Saldo</span>
            <span className="font-black text-sm text-white">⭐ 0 Pts</span>
          </div>
        </div>
      )}

      {/* 2. GESTOR DE BANNERS O HERO PROMOCIONAL */}
      {sections.promoCarousel && (
        banners.length > 0 ? (
          <div className="space-y-3">
            {banners.map((banner, index) => (
              <div key={banner.id || index} className={`relative overflow-hidden ${shadowStyle} bg-gray-900 text-white group ${borderRadius}`}>
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
                  <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full w-max mb-1 uppercase tracking-wider">
                    Promoción Exclusiva
                  </span>
                  <h3 className="text-lg font-black tracking-wide leading-tight text-white drop-shadow">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-xs text-gray-200 mt-0.5 line-clamp-2 drop-shadow">
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
              <div className={`relative overflow-hidden ${shadowStyle} bg-gray-900 text-white group ${borderRadius}`}>
                <img 
                  src={heroImage} 
                  alt={heroTitle || "Promoción Especial"} 
                  className="w-full h-52 object-cover brightness-95 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full w-max mb-1 uppercase tracking-wider">
                    Promoción Exclusiva
                  </span>
                  <h3 className="text-lg font-black tracking-wide leading-tight text-white drop-shadow">
                    {heroTitle || "¡Oferta especial de hoy!"}
                  </h3>
                  <p className="text-xs text-gray-100 mt-0.5 line-clamp-2 drop-shadow">
                    {heroSubtitle || "Disfruta de los mejores sabores preparados especialmente para ti."}
                  </p>
                  {featuredItem && (
                    <button 
                      onClick={() => onAddToCart(featuredItem)}
                      className="mt-3 bg-white text-gray-900 hover:bg-gray-100 font-extrabold text-xs py-2 px-4 rounded-xl shadow-md w-max transition-all active:scale-95 flex items-center space-x-1"
                    >
                      <span>Pedir Ahora 🛒</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className={`relative overflow-hidden ${shadowStyle} text-white p-5 ${borderRadius}`} style={{ backgroundColor: primaryColor }}>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full w-max mb-2 inline-block uppercase tracking-wider">
                  Especial del Día
                </span>
                <h3 className="text-xl font-black">{heroTitle || "¡Descubre el sabor de la casa!"}</h3>
                <p className="text-xs text-white/90 mt-1">
                  {heroSubtitle || "Productos frescos y elaborados al instante para acompañar tu día."}
                </p>
              </div>
            )
          )
        )
      )}

      {/* 3. SECCIÓN «PLATO DEL DÍA» */}
      {sections.dailySpecial && featuredItem && (
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-extrabold text-gray-900 text-base tracking-tight flex items-center gap-1.5">
              <span>🔥</span> Plato del Día
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">Imprescindible</span>
          </div>

          <div className={`bg-white overflow-hidden group border border-gray-100 ${borderRadius} ${shadowStyle}`}>
            {featuredItem.image_url && (
              <div className="relative h-44 overflow-hidden bg-gray-100">
                <img 
                  src={featuredItem.image_url} 
                  alt={featuredItem.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div 
                  className="absolute top-3 right-3 text-white font-black text-xs px-3 py-1.5 shadow-lg rounded-xl"
                  style={{ backgroundColor: primaryColor }}
                >
                  ${featuredItem.price}
                </div>
              </div>
            )}
            <div className="p-4">
              <h4 className="font-extrabold text-gray-900 text-base">{featuredItem.name}</h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{featuredItem.description}</p>
              
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                  ✓ Disponible ahora
                </span>
                <button
                  onClick={() => onAddToCart(featuredItem)}
                  className="text-white text-xs font-bold px-4 py-2.5 shadow-md transition-all active:scale-95 flex items-center space-x-1.5 rounded-xl"
                  style={{ backgroundColor: buttonColor }}
                >
                  <span>Agregar al Carrito</span>
                  <span className="text-sm">＋</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. SECCIÓN «LOS FAVORITOS» */}
      {sections.favorites && favoriteItems.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-extrabold text-gray-900 text-base tracking-tight flex items-center gap-1.5">
              <span>⭐</span> Los Más Pedidos
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {favoriteItems.map((item) => (
              <div key={item.id} className={`bg-white border border-gray-100 overflow-hidden flex flex-col justify-between group ${borderRadius} ${shadowStyle}`}>
                <div>
                  {item.image_url ? (
                    <div className="h-32 w-full overflow-hidden bg-gray-50">
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-32 w-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                      Sin foto
                    </div>
                  )}
                  <div className="p-3">
                    <h4 className="font-bold text-gray-800 text-xs line-clamp-1">{item.name}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{item.description}</p>
                  </div>
                </div>
                <div className="p-3 pt-0 flex items-center justify-between mt-2">
                  <span className="font-extrabold text-gray-900 text-xs">${item.price}</span>
                  <button
                    onClick={() => onAddToCart(item)}
                    className="text-white w-7 h-7 rounded-xl flex items-center justify-center font-bold shadow-sm active:scale-95 text-sm"
                    style={{ backgroundColor: buttonColor }}
                  >
                    +
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