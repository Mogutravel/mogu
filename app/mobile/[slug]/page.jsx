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
          const sortedCategories = (data.menu_categories || []).sort(
            (a, b) => (a.position || 0) - (b.position || 0)
          );
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
      <div className="flex justify-center items-center h-screen bg-gray-50 text-emerald-800 font-bold">
        Cargando experiencia Mogu...
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-500 font-medium">
        Local no encontrado o inactivo.
      </div>
    );
  }

  // Extraer configuración visual de forma robusta
  const rawConfig = storeData.store_config;
  const storeConfig = Array.isArray(rawConfig) ? rawConfig[0] || {} : rawConfig || {};

  // Variables globales de diseño extraídas del editor
  const primaryColor = storeConfig.primary_color || '#065F46';
  const secondaryColor = storeConfig.secondary_color || '#F9FAFB';
  const buttonColor = storeConfig.button_color || '#047857';
  const borderRadius = storeConfig.border_radius || 'rounded-2xl';

  // Objeto enriquecido con la config unificada para los hijos
  const enrichedStore = {
    ...storeData,
    store_config: storeConfig,
  };

  return (
    <div 
      className={`w-full min-h-screen sm:max-w-md mx-auto pb-24 relative shadow-2xl font-sans overflow-x-hidden sm:border-x border-gray-200 transition-all rounded-none sm:${borderRadius}`}
      style={{ backgroundColor: secondaryColor }}
    >
      
      {/* 1. Header con colores dinámicos */}
      <Header 
        store={enrichedStore} 
        categories={categories} 
        activeCategory={activeCategory} 
        setActiveCategory={setActiveCategory}
        currentTab={currentTab}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        onCartClick={() => setCurrentTab('carrito')}
      />

      {/* 2. Contenido principal */}
      <main className="p-4">
        {currentTab === 'inicio' && (
          <div>
            {/* Feed Principal */}
            <HomeFeed 
              store={enrichedStore} 
              categories={categories} 
              onAddToCart={addToCart} 
            />

            {/* Menú Completo */}
            <div className="mt-8 pt-6 border-t border-black/5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-extrabold text-gray-900 text-base">Explorar Menú Completo</h3>
              </div>
              
              {/* Pestañas de categorías con color principal dinámico */}
              <div className="flex overflow-x-auto space-x-2 pb-3 no-scrollbar text-xs mb-3">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`whitespace-nowrap px-3.5 py-2 rounded-xl font-bold transition-all shadow-sm ${
                        isActive ? 'text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      }`}
                      style={isActive ? { backgroundColor: primaryColor } : {}}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Catálogo */}
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

      {/* 3. Barra de navegación inferior */}
      <BottomNav 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        storeConfig={storeConfig} 
      />

    </div>
  );
}