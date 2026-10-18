'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  FiSearch, 
  FiPlus, 
  FiEye, 
  FiEyeOff, 
  FiTrash2, 
  FiCamera, 
  FiX, 
  FiShoppingBag, 
  FiExternalLink,
  FiCheck,
  FiLoader,
  FiEdit3,
  FiImage
} from 'react-icons/fi'

interface Profile {
  id: string
  slug: string
  full_name?: string
  avatar_url?: string | null
  catalog_hero_image?: string | null
  has_catalogo?: boolean
}

interface CatalogoItem {
  id: string
  category_id: string
  name: string
  description: string | null
  price: string | number | null
  image_url: string | null
  active: boolean
  position: number
}

interface CatalogoCategory {
  id: string
  name: string
  position: number
  items: CatalogoItem[]
}

export default function AppleStyleStoreAdminPanel() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [categories, setCategories] = useState<CatalogoCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // Carga de Portada / Hero Image y Avatar
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Búsqueda y Filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all')

  // Modal para Productos
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null)
  
  // Formulario Producto
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formImageFile, setFormImageFile] = useState<File | null>(null)
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null)
  const [submittingItem, setSubmittingItem] = useState(false)

  // Crear Categoría
  const [newCatName, setNewCatName] = useState('')
  const [isCreatingCat, setIsCreatingCat] = useState(false)

  // Cargar datos desde Supabase
  useEffect(() => {
    async function loadData() {
      if (!slug) return
      setLoading(true)

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        let { data: profileData } = await supabase
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

        if (!profileData) {
          setLoading(false)
          return
        }

        setProfile(profileData)

        const { data: catsData } = await supabase
          .from('catalogo_categories')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('position', { ascending: true })

        if (catsData && catsData.length > 0) {
          const catIds = catsData.map((c) => c.id)
          const { data: itemsData } = await supabase
            .from('catalogo_items')
            .select('*')
            .in('category_id', catIds)
            .order('position', { ascending: true })

          const catsWithItems = catsData.map((cat) => ({
            ...cat,
            items: itemsData?.filter((i) => i.category_id === cat.id) || [],
          }))

          setCategories(catsWithItems)
          if (!formCategoryId) setFormCategoryId(catsData[0].id)
        }
      } catch (err) {
        console.error('Error cargando tienda:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [slug, router])

  // --- SUBIR / CAMBIAR IMAGEN HERO DE CATÁLOGO (catalog_hero_image) ---
  const handleHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploadingHero(true)
    setMessage('Subiendo nueva imagen de portada del catálogo...')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `hero-${profile.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: pubData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const newHeroUrl = pubData.publicUrl

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ catalog_hero_image: newHeroUrl })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setProfile({ ...profile, catalog_hero_image: newHeroUrl })
      setMessage('✨ Imagen de portada (Curaduría Exclusiva) actualizada con éxito.')
      setTimeout(() => setMessage(''), 3500)
    } catch (err: any) {
      alert(`Error al actualizar la imagen de portada: ${err.message}`)
    } finally {
      setUploadingHero(false)
    }
  }

  // --- ELIMINAR IMAGEN HERO DE CATÁLOGO ---
  const handleDeleteHeroImage = async () => {
    if (!profile || !confirm('¿Deseas quitar la imagen de portada de la tienda?')) return

    setUploadingHero(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ catalog_hero_image: null })
        .eq('id', profile.id)

      if (error) throw error

      setProfile({ ...profile, catalog_hero_image: null })
      setMessage('🗑️ Imagen de portada del catálogo eliminada.')
      setTimeout(() => setMessage(''), 3500)
    } catch (err: any) {
      alert(`Error al eliminar portada: ${err.message}`)
    } finally {
      setUploadingHero(false)
    }
  }

  // --- LOGO / AVATAR ---
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploadingAvatar(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `avatar-${profile.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: pubData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const newAvatarUrl = pubData.publicUrl

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setProfile({ ...profile, avatar_url: newAvatarUrl })
      setMessage('✨ Logotipo actualizado.')
      setTimeout(() => setMessage(''), 3500)
    } catch (err: any) {
      alert(`Error al actualizar el logotipo: ${err.message}`)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleDeleteAvatar = async () => {
    if (!profile || !confirm('¿Eliminar el logotipo de la tienda?')) return

    setUploadingAvatar(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profile.id)

      if (error) throw error

      setProfile({ ...profile, avatar_url: null })
      setMessage('🗑️ Logotipo eliminado.')
      setTimeout(() => setMessage(''), 3500)
    } catch (err: any) {
      alert(`Error al quitar logotipo: ${err.message}`)
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Métricas
  const metrics = useMemo(() => {
    const allItems = categories.flatMap((c) => c.items)
    return {
      totalProducts: allItems.length,
      visibleProducts: allItems.filter((i) => i.active !== false).length,
      hiddenProducts: allItems.filter((i) => i.active === false).length,
      totalCategories: categories.length,
    }
  }, [categories])

  // Productos filtrados
  const filteredProducts = useMemo(() => {
    return categories.flatMap((cat) => {
      if (selectedCatFilter !== 'all' && cat.id !== selectedCatFilter) return []

      return cat.items
        .filter((item) => {
          const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
          
          const matchesStatus = statusFilter === 'all' 
            ? true 
            : statusFilter === 'visible' 
            ? item.active !== false 
            : item.active === false

          return matchesSearch && matchesStatus
        })
        .map((item) => ({ ...item, categoryName: cat.name }))
    })
  }, [categories, searchQuery, selectedCatFilter, statusFilter])

  // Abrir Modal
  const handleOpenModal = (item?: CatalogoItem) => {
    if (item) {
      setEditingItem(item)
      setFormName(item.name)
      setFormDescription(item.description || '')
      setFormPrice(item.price ? String(item.price) : '')
      setFormCategoryId(item.category_id)
      setFormImagePreview(item.image_url)
    } else {
      setEditingItem(null)
      setFormName('')
      setFormDescription('')
      setFormPrice('')
      setFormImagePreview(null)
      if (categories.length > 0) setFormCategoryId(categories[0].id)
    }
    setFormImageFile(null)
    setIsModalOpen(true)
  }

  // Guardar Producto
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formCategoryId || !formName.trim()) {
      alert('Completa el nombre y selecciona una categoría.')
      return
    }

    setSubmittingItem(true)
    let finalImageUrl = formImagePreview

    try {
      if (formImageFile) {
        const fileExt = formImageFile.name.split('.').pop()
        const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(fileName, formImageFile, { upsert: true })

        if (!uploadError) {
          const { data: pub } = supabase.storage.from('menu-images').getPublicUrl(fileName)
          finalImageUrl = pub.publicUrl
        }
      }

      if (editingItem) {
        const { error } = await supabase
          .from('catalogo_items')
          .update({
            name: formName.trim(),
            description: formDescription.trim() || null,
            price: formPrice.trim() || null,
            category_id: formCategoryId,
            image_url: finalImageUrl,
          })
          .eq('id', editingItem.id)

        if (error) throw error

        setCategories(categories.map((cat) => ({
          ...cat,
          items: cat.items.map((i) => 
            i.id === editingItem.id 
              ? { ...i, name: formName.trim(), description: formDescription.trim() || null, price: formPrice.trim() || null, category_id: formCategoryId, image_url: finalImageUrl } 
              : i
          )
        })))

        setMessage('✨ Producto actualizado.')
      } else {
        const { data, error } = await supabase
          .from('catalogo_items')
          .insert([{
            category_id: formCategoryId,
            name: formName.trim(),
            description: formDescription.trim() || null,
            price: formPrice.trim() || null,
            image_url: finalImageUrl,
            active: true,
            position: 99,
          }])
          .select()

        if (error) throw error

        if (data && data.length > 0) {
          setCategories(categories.map((cat) => {
            if (cat.id === formCategoryId) {
              return { ...cat, items: [...cat.items, data[0]] }
            }
            return cat
          }))
        }
        setMessage('✨ Producto publicado.')
      }

      setIsModalOpen(false)
      setTimeout(() => setMessage(''), 3500)
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`)
    } finally {
      setSubmittingItem(false)
    }
  }

  // Crear Categoría
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !newCatName.trim()) return

    setIsCreatingCat(true)
    const { data, error } = await supabase
      .from('catalogo_categories')
      .insert([{ profile_id: profile.id, name: newCatName.trim(), position: categories.length + 1 }])
      .select()

    setIsCreatingCat(false)
    if (error) {
      alert(`Error al crear categoría: ${error.message}`)
      return
    }

    if (data && data.length > 0) {
      const newCat = { ...data[0], items: [] }
      setCategories([...categories, newCat])
      setNewCatName('')
      setMessage('✨ Categoría creada.')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  // Eliminar Categoría
  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`¿Eliminar categoría "${catName}"?`)) return

    try {
      await supabase.from('catalogo_items').delete().eq('category_id', catId)
      const { error } = await supabase.from('catalogo_categories').delete().eq('id', catId)

      if (error) throw error

      setCategories(categories.filter((c) => c.id !== catId))
      if (selectedCatFilter === catId) setSelectedCatFilter('all')
      setMessage(`🗑️ Categoría "${catName}" eliminada.`)
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  // Cambiar Visibilidad
  const handleToggleActive = async (itemId: string, currentActive: boolean) => {
    const newStatus = !currentActive
    try {
      await supabase.from('catalogo_items').update({ active: newStatus }).eq('id', itemId)
      setCategories(categories.map((cat) => ({
        ...cat,
        items: cat.items.map((i) => i.id === itemId ? { ...i, active: newStatus } : i)
      })))
    } catch (err) {
      console.error(err)
    }
  }

  // Eliminar Producto
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('¿Eliminar este producto?')) return

    try {
      await supabase.from('catalogo_items').delete().eq('id', itemId)
      setCategories(categories.map((cat) => ({
        ...cat,
        items: cat.items.filter((i) => i.id !== itemId)
      })))
      setMessage('🗑️ Producto eliminado.')
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-neutral-900 dark:text-neutral-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="w-8 h-8 text-neutral-400 animate-spin" />
          <span className="text-xs font-medium tracking-wide text-neutral-500">Cargando Mogu Studio...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#0A0A0C] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-neutral-200 dark:selection:bg-neutral-800 pb-24">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#F5F5F7]/80 dark:bg-[#0A0A0C]/80 backdrop-blur-2xl border-b border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm shadow-sm">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold tracking-tight">{profile?.full_name || slug}</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Tienda Activa
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Gestión de Catálogo E-Commerce</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/catalogo/${slug}`}
              target="_blank"
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition flex items-center gap-2"
            >
              <span>Ver Tienda Pública</span>
              <FiExternalLink className="text-xs" />
            </Link>

            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition text-xs font-medium shadow-sm flex items-center gap-1.5 active:scale-[0.98] cursor-pointer"
            >
              <FiPlus className="text-sm" />
              <span>Nuevo Producto</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto px-6 pt-8 space-y-8">

        {message && (
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs font-medium text-emerald-600 dark:text-emerald-400 shadow-sm animate-fade-in flex items-center gap-2">
            <FiCheck />
            <span>{message}</span>
          </div>
        )}

        {/* ADMINISTRACIÓN DE PORTADA PRINCIPAL (catalog_hero_image - "CURADURÍA EXCLUSIVA") */}
        <div className="rounded-3xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden shadow-sm">
          
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-neutral-900 dark:text-white">Portada de la Tienda (Curaduría Exclusiva)</h3>
              <p className="text-[11px] text-neutral-500">Imagen de fondo principal visible al ingresar al catálogo público</p>
            </div>
          </div>

          <div className="relative w-full h-52 md:h-60 bg-neutral-900 group">
            {profile?.catalog_hero_image ? (
              <img src={profile.catalog_hero_image} alt="Portada Tienda" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-xs text-neutral-400 space-y-2">
                <FiImage className="w-8 h-8 opacity-40" />
                <span>Sin imagen de portada personalizada</span>
                <span className="text-[10px] text-neutral-500">(Se utiliza la imagen de la montaña por defecto)</span>
              </div>
            )}

            {/* Overlay interactivo */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
              <label 
                htmlFor="store-hero-upload" 
                className="px-4 py-2 bg-white text-neutral-900 rounded-xl text-xs font-semibold cursor-pointer hover:bg-neutral-100 transition shadow-lg flex items-center gap-2"
              >
                {uploadingHero ? <FiLoader className="animate-spin text-xs" /> : <FiCamera className="text-xs" />}
                <span>{profile?.catalog_hero_image ? 'Cambiar Portada' : 'Subir Portada'}</span>
              </label>

              <input 
                id="store-hero-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleHeroImageChange}
                disabled={uploadingHero}
              />

              {profile?.catalog_hero_image && (
                <button
                  type="button"
                  onClick={handleDeleteHeroImage}
                  disabled={uploadingHero}
                  className="px-4 py-2 bg-rose-500/90 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold transition shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <FiX className="text-xs" />
                  <span>Eliminar Portada</span>
                </button>
              )}
            </div>
          </div>

          {/* Logo / Avatar */}
          <div className="p-6 flex items-center gap-4 -mt-10 relative z-10">
            <div className="relative w-16 h-16 rounded-2xl bg-white dark:bg-[#18181B] border-4 border-white dark:border-[#121215] shadow-md overflow-hidden group flex-shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-lg text-neutral-400">
                  🏢
                </div>
              )}

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1">
                <label 
                  htmlFor="avatar-file-input" 
                  className="p-1.5 text-white hover:text-emerald-400 cursor-pointer text-xs"
                >
                  {uploadingAvatar ? <FiLoader className="animate-spin text-xs" /> : <FiCamera className="text-xs" />}
                </label>

                {profile?.avatar_url && (
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    className="p-1.5 text-rose-400 hover:text-rose-300 text-xs cursor-pointer"
                  >
                    <FiX className="text-xs" />
                  </button>
                )}
              </div>

              <input 
                id="avatar-file-input" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
              />
            </div>

            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight">{profile?.full_name || slug}</h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Página de la tienda configurada</p>
            </div>
          </div>

        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-1">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Total Productos</span>
            <p className="text-2xl font-semibold tracking-tight">{metrics.totalProducts}</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-1">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Visibles</span>
            <p className="text-2xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">{metrics.visibleProducts}</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-1">
            <span className="text-xs text-neutral-400 font-medium">Ocultos</span>
            <p className="text-2xl font-semibold tracking-tight text-neutral-500">{metrics.hiddenProducts}</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-1">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Categorías</span>
            <p className="text-2xl font-semibold tracking-tight">{metrics.totalCategories}</p>
          </div>
        </div>

        {/* FILTROS Y CATEGORÍAS */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border-none text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-neutral-400 outline-none transition"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${statusFilter === 'all' ? 'bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('visible')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${statusFilter === 'visible' ? 'bg-white dark:bg-neutral-800 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-neutral-500'}`}
              >
                Visibles
              </button>
              <button
                onClick={() => setStatusFilter('hidden')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${statusFilter === 'hidden' ? 'bg-white dark:bg-neutral-800 shadow-sm text-neutral-500' : 'text-neutral-500'}`}
              >
                Ocultos
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Categorías</span>
              <form onSubmit={handleAddCategory} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="+ Nueva categoría"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="bg-neutral-100 dark:bg-neutral-900 px-3 py-1 rounded-lg text-xs outline-none focus:ring-1 focus:ring-neutral-400"
                />
                <button type="submit" disabled={isCreatingCat} className="text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:underline">
                  Añadir
                </button>
              </form>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCatFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition flex-shrink-0 flex items-center gap-2 border ${
                  selectedCatFilter === 'all'
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-black border-transparent shadow-sm'
                    : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <span>Todas</span>
                <span className="text-[10px] opacity-70">({metrics.totalProducts})</span>
              </button>

              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setSelectedCatFilter(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition flex items-center gap-2 border ${
                      selectedCatFilter === cat.id
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-black border-transparent shadow-sm'
                        : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200/60 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-70">({cat.items.length})</span>
                  </button>

                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-1.5 text-neutral-400 hover:text-rose-500 transition rounded-lg hover:bg-rose-500/10"
                  >
                    <FiTrash2 className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GRILLA DE PRODUCTOS */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Productos ({filteredProducts.length})
          </h2>

          {filteredProducts.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 text-center space-y-3">
              <FiShoppingBag className="mx-auto w-10 h-10 text-neutral-300 dark:text-neutral-600" />
              <p className="text-xs text-neutral-500 font-medium">No se encontraron productos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-3xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />

                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/60 text-white backdrop-blur-md">
                          {item.categoryName}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => handleToggleActive(item.id, item.active)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-md transition ${
                            item.active !== false 
                              ? 'bg-emerald-500/80 text-white' 
                              : 'bg-neutral-800/80 text-neutral-300'
                          }`}
                        >
                          {item.active !== false ? '● Visible' : '○ Oculto'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white line-clamp-1">
                          {item.name}
                        </h3>
                        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex-shrink-0">
                          {item.price ? (String(item.price).includes('$') ? item.price : `$${item.price}`) : 'Sin precio'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {item.description || 'Sin descripción.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 transition"
                    >
                      <FiEdit3 className="text-xs" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-xs font-medium text-neutral-400 hover:text-rose-500 transition flex items-center gap-1"
                    >
                      <FiTrash2 className="text-xs" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* MODAL CREAR / EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 shadow-2xl p-6 space-y-6 overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
                {editingItem ? 'Editar Producto' : 'Añadir Nuevo Producto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full transition"
              >
                <FiX className="text-base" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Café Blend Arábico 250g"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-neutral-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Categoría</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-neutral-400"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Precio</label>
                  <input
                    type="text"
                    placeholder="Ej. 8990"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  placeholder="Notas de cata, origen, formato..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-neutral-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Fotografía</label>
                <div className="flex items-center gap-4">
                  {formImagePreview && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 flex-shrink-0">
                      <img src={formImagePreview} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setFormImageFile(file)
                        setFormImagePreview(URL.createObjectURL(file))
                      }
                    }}
                    className="w-full text-xs text-neutral-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-neutral-200 dark:file:bg-neutral-800 file:text-neutral-900 dark:file:text-white hover:file:opacity-80 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingItem}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black text-xs font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingItem && <FiLoader className="animate-spin text-xs" />}
                  <span>{editingItem ? 'Guardar Cambios' : 'Publicar Producto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}