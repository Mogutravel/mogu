'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  FiShoppingBag,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiMessageCircle,
  FiSearch,
  FiX,
} from 'react-icons/fi'

interface Profile {
  id: string
  slug: string
  full_name?: string
  name?: string
  phone?: string | null
  has_menu?: boolean
  menu_style?: 'modern' | 'classic' | 'cards'
  menu_theme?: 'dark' | 'light'
  avatar_url?: string | null
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

interface CartItem {
  cartId: string // Identificador único para el carrito (permite distinguir tamaños)
  item: MenuItem
  quantity: number
  selectedSize?: string
  selectedPrice?: number
}

interface ImageModal {
  url: string
  name: string
  description: string | null
  price: string | number | null
}

export default function MoguMenu() {
  const params = useParams()
  const slug = params?.slug as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const [cart, setCart] = useState<CartItem[]>([])
  const [showCartDrawer, setShowCartDrawer] = useState(false)

  const [activeImageModal, setActiveImageModal] =
    useState<ImageModal | null>(null)

  // Estados para el Modal de Selección de Tamaños
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false)
  const [productToSize, setProductToSize] = useState<MenuItem | null>(null)
  const [selectedSizeKey, setSelectedSizeKey] = useState<'chico' | 'mediano' | 'grande'>('chico')

  // Cargar establecimiento, categorías y productos.
  useEffect(() => {
    async function loadMenuData() {
      if (!slug) {
        setLoading(false)
        return
      }

      setLoading(true)
      setErrorMsg('')

      try {
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', slug)
          .maybeSingle()

        if (profileError) throw profileError

        if (!profileData) {
          const { data: fallback, error: fallbackError } = await supabase
            .from('profiles')
            .select('*')
            .ilike('full_name', `%${slug}%`)
            .maybeSingle()

          if (fallbackError) throw fallbackError
          profileData = fallback
        }

        if (!profileData) {
          setErrorMsg(`No se encontró el establecimiento: "${slug}".`)
          return
        }

        setProfile(profileData)

        const { data: catsData, error: catsError } = await supabase
          .from('menu_categories')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('position', { ascending: true })

        if (catsError) throw catsError

        if (!catsData?.length) {
          setCategories([])
          return
        }

        const catIds = catsData.map((cat) => cat.id)

        const { data: itemsData, error: itemsError } = await supabase
          .from('menu_items')
          .select('*')
          .in('category_id', catIds)
          .order('position', { ascending: true })

        if (itemsError) throw itemsError

        const catsWithItems: MenuCategory[] = catsData
          .map((cat) => ({
            ...cat,
            items: (itemsData || []).filter(
              (item) => item.category_id === cat.id && item.active !== false
            ),
          }))
          .filter((cat) => cat.items.length > 0)

        setCategories(catsWithItems)
      } catch (err) {
        console.error(err)
        setErrorMsg('Error al conectar con la base de datos.')
      } finally {
        setLoading(false)
      }
    }

    loadMenuData()
  }, [slug])

  const parsePrice = (
    price: string | number | null | undefined
  ): number | null => {
    if (price === null || price === undefined) return null

    const rawPrice = String(price).trim()
    if (!rawPrice) return null

    const cleaned = rawPrice
      .replace(/\s/g, '')
      .replace(/\$/g, '')
      .replace(/CLP/gi, '')

    if (/^-?\d{1,3}(\.\d{3})+$/.test(cleaned)) {
      const value = Number(cleaned.replace(/\./g, ''))
      return Number.isFinite(value) ? value : null
    }

    if (/^-?\d+$/.test(cleaned)) {
      const value = Number(cleaned)
      return Number.isFinite(value) ? value : null
    }

    const value = Number(cleaned.replace(',', '.'))
    return Number.isFinite(value) ? value : null
  }

