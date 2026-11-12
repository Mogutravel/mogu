'use client';

export default function CartView({ cart, updateQuantity, storePhone, goToMenu, storeConfig }) {
  const buttonColor = storeConfig?.button_color || '#047857';
  const primaryColor = storeConfig?.primary_color || '#065F46';
  const borderRadius = storeConfig?.border_radius || 'rounded-2xl';
  const shadowStyle = storeConfig?.shadow_style || 'shadow-sm';

  const totalPrice = cart.reduce((acc, item) => acc + (item.finalPrice || item.price) * item.quantity, 0);

  return (
    <div className="space-y-4 pt-2">
      <h3 className="font-extrabold text-gray-900 text-base">Tu Carrito de Compras</h3>

      {cart.length === 0 ? (
        <div className={`bg-white p-8 text-center space-y-3 border border-gray-100 ${borderRadius} ${shadowStyle}`}>
          <p className="text-xs text-gray-400">Tu carrito está vacío.</p>
          <button
            onClick={goToMenu}
            className="text-xs font-bold text-white px-4 py-2.5 rounded-xl shadow transition"
            style={{ backgroundColor: buttonColor }}
          >
            Ver Menú y Productos
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {cart.map((item, index) => (
            <div key={index} className={`bg-white p-3.5 border border-gray-100 flex justify-between items-center ${borderRadius} ${shadowStyle}`}>
              <div>
                <h4 className="font-bold text-xs text-gray-800">{item.name} {item.selectedSize && `(${item.selectedSize})`}</h4>
                <p className="text-xs font-black mt-0.5" style={{ color: primaryColor }}>${item.finalPrice || item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(index, -1)} className="w-7 h-7 bg-gray-100 rounded-lg font-bold text-gray-600">-</button>
                <span className="text-xs font-bold">{item.quantity}</span>
                <button onClick={() => updateQuantity(index, 1)} className="w-7 h-7 bg-gray-100 rounded-lg font-bold text-gray-600">+</button>
              </div>
            </div>
          ))}

          <div className={`bg-white p-4 border border-gray-100 space-y-3 ${borderRadius} ${shadowStyle}`}>
            <div className="flex justify-between font-extrabold text-sm">
              <span>Total a Pagar:</span>
              <span style={{ color: primaryColor }}>${totalPrice}</span>
            </div>

            <button
              onClick={() => {
                const message = encodeURIComponent(
                  `Hola, quiero hacer el siguiente pedido:\n` +
                  cart.map(i => `- ${i.quantity}x ${i.name} (${i.selectedSize || 'Estándar'}) - $${(i.finalPrice || i.price) * i.quantity}`).join('\n') +
                  `\nTotal: $${totalPrice}`
                );
                window.open(`https://wa.me/${storePhone}?text=${message}`, '_blank');
              }}
              className={`w-full py-3 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95 text-center block`}
              style={{ backgroundColor: buttonColor }}
            >
              Enviar Pedido por WhatsApp 📲
            </button>
          </div>
        </div>
      )}
    </div>
  );
}