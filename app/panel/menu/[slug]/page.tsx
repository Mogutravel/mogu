'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Profile {
  id: string
  slug: string
  full_name?: string
  name?: string
  has_menu?: boolean
  menu_style?: 'modern' | 'classic' | 'cards'
}

interface MenuItem {
  id: string
  category_id: string
  name: string
  description: string | null
  price: string | null
  image_url: string | null
  active: boolean
  position: number
}

interface MenuCategory {
  id: string
  name: string
  position: number
  items: MenuItem[]
}

export default function HauteCuisineAdminPanel() {
  const params = useParams()
  const slug = params?.slug as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [savingGlobal, setSavingGlobal] = useState(false)
  const [message, setMessage] = useState('')

  // Estados de formularios
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [itemName, setItemName] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [itemImageFile, setItemImageFile] = useState<File | null>(null)
  const [submittingItem, setSubmittingItem] = useState(false)

  useEffect(() => {
    async function loadAdminData() {
      if (!slug) return
      setLoading(true)

      try {
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', slug)
          .maybeSingle()

        if (!profileData) {
          const { data: fallback } = await supabase
            .from('profiles')
            .select('*')
            .ilike('full_name', `%${slug}%`)
            .maybeSingle()
          profileData = fallback
        }

        if (profileError || !profileData) {
          console.error('Error al cargar perfil:', profileError)
          setLoading(false)
          return
        }

        setProfile(profileData)

        // Cargar categorías
        const { data: catsData } = await supabase
          .from('menu_categories')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('position', { ascending: true })

        if (catsData && catsData.length > 0) {
          const catIds = catsData.map((c) => c.id)
          const { data: itemsData } = await supabase
            .from('menu_items')
            .select('*')
            .in('category_id', catIds)
            .order('position', { ascending: true })

          const catsWithItems = catsData.map((cat) => ({
            ...cat,
            items: itemsData?.filter((i) => i.category_id === cat.id) || [],
          }))

          setCategories(catsWithItems)
          setSelectedCategoryId(catsData[0].id)
        }
      } catch (err) {
        console.error('Error inicializando panel:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [slug])

  // Guardar configuración general del establecimiento y estilo seleccionado
  const handleSaveAllChanges = async () => {
    if (!profile) return
    setSavingGlobal(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({
        menu_style: profile.menu_style || 'modern',
        has_menu: profile.has_menu ?? true,
      })
      .eq('id', profile.id)

    setSavingGlobal(false)

    if (error) {
      setMessage(`❌ Error al guardar: ${error.message}`)
    } else {
      setMessage('✨ ¡Estilo y configuración actualizados con éxito en la carta pública!')
      setTimeout(() => setMessage(''), 4000)
    }
  }

  // Crear Categoría / Sección
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !newCategoryName.trim()) return

    const { data, error } = await supabase
      .from('menu_categories')
      .insert([{ profile_id: profile.id, name: newCategoryName.trim(), position: categories.length + 1 }])
      .select()

    if (error) {
      alert(`Error al crear sección: ${error.message}`)
      return
    }

    if (data && data.length > 0) {
      const newCat = { ...data[0], items: [] }
      setCategories([...categories, newCat])
      setNewCategoryName('')
      if (!selectedCategoryId) setSelectedCategoryId(newCat.id)
      setMessage('✨ Sección creada correctamente.')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  // Crear Plato con gestión de imagen y almacenamiento
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategoryId || !itemName.trim()) {
      alert('Por favor selecciona una sección y asigna un nombre al plato.')
      return
    }

    setSubmittingItem(true)
    setMessage('Subiendo creación y optimizando imagen...')
    let finalImageUrl = null

    try {
      if (itemImageFile) {
        const fileExt = itemImageFile.name.split('.').pop()
        const fileName = `dish-${Date.now()}-${Math.random()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(fileName, itemImageFile, { upsert: true })

        if (uploadError) {
          const { error: fallbackError } = await supabase.storage
            .from('avatars')
            .upload(fileName, itemImageFile, { upsert: true })
          
          if (!fallbackError) {
            const { data: pub } = supabase.storage.from('avatars').getPublicUrl(fileName)
            finalImageUrl = pub.publicUrl
          }
        } else {
          const { data: pub } = supabase.storage.from('menu-images').getPublicUrl(fileName)
          finalImageUrl = pub.publicUrl
        }
      }

      const { data, error } = await supabase
        .from('menu_items')
        .insert([{
          category_id: selectedCategoryId,
          name: itemName.trim(),
          description: itemDescription.trim() || null,
          price: itemPrice.trim() || null,
          image_url: finalImageUrl,
          active: true,
          position: 99,
        }])
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setCategories(categories.map((cat) => {
          if (cat.id === selectedCategoryId) {
            return { ...cat, items: [...cat.items, data[0]] }
          }
          return cat
        }))
        setItemName('')
        setItemDescription('')
        setItemPrice('')
        setItemImageFile(null)
        setMessage('🚀 ¡Plato publicado con éxito en el menú!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (err: any) {
      alert(`Error al añadir plato: ${err.message}`)
    } finally {
      setSubmittingItem(false)
    }
  }

  // Alternar visibilidad (Visible / Oculto)
  const handleToggleActive = async (itemId: string, currentActive: boolean, catId: string) => {
    const { error } = await supabase
      .from('menu_items')
      .update({ active: !currentActive })
      .eq('id', itemId)

    if (error) {
      alert(`Error al actualizar estado: ${error.message}`)
      return
    }

    setCategories(categories.map((cat) => {
      if (cat.id === catId) {
        return {
          ...cat,
          items: cat.items.map((i) => i.id === itemId ? { ...i, active: !currentActive } : i),
        }
      }
      return cat
    }))
  }

  // Eliminar plato permanentemente
  const handleDeleteItem = async (itemId: string, catId: string) => {
    if (!confirm('¿Estás seguro de eliminar este plato? Se removerá permanentemente de la carta.')) return
    
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      alert(`❌ Error al eliminar en Supabase: ${error.message}`)
      return
    }

    setCategories(categories.map((cat) => {
      if (cat.id === catId) {
        return { ...cat, items: cat.items.filter((i) => i.id !== itemId) }
      }
      return cat
    }))

    setMessage('🗑️ Plato eliminado correctamente.')
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#110E0D] text-[#E8E2D9] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border border-[#B08968]/30 border-t-[#B08968] animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#110E0D] text-[#E8E2D9] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h1 className="font-serif text-xl">Establecimiento no encontrado</h1>
        <Link href="/" className="px-5 py-2.5 bg-[#26201D] text-xs font-serif rounded-full text-[#B08968]">Volver al Inicio</Link>
      </div>
    )
  }

  const currentStyle = profile.menu_style || 'modern'

  return (
    <div className="min-h-screen bg-[#110E0D] text-[#E8E2D9] font-sans selection:bg-[#B08968]/30 pb-32">
      
      {/* NAVBAR SUPERIOR */}
      <header className="border-b border-[#26201D] bg-[#110E0D]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-serif uppercase tracking-[0.3em] text-[#B08968]">MOGU Studio • Panel Pro</span>
            <h1 className="font-serif text-lg tracking-wide text-[#F4F0EB]">{profile.full_name || slug}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href={`/menu/${slug}`} 
              target="_blank" 
              className="px-5 py-2 bg-[#B08968] hover:bg-[#9E7A5A] text-[#110E0D] font-serif font-bold text-xs rounded-full transition shadow-lg flex items-center gap-1.5"
            >
              <span>Ver Menú Público ↗</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10 space-y-10">

        {message && (
          <div className="p-4 rounded-2xl bg-[#B08968]/10 text-xs font-serif text-[#B08968] border border-[#B08968]/30 shadow-xl">
            {message}
          </div>
        )}

        {/* SECCIÓN DE CONFIGURACIÓN Y SELECTOR DE ESTILOS */}
        <div className="p-8 rounded-3xl bg-[#161210] border border-[#26201D] shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#26201D] pb-6">
            <div>
              <h2 className="font-serif text-base text-[#F4F0EB]">Identidad y Estilo Visual del Menú</h2>
              <p className="text-xs text-[#9C9289] font-light mt-1">Elige cómo se presentará la carta a tus comensales y controla su visibilidad.</p>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-[#1A1513] px-4 py-2.5 rounded-2xl border border-[#382F2A]">
                <input
                  type="checkbox"
                  checked={profile.has_menu ?? true}
                  onChange={(e) => setProfile({ ...profile, has_menu: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#B08968] cursor-pointer"
                />
                <span className="text-xs font-serif text-[#E8E2D9]">Menú Público Activo</span>
              </label>

              <button
                type="button"
                disabled={savingGlobal}
                onClick={handleSaveAllChanges}
                className="px-6 py-3 bg-[#B08968] hover:bg-[#9E7A5A] text-[#110E0D] font-serif font-bold text-xs uppercase tracking-widest rounded-full transition shadow-lg cursor-pointer disabled:opacity-50"
              >
                {savingGlobal ? 'Guardando...' : '💾 Guardar Cambios'}
              </button>
            </div>
          </div>

          {/* Selector Visual de 3 Estilos */}
          <div className="space-y-3">
            <label className="block text-[10px] font-serif uppercase tracking-widest text-[#B08968]">Selecciona el Estilo de tu Carta</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Estilo 1: Moderno */}
              <div 
                onClick={() => setProfile({ ...profile, menu_style: 'modern' })}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                  currentStyle === 'modern' 
                    ? 'bg-[#1A1513] border-[#B08968] shadow-[0_0_20px_rgba(176,137,104,0.15)]' 
                    : 'bg-[#14110F] border-[#26201D] hover:border-[#382F2A]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-bold text-[#F4F0EB]">Estilo Moderno</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${currentStyle === 'modern' ? 'border-[#B08968] bg-[#B08968]' : 'border-[#382F2A]'}`}>
                      {currentStyle === 'modern' && <span className="w-1.5 h-1.5 rounded-full bg-[#110E0D]" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9C9289] font-light leading-relaxed">
                    Diseño limpio y minimalista con buscador rápido, ideal para bistrós contemporáneos y cafeterías de autor.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#26201D] text-[10px] font-serif text-[#B08968] uppercase tracking-wider">
                  Configurado para UX ágil
                </div>
              </div>

              {/* Estilo 2: Clásico */}
              <div 
                onClick={() => setProfile({ ...profile, menu_style: 'classic' })}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                  currentStyle === 'classic' 
                    ? 'bg-[#1A1513] border-[#B08968] shadow-[0_0_20px_rgba(176,137,104,0.15)]' 
                    : 'bg-[#14110F] border-[#26201D] hover:border-[#382F2A]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-bold text-[#F4F0EB]">Estilo Clásico</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${currentStyle === 'classic' ? 'border-[#B08968] bg-[#B08968]' : 'border-[#382F2A]'}`}>
                      {currentStyle === 'classic' && <span className="w-1.5 h-1.5 rounded-full bg-[#110E0D]" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9C9289] font-light leading-relaxed">
                    Elegancia tradicional con tipografía serif prominente, estructurada para restaurantes de alta cocina formal.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#26201D] text-[10px] font-serif text-[#B08968] uppercase tracking-wider">
                  Enfoque gastronómico puro
                </div>
              </div>

              {/* Estilo 3: Tarjetas Editorial */}
              <div 
                onClick={() => setProfile({ ...profile, menu_style: 'cards' })}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                  currentStyle === 'cards' 
                    ? 'bg-[#1A1513] border-[#B08968] shadow-[0_0_20px_rgba(176,137,104,0.15)]' 
                    : 'bg-[#14110F] border-[#26201D] hover:border-[#382F2A]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-bold text-[#F4F0EB]">Tarjetas Editorial</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${currentStyle === 'cards' ? 'border-[#B08968] bg-[#B08968]' : 'border-[#382F2A]'}`}>
                      {currentStyle === 'cards' && <span className="w-1.5 h-1.5 rounded-full bg-[#110E0D]" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9C9289] font-light leading-relaxed">
                    Formato tipo revista de lujo con fotografía protagonista en grande y diseño inmersivo para destacar platos estrella.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#26201D] text-[10px] font-serif text-[#B08968] uppercase tracking-wider">
                  Alto impacto visual
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* GRID DE GESTIÓN DE SECCIONES Y PLATOS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* FORMULARIOS DE CREACIÓN (7 COLUMNAS) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* CREAR SECCIÓN */}
            <div className="p-8 rounded-3xl bg-[#161210] border border-[#26201D] shadow-2xl space-y-4">
              <div>
                <h2 className="font-serif text-sm text-[#F4F0EB]">1. Crear Sección del Menú</h2>
                <p className="text-xs text-[#9C9289] font-light">Ej: Entradas, Principales, Coctelería.</p>
              </div>
              
              <form onSubmit={handleAddCategory} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Nombre de la sección"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-[#1A1513] border border-[#382F2A] rounded-full px-5 py-3 text-xs text-[#E8E2D9] focus:border-[#B08968] outline-none transition"
                />
                <button type="submit" className="px-6 py-3 bg-[#26201D] hover:bg-[#382F2A] border border-[#382F2A] text-[#B08968] font-serif text-xs uppercase tracking-wider rounded-full transition cursor-pointer shadow flex-shrink-0">
                  + Crear Sección
                </button>
              </form>
            </div>

            {/* CREAR PLATO */}
            <div className="p-8 rounded-3xl bg-[#161210] border border-[#26201D] shadow-2xl space-y-4">
              <div>
                <h2 className="font-serif text-sm text-[#F4F0EB]">2. Agregar Plato o Creación</h2>
                <p className="text-xs text-[#9C9289] font-light">Sube fotografía de alta calidad, define la descripción e ingredientes.</p>
              </div>

              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-serif uppercase tracking-widest text-[#9C9289] mb-1.5">Sección de Destino</label>
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="w-full bg-[#1A1513] border border-[#382F2A] rounded-2xl px-4 py-3 text-xs text-[#E8E2D9] focus:border-[#B08968] outline-none cursor-pointer"
                    >
                      {categories.length === 0 ? (
                        <option value="">Crea una sección primero</option>
                      ) : (
                        categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-serif uppercase tracking-widest text-[#9C9289] mb-1.5">Nombre del Plato</label>
                    <input
                      type="text"
                      placeholder="Ej: Risotto de Hongos"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full bg-[#1A1513] border border-[#382F2A] rounded-2xl px-4 py-3 text-xs text-[#E8E2D9] focus:border-[#B08968] outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-serif uppercase tracking-widest text-[#9C9289] mb-1.5">Precio</label>
                    <input
                      type="text"
                      placeholder="Ej: $14.500"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      className="w-full bg-[#1A1513] border border-[#382F2A] rounded-2xl px-4 py-3 text-xs text-[#E8E2D9] focus:border-[#B08968] outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-serif uppercase tracking-widest text-[#9C9289] mb-1.5">Fotografía</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setItemImageFile(e.target.files?.[0] || null)}
                      className="w-full bg-[#1A1513] border border-[#382F2A] rounded-2xl px-3 py-2.5 text-xs text-[#9C9289] file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-serif file:bg-[#B08968] file:text-[#110E0D] hover:file:bg-[#9E7A5A] cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-serif uppercase tracking-widest text-[#9C9289] mb-1.5">Descripción Breve</label>
                  <textarea
                    rows={2}
                    placeholder="Ingredientes y notas de cata..."
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    className="w-full bg-[#1A1513] border border-[#382F2A] rounded-2xl px-4 py-3 text-xs text-[#E8E2D9] focus:border-[#B08968] outline-none transition resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    disabled={submittingItem}
                    className="w-full py-3.5 bg-[#B08968] hover:bg-[#9E7A5A] text-[#110E0D] font-serif font-bold text-xs uppercase tracking-widest rounded-full transition shadow-xl cursor-pointer disabled:opacity-50"
                  >
                    {submittingItem ? 'Subiendo...' : '✨ Publicar Plato en la Carta'}
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* VISTA EN VIVO Y GESTIÓN DE PLATOS (5 COLUMNAS) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              <div className="p-6 rounded-3xl bg-[#161210] border border-[#26201D] shadow-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-[#26201D] pb-3">
                  <h3 className="font-serif text-xs uppercase tracking-widest text-[#B08968]">Gestión y Vista en Vivo</h3>
                  <span className="px-2.5 py-1 bg-[#B08968]/10 text-[#B08968] text-[10px] font-serif rounded-full">Sincronizado</span>
                </div>

                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1">
                  {categories.length === 0 ? (
                    <p className="text-xs text-[#9C9289] text-center py-10 font-serif">Crea secciones y platos para administrarlos aquí.</p>
                  ) : (
                    categories.map((cat) => (
                      <div key={cat.id} className="space-y-3">
                        <h4 className="text-[11px] font-serif uppercase tracking-widest text-[#B08968] px-1">{cat.name}</h4>
                        {cat.items.length === 0 ? (
                          <p className="text-[10px] text-[#7A7067] pl-1 italic">Sin platos en esta sección.</p>
                        ) : (
                          cat.items.map((item) => (
                            <div 
                              key={item.id}
                              className="bg-[#1A1513] border border-[#26201D] rounded-2xl p-4 transition-all duration-300 hover:border-[#B08968]/40 space-y-3 shadow-inner"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  {item.image_url ? (
                                    <img src={item.image_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-[#382F2A] flex-shrink-0" />
                                  ) : (
                                    <div className="w-12 h-12 rounded-xl bg-[#110E0D] border border-[#26201D] flex items-center justify-center text-sm flex-shrink-0">🍽️</div>
                                  )}
                                  <div>
                                    <h5 className="font-serif text-xs text-[#F4F0EB]">{item.name}</h5>
                                    <p className="text-[10px] text-[#9C9289] line-clamp-1 mt-0.5">{item.description || 'Sin descripción'}</p>
                                  </div>
                                </div>
                                <span className="font-serif text-xs font-semibold text-[#B08968] whitespace-nowrap">
                                  {item.price || 'Gratis'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-[#26201D]">
                                <button
                                  type="button"
                                  onClick={() => handleToggleActive(item.id, item.active, cat.id)}
                                  className={`text-[10px] font-serif px-2.5 py-1 rounded-lg transition cursor-pointer ${
                                    item.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[#26201D] text-[#9C9289]'
                                  }`}
                                >
                                  {item.active ? '● Visible' : '○ Oculto'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(item.id, cat.id)}
                                  className="text-[10px] font-serif text-red-400 hover:text-red-300 transition cursor-pointer"
                                >
                                  Eliminar Plato 🗑️
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  )
}