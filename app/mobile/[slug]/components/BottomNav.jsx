'use client';

import { Home, Star, ShoppingCart, ReceiptText, User } from 'lucide-react';

export default function BottomNav({ currentTab, setCurrentTab, storeConfig, cart = [] }) {
  // Color principal configurado por el usuario o verde esmeralda por defecto
  const primaryColor = storeConfig?.primary_color || '#10B981';

  // Calculamos la cantidad total de artículos sumando las cantidades de cada producto
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'puntos', label: 'Puntos', icon: Star },
    { id: 'carrito', label: 'Carrito', icon: ShoppingCart, badge: totalItems },
    { id: 'pedidos', label: 'Pedidos', icon: ReceiptText },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-[#0C0A09]/90 dark:bg-[#0C0A09]/95 backdrop-blur-xl border-t border-white/[0.08] py-2 px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.3)] z-50">
      <div className="flex justify-around items-center w-full max-w-md mx-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`relative flex flex-col items-center justify-center w-16 py-1.5 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'text-white' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {/* Fondo indicador sutil para la pestaña activa (Estilo app nativa) */}
              {isActive && (
                <div 
                  className="absolute inset-0 rounded-xl opacity-15 transition-all duration-300"
                  style={{ backgroundColor: primaryColor }}
                />
              )}

              <div className="relative z-10">
                <IconComponent 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 1.7} 
                  className={`transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : 'group-hover:scale-105'}`}
                  style={isActive ? { color: primaryColor } : {}}
                />

                {/* Burbuja del carrito con la cantidad total */}
                {tab.id === 'carrito' && tab.badge > 0 && (
                  <span 
                    className="absolute -top-2 -right-3.5 text-white text-[10px] font-black px-1.5 min-w-[20px] h-5 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.5)] border-2 border-[#0C0A09] animate-pulse"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span 
                className={`relative z-10 text-[10px] mt-1 tracking-tight transition-all duration-300 ${
                  isActive ? 'font-bold' : 'font-medium opacity-80'
                }`}
                style={isActive ? { color: primaryColor } : {}}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}