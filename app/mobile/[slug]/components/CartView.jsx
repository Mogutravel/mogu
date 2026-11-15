'use client';
import { useState } from 'react';
import { Store, Truck, ArrowLeft, Navigation } from 'lucide-react';

export default function CartView({ cart, updateQuantity, storePhone, goToMenu, storeConfig }) {
  const buttonColor = storeConfig?.button_color || '#047857';
  const primaryColor = storeConfig?.primary_color || '#065F46';
  const borderRadius = storeConfig?.border_radius || 'rounded-2xl';
  const shadowStyle = storeConfig?.shadow_style || 'shadow-sm';

  const totalPrice = cart.reduce((acc, item) => acc + (item.finalPrice || item.price) * item.quantity, 0);

  // Pasos del flujo: 'cart' | 'delivery_type' | 'location' | 'checkout'
  const [step, setStep] = useState('cart');
  const [deliveryType, setDeliveryType] = useState('delivery'); // 'delivery' o 'retiro'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    address: '',
    addressNumber: '',
    paymentMethod: 'Efectivo' // 'Efectivo' o 'Transferencia'
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          alert(`GPS obtenido con éxito: Lat ${position.coords.latitude.toFixed(4)}, Lon ${position.coords.longitude.toFixed(4)}`);
          setFormData(prev => ({ ...prev, address: 'Ubicación GPS Actual' }));
        },
        () => {
          alert('No se pudo obtener la ubicación. Por favor ingrésala de forma manual.');
        }
      );
    } else {
      alert('La geolocalización no está soportada en este navegador.');
    }
  };

  const handleSendWhatsApp = (e) => {
    e.preventDefault();
    const itemsText = cart.map(i => `- ${i.quantity}x ${i.name} (${i.selectedSize || 'Estándar'}) - $${(i.finalPrice || i.price) * i.quantity}`).join('\n');
    
    const deliveryText = deliveryType === 'delivery' 
      ? `📦 Tipo de Entrega: Delivery\n📍 Dirección: ${formData.address} ${formData.addressNumber}\n`
      : `🛍️ Tipo de Entrega: Retiro en Local\n`;

    const message = encodeURIComponent(
      `Hola, quiero realizar el siguiente pedido:\n\n` +
      itemsText +
      `\n\n` + deliveryText +
      `💵 Método de Pago: ${formData.paymentMethod}\n` +
      `👤 Nombre: ${formData.name}\n` +
      `📞 Teléfono: ${formData.phone}\n` +
      (formData.email ? `✉️ Email: ${formData.email}\n` : '') +
      (formData.notes ? `📝 Observaciones: ${formData.notes}\n` : '') +
      `\n💰 Total a Pagar: $${totalPrice}`
    );

    window.open(`https://wa.me/${storePhone}?text=${message}`, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="space-y-4 pt-2">
        <h3 className="font-extrabold text-gray-900 text-base">Tu Carrito de Compras</h3>
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
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2 pb-20">
      {/* PASO 1: VISTA DEL CARRITO */}
      {step === 'cart' && (
        <>
          <h3 className="font-extrabold text-gray-900 text-base">Tu Carrito de Compras</h3>
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
                onClick={() => setStep('delivery_type')}
                className="w-full py-3 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95 text-center block"
                style={{ backgroundColor: buttonColor }}
              >
                Continuar con el Pedido 🚀
              </button>
            </div>
          </div>
        </>
      )}

      {/* PASO 2: TIPO DE ENTREGA (Colores dinámicos del local) */}
      {step === 'delivery_type' && (
        <div className={`bg-white p-5 border border-gray-100 space-y-4 ${borderRadius} ${shadowStyle}`}>
          <div className="flex items-center justify-between">
            <button onClick={() => setStep('cart')} className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-xs font-bold">
              <ArrowLeft size={16} /> Atrás
            </button>
            <h3 className="font-extrabold text-gray-900 text-sm">Tipo de Entrega</h3>
            <div className="w-10"></div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeliveryType('delivery')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition`}
              style={{
                borderColor: deliveryType === 'delivery' ? buttonColor : '#E5E7EB',
                backgroundColor: deliveryType === 'delivery' ? `${buttonColor}15` : 'transparent'
              }}
            >
              <Truck size={28} style={{ color: deliveryType === 'delivery' ? buttonColor : '#4B5563' }} />
              <span className="text-xs font-bold" style={{ color: deliveryType === 'delivery' ? primaryColor : '#4B5563' }}>Delivery</span>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryType('retiro')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition`}
              style={{
                borderColor: deliveryType === 'retiro' ? buttonColor : '#E5E7EB',
                backgroundColor: deliveryType === 'retiro' ? `${buttonColor}15` : 'transparent'
              }}
            >
              <Store size={28} style={{ color: deliveryType === 'retiro' ? buttonColor : '#4B5563' }} />
              <span className="text-xs font-bold" style={{ color: deliveryType === 'retiro' ? primaryColor : '#4B5563' }}>Retiro</span>
            </button>
          </div>

          <button
            onClick={() => setStep(deliveryType === 'delivery' ? 'location' : 'checkout')}
            className="w-full py-3 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95 text-center mt-4"
            style={{ backgroundColor: buttonColor }}
          >
            Continuar →
          </button>
        </div>
      )}

      {/* PASO 3: UBICACIÓN CON MAPA Y GPS FUNCIONAL */}
      {step === 'location' && (
        <div className={`bg-white p-5 border border-gray-100 space-y-4 ${borderRadius} ${shadowStyle}`}>
          <div className="flex items-center justify-between">
            <button onClick={() => setStep('delivery_type')} className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-xs font-bold">
              <ArrowLeft size={16} /> Atrás
            </button>
            <h3 className="font-extrabold text-gray-900 text-sm">Tu Ubicación</h3>
            <div className="w-10"></div>
          </div>

          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleGetLocation}
              className="w-full py-3 border-2 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              style={{ 
                borderColor: buttonColor, 
                backgroundColor: `${buttonColor}10`,
                color: primaryColor 
              }}
            >
              <Navigation size={16} style={{ color: buttonColor }} /> Usar mi ubicación GPS exacta (Recomendado)
            </button>

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">Dirección (Calle y Número)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="address"
                  placeholder="Ej: Av. Providencia 1234, Comuna"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>
            </div>

            <div>
              <input
                type="text"
                name="addressNumber"
                placeholder="Nº Casa / Depto / Referencia (Ej: Casa esquina reja negra)"
                value={formData.addressNumber}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Contenedor del Mapa interactivo */}
            <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100">
              <iframe 
                title="Mapa de Ubicación"
                className="w-full h-full border-0 pointer-events-auto"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-71.24,-34.99,-71.22,-34.97&layer=mapnik"
              />
              <div className="absolute top-3 left-3 flex flex-col bg-white rounded-lg shadow-md border border-gray-300 z-10 overflow-hidden">
                <button type="button" className="w-8 h-8 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100 border-b border-gray-200">+</button>
                <button type="button" className="w-8 h-8 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100">-</button>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 text-center">
              📍 Usa el GPS, selecciona una sugerencia o toca tu casa en el mapa para validar la zona.
            </p>
          </div>

          <button
            onClick={() => setStep('checkout')}
            disabled={!formData.address}
            className={`w-full py-3 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95 text-center mt-2 ${!formData.address ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ backgroundColor: buttonColor }}
          >
            Continuar →
          </button>
        </div>
      )}

      {/* PASO 4: DATOS DE CONTACTO Y PAGO (Solo Efectivo y Transferencia) */}
      {step === 'checkout' && (
        <form onSubmit={handleSendWhatsApp} className={`bg-white p-5 border border-gray-100 space-y-4 ${borderRadius} ${shadowStyle}`}>
          <div className="flex items-center justify-between">
            <button 
              type="button" 
              onClick={() => setStep(deliveryType === 'delivery' ? 'location' : 'delivery_type')} 
              className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-xs font-bold"
            >
              <ArrowLeft size={16} /> Atrás
            </button>
            <h3 className="font-extrabold text-gray-900 text-sm">Datos y Pago</h3>
            <div className="w-10"></div>
          </div>

          <div className="space-y-3 pt-1">
            <h4 className="font-bold text-xs text-gray-800 border-b pb-1">Datos de Contacto</h4>
            
            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">Tu Nombre *</label>
              <input
                type="text"
                name="name"
                placeholder="Ej: Juan Pérez"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">Teléfono *</label>
              <input
                type="tel"
                name="phone"
                placeholder="+569 1234 5678"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">Email (Opcional)</label>
              <input
                type="email"
                name="email"
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">Observaciones Generales</label>
              <textarea
                name="notes"
                placeholder="Ej: Timbre malo, dejar en conserjería..."
                value={formData.notes}
                onChange={handleInputChange}
                rows="2"
                className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>

            <h4 className="font-bold text-xs text-gray-800 border-b pb-1 pt-2">Método de Pago</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <label className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition ${formData.paymentMethod === 'Efectivo' ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800' : 'border-gray-200 text-gray-600'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="Efectivo" 
                  checked={formData.paymentMethod === 'Efectivo'} 
                  onChange={handleInputChange} 
                  className="hidden" 
                />
                <span className="text-base">💵</span>
                <span className="text-xs font-bold">Efectivo</span>
              </label>

              <label className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition ${formData.paymentMethod === 'Transferencia' ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800' : 'border-gray-200 text-gray-600'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="Transferencia" 
                  checked={formData.paymentMethod === 'Transferencia'} 
                  onChange={handleInputChange} 
                  className="hidden" 
                />
                <span className="text-base">🏦</span>
                <span className="text-xs font-bold">Transferencia</span>
              </label>
            </div>
          </div>

          <div className="pt-2 border-t flex justify-between font-extrabold text-sm">
            <span>Total a Pagar:</span>
            <span style={{ color: primaryColor }}>${totalPrice}</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95 text-center block"
            style={{ backgroundColor: buttonColor }}
          >
            Confirmar Pedido y Enviar por WhatsApp 📲
          </button>
        </form>
      )}
    </div>
  );
}