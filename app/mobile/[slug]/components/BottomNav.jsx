export default function BottomNav({ currentTab, setCurrentTab }) {
  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: '🍕' },
    { id: 'puntos', label: 'Puntos', icon: '⭐' },
    { id: 'carrito', label: 'Carrito', icon: '🛒' },
    { id: 'pedidos', label: 'Pedidos', icon: '📄' },
    { id: 'perfil', label: 'Perfil', icon: '👤' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 flex justify-around py-2.5 shadow-lg z-50 text-[11px]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setCurrentTab(tab.id)}
          className={`flex flex-col items-center transition-colors ${
            currentTab === tab.id ? 'text-green-800 font-bold scale-105' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <span className="text-lg">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}