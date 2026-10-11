'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { FaArrowLeft, FaPlus, FaTrash, FaEye, FaEyeSlash, FaShoppingBag, FaUpload } from 'react-icons/fa'

interface Profile {
  id: string
  slug: string
  full_name: string
}

interface CatalogCategory {
  id: string
  name: string
  position: number
}

interface CatalogItem {
  id: string
  category_id: string
  name: string
  description: string | null
  price: string | null
  image_url: string | null
  active: boolean
  position: number
}

export default function CatalogAdminEditor() {
  const params = useParams()
  const slug = params?.slug as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [categories, setCategories] = useState<CatalogCategory[]>([])
  const [items, setItems] = useState<CatalogItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [savingCategory, setSavingCategory] = useState(false)
  const [savingItem, setSavingItem] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Formularios
  const [newCatName, setNewCatName] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemDesc, setNewItemDesc] = useState('')
  const [newItemImage, setNewItemImage] = useState('')

  useEffect(() => {
    async function loadAdminData() {
      if (!slug) return
      setLoading(true)

      // 1. Obtener Perfil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, slug, full_name')
        .eq('slug', slug)
        .single()

      if (profileData) {
        setProfile(profileData)

        // 2. Obtener Categorías
        const { data: catsData } = await supabase
          .from('catalogo_categories')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('position', { ascending: true })

        if (catsData && catsData.length > 0) {
          setCategories(catsData)
          setSelectedCategory(catsData[0].id)

          // 3. Obtener Productos
          const catIds = catsData.map((c) => c.id)
          const { data: itemsData } = await supabase
            .from('catalogo_items')
            .select('*')
            .in('category_id', catIds)
            .order('position', { ascending: true })

          if (itemsData) setItems(itemsData)
        }
      }
      setLoading(false)
    }

    loadAdminData()
  }, [slug])

  // Crear nueva categoría
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !newCatName.trim()) return

    setSavingCategory(true)
    const newPosition = categories.length + 1

    const { data, error } = await supabase
      .from('catalogo_categories')
      .insert([
        {
          profile_id: profile.id,
          name: newCatName.trim(),
          position: newPosition,
        },
      ])
      .select()

    setSavingCategory(false)

    if (error) {
      alert(`Error al crear categoría: ${error.message}`)
    } else if (data && data.length > 0) {
      setCategories([...categories, data[0]])
      if (!selectedCategory) setSelectedCategory(data[0].id)
      setNewCatName('')
    }
  }

  // Eliminar categoría
  const handleDeleteCategory = async (catId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría y todos sus productos?')) return

    const { error } = await supabase.from('catalogo_categories').delete().eq('id', catId)

    if (!error) {
      const updatedCats = categories.filter((c) => c.id !== catId)
      setCategories(updatedCats)
      setItems(items.filter((i) => i.category_id !== catId))
      if (selectedCategory === catId) {
        setSelectedCategory(updatedCats.length > 0 ? updatedCats[0].id : null)
      }
    }
  }

  // Subir foto del producto a Supabase
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    try {
      setUploadingImage(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `item-${profile.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setNewItemImage(publicUrl)
      setUploadingImage(false)
    } catch (error: any) {
      alert(`Error al subir imagen: ${error.message}`)
      setUploadingImage(false)
    }
  }

  // Crear nuevo producto
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory || !newItemName.trim()) {
      alert('Ingresa al menos el nombre del producto.')
      return
    }

    setSavingItem(true)
    const categoryItems = items.filter((i) => i.category_id === selectedCategory)

    const { data, error } = await supabase
      .from('catalogo_items')
      .insert([
        {
          category_id: selectedCategory,
          name: newItemName.trim(),
          price: newItemPrice.trim() || null,
          description: newItemDesc.trim() || null,
          image_url: newItemImage.trim() || null,
          active: true,
          position: categoryItems.length + 1,
        },
      ])
      .select()

    setSavingItem(false)

    if (error) {
      alert(`Error al crear producto: ${error.message}`)
    } else if (data && data.length > 0) {
      setItems([...items, data[0]])
      setNewItemName('')
      setNewItemPrice('')
      setNewItemDesc('')
      setNewItemImage('')
    }
  }

  // Alternar Visibilidad Activo/Inactivo
  const toggleItemActive = async (item: CatalogItem) => {
    const { error } = await supabase
      .from('catalogo_items')
      .update({ active: !item.active })
      .eq('id', item.id)

    if (!error) {
      setItems(items.map((i) => (i.id === item.id ? { ...i, active: !item.active } : i)))
    }
  }

  // Eliminar producto
  const handleDeleteItem = async (itemId: string) => {
    const { error } = await supabase.from('catalogo_items').delete().eq('id', itemId)
    if (!error) {
      setItems(items.filter((i) => i.id !== itemId))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-slate-500/20 border-t-slate-200 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white font-sans pb-24">
      
      {/* NAVBAR */}
      <header className="border-b border-neutral-800 bg-[#0A0A0C]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/${slug}`}
              className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white transition"
            >
              <FaArrowLeft className="text-xs" />
            </Link>
            <div>
              <h1 className="text-xs font-black uppercase tracking-wider text-slate-400">Editor de Tienda Online</h1>
              <p className="text-sm font-bold text-white">{profile?.full_name || slug}</p>
            </div>
          </div>

          <Link
            href={`/catalogo/${slug}`}
            target="_blank"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-extrabold text-white rounded-xl transition flex items-center gap-2 shadow-lg"
          >
            <span>Ver Tienda en Vivo ↗</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: GESTIÓN DE CATEGORÍAS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-xl shadow-2xl">
            <h2 className="text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <FaShoppingBag className="text-slate-400" /> Categorías del Catálogo
            </h2>

            {/* Formulario Nueva Categoría */}
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Ej. Poleras, Accesorios..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-slate-400 outline-none"
              />
              <button
                type="submit"
                disabled={savingCategory}
                className="px-4 py-2 bg-slate-200 hover:bg-white text-black font-black text-xs rounded-xl transition cursor-pointer"
              >
                +
              </button>
            </form>

            {/* Lista de Categorías */}
            <div className="space-y-2">
              {categories.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-4">No has agregado categorías aún.</p>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-slate-800/80 border-slate-400 text-white shadow-lg'
                        : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold">{cat.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCategory(cat.id)
                      }}
                      className="text-neutral-500 hover:text-rose-400 p-1.5 transition"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: GESTIÓN DE PRODUCTOS DE LA CATEGORÍA SELECCIONADA */}
        <div className="lg:col-span-8 space-y-6">
          {!selectedCategory ? (
            <div className="p-12 text-center border border-dashed border-neutral-800 rounded-3xl text-neutral-500 text-xs">
              Selecciona o crea una categoría a la izquierda para administrar sus productos.
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-xl shadow-2xl space-y-6">
              
              <h2 className="text-sm font-black uppercase tracking-wider text-white border-b border-neutral-800 pb-3">
                Agregar Producto a "{categories.find((c) => c.id === selectedCategory)?.name}"
              </h2>

              {/* Formulario Agregar Producto */}
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre del Producto (ej. Chaqueta Oversize)"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-slate-400 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Precio (ej. $29.990)"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-slate-400 outline-none"
                  />
                </div>

                <textarea
                  rows={2}
                  placeholder="Descripción del producto (materiales, tallas, estilo...)"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-slate-400 outline-none resize-none"
                />

                {/* Subida / URL de Imagen */}
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <input
                    type="text"
                    placeholder="URL de la Foto (https://...)"
                    value={newItemImage}
                    onChange={(e) => setNewItemImage(e.target.value)}
                    className="flex-1 w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-slate-400 outline-none"
                  />
                  <label className="w-full sm:w-auto px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-bold text-white rounded-xl cursor-pointer transition flex items-center justify-center gap-2">
                    <FaUpload className="text-xs" />
                    <span>{uploadingImage ? 'Subiendo...' : 'Subir Imagen'}</span>
                    <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
                  </label>
                </div>

                {newItemImage && (
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-950">
                    <img src={newItemImage} alt="Previsualización" className="w-full h-full object-cover" />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingItem}
                  className="w-full py-3 bg-slate-200 hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg cursor-pointer"
                >
                  {savingItem ? 'Guardando...' : '+ Guardar Producto en Catálogo'}
                </button>
              </form>

              {/* Lista de Productos de la Categoría */}
              <div className="pt-6 border-t border-neutral-800 space-y-3">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Productos Guardados
                </h3>

                {items.filter((i) => i.category_id === selectedCategory).length === 0 ? (
                  <p className="text-xs text-neutral-500 py-4">No hay productos guardados en esta categoría.</p>
                ) : (
                  items
                    .filter((i) => i.category_id === selectedCategory)
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 bg-neutral-950 border rounded-2xl flex items-center justify-between gap-4 transition ${
                          item.active ? 'border-neutral-800' : 'border-neutral-800/40 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {item.image_url ? (
                            <img src={item.image_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-lg flex-shrink-0">
                              🛍️
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                            <p className="text-[10px] text-neutral-400 truncate">{item.description || 'Sin descripción'}</p>
                            <span className="text-xs font-black text-slate-300">{item.price || 'Sin precio'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleItemActive(item)}
                            className={`p-2 rounded-xl border text-xs transition cursor-pointer ${
                              item.active
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
                            }`}
                            title={item.active ? 'Visible en catálogo' : 'Oculto'}
                          >
                            {item.active ? <FaEye /> : <FaEyeSlash />}
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs transition cursor-pointer"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>

            </div>
          )}
        </div>

      </main>
    </div>
  )
}