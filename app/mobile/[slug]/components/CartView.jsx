'use client';
import { useState, useEffect, useRef } from 'react';
import { Store, Truck, ArrowLeft, Navigation, Copy, Check } from 'lucide-react';

export default function CartView({ cart, updateQuantity, storePhone, goToMenu, storeConfig }) {
  const buttonColor = storeConfig?.button_color || '#10B981';
  const primaryColor = storeConfig?.primary_color || '#10B981';
  const borderRadius = storeConfig?.border_radius || 'rounded-2xl';
  const shadowStyle = storeConfig?.shadow_style || 'shadow-sm';

  const totalPrice = cart.reduce((acc, item) => acc + (item.finalPrice || item.price) * item.quantity, 0);

  const [step, setStep] = useState('cart');
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [copied, setCopied] = useState(false);
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    address: '',
    addressNumber: '',
    paymentMethod: 'Efectivo'
  });

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Inicializar mapa interactivo con Pin de Persona / Avatar Original
  useEffect(() => {
    if (step === 'location' && typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        const defaultLat = -34.9828;
        const defaultLng = -71.2394;

        if (!mapInstanceRef.current && mapRef.current) {
          const map = L.map(mapRef.current, {
            zoomControl: false
          }).setView([defaultLat, defaultLng], 14);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);

          L.control.zoom({ position: 'topright' }).addTo(map);

          // Pin original con silueta de persona / avatar interactivo y sombra luminosa
          const personPin = L.divIcon({
            className: 'person-map-pin',
            html: `
              <div style="position: relative; display: flex; align-items: center; justify-content: center;">
                <div style="position: absolute; width: 44px; height: 44px; background-color: ${primaryColor}40; border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="background: linear-gradient(135deg, ${primaryColor}, #111827); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(0,0,0,0.4); border: 2.5px solid white; position: relative; z-index: 10;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
              </div>
            `,
            iconSize: [44, 44],
            iconAnchor: [22, 22],
            popupAnchor: [0, -22]
          });

          const marker = L.marker([defaultLat, defaultLng], { draggable: true, icon: personPin }).addTo(map);
          markerRef.current = marker;

          map.on('click', async (e) => {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            await reverseGeocode(lat, lng);
          });

          marker.on('dragend', async () => {
            const pos = marker.getLatLng();
            await reverseGeocode(pos.lat, pos.lng);
          });

          mapInstanceRef.current = map;
        } else {
          setTimeout(() => {
            mapInstanceRef.current?.invalidateSize();
          }, 200);
        }
      });
    }
  }, [step, primaryColor]);

  const reverseGeocode = async (lat, lon) => {
    try {
      setIsLoadingGps(true);
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
      }
    } catch (error) {
      console.error('Error al obtener dirección del mapa:', error);
    } finally {
      setIsLoadingGps(false);
    }
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
        
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lon], 16);
          markerRef.current.setLatLng([lat, lon]);
        }
        await reverseGeocode(lat, lon);
        setIsLoadingGps(false);
        alert('¡Ubicación GPS detectada con éxito!');
      },
      () => {
        setIsLoadingGps(false);
        alert('No se pudo obtener el permiso de ubicación.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          {step === 'location' ? 'Paso 2.5 de 3' : 'Paso en curso'}
        </div>
      </div>

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
                  <button onClick={() => updateQuantity(index, -1)} className="w-7 h-7 bg-white rounded-lg font-bold text-zinc-700 shadow-sm flex items-center justify-center">-</button>
                  <span className="text-xs font-extrabold px-1 text-zinc-800">{item.quantity}</span>
                  <button onClick={() => updateQuantity(index, 1)} className="w-7 h-7 bg-white rounded-lg font-bold text-zinc-700 shadow-sm flex items-center justify-center">+</button>
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
              style={{ backgroundColor: buttonColor }}
            >
              Continuar con el Pedido 🚀
            </button>
          </div>
        </div>
      )}

      {step === 'delivery_type' && (
        <div className={`bg-white p-6 border border-zinc-200/80 space-y-5 ${borderRadius} ${shadowStyle}`}>
          <button onClick={() => setStep('cart')} className="text-zinc-500 hover:text-zinc-800 flex items-center gap-1 text-xs font-bold cursor-pointer">
            <ArrowLeft size={16} /> Volver al carrito
          </button>

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
            style={{ backgroundColor: buttonColor }}
          >
            Continuar →
          </button>
        </div>
      )}

      {step === 'location' && (
        <div className={`bg-white p-6 border border-zinc-200/80 space-y-4 ${borderRadius} ${shadowStyle}`}>
          <button onClick={() => setStep('delivery_type')} className="text-zinc-500 hover:text-zinc-800 flex items-center gap-1 text-xs font-bold cursor-pointer">
            <ArrowLeft size={16} /> Atrás
          </button>

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
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                📍 Mueve el avatar o haz clic en el mapa para ubicar tu entrega:
              </label>
              <div 
                ref={mapRef} 
                className="relative w-full h-56 rounded-2xl overflow-hidden border border-zinc-200 shadow-inner z-10"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-700 block mb-1">Calle / Avenida *</label>
              <input
                type="text"
                name="address"
                placeholder="Ej: Av. Principal"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-3 border border-zinc-200 rounded-xl text-xs focus:outline-none bg-zinc-50/50"
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
                className="w-full p-3 border border-zinc-200 rounded-xl text-xs focus:outline-none bg-zinc-50/50"
                required
              />
            </div>
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

      {step === 'checkout' && (
        <form onSubmit={handleSendWhatsApp} className={`bg-white p-6 border border-zinc-200/80 space-y-4 ${borderRadius} ${shadowStyle}`}>
          <button 
            type="button" 
            onClick={() => setStep(deliveryType === 'delivery' ? 'location' : 'delivery_type')} 
            className="text-zinc-500 hover:text-zinc-800 flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft size={16} /> Atrás
          </button>

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

            {formData.paymentMethod === 'Transferencia' && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-2 mt-3 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                  <span className="text-xs font-black text-zinc-800">Datos Bancarios</span>
                  <button 
                    type="button" 
                    onClick={copyBankData}
                    className="text-[11px] font-bold flex items-center gap-1 bg-white border border-zinc-200 px-2.5 py-1 rounded-lg shadow-sm hover:bg-gray-100 cursor-pointer"
                    style={{ color: primaryColor }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? '¡Copiado!' : 'Copiar datos'}
                  </button>
                </div>
                <div className="text-[11px] space-y-1 text-zinc-600 pt-1">
                  <p><strong>Banco:</strong> {storeConfig?.bank_name || 'Banco Estado'}</p>
                  <p><strong>Nº:</strong> {storeConfig?.bank_account_number || '12345678'}</p>
                  <p><strong>RUT:</strong> {storeConfig?.bank_rut || '76.123.456-7'}</p>
                  <p><strong>Titular:</strong> {storeConfig?.bank_holder || storeConfig?.name || 'Comercio'}</p>
                </div>
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
            style={{ backgroundColor: buttonColor }}
          >
            Confirmar Pedido y Enviar por WhatsApp 📲
          </button>
        </form>
      )}
    </div>
  );
}