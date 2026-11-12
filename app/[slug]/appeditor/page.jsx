'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  FiCheck, FiLoader, FiExternalLink, FiArrowLeft, FiSmartphone, 
  FiLayout, FiImage, FiSliders, FiPlus, FiTrash2, FiStar, FiUploadCloud, FiX 
} from 'react-icons/fi';

const VISUAL_PRESETS = [
  { id: 'minimalista', name: '🖤 Minimalista Moderno', desc: 'Limpio, elegante y directo al grano.', primary: '#111827', secondary: '#F9FAFB', accent: '#374151', radius: 'rounded-xl', shadow: 'shadow-sm' },
  { id: 'premium', name: '👑 Elegante & Dorado', desc: 'Ideal para cenas o experiencias gourmet.', primary: '#0F172A', secondary: '#1E293B', accent: '#D97706', radius: 'rounded-2xl', shadow: 'shadow-xl' },
  { id: 'moderno', name: '🌿 Esmeralda Fresco', desc: 'El estilo clásico y natural de Mogu.', primary: '#065F46', secondary: '#ECFDF5', accent: '#10B981', radius: 'rounded-2xl', shadow: 'shadow-md' },
  { id: 'fastfood', name: '🔥 Dinámico & Antojo', desc: 'Perfecto para hamburgueserías y delivery rápido.', primary: '#DC2626', secondary: '#FEF2F2', accent: '#F59E0B', radius: 'rounded-3xl', shadow: 'shadow-lg' },
  { id: 'cafeteria', name: '☕ Cafetería Cálida', desc: 'Tonos acogedores para café y repostería.', primary: '#78350F', secondary: '#FFFBEB', accent: '#B45309', radius: 'rounded-2xl', shadow: 'shadow-sm' },
];

