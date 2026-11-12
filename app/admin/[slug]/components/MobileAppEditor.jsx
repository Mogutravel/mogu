'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function MobileAppEditor({ profileId, slug }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuItems, setMenuItems] = useState([]);

  // Estados del formulario (conectados a store_config)
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [heroActive, setHeroActive] = useState(true);
  const [dailySpecialId, setDailySpecialId] = useState('');
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    async function loadEditorData() {
      try {
        // 1. Obtener todos los productos activos del local (solo lectura para elegir)
        const { data: categories } = await supabase
          .from('menu_categories')
          .select('id, name, menu_items (id, name, price, image_url, active)')
          .eq('profile_id', profileId);

        const allProducts = (categories || [])
          .flatMap((cat) => cat.menu_items || [])
          .filter((item) => item.active);
        setMenuItems(allProducts);

        // 2. Obtener configuración visual actual si existe en store_config
        const { data: config } = await supabase
          .from('store_config')
          .select('*')
          .eq('profile_id', profileId)
          .single();

        if (config) {
          setHeroTitle(config.hero_title || '');
          setHeroSubtitle(config.hero_subtitle || '');
          setHeroImage(config.hero_image || '');
          setHeroActive(config.hero_active ?? true);
          setDailySpecialId(config.daily_special_item_id || '');
          setFavoriteIds(config.favorite_item_ids || []);
        }
      } catch (err) {
        console.error('Error cargando datos del editor:', err);
      } finally {
        setLoading(false);
      }
    }

    if (profileId) {
      loadEditorData();
    }
  }, [profileId]);

  // Alternar selección de productos en "Los Favoritos" (máximo 4 recomendados)
  const toggleFavorite = (itemId) => {
    setFavoriteIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        if (prev.length >= 6) {
          alert('Puedes destacar un máximo de 6 productos favoritos en la portada.');
          return prev;
        }
        return [...prev, itemId];
      }
    });
  };

  // Guardar cambios en store_config
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('store_config')
        .upsert(
          {
            profile_id: profileId,
            hero_title: heroTitle,
            hero_subtitle: heroSubtitle,
            hero_image: heroImage,
            hero_active: heroActive,
            daily_special_item_id: dailySpecialId || null,
            favorite_item_ids: favoriteIds,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'profile_id' }
        );

      if (error) throw error;
      alert('¡Portada de la App Mobile actualizada con éxito!');
    } catch (err) {
      console.error('Error guardando configuración:', err);
      alert('Hubo un error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500 font-medium">Cargando editor de la app...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6 font-sans">
      
      {/* CABECERA DEL EDITOR CON BOTÓN DE VISTA PREVIA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Personalizar App Mobile</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Configura los banners, el plato del día y los favoritos sin alterar tu carta.
          </p>
        </div>
        <a
          href={`/mobile/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-green-800 hover:bg-green-900 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow transition-all"
        >
          <span>Ver App en Vivo</span>
          <span>↗</span>
        </a>
      </div>

      <form onSubmit={handleSave} className="space-y-8 mt-6">
        
        {/* SECCIÓN 1: BANNER DE PROMOCIONES PRINCIPAL */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <span>🖼️</span> Banner Promocional Principal
            </h3>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={heroActive}
                onChange={(e) => setHeroActive(e.target.checked)}
                className="rounded text-green-700 focus:ring-green-700 w-4 h-4"
              />
              <span>Mostrar banner</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Título Comercial
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="Ej: ¡20% OFF en Cafés de Especialidad!"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-green-700 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Subtítulo / Descripción Breve
              </label>
              <input
                type="text"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="Ej: Válido solo pidiendo por nuestra app."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-green-700 bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                URL de la Imagen del Banner
              </label>
              <input
                type="url"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-green-700 bg-white"
              />
              {heroImage && (
                <div className="mt-3 relative h-32 rounded-xl overflow-hidden border border-gray-200">
                  <img src={heroImage} alt="Vista previa banner" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: PLATO DEL DÍA */}
        <section className="space-y-3 pt-4 border-t border-gray-100">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span>🔥</span> Plato del Día (Protagonista)
          </h3>
          <p className="text-xs text-gray-500">
            Elige un producto de tu menú para destacarlo con tarjeta grande en la portada.
          </p>

          <select
            value={dailySpecialId}
            onChange={(e) => setDailySpecialId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:border-green-700 font-medium"
          >
            <option value="">-- Ningún plato seleccionado (Ocultar sección) --</option>
            {menuItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} — ${item.price}
              </option>
            ))}
          </select>
        </section>

        {/* SECCIÓN 3: LOS FAVORITOS / MÁS PEDIDOS */}
        <section className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <span>⭐</span> Los Favoritos / Más Pedidos
              </h3>
              <p className="text-xs text-gray-500">
                Selecciona los productos que aparecerán en la cuadrícula destacada ({favoriteIds.length}/6).
              </p>
            </div>
          </div>

          {menuItems.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No tienes productos activos en tu menú aún.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto p-1">
              {menuItems.map((item) => {
                const isSelected = favoriteIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleFavorite(item.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-green-50 border-green-600 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
                      )}
                      <div className="truncate">
                        <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">${item.price}</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="w-4 h-4 text-green-700 rounded focus:ring-0"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* BOTÓN GUARDAR */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-800 hover:bg-green-900 disabled:opacity-50 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all"
          >
            {saving ? 'Guardando cambios...' : 'Guardar Configuración Visual'}
          </button>
        </div>

      </form>
    </div>
  );
}