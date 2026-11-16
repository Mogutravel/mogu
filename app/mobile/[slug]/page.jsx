'use client';

import { useState, useEffect, use } from 'react';
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
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const [storeData, setStoreData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [currentTab, setCurrentTab] = useState('inicio');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoreAndMenu() {
      try {
        // Consulta optimizada para traer solo datos esenciales y filtrar productos activos directamente
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
          .eq('slug', slug)
          .single();

        if (error) throw error;

        if (data) {
          setStoreData(data);
          
          // Ordenar categorías y filtrar solo ítems activos para mayor ligereza en memoria
          const sortedCategories = (data.menu_categories || [])
            .map(cat => ({
              ...cat,
              menu_items: (cat.menu_items || [])
                .filter(item => item.active)
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
      loadStoreAndMenu();
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
      <div className="flex flex-col justify-center items-center h-screen bg-[#0E0C0A] text-white font-sans relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full blur-3xl pointer-events-none animate-pulse opacity-20 bg-emerald-500" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center p-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium tracking-wide text-zinc-200">Cargando experiencia Mogu...</p>
        </div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#0E0C0A] text-white font-sans p-6 text-center">
        <div className="max-w-xs p-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-400 text-2xl font-bold">
            !
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Local no disponible</h2>
          <p className="text-xs text-zinc-400">El establecimiento que buscas no se encuentra activo o la URL es incorrecta.</p>
        </div>
      </div>
    );
  }

  const rawConfig = storeData.store_config;
  const storeConfig = Array.isArray(rawConfig) ? rawConfig[0] || {} : rawConfig || {};

  const primaryColor = storeConfig.primary_color || '#10B981';
  const secondaryColor = storeConfig.secondary_color || '#0E0C0A';
  const borderRadius = storeConfig.border_radius || 'rounded-3xl';

  const enrichedStore = {
    ...storeData,
    store_config: storeConfig,
  };

  return (
    <div 
      className={`w-full min-h-screen sm:max-w-md mx-auto pb-28 relative shadow-2xl font-sans overflow-x-hidden sm:border-x border-white/10 transition-all duration-300 rounded-none sm:${borderRadius}`}
      style={{ backgroundColor: secondaryColor }}
    >
      {/* Malla de Degradados Dinámicos */}
      <div className="absolute top-0 left-0 w-full h-96 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-[100px] opacity-25 transition-all duration-700" 
          style={{ backgroundColor: primaryColor }}
        />
        <div className="absolute top-12 -right-24 w-72 h-72 bg-purple-500/15 rounded-full blur-[90px] pointer-events-none" />
      </div>

      <div className="relative z-10">
        <Header 
          store={enrichedStore} 
          categories={categories} 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory}
          currentTab={currentTab}
          cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
          onCartClick={() => setCurrentTab('carrito')}
        />

        <main className="px-4 pt-3 transition-all duration-300 animate-fadeIn">
          {currentTab === 'inicio' && (
            <div className="space-y-6">
              <HomeFeed 
                store={enrichedStore} 
                categories={categories} 
                onAddToCart={addToCart} 
              />

              {/* Menú Completo */}
              <div className="pt-3">
                {/* Título Explorar Menú */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div>
                    <span 
                      className="text-[10px] font-extrabold uppercase tracking-[0.2em]"
                      style={{ color: primaryColor }}
                    >
                      Catálogo digital
                    </span>
                    <h3 className="font-black text-zinc-900 text-lg tracking-tight flex items-center gap-2 mt-0.5">
                      <UtensilsCrossed size={18} style={{ color: primaryColor }} />
                      Explorar Menú
                    </h3>
                  </div>
                </div>
                
                {/* Barra de categorías flotante */}
                <div className="sticky top-16 z-20 backdrop-blur-md bg-white/90 dark:bg-[#0E0C0A]/90 py-3 -mx-4 px-4 border-y border-zinc-200/80 dark:border-white/10 shadow-sm mb-4">
                  <div className="flex overflow-x-auto space-x-2 no-scrollbar text-xs">
                    {categories.map((cat) => {
                      const isActive = activeCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id)}
                          className={`whitespace-nowrap px-4 py-2.5 rounded-full font-extrabold transition-all duration-300 transform active:scale-95 shadow-sm cursor-pointer ${
                            isActive 
                              ? 'text-white shadow-md' 
                              : 'bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-white/15 hover:bg-zinc-200 dark:hover:bg-white/20'
                          }`}
                          style={isActive ? { 
                            backgroundColor: primaryColor, 
                            boxShadow: `0 6px 20px -4px ${primaryColor}80`,
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