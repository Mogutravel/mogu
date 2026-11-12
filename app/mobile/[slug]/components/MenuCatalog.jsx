'export client';

export default function MenuCatalog({ categories, activeCategory, onAddToCart, storeConfig }) {
  const currentCategory = categories.find((cat) => cat.id === activeCategory);
  const activeItems = currentCategory?.menu_items?.filter((item) => item.active) || [];

  // Extraer configuración visual del editor (con valores por defecto seguros)
  const primaryColor = storeConfig?.primary_color || '#065F46';
  const buttonColor = storeConfig?.button_color || '#047857';
  const borderRadius = storeConfig?.border_radius || 'rounded-2xl';
  const shadowStyle = storeConfig?.shadow_style || 'shadow-sm';

  return (
    <div>
      {/* Widget de saludo y puntos de Mogu Travel con colores dinámicos */}
      <div 
        className={`border p-3.5 mb-4 flex justify-between items-center ${shadowStyle} ${borderRadius}`}
        style={{ 
          backgroundColor: `${primaryColor}10`, // 10% de opacidad para el fondo suave
          borderColor: `${primaryColor}30`,
          color: primaryColor
        }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Comunidad Mogu Travel</p>
          <p className="font-bold text-sm">¡Hola, Viajero!</p>
        </div>
        <div 
          className="text-white text-xs px-3 py-1.5 rounded-xl font-extrabold shadow-sm"
          style={{ backgroundColor: primaryColor }}
        >
          ⭐ 0 Puntos
        </div>
      </div>

      {/* Lista de productos */}
      <div className="space-y-3">
        {activeItems.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            No hay productos disponibles en esta categoría.
          </div>
        ) : (
          activeItems.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white p-3.5 border border-gray-100 flex justify-between items-center ${shadowStyle} ${borderRadius}`}
            >
              <div className="flex-1 pr-3">
                <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.description}</p>
                <p 
                  className="font-extrabold text-sm mt-1.5"
                  style={{ color: primaryColor }}
                >
                  ${item.price}
                </p>
              </div>
              {item.image_url && (
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  className={`w-20 h-20 object-cover shadow-sm border border-gray-100 ${borderRadius}`} 
                />
              )}
              <button
                onClick={() => onAddToCart(item)}
                className="ml-3 text-white w-9 h-9 rounded-full flex items-center justify-center font-black shadow-md transition-transform active:scale-95 flex-shrink-0 cursor-pointer"
                style={{ backgroundColor: buttonColor }}
                title="Agregar al carrito"
              >
                +
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}