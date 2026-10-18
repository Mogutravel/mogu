'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  FiSearch, 
  FiShoppingBag, 
  FiX, 
  FiPlus, 
  FiMinus, 
  FiArrowRight, 
  FiPhoneCall,
  FiCheck,
  FiShare2
} from 'react-icons/fi'

interface Profile {
  id: string
  slug: string
  full_name?: string
  bio?: string
  phone?: string
  avatar_url?: string | null
  catalog_hero_image?: string | null
  menu_theme?: 'dark' | 'light'
  menu_style?: 'modern' | 'classic' | 'cards'
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

interface CartItem {
  product: CatalogoItem
  quantity: number
}

export default function AppleStylePublicCatalog() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [categories, setCategories] = useState<CatalogoCategory[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros y Búsqueda
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCatId, setSelectedCatId] = useState<string>('all')

  // Carrito de Compras (Drawer)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Modal Detalle de Producto
  const [selectedProduct, setSelectedProduct] = useState<CatalogoItem | null>(null)
  const [detailQuantity, setDetailQuantity] = useState(1)

  // Mensaje flotante de notificación
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Carga de Datos desde Supabase
  useEffect(() => {
    async function loadCatalog() {
      if (!slug) return
      setLoading(true)

      try {
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

        setProfile({
          ...profileData,
          menu_theme: profileData.menu_theme || 'dark',
          menu_style: profileData.menu_style || 'modern',
        })

        // Cargar Categorías del Catálogo
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
            .eq('active', true)
            .order('position', { ascending: true })

          const catsWithItems = catsData.map((cat) => ({
            ...cat,
            items: itemsData?.filter((i) => i.category_id === cat.id) || [],
          }))

          setCategories(catsWithItems)
        }
      } catch (err) {
        console.error('Error al cargar catálogo:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCatalog()
  }, [slug])

  // --- LÓGICA DEL CARRITO ---
  const addToCart = (product: CatalogoItem, qtyToAdd: number = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id)
      if (existingIndex > -1) {
        const updated = [...prevCart]
        updated[existingIndex].quantity += qtyToAdd
        return updated
      } else {
        return [...prevCart, { product, quantity: qtyToAdd }]
      }
    })

