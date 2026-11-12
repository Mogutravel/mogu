'use client';

export default function PointsView({ storeConfig }) {
  const primaryColor = storeConfig?.primary_color || '#065F46';
  const buttonColor = storeConfig?.button_color || '#047857';
  const borderRadius = storeConfig?.border_radius || 'rounded-2xl';
  const shadowStyle = storeConfig?.shadow_style || 'shadow-sm';

  return (
    <div className="space-y-6 pt-4">
      <div className={`bg-white p-6 border border-gray-100 text-center space-y-4 ${shadowStyle} ${borderRadius}`}>
        <h3 className="font-extrabold text-base text-gray-900">Tus Puntos Mogu Travel</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Próximamente podrás acumular y canjear tus puntos directamente en el local.
        </p>

        <div 
          className={`py-6 px-4 text-white font-black text-2xl tracking-wide shadow-md transition-all opacity-80 ${borderRadius}`}
          style={{ backgroundColor: primaryColor }}
        >
          0 Puntos
        </div>

        {/* Mensaje enfocado en desarrollo */}
        <div className="pt-2">
          <span 
            className="inline-block text-xs font-bold px-3 py-1.5 rounded-xl border border-dashed"
            style={{ 
              color: primaryColor, 
              borderColor: `${primaryColor}40`,
              backgroundColor: `${primaryColor}10` 
            }}
          >
            
          </span>
        </div>
      </div>
    </div>
  );
}