export default function AppEditorPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(null); // indicador de subida para cada campo
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('estilo');

  const [profile, setProfile] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  // Estados visuales simplificados
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#10B981');
  const [secondaryColor, setSecondaryColor] = useState('#F9FAFB');
  const [buttonColor, setButtonColor] = useState('#047857');
  const [borderRadius, setBorderRadius] = useState('rounded-2xl');
  const [shadowStyle, setShadowStyle] = useState('shadow-md');

  const [sectionsConfig, setSectionsConfig] = useState({
    welcomeBanner: true,
    promoCarousel: true,
    dailySpecial: true,
    favorites: true,
    categoriesNav: true,
    fullCatalog: true,
  });

  const [welcomeMessage, setWelcomeMessage] = useState('¡Hola, Viajero!');
  const [banners, setBanners] = useState([]);
  const [dailySpecialId, setDailySpecialId] = useState('');
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setLoading(true);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
          setFullName(profileData.full_name || '');
          setAvatarUrl(profileData.avatar_url || '');
        }

        const { data: categories } = await supabase
          .from('menu_categories')
          .select('id, name, menu_items (id, name, price, image_url, active)')
          .eq('profile_id', profileData?.id);

        const allProducts = (categories || []).flatMap((cat) => cat.menu_items || []).filter((item) => item.active);
        setMenuItems(allProducts);

        const { data: config } = await supabase
          .from('store_config')
          .select('*')
          .eq('profile_id', profileData?.id)
          .maybeSingle();

        if (config) {
          setPrimaryColor(config.primary_color || '#10B981');
          setSecondaryColor(config.secondary_color || '#F9FAFB');
          setButtonColor(config.button_color || '#047857');
          setBorderRadius(config.border_radius || 'rounded-2xl');
          setShadowStyle(config.shadow_style || 'shadow-md');
          if (config.sections_config) setSectionsConfig(config.sections_config);
          setWelcomeMessage(config.welcome_message || '¡Hola, Viajero!');
          setBanners(config.banners_list || []);
          setDailySpecialId(config.daily_special_item_id || '');
          setFavoriteIds(config.favorite_item_ids || []);
        }
      } catch (err) {
        console.error('Error cargando editor:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug, router]);

  // Función genérica para subir imagen a Supabase Storage
  const handleImageUpload = async (file, targetType, bannerIndex = null) => {
    if (!file || !profile) return;
    const identifier = bannerIndex !== null ? `banner-${bannerIndex}` : targetType;
    setUploadingImg(identifier);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars') // o tu bucket de preferencia
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (targetType === 'avatar') {
        setAvatarUrl(publicUrl);
      } else if (targetType === 'banner' && bannerIndex !== null) {
        const updated = [...banners];
        updated[bannerIndex].image = publicUrl;
        setBanners(updated);
      }

      setMessage('✨ ¡Imagen subida con éxito!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      alert('No se pudo subir la imagen. Inténtalo de nuevo.');
    } finally {
      setUploadingImg(null);
    }
  };

  const applyPreset = (preset) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    setButtonColor(preset.accent);
    setBorderRadius(preset.radius);
    setShadowStyle(preset.shadow);
    setMessage(`✨ ¡Estilo "${preset.name}" aplicado! Haz clic en "Guardar Cambios" para fijarlo.`);
    setTimeout(() => setMessage(''), 4000);
  };

  const addBanner = () => {
    setBanners([...banners, { id: Date.now(), title: '¡Nueva Oferta!', subtitle: 'Disfruta hoy', image: '' }]);
  };

  const updateBanner = (index, field, value) => {
    const updated = [...banners];
    updated[index][field] = value;
    setBanners(updated);
  };

  const removeBanner = (index) => {
    setBanners(banners.filter((_, i) => i !== index));
  };

  const toggleFavorite = (itemId) => {
    setFavoriteIds((prev) => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage('');

    try {
      await supabase
        .from('profiles')
        .update({ full_name: fullName, avatar_url: avatarUrl })
        .eq('id', profile.id);

      const { error } = await supabase
        .from('store_config')
        .upsert(
          {
            profile_id: profile.id,
            primary_color: primaryColor,
            secondary_color: secondaryColor,
            button_color: buttonColor,
            border_radius: borderRadius,
            shadow_style: shadowStyle,
            sections_config: sectionsConfig,
            welcome_message: welcomeMessage,
            banners_list: banners,
            daily_special_item_id: dailySpecialId || null,
            favorite_item_ids: favoriteIds,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'profile_id' }
        );

      if (error) throw error;

      setMessage('🚀 ¡Cambios guardados con éxito en tu aplicación!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('Error al guardar:', err);
      alert('Hubo un error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-2">
          <FiLoader className="w-6 h-6 text-emerald-600 animate-spin" />
          <span className="text-xs font-semibold text-gray-500">Cargando tu personalizador...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans pb-24">
      
      {/* BARRA SUPERIOR AMIGABLE */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href={`/admin/${slug}`} className="p-2 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <FiArrowLeft className="text-sm" />
              <span>Volver</span>
            </Link>
            <span className="text-gray-300">|</span>
            <div>
              <h1 className="text-xs font-black uppercase tracking-wider text-emerald-800">Personaliza tu App 📱</h1>
              <p className="text-[10px] text-gray-500">Los cambios se ven al instante en la vista previa</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/mobile/${slug}`}
              target="_blank"
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <FiSmartphone className="text-xs" />
              <span>Ver App Real</span>
            </Link>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios ✨'}
            </button>
          </div>
        </div>
      </header>

      {message && (
        <div className="bg-emerald-600 text-white text-center py-2.5 text-xs font-bold shadow-md sticky top-[57px] z-40 flex items-center justify-center gap-2">
          <FiCheck className="text-sm" />
          <span>{message}</span>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL: EDITOR + VISTA PREVIA */}
      <main className="max-w-7xl mx-auto px-4 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: PESTAÑAS SIMPLES */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm gap-1">
            <button
              onClick={() => setActiveTab('estilo')}
              className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'estilo' ? 'bg-emerald-700 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiStar className="text-sm" />
              <span>1. Estilo & Apariencia</span>
            </button>
            <button
              onClick={() => setActiveTab('contenido')}
              className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'contenido' ? 'bg-emerald-700 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiLayout className="text-sm" />
              <span>2. Secciones & Promos</span>
            </button>
          </div>

          {/* ================= SECCIÓN 1: ESTILO Y APARIENCIA ================= */}
          {activeTab === 'estilo' && (
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              
              <div>
                <h2 className="text-sm font-extrabold text-gray-900">✨ Elige un Estilo Rápido (Recomendado)</h2>
                <p className="text-xs text-gray-500 mt-0.5">Haz clic en un diseño para aplicarlo al instante en tu app.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VISUAL_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="p-3.5 rounded-2xl border-2 border-gray-200 hover:border-emerald-600 cursor-pointer transition bg-gray-50 hover:bg-emerald-50/30 flex items-center justify-between group"
                  >
                    <div>
                      <h3 className="font-bold text-xs text-gray-900 group-hover:text-emerald-800">{preset.name}</h3>
                      <p className="text-[10px] text-gray-500 mt-0.5">{preset.desc}</p>
                    </div>
                    <div className="flex gap-1">
                      <span className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: preset.primary }} />
                      <span className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: preset.accent }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">O personaliza tus propios colores</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Color Principal</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-9 h-9 rounded-xl cursor-pointer border-0 bg-transparent" />
                      <span className="text-xs font-mono text-gray-600">{primaryColor}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Color de Botones</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={buttonColor} onChange={(e) => setButtonColor(e.target.value)} className="w-9 h-9 rounded-xl cursor-pointer border-0 bg-transparent" />
                      <span className="text-xs font-mono text-gray-600">{buttonColor}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Fondo de la App</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-9 h-9 rounded-xl cursor-pointer border-0 bg-transparent" />
                      <span className="text-xs font-mono text-gray-600">{secondaryColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* NOMBRE Y LOGOTIPO CON CARGA DIRECTA Y ELIMINAR */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Nombre y Logotipo del Negocio</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre Comercial</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Logotipo del Local</label>
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-300 flex-shrink-0">
                          <img src={avatarUrl} alt="Logo" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setAvatarUrl('')}
                            className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition"
                            title="Eliminar logo"
                          >
                            <FiX className="text-sm" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                          Sin logo
                        </div>
                      )}

                      <label className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl cursor-pointer transition text-xs font-bold text-gray-700">
                        {uploadingImg === 'avatar' ? (
                          <FiLoader className="animate-spin text-sm text-emerald-600" />
                        ) : (
                          <>
                            <FiUploadCloud className="text-sm text-emerald-600" />
                            <span>{avatarUrl ? 'Cambiar Logo' : 'Subir Imagen'}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'avatar')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================= SECCIÓN 2: SECCIONES Y PROMOS ================= */}
          {activeTab === 'contenido' && (
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              
              <div>
                <h2 className="text-sm font-extrabold text-gray-900">¿Qué quieres mostrar en la pantalla de inicio?</h2>
                <p className="text-xs text-gray-500 mt-0.5">Activa o desactiva bloques con un solo clic.</p>
              </div>

              <div className="space-y-2.5">
                {[
                  { key: 'welcomeBanner', label: '👋 Saludo y Puntos (Mogu Travel)' },
                  { key: 'promoCarousel', label: '🖼️ Banners Promocionales Superiores' },
                  { key: 'dailySpecial', label: '🔥 Plato del Día (Destacado)' },
                  { key: 'favorites', label: '⭐ Los Más Pedidos / Favoritos' },
                ].map((sec) => (
                  <label key={sec.key} className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 transition">
                    <span className="text-xs font-bold text-gray-800">{sec.label}</span>
                    <input
                      type="checkbox"
                      checked={sectionsConfig[sec.key]}
                      onChange={(e) => setSectionsConfig({ ...sectionsConfig, [sec.key]: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-0 cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-3">
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">Mensaje de Saludo para tus Clientes</label>
                <input
                  type="text"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Ej. ¡Hola, Viajero!"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs outline-none"
                />
              </div>

              {/* BANNERS CON CARGA DIRECTA Y ELIMINAR */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Banners Publicitarios</h3>
                  <button
                    type="button"
                    onClick={addBanner}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <FiPlus className="text-sm" />
                    <span>Añadir Banner</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {banners.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-4">No hay banners creados. Añade uno arriba.</p>
                  ) : (
                    banners.map((banner, index) => (
                      <div key={banner.id} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3 relative">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Banner #{index + 1}</span>
                          <button type="button" onClick={() => removeBanner(index)} className="text-gray-400 hover:text-red-600 p-1">
                            <FiTrash2 className="text-xs" />
                          </button>
                        </div>
                        
                        <input
                          type="text"
                          value={banner.title}
                          onChange={(e) => updateBanner(index, 'title', e.target.value)}
                          placeholder="Título del banner (ej. ¡20% OFF en Pizzas!)"
                          className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none"
                        />

                        {/* Imagen del Banner con Carga Directa y Eliminar */}
                        <div className="flex items-center gap-3 pt-1">
                          {banner.image ? (
                            <div className="relative w-20 h-12 rounded-xl overflow-hidden border border-gray-300 flex-shrink-0">
                              <img src={banner.image} alt="Banner" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => updateBanner(index, 'image', '')}
                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition"
                                title="Eliminar imagen"
                              >
                                <FiX className="text-sm" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-20 h-12 rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[10px] flex-shrink-0">
                              Sin imagen
                            </div>
                          )}

                          <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl cursor-pointer transition text-xs font-bold text-gray-700 shadow-sm">
                            {uploadingImg === `banner-${index}` ? (
                              <FiLoader className="animate-spin text-sm text-emerald-600" />
                            ) : (
                              <>
                                <FiUploadCloud className="text-sm text-emerald-600" />
                                <span>{banner.image ? 'Cambiar Foto' : 'Subir Fotografía'}</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner', index)}
                              className="hidden"
                            />
                          </label>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SELECCIÓN COMERCIAL */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Plato del Día y Favoritos</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Selecciona el Plato del Día</label>
                  <select
                    value={dailySpecialId}
                    onChange={(e) => setDailySpecialId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs outline-none font-medium cursor-pointer"
                  >
                    <option value="">-- Ningún plato destacado --</option>
                    {menuItems.map(item => (
                      <option key={item.id} value={item.id}>{item.name} (${item.price})</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* COLUMNA DERECHA: SIMULADOR MÓVIL EN TIEMPO REAL */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-20 w-full max-w-sm bg-gray-900 border-[8px] border-gray-800 rounded-[48px] p-4 shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-4 bg-black rounded-full z-30" />

            <div 
              className={`rounded-[36px] pt-10 pb-6 px-3.5 min-h-[620px] flex flex-col justify-between relative overflow-y-auto max-h-[75vh] transition-all ${borderRadius} ${shadowStyle}`}
              style={{ backgroundColor: secondaryColor }}
            >
              
              <div className="space-y-3.5">
                
                {/* Header Simulado */}
                <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-black/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 overflow-hidden border">
                      {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-xs">🏢</span>}
                    </div>
                    <div>
                      <h4 className="text-xs font-black truncate max-w-[120px]">{fullName || 'Tu Negocio'}</h4>
                      <p className="text-[9px] text-gray-500">Recoger en Local</p>
                    </div>
                  </div>
                  <div className="bg-emerald-800 text-white text-[10px] font-bold px-2 py-1 rounded-xl">
                    🛒 0
                  </div>
                </div>

                {/* 1. Saludo */}
                {sectionsConfig.welcomeBanner && (
                  <div className="p-3 rounded-2xl text-white shadow-sm flex justify-between items-center" style={{ backgroundColor: primaryColor }}>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded font-bold">Mogu Travel</span>
                      <h5 className="font-bold text-xs mt-0.5">{welcomeMessage}</h5>
                    </div>
                    <span className="text-xs font-black bg-white/10 px-2 py-1 rounded-xl">⭐ 0 Pts</span>
                  </div>
                )}

                {/* 2. Banner */}
                {sectionsConfig.promoCarousel && (
                  <div className="relative rounded-2xl overflow-hidden h-32 bg-gray-800 text-white shadow">
                    {banners.length > 0 && banners[0].image ? (
                      <img src={banners[0].image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-emerald-800 to-teal-700 text-white font-bold text-xs p-2 text-center">
                        {banners[0]?.title || '¡Promoción Destacada!'}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Plato del Día */}
                {sectionsConfig.dailySpecial && (
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-black/5">
                    <span className="text-[10px] font-black text-emerald-700 block mb-1.5">🔥 Plato del Día</span>
                    <div className="h-20 bg-gray-100 rounded-xl overflow-hidden mb-2 flex items-center justify-center text-[10px] text-gray-400">
                      Fotografía del Plato
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold">Especial de la Casa</p>
                        <p className="text-[10px] text-gray-500">$9.990</p>
                      </div>
                      <span className="text-[10px] text-white px-3 py-1 rounded-lg font-bold" style={{ backgroundColor: buttonColor }}>+ Pedir</span>
                    </div>
                  </div>
                )}

              </div>

              <div className="mt-4 pt-2 border-t border-black/5 text-center">
                <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Vista Previa Interactiva</span>
              </div>

            </div>

          </div>
        </div>

      </main>

    </div>
  );
}