  const formatCLP = (amount: number) =>
    amount.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    })

  const displayPrice = (item: MenuItem): string => {
    if (item.has_sizes && item.sizes_prices) {
      const chicoPrice = parsePrice(item.sizes_prices.chico)
      return chicoPrice !== null ? `Desde ${formatCLP(chicoPrice)}` : 'A convenir'
    }

    if (item.price === null || item.price === undefined || String(item.price).trim() === '') {
      return 'A convenir'
    }

    const parsed = parsePrice(item.price)
    return parsed === null ? String(item.price) : formatCLP(parsed)
  }

  const getItemSubtotal = (ci: CartItem): number | null => {
    const price = ci.selectedPrice !== undefined ? ci.selectedPrice : parsePrice(ci.item.price)
    if (price === null) return null
    return price * ci.quantity
  }

  const totalCartItems = useMemo(
    () => cart.reduce((sum, ci) => sum + ci.quantity, 0),
    [cart]
  )

  const cartSubtotal = useMemo(
    () =>
      cart.reduce((total, ci) => {
        const subtotal = getItemSubtotal(ci)
        return total + (subtotal ?? 0)
      }, 0),
    [cart]
  )

  const hasUnpricedItems = useMemo(
    () => cart.some((ci) => (ci.selectedPrice !== undefined ? ci.selectedPrice : parsePrice(ci.item.price)) === null),
    [cart]
  )

  // Manejador central para agregar al carrito (con o sin modal de tamaños)
  const handleTriggerAdd = (item: MenuItem, e?: React.MouseEvent) => {
    e?.stopPropagation()

    if (item.has_sizes && item.sizes_prices) {
      setProductToSize(item)
      setSelectedSizeKey('chico')
      setIsSizeModalOpen(true)
    } else {
      addToCartDirect(item)
    }
  }

  const addToCartDirect = (item: MenuItem, sizeKey?: string, customPrice?: number) => {
    const cartId = sizeKey ? `${item.id}-${sizeKey}` : item.id
    const finalPrice = customPrice !== undefined ? customPrice : parsePrice(item.price) ?? 0

    setCart((prev) => {
      const existing = prev.find((ci) => ci.cartId === cartId)

      if (existing) {
        return prev.map((ci) =>
          ci.cartId === cartId ? { ...ci, quantity: ci.quantity + 1 } : ci
        )
      }

      return [
        ...prev,
        {
          cartId,
          item,
          quantity: 1,
          selectedSize: sizeKey ? sizeKey.charAt(0).toUpperCase() + sizeKey.slice(1) : undefined,
          selectedPrice: finalPrice,
        },
      ]
    })
  }

  const decreaseQuantity = (cartId: string) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.cartId === cartId)

      if (existing && existing.quantity > 1) {
        return prev.map((ci) =>
          ci.cartId === cartId ? { ...ci, quantity: ci.quantity - 1 } : ci
        )
      }

      return prev.filter((ci) => ci.cartId !== cartId)
    })
  }

  const increaseQuantity = (ci: CartItem) => {
    if (ci.item.has_sizes && ci.selectedSize) {
      const sizeKey = ci.selectedSize.toLowerCase() as 'chico' | 'mediano' | 'grande'
      const price = parsePrice(ci.item.sizes_prices?.[sizeKey]) ?? ci.selectedPrice ?? 0
      addToCartDirect(ci.item, sizeKey, price)
    } else {
      addToCartDirect(ci.item)
    }
  }

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((ci) => ci.cartId !== cartId))
  }

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0 || !profile) return

    let text =
      `Hola *${profile.full_name || profile.name || 'Local'}*, ` +
      'me gustaría realizar el siguiente pedido desde su carta digital:\n\n'

    cart.forEach((ci) => {
      const unitPrice = ci.selectedPrice ?? parsePrice(ci.item.price)
      const subtotal = getItemSubtotal(ci)
      const sizeText = ci.selectedSize ? ` (${ci.selectedSize})` : ''

      text += `• *${ci.quantity}x* ${ci.item.name}${sizeText}\n`

      if (unitPrice !== null && subtotal !== null) {
        text += `  Precio unitario: ${formatCLP(unitPrice)}\n`
        text += `  Subtotal: ${formatCLP(subtotal)}\n`
      } else {
        text += '  Precio: Por confirmar\n'
      }

      text += '\n'
    })

    text += `*Subtotal de productos con precio confirmado: ${formatCLP(cartSubtotal)}*\n`

    if (hasUnpricedItems) {
      text +=
        '*Importante:* Hay productos con precio por confirmar. ' +
        'El monto final debe confirmarse con el local.\n'
    }

    text +=
      '\nEl costo de despacho, si corresponde, se coordina con el local.\n' +
      '¡Quedo atento/a para coordinar el pago y la entrega!'

    const rawPhone = profile.phone ? profile.phone.replace(/\D/g, '') : ''

    const whatsappUrl = rawPhone
      ? `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const filteredCategories = useMemo(() => {
    return categories
      .map((cat) => {
        if (activeCategory !== 'all' && cat.id !== activeCategory) {
          return null
        }

        const query = searchTerm.toLowerCase().trim()

        const filteredItems = cat.items.filter((item) => {
          return (
            item.name.toLowerCase().includes(query) ||
            (item.description?.toLowerCase().includes(query) ?? false)
          )
        })

        if (!filteredItems.length) return null

        return { ...cat, items: filteredItems }
      })
      .filter(Boolean) as MenuCategory[]
  }, [categories, searchTerm, activeCategory])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-[#F2F2EE] flex flex-col items-center justify-center p-4">
        <div className="w-7 h-7 rounded-full border-2 border-white/10 border-t-[#FF7A45] animate-spin" />
        <span className="mt-4 text-[11px] uppercase tracking-[0.3em] text-white/50">
          Cargando carta
        </span>
      </div>
    )
  }

  if (errorMsg || !profile) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-[#F2F2EE] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Establecimiento no disponible
        </h1>

        <p className="text-sm text-white/50">{errorMsg}</p>

        <a
          href={`/panel/menu/${slug}`}
          className="px-5 py-2.5 bg-[#FF7A45] text-black text-xs font-semibold rounded-full hover:brightness-110 transition"
        >
          Ir al Panel
        </a>
      </div>
    )
  }

  const displayName = profile.full_name || profile.name || slug
  const menuStyle = profile.menu_style || 'modern'
  const isLight = profile.menu_theme === 'light'

  const t = {
    bg: isLight ? 'bg-[#FAFAF8] text-[#141414]' : 'bg-[#0B0B0C] text-[#F2F2EE]',
    surface: isLight ? 'bg-white' : 'bg-[#141416]',
    surfaceAlt: isLight ? 'bg-[#F1F0EC]' : 'bg-[#1B1B1E]',
    line: isLight ? 'border-[#E4E2DC]' : 'border-[#26262A]',
    lineBg: isLight ? 'bg-[#E4E2DC]' : 'bg-[#26262A]',
    headerBg: isLight
      ? 'bg-[#FAFAF8]/85 border-[#E4E2DC]'
      : 'bg-[#0B0B0C]/85 border-[#26262A]',
    title: isLight ? 'text-[#141414]' : 'text-[#F2F2EE]',
    muted: isLight ? 'text-[#6B6B66]' : 'text-[#8A8A90]',
    accent: isLight ? 'text-[#D9480F]' : 'text-[#FF7A45]',
    accentBg: isLight
      ? 'bg-[#D9480F] text-white hover:bg-[#B93C0B]'
      : 'bg-[#FF7A45] text-black hover:brightness-110',
    accentSoft: isLight
      ? 'bg-[#D9480F]/10 text-[#D9480F]'
      : 'bg-[#FF7A45]/15 text-[#FF7A45]',
    search: isLight
      ? 'bg-white border-[#E4E2DC] text-[#141414] placeholder-[#9A9A94] focus:border-[#141414]'
      : 'bg-[#141416] border-[#26262A] text-[#F2F2EE] placeholder-[#6A6A70] focus:border-[#F2F2EE]/60',
    ghostBtn: isLight
      ? 'border-[#D6D3CB] text-[#141414] hover:bg-[#141414] hover:text-white'
      : 'border-[#33333A] text-[#F2F2EE] hover:bg-[#F2F2EE] hover:text-black',
    footer: isLight ? 'text-[#9A9A94] border-[#E4E2DC]' : 'text-[#5A5A60] border-[#26262A]',
  }

  const openImage = (item: MenuItem) => {
    if (!item.image_url) return

    setActiveImageModal({
      url: item.image_url,
      name: item.name,
      description: item.description,
      price: item.price,
    })
  }

  const hasQuery = searchTerm.trim().length > 0

  const renderSearch = (placeholder: string, className = '') => (
    <div className={`relative ${className}`}>
      <FiSearch
        className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none ${t.muted}`}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={`w-full rounded-full border pl-9 pr-4 py-2.5 text-sm outline-none transition ${t.search}`}
      />
    </div>
  )

  const emptyState = (
    <div className={`text-center py-24 text-sm ${t.muted}`}>
      {hasQuery
        ? 'No encontramos nada con esa búsqueda.'
        : 'Esta carta aún no tiene productos.'}
    </div>
  )

  const renderCategoryTabs = (variant: 'underline' | 'pill') => {
    const base =
      'flex-shrink-0 whitespace-nowrap cursor-pointer transition text-sm'

    const cls = (active: boolean) =>
      variant === 'underline'
        ? `${base} py-2 border-b-2 ${
            active
              ? `${t.title} font-semibold border-current`
              : `${t.muted} border-transparent hover:${isLight ? 'text-black' : 'text-white'}`
          }`
        : `${base} px-4 py-2 rounded-full border ${
            active
              ? isLight
                ? 'bg-[#141414] text-white border-[#141414]'
                : 'bg-[#F2F2EE] text-black border-[#F2F2EE]'
              : `${t.muted} ${t.line} hover:opacity-80`
          }`

    return (
      <>
        <button onClick={() => setActiveCategory('all')} className={cls(activeCategory === 'all')}>
          Todo
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cls(activeCategory === cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </>
    )
  }

  const tabsWrapper = (variant: 'underline' | 'pill') =>
    `flex items-center overflow-x-auto flex-nowrap [scrollbar-width:none] ${
      variant === 'underline' ? 'gap-6' : 'gap-2'
    }`

  return (
    <div
      className={`min-h-screen font-sans selection:bg-[#FF7A45]/30 relative flex flex-col transition-colors duration-300 pb-24 ${t.bg}`}
    >
      {/* BOTÓN FLOTANTE DEL CARRITO */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-sm">
        <button
          onClick={() => setShowCartDrawer(true)}
          className={`w-full flex items-center justify-between gap-3 pl-5 pr-3 py-3 rounded-full shadow-2xl cursor-pointer transition active:scale-[0.98] ${t.accentBg}`}
        >
          <span className="flex items-center gap-2.5 text-sm font-semibold">
            <FiShoppingBag className="text-base" />
            {totalCartItems > 0 ? 'Ver mi pedido' : 'Mi pedido'}
          </span>

          <span
            className={`min-w-8 h-8 px-2 rounded-full flex items-center justify-center text-xs font-bold ${
              isLight ? 'bg-white/20' : 'bg-black/15'
            }`}
          >
            {totalCartItems}
          </span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* ESTILO CLÁSICO                                               */}
      {/* ============================================================ */}
      {menuStyle === 'classic' && (
        <div className="flex-1 flex flex-col">
          <header className="px-6 pt-20 pb-10 text-center">
            <div className="max-w-xl mx-auto space-y-5">
              <p className={`text-[11px] uppercase tracking-[0.45em] ${t.accent}`}>
                Carta
              </p>

              <h1
                className={`font-serif text-5xl md:text-6xl leading-[1.05] tracking-tight ${t.title}`}
              >
                {displayName}
              </h1>

              <div className="flex items-center justify-center gap-3">
                <span className={`h-px w-12 ${t.lineBg}`} />
                <span className={`text-xs ${t.accent}`}>✦</span>
                <span className={`h-px w-12 ${t.lineBg}`} />
              </div>
            </div>
          </header>

          <div
            className={`sticky top-0 z-30 backdrop-blur-xl border-y ${t.headerBg}`}
          >
            <div className="max-w-2xl mx-auto px-6 py-3 flex flex-col gap-3">
              <div className={tabsWrapper('underline')}>
                {renderCategoryTabs('underline')}
              </div>
            </div>
          </div>

          <main className="max-w-2xl w-full mx-auto px-6 py-14 flex-1 space-y-20">
            {renderSearch('Buscar en la carta', 'max-w-xs mx-auto -mt-4')}

            {filteredCategories.length === 0 && emptyState}

            {filteredCategories.map((cat, index) => (
              <section key={cat.id} className="space-y-10">
                <div className="text-center space-y-2">
                  <span className={`font-serif italic text-sm ${t.accent}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2
                    className={`font-serif text-3xl tracking-tight ${t.title}`}
                  >
                    {cat.name}
                  </h2>
                </div>

                <div className="space-y-9">
                  {cat.items.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleTriggerAdd(item)}
                      className="flex items-start gap-4 group cursor-pointer"
                    >
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-baseline gap-3">
                          <h3
                            className={`font-serif text-lg leading-snug ${t.title}`}
                          >
                            {item.name}
                          </h3>

                          <span
                            className={`flex-1 border-b border-dotted translate-y-[-4px] ${t.line}`}
                          />

                          <span
                            className={`font-serif text-lg whitespace-nowrap ${t.accent}`}
                          >
                            {displayPrice(item)}
                          </span>
                        </div>

                        {item.description && (
                          <p
                            className={`text-sm leading-relaxed max-w-md ${t.muted}`}
                          >
                            {item.description}
                          </p>
                        )}

                        <button
                          onClick={(e) => handleTriggerAdd(item, e)}
                          className={`mt-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] cursor-pointer transition ${t.accent} hover:opacity-70`}
                        >
                          <FiPlus /> Agregar
                        </button>
                      </div>

                      {item.image_url && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            openImage(item)
                          }}
                          className={`w-20 h-20 flex-shrink-0 overflow-hidden rounded-sm border cursor-pointer ${t.line}`}
                        >
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition duration-500"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </main>
        </div>
      )}

      {/* ============================================================ */}
      {/* ESTILO MODERNO                                               */}
      {/* ============================================================ */}
      {menuStyle === 'modern' && (
        <div className="flex-1 flex flex-col">
          <header
            className={`sticky top-0 z-30 backdrop-blur-xl border-b ${t.headerBg}`}
          >
            <div className="max-w-3xl mx-auto px-5 pt-5 pb-0 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h1
                  className={`text-2xl font-bold tracking-tight truncate ${t.title}`}
                >
                  {displayName}
                </h1>
              </div>

              {renderSearch('Buscar productos')}

              <div className={tabsWrapper('underline')}>
                {renderCategoryTabs('underline')}
              </div>
            </div>
          </header>

          <main className="max-w-3xl w-full mx-auto px-5 py-8 flex-1 space-y-12">
            {filteredCategories.length === 0 && emptyState}

            {filteredCategories.map((cat) => (
              <section key={cat.id}>
                <div className="flex items-center gap-3 mb-2">
                  <h2
                    className={`text-lg font-bold tracking-tight ${t.title}`}
                  >
                    {cat.name}
                  </h2>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${t.accentSoft}`}
                  >
                    {cat.items.length}
                  </span>
                </div>

                <div className={`divide-y ${isLight ? 'divide-[#E4E2DC]' : 'divide-[#26262A]'}`}>
                  {cat.items.map((item) => (
                    <article
                      key={item.id}
                      onClick={() => handleTriggerAdd(item)}
                      className="flex items-center gap-4 py-5 cursor-pointer group"
                    >
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <h3
                          className={`text-[15px] font-semibold leading-snug ${t.title}`}
                        >
                          {item.name}
                        </h3>

                        {item.description && (
                          <p
                            className={`text-[13px] leading-relaxed line-clamp-2 ${t.muted}`}
                          >
                            {item.description}
                          </p>
                        )}

                        <p className={`text-sm font-bold pt-0.5 ${t.accent}`}>
                          {displayPrice(item)}
                        </p>
                      </div>

                      <div className="relative flex-shrink-0">
                        {item.image_url ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              openImage(item)
                            }}
                            className={`block w-24 h-24 rounded-2xl overflow-hidden border cursor-pointer ${t.line}`}
                          >
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24" />
                        )}

                        <button
                          onClick={(e) => handleTriggerAdd(item, e)}
                          aria-label={`Agregar ${item.name}`}
                          className={`absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition active:scale-90 ${t.accentBg}`}
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </main>
        </div>
      )}

      {/* ============================================================ */}
      {/* ESTILO TARJETAS                                              */}
      {/* ============================================================ */}
      {menuStyle === 'cards' && (
        <div className="flex-1 flex flex-col">
          <header className="px-5 pt-14 pb-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="space-y-2">
                <p className={`text-[11px] font-semibold uppercase tracking-[0.3em] ${t.accent}`}>
                  Nuestra carta
                </p>
                <h1
                  className={`text-4xl md:text-5xl font-extrabold tracking-tight leading-none ${t.title}`}
                >
                  {displayName}
                </h1>
              </div>

              {renderSearch('¿Qué se te antoja hoy?', 'max-w-md')}
            </div>
          </header>

          <div className={`sticky top-0 z-30 backdrop-blur-xl border-b ${t.headerBg}`}>
            <div className="max-w-4xl mx-auto px-5 py-3">
              <div className={tabsWrapper('pill')}>
                {renderCategoryTabs('pill')}
              </div>
            </div>
          </div>

          <main className="max-w-4xl w-full mx-auto px-5 py-10 flex-1 space-y-14">
            {filteredCategories.length === 0 && emptyState}

            {filteredCategories.map((cat) => (
              <section key={cat.id} className="space-y-5">
                <h2 className={`text-2xl font-bold tracking-tight ${t.title}`}>
                  {cat.name}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                  {cat.items.map((item) => (
                    <article
                      key={item.id}
                      onClick={() => handleTriggerAdd(item)}
                      className={`group rounded-3xl overflow-hidden flex flex-col border cursor-pointer ${t.surface} ${t.line}`}
                    >
                      <div className={`relative aspect-[4/3] overflow-hidden ${t.surfaceAlt}`}>
                        {item.image_url ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              openImage(item)
                            }}
                            className="block w-full h-full cursor-pointer"
                          >
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center text-3xl ${t.muted}`}>
                            ✦
                          </div>
                        )}

                        <span
                          className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md ${
                            isLight
                              ? 'bg-white/90 text-[#141414]'
                              : 'bg-black/70 text-white'
                          }`}
                        >
                          {displayPrice(item)}
                        </span>
                      </div>

                      <div className="p-3.5 md:p-4 flex flex-col flex-1 gap-3">
                        <div className="space-y-1 flex-1">
                          <h3
                            className={`text-sm md:text-[15px] font-semibold leading-snug ${t.title}`}
                          >
                            {item.name}
                          </h3>

                          {item.description && (
                            <p
                              className={`text-xs leading-relaxed line-clamp-2 ${t.muted}`}
                            >
                              {item.description}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleTriggerAdd(item, e)}
                          className={`w-full py-2.5 rounded-2xl text-xs font-semibold cursor-pointer transition active:scale-[0.98] flex items-center justify-center gap-1.5 ${t.accentBg}`}
                        >
                          <FiPlus /> Agregar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </main>
        </div>
      )}

      {/* MODAL DE SELECCIÓN DE TAMAÑOS (CHICO, MEDIANO, GRANDE) */}
      {isSizeModalOpen && productToSize && (
        <div
          onClick={() => setIsSizeModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border space-y-5 ${t.surface} ${t.line}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-base font-bold tracking-tight ${t.title}`}>
                  {productToSize.name}
                </h3>
                <p className={`text-xs mt-0.5 ${t.muted}`}>
                  Selecciona el tamaño de tu preferencia
                </p>
              </div>

              <button
                onClick={() => setIsSizeModalOpen(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center border cursor-pointer transition ${t.line}`}
              >
                <FiX className="text-xs" />
              </button>
            </div>

            <div className="space-y-2">
              {(['chico', 'mediano', 'grande'] as const).map((sizeKey) => {
                const priceVal = productToSize.sizes_prices?.[sizeKey]
                if (priceVal === undefined || priceVal === null || priceVal === '') return null

                const numericPrice = parsePrice(priceVal) ?? 0
                const sizeLabel = sizeKey.charAt(0).toUpperCase() + sizeKey.slice(1)
                const isSelected = selectedSizeKey === sizeKey

                return (
                  <button
                    key={sizeKey}
                    onClick={() => setSelectedSizeKey(sizeKey)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-[#FF7A45] bg-[#FF7A45]/10 font-semibold'
                        : `${t.line} hover:border-neutral-400`
                    }`}
                  >
                    <span className="text-xs font-semibold">{sizeLabel}</span>
                    <span className="text-xs font-bold">{formatCLP(numericPrice)}</span>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => {
                const priceVal = productToSize.sizes_prices?.[selectedSizeKey]
                const numericPrice = parsePrice(priceVal) ?? 0
                addToCartDirect(productToSize, selectedSizeKey, numericPrice)
                setIsSizeModalOpen(false)
              }}
              className={`w-full py-3 rounded-2xl text-xs font-semibold cursor-pointer transition shadow-md ${t.accentBg}`}
            >
              Confirmar y Agregar
            </button>
          </div>
        </div>
      )}

      {/* BANNER MOGU */}
      <section className={`border-t py-14 px-6 text-center ${t.line}`}>
        <div className="max-w-md mx-auto space-y-3">
          <span className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${t.accent}`}>
            Plataforma Mogu
          </span>

          <h3 className={`text-lg font-semibold tracking-tight ${t.title}`}>
            Eleva la experiencia digital de tu local
          </h3>

          <p className={`text-sm ${t.muted}`}>
            Crea cartas interactivas de alta gama en minutos.
          </p>

          <div className="pt-3">
            <a
              href="https://mogu.cl"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block px-6 py-3 text-xs font-semibold rounded-full transition ${t.accentBg}`}
            >
              Crear mi carta Mogu ↗
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className={`py-6 text-center border-t text-[10px] tracking-[0.3em] uppercase ${t.footer}`}
      >
        Hecho con Mogu Digital
      </footer>

      {/* DRAWER DEL CARRITO */}
      {showCartDrawer && (
        <div
          onClick={() => setShowCartDrawer(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md h-full p-6 flex flex-col shadow-2xl border-l ${t.line} ${
              isLight ? 'bg-[#FAFAF8] text-[#141414]' : 'bg-[#0F0F11] text-[#F2F2EE]'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-4 ${t.line}`}>
              <div className="flex items-center gap-2.5">
                <FiShoppingBag className={`text-lg ${t.accent}`} />
                <h2 className="text-base font-bold tracking-tight">Tu pedido</h2>
              </div>

              <button
                onClick={() => setShowCartDrawer(false)}
                className={`w-9 h-9 rounded-full flex items-center justify-center border cursor-pointer transition ${t.line} hover:opacity-70`}
                aria-label="Cerrar carrito"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 min-h-0 py-5 pr-1">
              {cart.length === 0 ? (
                <div className={`text-center py-20 text-sm ${t.muted}`}>
                  Tu carrito está vacío. Agrega productos desde la carta.
                </div>
              ) : (
                cart.map((ci) => {
                  const unitPrice = ci.selectedPrice ?? parsePrice(ci.item.price)
                  const itemSubtotal = getItemSubtotal(ci)

                  return (
                    <div
                      key={ci.cartId}
                      className={`flex items-center justify-between gap-3 p-3 rounded-2xl border ${t.line} ${t.surface}`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {ci.item.image_url ? (
                          <img
                            src={ci.item.image_url}
                            alt={ci.item.name}
                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                          />
                        ) : (
                          <div
                            className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${t.surfaceAlt} ${t.muted}`}
                          >
                            <FiShoppingBag />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold break-words leading-snug">
                            {ci.item.name} {ci.selectedSize ? `(${ci.selectedSize})` : ''}
                          </h4>

                          <p className={`text-xs mt-0.5 ${t.muted}`}>
                            {unitPrice !== null
                              ? `${formatCLP(unitPrice)} c/u`
                              : 'Precio por confirmar'}
                          </p>

                          <p className={`text-sm font-bold mt-1 ${t.accent}`}>
                            {itemSubtotal !== null
                              ? formatCLP(itemSubtotal)
                              : 'Por confirmar'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className={`flex items-center rounded-full border ${t.line}`}>
                          <button
                            onClick={() => decreaseQuantity(ci.cartId)}
                            className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-60"
                            aria-label={`Disminuir ${ci.item.name}`}
                          >
                            <FiMinus className="text-xs" />
                          </button>

                          <span className="text-sm font-bold w-5 text-center">
                            {ci.quantity}
                          </span>

                          <button
                            onClick={() => increaseQuantity(ci)}
                            className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-60"
                            aria-label={`Aumentar ${ci.item.name}`}
                          >
                            <FiPlus className="text-xs" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(ci.cartId)}
                          className="text-rose-500 hover:text-rose-600 p-1 transition cursor-pointer"
                          aria-label={`Eliminar ${ci.item.name}`}
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className={`pt-5 border-t space-y-4 ${t.line}`}>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Subtotal</p>
                  <p className={`text-xs mt-0.5 ${t.muted}`}>
                    {totalCartItems}{' '}
                    {totalCartItems === 1 ? 'producto' : 'productos'}
                  </p>
                </div>

                <span className="text-2xl font-bold tracking-tight">
                  {formatCLP(cartSubtotal)}
                </span>
              </div>

              {hasUnpricedItems && (
                <p className="text-xs leading-relaxed text-amber-600">
                  Hay productos con precio por confirmar. El subtotal mostrado
                  no incluye esos productos.
                </p>
              )}

              <p className={`text-xs ${t.muted}`}>
                El costo de despacho, si corresponde, se coordina directamente
                con el local.
              </p>

              <button
                onClick={handleWhatsAppCheckout}
                disabled={cart.length === 0}
                className={`w-full py-4 px-6 rounded-full text-sm font-semibold flex items-center justify-center gap-2.5 transition ${
                  cart.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-lg shadow-emerald-900/20'
                    : `${t.surfaceAlt} ${t.muted} cursor-not-allowed`
                }`}
              >
                <FiMessageCircle className="text-base" />
                <span>Enviar pedido por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE IMAGEN */}
      {activeImageModal && (
        <div
          onClick={() => setActiveImageModal(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative max-w-lg w-full border rounded-3xl overflow-hidden shadow-2xl flex flex-col ${t.line} ${t.surface}`}
          >
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute top-4 right-4 z-40 w-9 h-9 rounded-full flex items-center justify-center bg-black/60 hover:bg-black text-white transition cursor-pointer"
              aria-label="Cerrar imagen"
            >
              <FiX />
            </button>

            <div
              className={`relative h-[45vh] flex items-center justify-center overflow-hidden ${t.surfaceAlt}`}
            >
              <img
                src={activeImageModal.url}
                alt={activeImageModal.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 space-y-2">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className={`text-lg font-bold tracking-tight ${t.title}`}>
                  {activeImageModal.name}
                </h3>

                {activeImageModal.price !== null &&
                  activeImageModal.price !== undefined &&
                  String(activeImageModal.price).trim() !== '' && (
                    <span
                      className={`text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap ${t.accentSoft}`}
                    >
                      {displayPrice({ price: activeImageModal.price } as MenuItem)}
                    </span>
                  )}
              </div>

              {activeImageModal.description && (
                <p className={`text-sm leading-relaxed ${t.muted}`}>
                  {activeImageModal.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}