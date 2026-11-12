'use client';

export default function Header({ store, cartCount, onCartClick }) {
  const config = Array.isArray(store?.store_config) ? store.store_config[0] : store?.store_config;
  const primaryColor = config?.primary_color || '#065F46';

  return (
    <header className="text-white shadow-md sticky top-0 z-40" style={{ backgroundColor: primaryColor }}>
      <div className="p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 overflow-hidden border border-white/30 flex-shrink-0">
            {store?.avatar_url ? (
              <img src={store.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm flex items-center justify-center h-full">🏢</span>
            )}
          </div>
          <div>
            <h1 className="text-xs font-black tracking-wide truncate max-w-[200px]">{store?.full_name}</h1>
          </div>
        </div>

        <button 
          onClick={onCartClick}
          className="bg-white/15 px-3.5 py-1.5 rounded-xl border border-white/20 text-xs font-extrabold flex items-center gap-1.5 active:scale-95 transition"
        >
          <span>🛒</span>
          <span>{cartCount}</span>
        </button>
      </div>
    </header>
  );
}