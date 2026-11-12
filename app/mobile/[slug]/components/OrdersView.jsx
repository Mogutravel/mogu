'use client';

export default function OrdersView() {
  return (
    <div>
      <h2 className="text-lg font-bold text-black mb-3">Mis Pedidos</h2>
      <div className="bg-white p-6 rounded-2xl border shadow-sm text-center">
        <p className="text-sm font-bold text-gray-900">No tienes pedidos actuales</p>
        <p className="text-xs text-gray-400 mt-1">¡Ups! Ahora mismo no tienes ningún pedido en el horno, pero estamos deseando preparártelo.</p>
      </div>
    </div>
  );
}