'use client';
import { useState } from 'react';
import { Store, Truck, ArrowLeft, Navigation, Copy, Check, Trash2 } from 'lucide-react';

export default function CartView({ cart, updateQuantity, storePhone, goToMenu, storeConfig }) {
  const buttonColor = storeConfig?.button_color || '#10B981';
  const primaryColor = storeConfig?.primary_color || '#10B981';
  const borderRadius = storeConfig?.border_radius || 'rounded-2xl';
  const shadowStyle = storeConfig?.shadow_style || 'shadow-sm';

  const totalPrice = cart.reduce((acc, item) => acc + (item.finalPrice || item.price) * item.quantity, 0);

  // Pasos del flujo: 'cart' | 'delivery_type' | 'location' | 'checkout'
  const [step, setStep] = useState('cart');
  const [deliveryType, setDeliveryType] = useState('delivery'); // 'delivery' o 'retiro'
  const [copied, setCopied] = useState(false);
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  
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
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada en tu navegador.');
      return;
    }

    setIsLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await response.json();
          
          if (data && data.address) {
            const street = data.address.road || data.address.pedestrian || data.address.suburb || '';
            const houseNumber = data.address.house_number || '';
            const suburb = data.address.suburb || data.address.city || '';
            
            setFormData(prev => ({
              ...prev,
              address: street || prev.address,
              addressNumber: houseNumber || prev.addressNumber,
              notes: suburb && !prev.notes.includes(suburb) ? (prev.notes ? `${prev.notes} Sector: ${suburb}` : `Sector: ${suburb}`) : prev.notes
            }));
            
            alert('¡Ubicación GPS detectada con éxito! Verifica los datos.');
          } else {
            alert('No se pudo determinar la calle exacta. Por favor ingrésala manualmente.');
          }
        } catch (error) {
          alert('Error al conectar con el servicio de mapas. Ingresa tu dirección manualmente.');
        } finally {
          setIsLoadingGps(false);
        }
      },
      (error) => {
        setIsLoadingGps(false);
        alert('No se pudo obtener el permiso de ubicación. Por favor ingrésala de forma manual.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const copyBankData = () => {
    const text = `Banco: ${storeConfig?.bank_name || 'Banco Estado'}\nTipo: ${storeConfig?.bank_account_type || 'Cuenta Corriente'}\nNº: ${storeConfig?.bank_account_number || '12345678'}\nRUT: ${storeConfig?.bank_rut || '76.123.456-7'}\nTitular: ${storeConfig?.bank_holder || storeConfig?.name || 'Comercio'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = (e) => {
    e.preventDefault();
    const itemsText = cart.map(i => `- ${i.quantity}x ${i.name} (${i.selectedSize || 'Estándar'}) - $${((i.finalPrice || i.price) * i.quantity).toLocaleString('es-CL')}`).join('\n');
    
    const deliveryText = deliveryType === 'delivery' 
      ? `📦 Tipo de Entrega: Delivery\n📍 Dirección: ${formData.address}, Nº ${formData.addressNumber}\n`
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
      `\n💰 Total a Pagar: $${totalPrice.toLocaleString('es-CL')}`
    );

    window.open(`https://wa.me/${storePhone}?text=${message}`, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="space-y-4 pt-2 pb-24">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: primaryColor }}>
            Tu pedido
          </span>
          <h3 className="font-black text-zinc-900 text-xl tracking-tight">Carrito de Compras</h3>
        </div>

        <div className={`bg-white/95 backdrop-blur-sm p-10 text-center space-y-3 border border-zinc-200/80 ${borderRadius} ${shadowStyle}`}>
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto mb-2">
            🛒
          </div>
          <p className="text-sm font-bold text-zinc-800">Tu carrito está vacío</p>
          <p className="text-xs text-zinc-400 max-w-[220px] mx-auto">Explora el catálogo y añade deliciosos productos para continuar.</p>
          <button
            onClick={goToMenu}
            className="mt-2 text-xs font-extrabold text-white px-5 py-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            style={{ backgroundColor: buttonColor }}
          >
            Ver Menú y Productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2 pb-24">
      {/* Encabezado con Indicador de Pasos */}
      <div className="flex items-end justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: primaryColor }}>
            Checkout seguro
          </span>
          <h3 className="font-black text-zinc-900 text-xl tracking-tight">
            {step === 'cart' && 'Tu Carrito de Compras'}
            {step === 'delivery_type' && 'Método de Entrega'}
            {step === 'location' && 'Dirección de Envío'}
            {step === 'checkout' && 'Datos y Pago'}
          </h3>
        </div>

        <div className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600">
          {step === 'cart' && 'Paso 1 de 3'}
          {step === 'delivery_type' && 'Paso 2 de 3'}
          {step === 'location' && 'Paso 2.5 de 3'}
          {step === 'checkout' && 'Paso 3 de 3'}
        </div>
      </div>

      {/* PASO 1: VISTA DEL CARRITO */}
      {step === 'cart' && (
        <div className="space-y-3">
          <div className="space-y-2.5">
            {cart.map((item, index) => (
              <div key={index} className={`bg-white p-4 border border-zinc-200/80 flex justify-between items-center gap-3 ${borderRadius} ${shadowStyle}`}>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-xs text-zinc-900 truncate">
                    {item.name} {item.selectedSize && `(${item.selectedSize})`}
                  </h4>
                  <p className="text-xs font-black mt-1" style={{ color: primaryColor }}>
                    ${((item.finalPrice || item.price) * item.quantity).toLocaleString('es-CL')}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-zinc-50 p-1 rounded-xl border border-zinc-200/60">
                  <button 
                    onClick={() => updateQuantity(index, -1)} 
                    className="w-7 h-7 bg-white rounded-lg font-bold text-zinc-700 shadow-sm flex items-center justify-center hover:bg-zinc-100 transition active:scale-95 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-extrabold px-1 text-zinc-800">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(index, 1)} 
                    className="w-7 h-7 bg-white rounded-lg font-bold text-zinc-700 shadow-sm flex items-center justify-center hover:bg-zinc-100 transition active:scale-95 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={`bg-white p-5 border border-zinc-200/80 space-y-4 ${borderRadius} ${shadowStyle}`}>
            <div className="flex justify-between items-center font-black text-sm pt-1">
              <span className="text-zinc-600">Total a Pagar:</span>
              <span className="text-base" style={{ color: primaryColor }}>${totalPrice.toLocaleString('es-CL')}</span>
            </div>

            <button
              onClick={() => setStep('delivery_type')}
              className="w-full py-3.5 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 text-center block cursor-pointer"
              style={{ 
                backgroundColor: buttonColor,
                boxShadow: `0 8px 20px -6px ${buttonColor}85`
              }}
            >
              Continuar con el Pedido 🚀
            </button>
          </div>
        </div>
      )}

      {/* PASO 2: TIPO DE ENTREGA */}
      {step === 'delivery_type' && (
        <div className={`bg-white p-6 border border-zinc-200/80 space-y-5 ${borderRadius} ${shadowStyle}`}>
          <div className="flex items-center justify-between">
            <button onClick={() => setStep('cart')} className="text-zinc-500 hover:text-zinc-800 flex items-center gap-1 text-xs font-bold cursor-pointer">
              <ArrowLeft size={16} /> Volver al carrito
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => setDeliveryType('delivery')}
              className="p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer"
              style={{
                borderColor: deliveryType === 'delivery' ? primaryColor : '#E4E4E7',
                backgroundColor: deliveryType === 'delivery' ? `${primaryColor}10` : '#FAFAFA'
              }}
            >
              <Truck size={30} style={{ color: deliveryType === 'delivery' ? primaryColor : '#71717A' }} />
              <span className="text-xs font-black" style={{ color: deliveryType === 'delivery' ? primaryColor : '#52525B' }}>Delivery</span>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryType('retiro')}
              className="p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer"
              style={{
                borderColor: deliveryType === 'retiro' ? primaryColor : '#E4E4E7',
                backgroundColor: deliveryType === 'retiro' ? `${primaryColor}10` : '#FAFAFA'
              }}
            >
              <Store size={30} style={{ color: deliveryType === 'retiro' ? primaryColor : '#71717A' }} />
              <span className="text-xs font-black" style={{ color: deliveryType === 'retiro' ? primaryColor : '#52525B' }}>Retiro en Local</span>
            </button>
          </div>

          <button
            onClick={() => setStep(deliveryType === 'delivery' ? 'location' : 'checkout')}
            className="w-full py-3.5 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 text-center cursor-pointer"
            style={{ 
              backgroundColor: buttonColor,
              boxShadow: `0 8px 20px -6px ${buttonColor}85`
            }}
          >
            Continuar →
          </button>
        </div>
      )}

      {/* PASO 3: UBICACIÓN Y GPS */}
      {step === 'location' && (
        <div className={`bg-white p-6 border border-zinc-200/80 space-y-4 ${borderRadius} ${shadowStyle}`}>
          <div className="flex items-center justify-between">
            <button onClick={() => setStep('delivery_type')} className="text-zinc-500 hover:text-zinc-800 flex items-center gap-1 text-xs font-bold cursor-pointer">
              <ArrowLeft size={16} /> Atrás
            </button>
          </div>

          <div className="space-y-3.5">
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLoadingGps}
              className="w-full py-3.5 border-2 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
              style={{ 
                borderColor: primaryColor, 
                backgroundColor: `${primaryColor}12`,
                color: primaryColor 
              }}
            >
              <Navigation size={16} className={isLoadingGps ? 'animate-spin' : ''} /> 
              {isLoadingGps ? 'Obteniendo ubicación GPS...' : 'Usar mi ubicación GPS exacta (Recomendado)'}
            </button>

            <div>
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">Calle / Avenida *</label>
              <input
                type="text"
                name="address"
                placeholder="Ej: Av. Principal"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-3 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 bg-zinc-50/50"
                style={{ '--tw-ring-color': primaryColor }}
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">Nº Casa / Depto / Referencia *</label>
              <input
                type="text"
                name="addressNumber"
                placeholder="Ej: 1234, Depto 42B"
                value={formData.addressNumber}
                onChange={handleInputChange}
                className="w-full p-3 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 bg-zinc-50/50"
                required
              />
            </div>

            {/* Mapa integrado interactivo */}
            <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-zinc-200 shadow-inner bg-zinc-100">
              <iframe 
                title="Mapa de Ubicación"
                className="w-full h-full border-0 pointer-events-auto"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-71.24,-34.99,-71.22,-34.97&layer=mapnik"
              />
            </div>

            <p className="text-[11px] text-zinc-400 text-center">
              📍 Asegúrate de verificar que el número de casa o departamento sea correcto.
            </p>
          </div>

          <button
            onClick={() => setStep('checkout')}
            disabled={!formData.address || !formData.addressNumber}
            className={`w-full py-3.5 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 text-center cursor-pointer ${(!formData.address || !formData.addressNumber) ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ backgroundColor: buttonColor }}
          >
            Continuar al Pago →
          </button>
        </div>
      )}

      {/* PASO 4: DATOS DE CONTACTO Y PAGO */}
      {step === 'checkout' && (
        <form onSubmit={handleSendWhatsApp} className={`bg-white p-6 border border-zinc-200/80 space-y-4 ${borderRadius} ${shadowStyle}`}>
          <div className="flex items-center justify-between">
            <button 
              type="button" 
              onClick={() => setStep(deliveryType === 'delivery' ? 'location' : 'delivery_type')} 
              className="text-zinc-500 hover:text-zinc-800 flex items-center gap-1 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft size={16} /> Atrás
            </button>
          </div>

          <div className="space-y-3.5 pt-1">
            <h4 className="font-extrabold text-xs text-zinc-900 border-b pb-1.5 uppercase tracking-wider">Datos de Contacto</h4>
            
            <div>
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">Tu Nombre *</label>
              <input
                type="text"
                name="name"
                placeholder="Ej: Juan Pérez"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-zinc-200 rounded-xl text-xs focus:outline-none bg-zinc-50/50"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">Teléfono *</label>
              <input
                type="tel"
                name="phone"
                placeholder="+569 1234 5678"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 border border-zinc-200 rounded-xl text-xs focus:outline-none bg-zinc-50/50"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">Email (Opcional)</label>
              <input
                type="email"
                name="email"
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 border border-zinc-200 rounded-xl text-xs focus:outline-none bg-zinc-50/50"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">Observaciones Generales</label>
              <textarea
                name="notes"
                placeholder="Ej: Timbre malo, dejar en conserjería..."
                value={formData.notes}
                onChange={handleInputChange}
                rows="2"
                className="w-full p-3 border border-zinc-200 rounded-xl text-xs focus:outline-none bg-zinc-50/50 resize-none"
              />
            </div>

            <h4 className="font-extrabold text-xs text-zinc-900 border-b pb-1.5 pt-2 uppercase tracking-wider">Método de Pago</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <label 
                className="p-3.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
                style={{
                  borderColor: formData.paymentMethod === 'Efectivo' ? primaryColor : '#E4E4E7',
                  backgroundColor: formData.paymentMethod === 'Efectivo' ? `${primaryColor}10` : '#FAFAFA',
                  color: formData.paymentMethod === 'Efectivo' ? primaryColor : '#52525B'
                }}
              >
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="Efectivo" 
                  checked={formData.paymentMethod === 'Efectivo'} 
                  onChange={handleInputChange} 
                  className="hidden" 
                />
                <span className="text-base">💵</span>
                <span className="text-xs font-black">Efectivo</span>
              </label>

              <label 
                className="p-3.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
                style={{
                  borderColor: formData.paymentMethod === 'Transferencia' ? primaryColor : '#E4E4E7',
                  backgroundColor: formData.paymentMethod === 'Transferencia' ? `${primaryColor}10` : '#FAFAFA',
                  color: formData.paymentMethod === 'Transferencia' ? primaryColor : '#52525B'
                }}
              >
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="Transferencia" 
                  checked={formData.paymentMethod === 'Transferencia'} 
                  onChange={handleInputChange} 
                  className="hidden" 
                />
                <span className="text-base">🏦</span>
                <span className="text-xs font-black">Transferencia</span>
              </label>
            </div>

            {/* DATOS BANCARIOS ADAPTADOS */}
            {formData.paymentMethod === 'Transferencia' && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-2 mt-3 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                  <span className="text-xs font-black text-zinc-800">Datos Bancarios</span>
                  <button 
                    type="button" 
                    onClick={copyBankData}
                    className="text-[11px] font-bold flex items-center gap-1 bg-white border border-zinc-200 px-2.5 py-1 rounded-lg shadow-sm hover:bg-zinc-100 cursor-pointer"
                    style={{ color: primaryColor }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? '¡Copiado!' : 'Copiar datos'}
                  </button>
                </div>
                
                <div className="text-[11px] space-y-1 text-zinc-600 pt-1">
                  <p><strong>Banco:</strong> {storeConfig?.bank_name || 'Banco Estado'}</p>
                  <p><strong>Tipo:</strong> {storeConfig?.bank_account_type || 'Cuenta Corriente'}</p>
                  <p><strong>Nº:</strong> {storeConfig?.bank_account_number || '12345678'}</p>
                  <p><strong>RUT:</strong> {storeConfig?.bank_rut || '76.123.456-7'}</p>
                  <p><strong>Titular:</strong> {storeConfig?.bank_holder || storeConfig?.name || 'Comercio'}</p>
                </div>
                <p className="text-[10px] text-zinc-400 pt-1 italic">
                  * Recuerda enviar el comprobante por WhatsApp junto con tu pedido.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-100 flex justify-between items-center font-black text-sm">
            <span className="text-zinc-600">Total a Pagar:</span>
            <span className="text-base" style={{ color: primaryColor }}>${totalPrice.toLocaleString('es-CL')}</span>
          </div>

          <button
            type="submit"
            className="w-full py-4 text-white font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 text-center block cursor-pointer"
            style={{ 
              backgroundColor: buttonColor,
              boxShadow: `0 10px 25px -5px ${buttonColor}80`
            }}
          >
            Confirmar Pedido y Enviar por WhatsApp 📲
          </button>
        </form>
      )}
    </div>
  );
}