    setToastMessage(`Añadido: ${product.name}`)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    })
  }

  const parsePrice = (priceVal: string | number | null): number => {
    if (!priceVal) return 0
    const cleaned = String(priceVal).replace(/[^0-9]/g, '')
    return parseInt(cleaned, 10) || 0
  }

  const formatCLP = (amount: number): string => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount)
  }

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + parsePrice(item.product.price) * item.quantity, 0)
  }, [cart])

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart])

  // Enviar Pedido a WhatsApp
  const handleSendWhatsAppOrder = () => {
    if (cart.length === 0 || !profile) return

    const phone = profile.phone || '56912345678'
    const cleanPhone = phone.replace(/[^0-9]/g, '')

    let text = `✨ *Nuevo Pedido desde Catálogo MOGU*\n`
    text += `*Cliente / Tienda:* ${profile.full_name || slug}\n`
    text += `──────────────\n`

    cart.forEach((item) => {
      const pPrice = parsePrice(item.product.price)
      text += `• *${item.quantity}x* ${item.product.name} — ${formatCLP(pPrice * item.quantity)}\n`
    })

    text += `──────────────\n`
    text += `*TOTAL ESTIMADO:* ${formatCLP(cartTotal)}\n\n`
    text += `Por favor confirma la disponibilidad y métodos de pago. ¡Gracias!`

    const encodedText = encodeURIComponent(text)
    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank')
  }

  // Filtrado de Productos en Tiempo Real
  const filteredProducts = useMemo(() => {
    return categories.flatMap((cat) => {
      if (selectedCatId !== 'all' && cat.id !== selectedCatId) return []

      return cat.items
        .filter((item) => {
          const query = searchQuery.toLowerCase()
          return item.name.toLowerCase().includes(query) || (item.description && item.description.toLowerCase().includes(query))
        })
        .map((item) => ({ ...item, categoryName: cat.name }))
    })
  }, [categories, searchQuery, selectedCatId])

  const isDarkMode = profile?.menu_theme !== 'light'

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0A0A0C] text-white' : 'bg-[#F5F5F7] text-neutral-900'}`}>
        <div className="w-8 h-8 border-2 border-neutral-400/30 border-t-neutral-800 dark:border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen font-sans selection:bg-neutral-200 dark:selection:bg-neutral-800 ${isDarkMode ? 'bg-[#0A0A0C] text-[#F5F5F7]' : 'bg-[#F9F9FB] text-neutral-900'} pb-32`}>
      
      {/* HEADER / HERO CON PORTADA Y TARJETA TRANSPARENTE COMPACTA DEBAJO */}
      <header className="relative w-full overflow-hidden">
        {/* Banner de Portada (catalog_hero_image) */}
        <div className="relative w-full h-48 md:h-64 bg-neutral-900">
          <img
            src={
              profile?.catalog_hero_image ||
              'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600&auto=format&fit=crop'
            }
            alt="Hero Background"
            className="w-full h-full object-cover opacity-90 dark:opacity-80 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-transparent to-transparent" />
        </div>

        {/* Tarjeta de Identidad Ultra-Transparente y Compacta (Ubicada debajo) */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-10 md:-mt-12 relative z-10">
          <div className={`p-4 md:p-5 rounded-3xl border backdrop-blur-md transition-all duration-500 shadow-lg ${
            isDarkMode 
              ? 'bg-black/20 border-white/10 text-white' 
              : 'bg-white/10 border-white/30 text-neutral-900'
          }`}>
            <div className="flex flex-row items-center justify-between gap-3">
              
              <div className="flex items-center gap-3.5 overflow-hidden">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover border border-white/20 shadow-md flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-lg font-serif text-white shadow-md flex-shrink-0">
                    M
                  </div>
                )}

                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold truncate">
                      ✦ MOGU COLLECTION ✦
                    </span>
                  </div>
                  <h1 className="text-base md:text-lg tracking-tight font-bold truncate">
                    {profile?.full_name || slug}
                  </h1>
                  <p className="text-[11px] text-neutral-400 font-normal truncate max-w-xs">
                    {profile?.bio || 'Comparte tu identidad digital con un solo Tap.'}
                  </p>
                </div>
              </div>

              {/* Acciones Rápidas Compactas */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {profile?.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="w-9 h-9 rounded-full border border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-md hover:bg-white/20 transition flex items-center justify-center text-xs shadow-sm cursor-pointer"
                    title="Llamar directamente"
                  >
                    <FiPhoneCall className="text-xs" />
                  </a>
                )}

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: profile?.full_name, url: window.location.href })
                    } else {
                      navigator.clipboard.writeText(window.location.href)
                      alert('¡Enlace copiado al portapapeles!')
                    }
                  }}
                  className="w-9 h-9 rounded-full border border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-md hover:bg-white/20 transition flex items-center justify-center text-xs shadow-sm cursor-pointer"
                  title="Compartir catálogo"
                >
                  <FiShare2 className="text-xs" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-5xl mx-auto px-6 pt-8 space-y-8">

        {/* BUSCADOR Y SELECCIÓN DE CATEGORÍAS */}
        <div className="space-y-6">
          
          {/* Buscador Inteligente */}
          <div className="relative max-w-xl mx-auto">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
            <input
              type="text"
              placeholder="Buscar piezas, colecciones o productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 pr-10 py-3 rounded-2xl border text-xs font-medium outline-none transition shadow-sm ${
                isDarkMode 
                  ? 'bg-[#121215] border-neutral-800/80 text-white placeholder-neutral-500 focus:border-neutral-600' 
                  : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-400 hover:text-neutral-200 cursor-pointer"
              >
                <FiX className="text-xs" />
              </button>
            )}
          </div>

          {/* Navegación por Categorías (Carrusel Horizontal) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
            <button
              onClick={() => setSelectedCatId('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all flex-shrink-0 border cursor-pointer ${
                selectedCatId === 'all'
                  ? isDarkMode 
                    ? 'bg-white text-black border-white shadow-lg' 
                    : 'bg-neutral-900 text-white border-neutral-900 shadow-lg'
                  : isDarkMode
                    ? 'bg-[#121215] border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              Ver Todo
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all flex-shrink-0 border cursor-pointer ${
                  selectedCatId === cat.id
                    ? isDarkMode 
                      ? 'bg-white text-black border-white shadow-lg' 
                      : 'bg-neutral-900 text-white border-neutral-900 shadow-lg'
                    : isDarkMode
                      ? 'bg-[#121215] border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
                }`}
              >
                {cat.name} ({cat.items.length})
              </button>
            ))}
          </div>
        </div>

        {/* GRILLA DE PRODUCTOS ESTILO APPLE */}
        <div>
          {filteredProducts.length === 0 ? (
            <div className={`p-16 rounded-3xl border text-center space-y-3 ${isDarkMode ? 'bg-[#121215] border-neutral-800/80' : 'bg-white border-neutral-200'}`}>
              <FiShoppingBag className="mx-auto w-10 h-10 text-neutral-400 opacity-50" />
              <p className="text-xs font-medium text-neutral-400">No encontramos productos con los criterios seleccionados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((item) => {
                const itemPrice = parsePrice(item.price)

                return (
                  <div
                    key={item.id}
                    className={`group relative rounded-3xl border p-4 transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-2xl ${
                      isDarkMode 
                        ? 'bg-[#121215] border-neutral-800/80 hover:border-neutral-700' 
                        : 'bg-white border-neutral-200/80 hover:border-neutral-300'
                    }`}
                  >
                    <div 
                      className="cursor-pointer space-y-4"
                      onClick={() => {
                        setSelectedProduct(item)
                        setDetailQuantity(1)
                      }}
                    >
                      {/* Imagen Protagonista Ratio 4:3 */}
                      <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800/40">
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop'}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-md">
                            {item.categoryName}
                          </span>
                        </div>
                      </div>

                      {/* Detalles del Producto */}
                      <div className="space-y-1.5 px-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold tracking-tight line-clamp-1">
                            {item.name}
                          </h3>
                          <span className="text-sm font-bold text-emerald-500 whitespace-nowrap">
                            {formatCLP(itemPrice)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 font-light line-clamp-2 leading-relaxed">
                          {item.description || 'Edición limitada elaborada con altos estándares de calidad.'}
                        </p>
                      </div>
                    </div>

                    {/* Botón de Agregar al Carrito */}
                    <div className="pt-2">
                      <button
                        onClick={() => addToCart(item)}
                        className={`w-full py-3 rounded-2xl text-xs font-semibold transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
                          isDarkMode 
                            ? 'bg-white text-black hover:bg-neutral-200' 
                            : 'bg-neutral-900 text-white hover:bg-neutral-800'
                        }`}
                      >
                        <FiPlus className="text-sm" />
                        <span>Agregar al Carrito</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </main>

      {/* BOTÓN FLOTANTE DEL CARRITO */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-fade-in">
          <button
            onClick={() => setIsCartOpen(true)}
            className="px-6 py-4 bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold text-xs rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 transition-all duration-300 active:scale-95 border border-white/20 cursor-pointer"
          >
            <div className="relative">
              <FiShoppingBag className="text-lg" />
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            </div>
            <span>Ver Selección</span>
            <span className="font-bold border-l border-neutral-700 dark:border-neutral-300 pl-3">
              {formatCLP(cartTotal)}
            </span>
          </button>
        </div>
      )}

      {/* DRAWER / PANEL SLIDE-OVER DEL CARRITO */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md h-full flex flex-col justify-between p-6 shadow-2xl border-l ${
            isDarkMode ? 'bg-[#121215] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="space-y-6 overflow-y-auto pr-1">
              
              {/* Encabezado Carrito */}
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <FiShoppingBag className="text-lg text-emerald-500" />
                  <h2 className="text-sm font-bold tracking-tight">Tu Selección ({cartCount})</h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-full hover:bg-neutral-800 transition cursor-pointer"
                >
                  <FiX className="text-base" />
                </button>
              </div>

              {/* Lista de Ítems */}
              {cart.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <FiShoppingBag className="mx-auto w-10 h-10 opacity-30" />
                  <p className="text-xs text-neutral-400 font-light">Tu carrito está vacío actualmente.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => {
                    const price = parsePrice(item.product.price)
                    return (
                      <div
                        key={item.product.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                          isDarkMode ? 'bg-[#18181D] border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product.image_url || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop'}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-neutral-800"
                          />
                          <div>
                            <h4 className="text-xs font-bold line-clamp-1">{item.product.name}</h4>
                            <span className="text-xs text-emerald-500 font-semibold">{formatCLP(price * item.quantity)}</span>
                          </div>
                        </div>

                        {/* Controles de Cantidad */}
                        <div className="flex items-center gap-2 bg-neutral-900/60 dark:bg-neutral-800 px-2.5 py-1.5 rounded-xl border border-neutral-700/50">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="text-xs text-neutral-400 hover:text-white cursor-pointer"
                          >
                            <FiMinus />
                          </button>
                          <span className="text-xs font-bold px-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="text-xs text-neutral-400 hover:text-white cursor-pointer"
                          >
                            <FiPlus />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Subtotal y Envío a WhatsApp */}
            {cart.length > 0 && (
              <div className="pt-6 border-t border-neutral-800/80 space-y-4">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>Subtotal Estimado</span>
                  <span className="text-emerald-500 text-lg">{formatCLP(cartTotal)}</span>
                </div>

                <button
                  onClick={handleSendWhatsAppOrder}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                >
                  <span>Enviar Pedido por WhatsApp</span>
                  <FiArrowRight className="text-sm" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL DETALLE DE PRODUCTO */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-lg rounded-3xl border p-6 space-y-6 shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-[#121215] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">Detalle del Producto</span>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-full hover:bg-neutral-800 transition cursor-pointer"
              >
                <FiX className="text-base" />
              </button>
            </div>

            <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800">
              <img
                src={selectedProduct.image_url || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop'}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-bold tracking-tight">{selectedProduct.name}</h3>
                <span className="text-lg font-bold text-emerald-500 whitespace-nowrap">
                  {formatCLP(parsePrice(selectedProduct.price))}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                {selectedProduct.description || 'Detalles cuidados y acabado de alta gama.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-800/80 gap-4">
              <div className="flex items-center gap-3 bg-neutral-800/60 px-4 py-2.5 rounded-2xl border border-neutral-700/50">
                <button
                  onClick={() => setDetailQuantity(Math.max(1, detailQuantity - 1))}
                  className="text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  <FiMinus />
                </button>
                <span className="text-xs font-bold">{detailQuantity}</span>
                <button
                  onClick={() => setDetailQuantity(detailQuantity + 1)}
                  className="text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  <FiPlus />
                </button>
              </div>

              <button
                onClick={() => {
                  addToCart(selectedProduct, detailQuantity)
                  setSelectedProduct(null)
                }}
                className="flex-1 py-3.5 bg-white dark:bg-white text-black font-bold text-xs uppercase tracking-wider rounded-2xl transition shadow-xl hover:opacity-90 active:scale-[0.98] cursor-pointer"
              >
                Agregar al Carrito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICACIÓN TOAST FLOTANTE */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-500 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <FiCheck />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  )
}