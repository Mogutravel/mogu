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
  FiExternalLink,
  FiCheck,
  FiLoader,
  FiEdit3,
  FiLayers,
  FiImage,
  FiLayout,
  FiMoon,
  FiSun
} from 'react-icons/fi'

interface Profile {
  id: string
  slug: string
  full_name?: string
  avatar_url?: string | null
  has_menu?: boolean
  menu_style?: 'classic' | 'modern' | 'cards' | string
  menu_theme?: 'light' | 'dark' | string
}

interface MenuItem {
  id: string
  category_id: string
  name: string
  description: string | null
  price: string | number | null
  image_url: string | null
  active: boolean
  position: number
  has_sizes?: boolean
  sizes_prices?: {
    chico: number | string
    mediano: number | string
    grande: number | string
  } | null
}

interface MenuCategory {
  id: string
  name: string
  position: number
  items: MenuItem[]
}

export default function AppleStyleMenuAdminPanel() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // Preferencias de Menú
  const [menuStyle, setMenuStyle] = useState<'classic' | 'modern' | 'cards'>('modern')
  const [menuTheme, setMenuTheme] = useState<'light' | 'dark'>('light')
  const [savingSettings, setSavingSettings] = useState(false)

  // Carga de Avatar / Logo
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Buscador y Filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all')

  // Modal para Platos / Productos
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  
  // Formulario Plato
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formImageFile, setFormImageFile] = useState<File | null>(null)
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null)
  const [submittingItem, setSubmittingItem] = useState(false)

  // Nuevos estados para tamaños opcionales
  const [formHasSizes, setFormHasSizes] = useState(false)
  const [formPriceChico, setFormPriceChico] = useState('')
  const [formPriceMediano, setFormPriceMediano] = useState('')
  const [formPriceGrande, setFormPriceGrande] = useState('')

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
        if (profileData.menu_style) setMenuStyle(profileData.menu_style as any)
        if (profileData.menu_theme) setMenuTheme(profileData.menu_theme as any)

        // Cargar Categorías de Menú
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
          if (!formCategoryId) setFormCategoryId(catsData[0].id)
        }
      } catch (err) {
        console.error('Error cargando menú:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [slug, router])

  // --- GUARDAR ESTILO Y FONDO DEL MENÚ ---
  const handleUpdateMenuSettings = async (
    newStyle: 'classic' | 'modern' | 'cards',
    newTheme: 'light' | 'dark'
  ) => {
    if (!profile) return
    setSavingSettings(true)
    setMenuStyle(newStyle)
    setMenuTheme(newTheme)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          menu_style: newStyle,
          menu_theme: newTheme
        })
        .eq('id', profile.id)

      if (error) throw error

      setProfile({ ...profile, menu_style: newStyle, menu_theme: newTheme })
      setMessage('✨ Estilo y diseño del menú actualizados.')
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      alert(`Error al guardar configuración del menú: ${err.message}`)
    } finally {
      setSavingSettings(false)
    }
  }

  // --- LOGO / AVATAR DEL LOCAL ---
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploadingAvatar(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `menu-avatar-${profile.id}-${Date.now()}.${fileExt}`

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
    if (!profile || !confirm('¿Eliminar el logotipo del negocio?')) return

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

  // Métricas reales
  const metrics = useMemo(() => {
    const allItems = categories.flatMap((c) => c.items)
    return {
      totalProducts: allItems.length,
      visibleProducts: allItems.filter((i) => i.active !== false).length,
      hiddenProducts: allItems.filter((i) => i.active === false).length,
      totalCategories: categories.length,
    }
  }, [categories])

  // Filtrado de platos/productos
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

  // Abrir Modal Crear / Editar
  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item)
      setFormName(item.name)
      setFormDescription(item.description || '')
      setFormCategoryId(item.category_id)
      setFormImagePreview(item.image_url)

      // Cargar configuración de tamaños si existe
      setFormHasSizes(item.has_sizes || false)
      setFormPriceChico(item.has_sizes && item.sizes_prices ? String(item.sizes_prices.chico || '') : String(item.price || ''))
      setFormPriceMediano(item.has_sizes && item.sizes_prices ? String(item.sizes_prices.mediano || '') : '')
      setFormPriceGrande(item.has_sizes && item.sizes_prices ? String(item.sizes_prices.grande || '') : '')
    } else {
      setEditingItem(null)
      setFormName('')
      setFormDescription('')
      setFormPrice('')
      setFormImagePreview(null)
      setFormHasSizes(false)
      setFormPriceChico('')
      setFormPriceMediano('')
      setFormPriceGrande('')
      if (categories.length > 0) setFormCategoryId(categories[0].id)
    }
    setFormImageFile(null)
    setIsModalOpen(true)
  }

  // Guardar Plato
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
        const fileName = `dish-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(fileName, formImageFile, { upsert: true })

        if (!uploadError) {
          const { data: pub } = supabase.storage.from('menu-images').getPublicUrl(fileName)
          finalImageUrl = pub.publicUrl
        }
      }

      // Preparar datos según si tiene tamaños o precio único
      const productPayload = {
        name: formName.trim(),
        description: formDescription.trim() || null,
        price: formHasSizes ? Number(formPriceChico) : (formPrice.trim() ? Number(formPrice) : null),
        category_id: formCategoryId,
        image_url: finalImageUrl,
        has_sizes: formHasSizes,
        sizes_prices: formHasSizes ? {
          chico: Number(formPriceChico),
          mediano: Number(formPriceMediano),
          grande: Number(formPriceGrande)
        } : null
      }

      if (editingItem) {
        const { error } = await supabase
          .from('menu_items')
          .update(productPayload)
          .eq('id', editingItem.id)

        if (error) throw error

        setCategories(categories.map((cat) => ({
          ...cat,
          items: cat.items.map((i) => 
            i.id === editingItem.id 
              ? { ...i, ...productPayload } 
              : i
          )
        })))

        setMessage('✨ Plato actualizado correctamente.')
      } else {
        const { data, error } = await supabase
          .from('menu_items')
          .insert([{
            ...productPayload,
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
        setMessage('✨ Plato publicado en el menú.')
      }

      setIsModalOpen(false)
      setTimeout(() => setMessage(''), 3500)
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`)
    } finally {
      setSubmittingItem(false)
    }
  }

  // Eliminar únicamente la foto del producto
  const handleDeleteProductImageOnly = async (itemId: string) => {
    if (!confirm('¿Eliminar únicamente la fotografía de este plato?')) return

    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ image_url: null })
        .eq('id', itemId)

      if (error) throw error

      setCategories(categories.map((cat) => ({
        ...cat,
        items: cat.items.map((i) => i.id === itemId ? { ...i, image_url: null } : i)
      })))

      if (editingItem && editingItem.id === itemId) {
        setFormImagePreview(null)
      }

      setMessage('🗑️ Fotografía removida.')
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      alert(`Error al quitar la imagen: ${err.message}`)
    }
  }

  // Crear Categoría
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !newCatName.trim()) return

    setIsCreatingCat(true)
    const { data, error } = await supabase
      .from('menu_categories')
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
      setMessage('✨ Categoría agregada.')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  // Eliminar Categoría
  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`¿Eliminar la categoría "${catName}" y sus platos asociados?`)) return

    try {
      await supabase.from('menu_items').delete().eq('category_id', catId)
      const { error } = await supabase.from('menu_categories').delete().eq('id', catId)

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
      await supabase.from('menu_items').update({ active: newStatus }).eq('id', itemId)
      setCategories(categories.map((cat) => ({
        ...cat,
        items: cat.items.map((i) => i.id === itemId ? { ...i, active: newStatus } : i)
      })))
    } catch (err) {
      console.error(err)
    }
  }

  // Eliminar Plato Completo
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('¿Estás seguro de eliminar este plato definitivamente?')) return

    try {
      await supabase.from('menu_items').delete().eq('id', itemId)
      setCategories(categories.map((cat) => ({
        ...cat,
        items: cat.items.filter((i) => i.id !== itemId)
      })))
      setMessage('🗑️ Plato eliminado.')
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
      
      {/* TOOLBAR ESTILO MACOS */}
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
                  Menú Activo
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Gestión de Carta Gastronómica Digital</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/menu/${slug}`}
              target="_blank"
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition flex items-center gap-2"
            >
              <span>Ver Menú Público</span>
              <FiExternalLink className="text-xs" />
            </Link>

            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition text-xs font-medium shadow-sm flex items-center gap-1.5 active:scale-[0.98] cursor-pointer"
            >
              <FiPlus className="text-sm" />
              <span>Nuevo Plato</span>
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

        {/* TARJETA DE IDENTIDAD Y CONFIGURACIÓN DE ESTILO DEL MENÚ */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-6">
          
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/60 pb-5">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden group flex-shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-lg text-neutral-400">
                    🍽️
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
                  onChange={handleAvatarChange}
                  disabled={uploadingAvatar}
                  className="hidden" 
                />
              </div>

              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight">{profile?.full_name || slug}</h2>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Personaliza la presentación pública de tu carta</p>
              </div>
            </div>
          </div>

          {/* SELECCIÓN DE 3 ESTILOS DE MENÚ Y MODO COLOR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* ESTILO DE MENÚ (Classic, Modern, Cards) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FiLayout className="text-sm text-neutral-500" />
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Estilo de Disposición (Layout)
                </label>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateMenuSettings('classic', menuTheme)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition ${
                    menuStyle === 'classic'
                      ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-black shadow-sm'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  <span className="text-xs font-bold">Clásico</span>
                  <span className="text-[10px] opacity-70 mt-1">Lista limpia de texto y precios</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateMenuSettings('modern', menuTheme)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition ${
                    menuStyle === 'modern'
                      ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-black shadow-sm'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  <span className="text-xs font-bold">Moderno</span>
                  <span className="text-[10px] opacity-70 mt-1">Miniauturas horizontales pulidas</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateMenuSettings('cards', menuTheme)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition ${
                    menuStyle === 'cards'
                      ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-black shadow-sm'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  <span className="text-xs font-bold">Tarjetas</span>
                  <span className="text-[10px] opacity-70 mt-1">Grilla visual estilo Instagram</span>
                </button>
              </div>
            </div>

            {/* COLOR DE FONDO (Light vs Dark) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {menuTheme === 'dark' ? <FiMoon className="text-sm text-neutral-500" /> : <FiSun className="text-sm text-neutral-500" />}
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Tema Visual de Fondo
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateMenuSettings(menuStyle, 'light')}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                    menuTheme === 'light'
                      ? 'border-neutral-900 dark:border-white bg-white text-black shadow-sm ring-2 ring-neutral-900/20'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FiSun className="text-amber-500 text-sm" />
                    <span className="text-xs font-bold">Claro (Light)</span>
                  </div>
                  {menuTheme === 'light' && <FiCheck className="text-xs" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateMenuSettings(menuStyle, 'dark')}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                    menuTheme === 'dark'
                      ? 'border-neutral-900 dark:border-white bg-neutral-950 text-white shadow-sm ring-2 ring-white/20'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FiMoon className="text-indigo-400 text-sm" />
                    <span className="text-xs font-bold">Oscuro (Dark)</span>
                  </div>
                  {menuTheme === 'dark' && <FiCheck className="text-xs" />}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* MÉTRICAS APPLE STYLE */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-1">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Total Platos</span>
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

        {/* BUSCADOR, FILTROS Y CATEGORÍAS */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
              <input
                type="text"
                placeholder="Buscar plato o ingrediente..."
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

        {/* GRILLA DE PLATOS */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Platos en Carta ({filteredProducts.length})
          </h2>

          {filteredProducts.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800/80 text-center space-y-3">
              <FiLayers className="mx-auto w-10 h-10 text-neutral-300 dark:text-neutral-600" />
              <p className="text-xs text-neutral-500 font-medium">No hay platos registrados con el filtro actual.</p>
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
                        src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />

                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/60 text-white backdrop-blur-md">
                          {item.categoryName}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        {item.image_url && (
                          <button
                            onClick={() => handleDeleteProductImageOnly(item.id)}
                            className="p-1.5 rounded-full bg-black/60 text-rose-400 hover:text-rose-300 backdrop-blur-md transition text-xs"
                            title="Eliminar únicamente la fotografía"
                          >
                            <FiTrash2 />
                          </button>
                        )}
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
                          {item.has_sizes && item.sizes_prices ? (
                            `$${item.sizes_prices.chico} (Chico)`
                          ) : (
                            item.price ? (String(item.price).includes('$') ? item.price : `$${item.price}`) : 'Sin precio'
                          )}
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
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 shadow-2xl p-6 space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
                {editingItem ? 'Editar Plato' : 'Añadir Nuevo Plato'}
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
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Categoría</label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Nombre del Plato</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Lungo"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                />
              </div>

              {/* SECCIÓN DE TAMAÑOS OPCIONALES */}
              <div className="space-y-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
                <label className="flex items-center space-x-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formHasSizes}
                    onChange={(e) => setFormHasSizes(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    ¿Este producto tiene opciones de tamaño (Chico, Mediano, Grande)?
                  </span>
                </label>

                {!formHasSizes ? (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 mb-1">Precio Único ($)</label>
                    <input
                      type="text"
                      placeholder="9990"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Chico ($)</label>
                      <input
                        type="text"
                        placeholder="2200"
                        value={formPriceChico}
                        onChange={(e) => setFormPriceChico(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                        required={formHasSizes}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Mediano ($)</label>
                      <input
                        type="text"
                        placeholder="2800"
                        value={formPriceMediano}
                        onChange={(e) => setFormPriceMediano(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                        required={formHasSizes}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Grande ($)</label>
                      <input
                        type="text"
                        placeholder="3800"
                        value={formPriceGrande}
                        onChange={(e) => setFormPriceGrande(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none"
                        required={formHasSizes}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Fotografía</label>
                  <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-900 dark:text-white rounded-xl cursor-pointer transition">
                    <FiImage className="text-xs" />
                    <span>Subir Foto</span>
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
                      className="hidden" 
                    />
                  </label>
                </div>

                {formImagePreview && (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 relative">
                    <img src={formImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Descripción / Ingredientes</label>
                <textarea
                  rows={2}
                  placeholder="Detalles del plato..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 text-xs font-medium rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingItem}
                  className="px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-black text-xs font-medium rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submittingItem ? 'Guardando...' : 'Guardar Plato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}