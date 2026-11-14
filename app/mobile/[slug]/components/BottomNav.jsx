'use client';

import { Home, Star, ShoppingCart, ReceiptText, User } from 'lucide-react';

export default function BottomNav({ currentTab, setCurrentTab, storeConfig }) {
  // Color principal configurado por el usuario o verde por defecto
  const primaryColor = storeConfig?.primary_color || '#065F46';

  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'puntos', label: 'Puntos', icon: Star },
    { id: 'carrito', label: 'Carrito', icon: ShoppingCart },
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
              className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all duration-200 ${
                isActive ? 'font-bold scale-105' : 'text-gray-400 hover:text-gray-600 font-medium'
              }`}
              style={isActive ? { color: primaryColor } : {}}
            >
              <IconComponent 
                size={22} 
                strokeWidth={isActive ? 2.5 : 1.8} 
                className="transition-transform duration-200" 
              />
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