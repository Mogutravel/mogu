'use client';

export default function ProfileView({ store }) {
  const config = Array.isArray(store?.store_config) ? store.store_config[0] : store?.store_config;
  const primaryColor = config?.primary_color || '#065F46';
  const borderRadius = config?.border_radius || 'rounded-2xl';
  const shadowStyle = config?.shadow_style || 'shadow-sm';

  return (
    <div className="space-y-4 pt-2">
      <div className={`bg-white p-6 border border-gray-100 text-center space-y-3 ${borderRadius} ${shadowStyle}`}>
        <div className="w-16 h-16 rounded-full overflow-hidden mx-auto border shadow-sm">
          {store?.avatar_url ? (
            <img src={store.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl">🏢</span>
          )}
        </div>
        <h3 className="font-extrabold text-sm text-gray-900">{store?.full_name}</h3>
        <p className="text-xs text-gray-500">Recoger en Local • Mogu Travel</p>

        <div className="pt-2">
          <span 
            className="inline-block text-xs font-bold px-3 py-1.5 text-white rounded-xl shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            Teléfono: {store?.phone || 'No registrado'}
          </span>
        </div>
      </div>
    </div>
  );
}