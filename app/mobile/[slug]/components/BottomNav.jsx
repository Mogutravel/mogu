'use client';

import { Home, Star, ShoppingCart, ReceiptText, User } from 'lucide-react';

export default function BottomNav({ currentTab, setCurrentTab, storeConfig, cart = [] }) {
  // Color principal configurado por el usuario o verde por defecto
  const primaryColor = storeConfig?.primary_color || '#065F46';

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
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200/80 py-2.5 shadow-lg z-50">
      <div className="flex justify-around items-center w-full max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`relative flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all duration-200 ${
                isActive ? 'font-bold scale-105' : 'text-gray-400 hover:text-gray-600 font-medium'
              }`}
              style={isActive ? { color: primaryColor } : {}}
            >
              <div className="relative">
                <IconComponent 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 1.8} 
                  className="transition-transform duration-200" 
                />
                {/* Burbuja del carrito con la cantidad total */}
                {tab.id === 'carrito' && tab.badge > 0 && (
                  <span 
                    className="absolute -top-2 -right-3 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}