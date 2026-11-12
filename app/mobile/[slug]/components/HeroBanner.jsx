export default function HeroBanner({ store }) {
  if (!store.catalog_hero_image) return null;

  return (
    <div className="mb-4 rounded-2xl overflow-hidden shadow-lg relative bg-green-900 text-white">
      <img 
        src={store.catalog_hero_image} 
        alt="Banner Promocional" 
        className="w-full h-48 object-cover opacity-95"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4">
        {store.catalog_hero_title && (
          <h2 className="text-xl font-black tracking-wide drop-shadow-md text-white">{store.catalog_hero_title}</h2>
        )}
        {store.catalog_hero_subtitle && (
          <p className="text-xs text-green-100 drop-shadow mt-0.5">{store.catalog_hero_subtitle}</p>
        )}
      </div>
    </div>
  );
}