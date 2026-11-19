'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import Header from './components/Header';
import HomeFeed from './components/HomeFeed';
import MenuCatalog from './components/MenuCatalog';
import CartView from './components/CartView';
import PointsView from './components/PointsView';
import OrdersView from './components/OrdersView';
import ProfileView from './components/ProfileView';
import BottomNav from './components/BottomNav';
import { UtensilsCrossed } from 'lucide-react';

export default function MobileStorePage({ params }) {
  // En Next.js Client Components, params puede venir como objeto o promesa según la estructura. 
  // Usamos un estado o efecto seguro para extraer el slug sin romper la renderización.
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    // Resolver params de forma segura tanto si es síncrono como si viene como promesa
    Promise.resolve(params).then((resolvedParams) => {
      if (resolvedParams?.slug) {
        setSlug(resolvedParams.slug);
      }
    });
  }, [params]);

  const [storeData, setStoreData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [currentTab, setCurrentTab] = useState('inicio');
  const [loading, setLoading] = useState(true);

  const categoriesScrollRef = useRef(null);

  useEffect(() => {
    async function loadStoreAndMenu(currentSlug) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            slug,
            full_name,
            phone,
            avatar_url,
            catalog_hero_title,
            catalog_hero_subtitle,
            catalog_hero_image,
            store_config (*),
            menu_categories (
              id,
              name,
              position,
              menu_items (
                id,
                name,
                description,
                price,
                image_url,
                active,
                position,
                has_sizes,
                sizes_prices
              )
            )
          `)
          .eq('slug', currentSlug)
          .single();

        if (error) throw error;

        if (data) {
          setStoreData(data);
          
          const sortedCategories = (data.menu_categories || [])
            .map((cat) => ({
              ...cat,
              menu_items: (cat.menu_items || [])
                .filter((item) => item.active)
                .sort((a, b) => (a.position || 0) - (b.position || 0))
            }))
            .sort((a, b) => (a.position || 0) - (b.position || 0));

          setCategories(sortedCategories);
          
          if (sortedCategories.length > 0) {
            setActiveCategory(sortedCategories[0].id);
          }
        }
      } catch (err) {
        console.error('Error al cargar los datos del local:', err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadStoreAndMenu(slug);
    }
  }, [slug]);

  const addToCart = (item, sizeName = null, price = item.price) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (ci) => ci.id === item.id && ci.selectedSize === sizeName
      );
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += 1;
        return newCart;
      } else {
        return [...prevCart, { ...item, selectedSize: sizeName, finalPrice: price, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (index, delta) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      newCart[index].quantity += delta;
      if (newCart[index].quantity <= 0) {
        return newCart.filter((_, i) => i !== index);
      }
      return newCart;
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[100dvh] bg-[#0E0C0A] text-white font-sans relative overflow-hidden select-none">
        <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full blur-3xl pointer-events-none animate-pulse opacity-20 bg-emerald-500" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center p-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl">
          <div className="w-12 h-12 border-4 border-emerald-500/35 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">Cargando experiencia...</p>
        </div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[100dvh] bg-[#0E0C0A] text-white font-sans p-6 text-center select-none">
        <div className="max-w-xs w-full p-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-400 text-2xl font-bold">
            !
          </div>
          <h2 className="text-base font-bold text-white mb-2">Local no disponible</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">El establecimiento que buscas no se encuentra activo o la URL es incorrecta.</p>
        </div>
      </div>
    );
  }

  const rawConfig = storeData.store_config;
  const storeConfig = Array.isArray(rawConfig) ? rawConfig[0] || {} : rawConfig || {};

  const primaryColor = storeConfig.primary_color || '#10B981';
  const secondaryColor = storeConfig.secondary_color || '#0E0C0A';

  const enrichedStore = {
    ...storeData,
    store_config: storeConfig,
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div 
      className="w-full min-h-[100dvh] max-w-md mx-auto relative font-sans antialiased overflow-x-hidden selection:bg-emerald-500 selection:text-white pb-32"
      style={{ backgroundColor: secondaryColor }}
    >
      <div className="absolute top-0 left-0 w-full h-80 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full blur-[90px] opacity-20 transition-all duration-700" 
          style={{ backgroundColor: primaryColor }}
        />
        <div className="absolute top-10 -right-20 w-64 h-64 bg-purple-500/15 rounded-full blur-[90px] pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col min-h-[100dvh]">
        <Header 
          store={enrichedStore} 
          categories={categories} 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory}
          currentTab={currentTab}
          cartCount={totalCartItems}
          onCartClick={() => setCurrentTab('carrito')}
        />

        <main className="flex-1 px-4 pt-3 transition-all duration-300">
          {currentTab === 'inicio' && (
            <div className="space-y-5">
              <HomeFeed 
                store={enrichedStore} 
                categories={categories} 
                onAddToCart={addToCart} 
              />

              <div className="pt-2">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div>
                    <span 
                      className="text-[10px] font-bold uppercase tracking-[0.2em]"
                      style={{ color: primaryColor }}
                    >
                      Catálogo digital
                    </span>
                    <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5 mt-0.5">
                      <UtensilsCrossed size={16} style={{ color: primaryColor }} />
                      Explorar Menú
                    </h3>
                  </div>
                </div>
                
                <div className="sticky top-14 z-20 backdrop-blur-xl bg-[#0E0C0A]/85 py-2.5 -mx-4 px-4 border-y border-white/10 shadow-lg mb-4">
                  <div 
                    ref={categoriesScrollRef}
                    className="flex overflow-x-auto space-x-2 no-scrollbar text-xs scroll-smooth py-0.5"
                  >
                    {categories.map((cat) => {
                      const isActive = activeCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id)}
                          className={`whitespace-nowrap px-3.5 py-2 rounded-xl font-bold transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                            isActive 
                              ? 'text-white shadow-lg' 
                              : 'bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10'
                          }`}
                          style={isActive ? { 
                            backgroundColor: primaryColor, 
                            boxShadow: `0 4px 16px -2px ${primaryColor}70`,
                            borderColor: 'transparent'
                          } : {}}
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <MenuCatalog 
                  categories={categories} 
                  activeCategory={activeCategory} 
                  onAddToCart={addToCart} 
                  storeConfig={storeConfig}
                />
              </div>
            </div>
          )}

          {currentTab === 'puntos' && <PointsView />}
          
          {currentTab === 'carrito' && (
            <CartView 
              cart={cart} 
              updateQuantity={updateQuantity} 
              storePhone={storeData.phone} 
              goToMenu={() => setCurrentTab('inicio')} 
              storeConfig={storeConfig}
            />
          )}
          
          {currentTab === 'pedidos' && <OrdersView />}
          
          {currentTab === 'perfil' && <ProfileView store={enrichedStore} />}
        </main>
      </div>

      <BottomNav 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        storeConfig={storeConfig} 
        cart={cart}
      />
    </div>
  );
}