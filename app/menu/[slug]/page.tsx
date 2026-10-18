
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
}

interface MenuCategory {
  id: string
  name: string
  position: number
  items: MenuItem[]
}

interface CartItem {
  item: MenuItem
  quantity: number
}

interface ImageModal {
  url: string
  name: string
  description: string | null
  price: string | number | null
}

export default function MoguSubtleAmbientMenu() {
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
          const { data: fallback, error: fallbackError } =
            await supabase
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
              (item) =>
                item.category_id === cat.id &&
                item.active !== false
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

  // Convierte precios de texto o número a valores numéricos.
  // Admite formatos como 5990, "5990", "$5.990" y "5.990 CLP".
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

    // Formato chileno: 5.990 o 15.000.
    if (/^-?\d{1,3}(\.\d{3})+$/.test(cleaned)) {
      const value = Number(cleaned.replace(/\./g, ''))
      return Number.isFinite(value) ? value : null
    }

    // Enteros sin separadores: 5990.
    if (/^-?\d+$/.test(cleaned)) {
      const value = Number(cleaned)
      return Number.isFinite(value) ? value : null
    }

    // Formato decimal, por ejemplo 5990,50.
    const value = Number(cleaned.replace(',', '.'))
    return Number.isFinite(value) ? value : null
  }

  const formatCLP = (amount: number) =>
    amount.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    })

  // Mostrar el precio original sin provocar errores si es numérico.
  const displayPrice = (
    price: string | number | null | undefined
  ): string => {
    if (price === null || price === undefined || String(price).trim() === '') {
      return 'A convenir'
    }

    const parsed = parsePrice(price)
    return parsed === null ? String(price) : formatCLP(parsed)
  }

  // Subtotal de cada producto.
  const getItemSubtotal = (
    item: MenuItem,
    quantity: number
  ): number | null => {
    const price = parsePrice(item.price)

    if (price === null) return null

    return price * quantity
  }

  // Cantidad total de unidades en el carrito.
  const totalCartItems = useMemo(
    () => cart.reduce((sum, ci) => sum + ci.quantity, 0),
    [cart]
  )

  // Suma de los productos con precio conocido.
  const cartSubtotal = useMemo(
    () =>
      cart.reduce((total, ci) => {
        const subtotal = getItemSubtotal(ci.item, ci.quantity)
        return total + (subtotal ?? 0)
      }, 0),
    [cart]
  )

  // Detectar productos sin precio válido.
  const hasUnpricedItems = useMemo(
    () => cart.some((ci) => parsePrice(ci.item.price) === null),
    [cart]
  )

  // Agregar producto al carrito.
  const addToCart = (
    item: MenuItem,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation()

    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id)

      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        )
      }

      return [...prev, { item, quantity: 1 }]
    })
  }

  // Disminuir cantidad.
  const decreaseQuantity = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === itemId)

      if (existing && existing.quantity > 1) {
        return prev.map((ci) =>
          ci.item.id === itemId
            ? { ...ci, quantity: ci.quantity - 1 }
            : ci
        )
      }

      return prev.filter((ci) => ci.item.id !== itemId)
    })
  }

  // Eliminar producto del carrito.
  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId))
  }

  // Enviar pedido por WhatsApp con precios y subtotales.
  const handleWhatsAppCheckout = () => {
    if (cart.length === 0 || !profile) return

    let text =
      `Hola *${profile.full_name || profile.name || 'Local'}*, ` +
      'me gustaría realizar el siguiente pedido desde su carta digital:\n\n'

    cart.forEach((ci) => {
      const unitPrice = parsePrice(ci.item.price)
      const subtotal = getItemSubtotal(ci.item, ci.quantity)

      text += `• *${ci.quantity}x* ${ci.item.name}\n`

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

    const rawPhone = profile.phone
      ? profile.phone.replace(/\D/g, '')
      : ''

    const whatsappUrl = rawPhone
      ? `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  // Buscar productos y filtrar categorías.
  const filteredCategories = useMemo(() => {
    return categories
      .map((cat) => {
        if (
          activeCategory !== 'all' &&
          cat.id !== activeCategory
        ) {
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

  // Pantalla de carga.
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E0C0A] text-[#D4CEC7] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border border-[#8C7A6B]/20 border-t-[#8C7A6B] animate-spin" />
        <span className="mt-4 font-serif italic text-xs tracking-[0.2em] text-[#8C7A6B]">
          Cargando atmósfera...
        </span>
      </div>
    )
  }

  // Pantalla de error.
  if (errorMsg || !profile) {
    return (
      <div className="min-h-screen bg-[#0E0C0A] text-[#D4CEC7] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h1 className="font-serif text-lg tracking-wide text-[#E8E4DF]">
          Establecimiento no disponible
        </h1>

        <p className="text-xs text-[#8C7A6B]">{errorMsg}</p>

        <a
          href={`/panel/menu/${slug}`}
          className="px-5 py-2 bg-[#26211D] text-[#D4CEC7] text-xs font-serif rounded-full hover:bg-[#38312B] transition"
        >
          Ir al Panel
        </a>
      </div>
    )
  }

  const displayName = profile.full_name || profile.name || slug
  const menuStyle = profile.menu_style || 'modern'
  const isLight = profile.menu_theme === 'light'

  const theme = {
    bg: isLight
      ? 'bg-[#D1C7B8] text-[#1C1815]'
      : 'bg-[#0E0C0A] text-[#D4CEC7]',

    headerBg: isLight
      ? 'bg-[#D1C7B8]/95 border-[#BCB1A1]'
      : 'bg-[#0E0C0A]/90 border-[#211C18]/60',

    titleMain: isLight ? 'text-[#1C1815]' : 'text-[#EFECE6]',

    subtitle: isLight ? 'text-[#615448]' : 'text-[#9E8D80]',

    searchBg: isLight
      ? 'bg-[#C5BBB0] border-[#B2A79C] text-[#1C1815] placeholder-[#615448] focus:border-[#42382F]'
      : 'bg-[#161311] border-[#26211D] text-[#D4CEC7] placeholder-[#73655B] focus:border-[#66584E]',

    pillActive: isLight
      ? 'bg-[#1C1815] text-[#D1C7B8] border-[#1C1815]'
      : 'bg-[#26211D] text-[#EFECE6] border-[#38312B]',

    pillInactive: isLight
      ? 'bg-[#C5BBB0] text-[#42382F] hover:text-[#1C1815] border-[#B2A79C]'
      : 'bg-[#13100E] text-[#8C7A6B] hover:text-[#D4CEC7] border-[#211C18]',

    cardBg: isLight
      ? 'bg-[#DDD4C6] border-[#C2B7A8] hover:border-[#A89D8E] shadow-sm'
      : 'bg-[#13100E]/70 hover:bg-[#161311] border-[#211C18] hover:border-[#38312B]',

    itemTitle: isLight
      ? 'text-[#1C1815] group-hover:text-[#52453B]'
      : 'text-[#E8E4DF] group-hover:text-[#B3A497]',

    itemDesc: isLight ? 'text-[#52453B]' : 'text-[#8C7A6B]',

    itemPrice: isLight
      ? 'text-[#42382F] font-extrabold'
      : 'text-[#A8988C]',

    divider: isLight ? 'border-[#C2B7A8]' : 'border-[#211C18]',

    badgeBg: isLight
      ? 'bg-[#C5BBB0] border-[#B2A79C] text-[#42382F]'
      : 'bg-[#161311]/60 border-[#26211D] text-[#9E8D80]',

    halo: isLight
      ? 'bg-gradient-to-b from-[#B2A79C]/30 to-transparent'
      : 'bg-gradient-to-b from-[#8C7A6B]/10 via-[#594B3F]/5 to-transparent',

    footerBg: isLight
      ? 'bg-[#C5BBB0] border-[#B2A79C] text-[#52453B]'
      : 'bg-[#0A0807] border-[#1C1714] text-[#594B3F]',
  }

  const renderCategories = () => (
    <>
      <button
        onClick={() => setActiveCategory('all')}
        className={`px-4 py-1.5 rounded-xl text-xs font-serif tracking-wider transition whitespace-nowrap flex-shrink-0 cursor-pointer border ${
          activeCategory === 'all'
            ? theme.pillActive
            : theme.pillInactive
        }`}
      >
        Todas
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setActiveCategory(cat.id)}
          className={`px-4 py-1.5 rounded-xl text-xs font-serif tracking-wider transition whitespace-nowrap flex-shrink-0 cursor-pointer border ${
            activeCategory === cat.id
              ? theme.pillActive
              : theme.pillInactive
          }`}
        >
          {cat.name}
        </button>
      ))}
    </>
  )

  const openImage = (item: MenuItem) => {
    if (!item.image_url) return

    setActiveImageModal({
      url: item.image_url,
      name: item.name,
      description: item.description,
      price: item.price,
    })
  }

  const renderAddButton = (item: MenuItem) => (
    <button
      onClick={(e) => addToCart(item, e)}
      className={`px-3 py-2 rounded-xl text-[10px] font-serif uppercase tracking-wider transition cursor-pointer border ${
        isLight
          ? 'bg-[#C5BBB0] border-[#B2A79C] text-[#1C1815] hover:bg-[#1C1815] hover:text-[#D1C7B8]'
          : 'bg-[#1A1613] border-[#26211D] text-[#D4CEC7] hover:bg-[#38312B]'
      }`}
    >
      <FiPlus className="inline mr-1" />
      Agregar
    </button>
  )

  return (
    <div
      className={`min-h-screen font-sans selection:bg-[#8C7A6B]/25 relative overflow-hidden flex flex-col justify-between transition-colors duration-500 pb-20 ${theme.bg}`}
    >
      <div
        className={`absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] ${theme.halo} blur-[140px] rounded-full pointer-events-none`}
      />

      {/* BOTÓN FLOTANTE DEL CARRITO */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowCartDrawer(true)}
          className={`flex items-center gap-3 px-6 py-3.5 rounded-full shadow-2xl transition-all duration-300 cursor-pointer border ${
            isLight
              ? 'bg-[#1C1815] text-[#D1C7B8] border-[#1C1815] hover:bg-[#38312B]'
              : 'bg-[#26211D] text-[#EFECE6] border-[#38312B] hover:bg-[#38312B]'
          }`}
        >
          <div className="relative">
            <FiShoppingBag className="text-lg" />
            {totalCartItems > 0 && (
              <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 bg-amber-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center shadow">
                {totalCartItems}
              </span>
            )}
          </div>

          <span className="text-xs font-serif uppercase tracking-widest font-medium">
            {totalCartItems > 0
              ? `Ver Pedido (${totalCartItems})`
              : 'Mi Carrito'}
          </span>
        </button>
      </div>

      {/* ESTILO CLÁSICO */}
      {menuStyle === 'classic' && (
        <div className="flex-1 flex flex-col relative z-10">
          <header
            className={`pt-16 pb-10 px-6 text-center relative border-b backdrop-blur-xl space-y-6 ${theme.headerBg}`}
          >
            <div className="max-w-xl mx-auto space-y-2">
              <span
                className={`text-[9px] uppercase tracking-[0.4em] block ${theme.subtitle}`}
              >
                Fine Dining Experience
              </span>

              <h1
                className={`text-3xl md:text-4xl font-serif font-light tracking-wide ${theme.titleMain}`}
              >
                {displayName}
              </h1>

              <div
                className={`w-10 h-px mx-auto my-3 ${
                  isLight ? 'bg-[#B2A79C]' : 'bg-[#38312B]'
                }`}
              />
            </div>

            <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-2 max-w-xl mx-auto flex-nowrap [scrollbar-width:none]">
              {renderCategories()}
            </div>
          </header>

          <main className="max-w-2xl w-full mx-auto px-6 py-12 flex-1 space-y-16">
            {filteredCategories.map((cat) => (
              <section key={cat.id} className="space-y-6">
                <div className="text-center">
                  <h2
                    className={`text-xs font-serif uppercase tracking-[0.3em] inline-block border-b pb-2 ${theme.subtitle} ${theme.divider}`}
                  >
                    {cat.name}
                  </h2>
                </div>

                <div className="space-y-8 font-serif">
                  {cat.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 group"
                    >
                      {item.image_url && (
                        <button
                          type="button"
                          onClick={() => openImage(item)}
                          className={`w-12 h-12 rounded-full overflow-hidden border flex-shrink-0 cursor-pointer ${
                            isLight
                              ? 'border-[#B2A79C] bg-[#C5BBB0]'
                              : 'border-[#26211D] bg-[#0A0807]'
                          }`}
                        >
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      )}

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-baseline gap-3">
                          <span className={`text-sm font-light tracking-wider ${theme.itemTitle}`}>
                            {item.name}
                          </span>

                          <div className={`flex-1 border-b border-dotted ${theme.divider}`} />

                          <span className={`text-sm font-sans whitespace-nowrap ${theme.itemPrice}`}>
                            {displayPrice(item.price)}
                          </span>
                        </div>

                        {item.description && (
                          <p className={`text-xs font-sans font-light italic leading-relaxed ${theme.itemDesc}`}>
                            {item.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={(e) => addToCart(item, e)}
                        className={`p-2 rounded-full transition cursor-pointer border ${
                          isLight
                            ? 'bg-[#C5BBB0] border-[#B2A79C] hover:bg-[#1C1815] hover:text-[#D1C7B8]'
                            : 'bg-[#161311] border-[#26211D] hover:bg-[#38312B] text-[#D4CEC7]'
                        }`}
                        title="Agregar al pedido"
                      >
                        <FiPlus className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </main>
        </div>
      )}

      {/* ESTILO MODERNO */}
      {menuStyle === 'modern' && (
        <div className="flex-1 flex flex-col relative z-10">
          <header className={`sticky top-0 z-30 backdrop-blur-xl border-b px-6 py-4 space-y-3 ${theme.headerBg}`}>
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
              <h1 className={`text-xs font-serif uppercase tracking-widest truncate ${theme.subtitle}`}>
                {displayName}
              </h1>

              <input
                type="text"
                placeholder="Buscar preparación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`rounded-full px-4 py-2 text-xs outline-none w-48 md:w-60 shadow-inner transition ${theme.searchBg}`}
              />
            </div>

            <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 flex-nowrap [scrollbar-width:none]">
              {renderCategories()}
            </div>
          </header>

          <main className="max-w-3xl w-full mx-auto px-6 py-10 flex-1 space-y-10">
            {filteredCategories.map((cat) => (
              <section key={cat.id} className="space-y-4">
                <h2 className={`text-[11px] font-serif uppercase tracking-widest border px-3.5 py-1.5 rounded-xl inline-block ${theme.badgeBg}`}>
                  {cat.name}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cat.items.map((item) => (
                    <article
                      key={item.id}
                      className={`rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-500 shadow-sm border ${theme.cardBg}`}
                    >
                      <div className="space-y-2 overflow-hidden flex-1">
                        <h3 className={`text-xs font-serif font-medium ${theme.itemTitle}`}>
                          {item.name}
                        </h3>

                        {item.description && (
                          <p className={`text-[11px] font-light line-clamp-2 leading-relaxed ${theme.itemDesc}`}>
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className={`text-xs font-serif font-medium ${theme.itemPrice}`}>
                            {displayPrice(item.price)}
                          </span>

                          {renderAddButton(item)}
                        </div>
                      </div>

                      {item.image_url && (
                        <button
                          type="button"
                          onClick={() => openImage(item)}
                          className={`w-16 h-16 rounded-xl overflow-hidden border flex-shrink-0 cursor-pointer ${
                            isLight
                              ? 'border-[#B2A79C]'
                              : 'border-[#26211D]'
                          }`}
                        >
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </main>
        </div>
      )}

      {/* ESTILO TARJETAS EDITORIAL */}
      {menuStyle === 'cards' && (
        <div className="flex-1 flex flex-col relative z-10">
          <header className={`backdrop-blur-xl border-b sticky top-0 z-30 px-6 py-5 space-y-4 ${theme.headerBg}`}>
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
              <div>
                <span className={`text-[9px] font-serif uppercase tracking-[0.3em] block ${theme.subtitle}`}>
                  
                </span>

                <h1 className={`text-sm font-serif font-medium tracking-wide mt-0.5 ${theme.titleMain}`}>
                  {displayName}
                </h1>
              </div>

              <input
                type="text"
                placeholder="Buscar café o tostado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`rounded-2xl px-4 py-2 text-xs outline-none w-44 md:w-56 shadow-inner transition ${theme.searchBg}`}
              />
            </div>

            <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 flex-nowrap [scrollbar-width:none]">
              {renderCategories()}
            </div>
          </header>

          <main className="max-w-3xl w-full mx-auto px-6 py-12 flex-1 space-y-12">
            {filteredCategories.map((cat) => (
              <section key={cat.id} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className={`text-xs font-serif uppercase tracking-[0.25em] ${theme.subtitle}`}>
                    {cat.name}
                  </h2>

                  <div className={`flex-1 h-px ${isLight ? 'bg-[#C2B7A8]' : 'bg-[#211C18]'}`} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cat.items.map((item) => (
                    <article
                      key={item.id}
                      className={`rounded-3xl overflow-hidden transition-all duration-700 flex flex-col shadow-md border ${theme.cardBg}`}
                    >
                      {item.image_url && (
                        <button
                          type="button"
                          onClick={() => openImage(item)}
                          className="h-48 overflow-hidden cursor-pointer"
                        >
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </button>
                      )}

                      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-baseline gap-2">
                            <h3 className={`font-serif text-sm font-medium ${theme.itemTitle}`}>
                              {item.name}
                            </h3>

                            <span className={`font-serif text-xs whitespace-nowrap ${theme.itemPrice}`}>
                              {displayPrice(item.price)}
                            </span>
                          </div>

                          {item.description && (
                            <p className={`text-xs font-light leading-relaxed ${theme.itemDesc}`}>
                              {item.description}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={(e) => addToCart(item, e)}
                          className={`w-full py-2.5 rounded-xl font-serif text-xs uppercase tracking-widest transition cursor-pointer border ${
                            isLight
                              ? 'bg-[#C5BBB0] border-[#B2A79C] text-[#1C1815] hover:bg-[#1C1815] hover:text-[#D1C7B8]'
                              : 'bg-[#161311] border-[#26211D] text-[#D4CEC7] hover:bg-[#38312B]'
                          }`}
                        >
                          Agregar al Pedido
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

      {/* BANNER MOGU */}
      <section
        className={`relative z-10 border-t py-16 px-6 text-center ${
          isLight
            ? 'bg-gradient-to-b from-[#C5BBB0]/50 to-[#B2A79C]/80 border-[#B2A79C]'
            : 'bg-gradient-to-b from-transparent via-[#120F0D] to-[#0A0807] border-[#211C18]/60'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <span className={`text-[9px] font-serif uppercase tracking-[0.35em] ${theme.subtitle}`}>
            Plataforma Mogu
          </span>

          <h3 className={`text-base font-serif font-light ${theme.titleMain}`}>
            Eleva la experiencia digital de tu local
          </h3>

          <p className={`text-xs font-light ${theme.itemDesc}`}>
            Crea cartas interactivas de alta gama en minutos.
          </p>

          <div className="pt-3">
            <a
              href="https://mogu.cl"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block px-7 py-3 text-xs font-serif uppercase tracking-widest rounded-full transition shadow-lg border ${
                isLight
                  ? 'bg-[#DDD4C6] hover:bg-[#C2B7A8] text-[#1C1815] border-[#B2A79C]'
                  : 'bg-[#1C1714] hover:bg-[#26211D] border-[#38312B] text-[#D4CEC7]'
              }`}
            >
              Crear mi carta Mogu ↗
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`relative z-10 py-6 text-center border-t text-[9px] tracking-[0.25em] font-serif ${theme.footerBg}`}>
        CURATED BY{' '}
        <span className={`font-medium ${isLight ? 'text-[#1C1815]' : 'text-[#A8988C]'}`}>
          MOGU DIGITAL
        </span>
      </footer>

      {/* DRAWER DEL CARRITO */}
      {showCartDrawer && (
        <div
          onClick={() => setShowCartDrawer(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md h-full p-6 sm:p-8 flex flex-col shadow-2xl border-l ${
              isLight
                ? 'bg-[#D1C7B8] border-[#BCB1A1] text-[#1C1815]'
                : 'bg-[#13100E] border-[#26211D] text-[#D4CEC7]'
            }`}
          >
            {/* Encabezado */}
            <div className="flex items-center justify-between border-b pb-4 border-current/20">
              <div className="flex items-center gap-2.5">
                <FiShoppingBag className="text-amber-600 text-lg" />
                <h2 className="text-sm font-serif uppercase tracking-[0.2em] font-semibold">
                  Tu Pedido
                </h2>
              </div>

              <button
                onClick={() => setShowCartDrawer(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-current/20 hover:bg-current/10 cursor-pointer"
                aria-label="Cerrar carrito"
              >
                ✕
              </button>
            </div>

            {/* Lista de productos */}
            <div className="space-y-3 overflow-y-auto flex-1 min-h-0 py-5 pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-xs font-serif italic opacity-70">
                  Tu carrito está vacío. Agrega platos o preparaciones desde el menú.
                </div>
              ) : (
                cart.map((ci) => {
                  const unitPrice = parsePrice(ci.item.price)
                  const itemSubtotal = getItemSubtotal(ci.item, ci.quantity)

                  return (
                    <div
                      key={ci.item.id}
                      className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-sm ${
                        isLight
                          ? 'bg-[#DDD4C6] border-[#C2B7A8]'
                          : 'bg-[#191512] border-[#26211D]'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {ci.item.image_url ? (
                          <img
                            src={ci.item.image_url}
                            alt={ci.item.name}
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-black/10 flex items-center justify-center text-lg flex-shrink-0">
                            🛍️
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-serif font-medium break-words">
                            {ci.item.name}
                          </h4>

                          <p className="text-[11px] opacity-70 mt-1">
                            {unitPrice !== null
                              ? `${formatCLP(unitPrice)} c/u`
                              : 'Precio por confirmar'}
                          </p>

                          <p className="text-xs font-semibold mt-1">
                            Subtotal:{' '}
                            {itemSubtotal !== null
                              ? formatCLP(itemSubtotal)
                              : 'Por confirmar'}
                          </p>
                        </div>
                      </div>

                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => decreaseQuantity(ci.item.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center border border-current/20 hover:bg-current/10 cursor-pointer"
                          aria-label={`Disminuir ${ci.item.name}`}
                        >
                          <FiMinus className="text-[10px]" />
                        </button>

                        <span className="text-xs font-bold w-4 text-center">
                          {ci.quantity}
                        </span>

                        <button
                          onClick={() => addToCart(ci.item)}
                          className="w-7 h-7 rounded-full flex items-center justify-center border border-current/20 hover:bg-current/10 cursor-pointer"
                          aria-label={`Aumentar ${ci.item.name}`}
                        >
                          <FiPlus className="text-[10px]" />
                        </button>

                        <button
                          onClick={() => removeFromCart(ci.item.id)}
                          className="text-rose-500 hover:text-rose-700 p-1.5 transition cursor-pointer"
                          aria-label={`Eliminar ${ci.item.name}`}
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* RESUMEN DEL PEDIDO */}
            <div className="pt-5 border-t border-current/20 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-serif font-medium">
                    Subtotal del pedido
                  </p>

                  <p className="text-[10px] opacity-60 mt-1">
                    {totalCartItems}{' '}
                    {totalCartItems === 1 ? 'producto' : 'productos'}
                  </p>
                </div>

                <span className="text-xl font-semibold font-serif">
                  {formatCLP(cartSubtotal)}
                </span>
              </div>

              {hasUnpricedItems && (
                <p className="text-[11px] leading-relaxed text-amber-700">
                  Hay productos cuyo precio está por confirmar. El subtotal mostrado no incluye esos productos.
                </p>
              )}

              <p className="text-[10px] opacity-60">
                El costo de despacho, si corresponde, se coordina directamente con el local.
              </p>

              <button
                onClick={handleWhatsAppCheckout}
                disabled={cart.length === 0}
                className={`w-full py-4 px-6 rounded-full font-serif text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2.5 shadow-xl transition-all ${
                  cart.length > 0
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-emerald-900/30 cursor-pointer'
                    : 'bg-current/10 opacity-50 cursor-not-allowed'
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
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative max-w-lg w-full border rounded-3xl overflow-hidden shadow-2xl flex flex-col ${
              isLight
                ? 'bg-[#DDD4C6] border-[#C2B7A8]'
                : 'bg-[#13100E] border-[#26211D]'
            }`}
          >
            <button
              onClick={() => setActiveImageModal(null)}
              className={`absolute top-4 right-4 z-40 w-8 h-8 rounded-full flex items-center justify-center text-xs transition border cursor-pointer ${
                isLight
                  ? 'bg-[#C5BBB0] hover:bg-[#B2A79C] text-[#1C1815] border-[#B2A79C]'
                  : 'bg-black/50 hover:bg-black text-[#D4CEC7] border-[#26211D]'
              }`}
              aria-label="Cerrar imagen"
            >
              ✕
            </button>

            <div
              className={`relative h-[45vh] flex items-center justify-center overflow-hidden ${
                isLight ? 'bg-[#C5BBB0]' : 'bg-[#0A0807]'
              }`}
            >
              <img
                src={activeImageModal.url}
                alt={activeImageModal.name}
                className="max-h-[42vh] max-w-full object-contain rounded-xl"
              />
            </div>

            <div
              className={`p-6 space-y-2 border-t ${
                isLight
                  ? 'bg-[#DDD4C6] border-[#C2B7A8]'
                  : 'bg-[#13100E] border-[#211C18]'
              }`}
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3
                  className={`font-serif text-base font-medium ${
                    isLight ? 'text-[#1C1815]' : 'text-[#E8E4DF]'
                  }`}
                >
                  {activeImageModal.name}
                </h3>

                {activeImageModal.price !== null &&
                  activeImageModal.price !== undefined &&
                  String(activeImageModal.price).trim() !== '' && (
                    <span
                      className={`font-serif text-xs px-3 py-1 rounded-xl border whitespace-nowrap ${
                        isLight
                          ? 'bg-[#C5BBB0] border-[#B2A79C] text-[#1C1815]'
                          : 'bg-[#1A1613] border-[#26211D] text-[#A8988C]'
                      }`}
                    >
                      {displayPrice(activeImageModal.price)}
                    </span>
                  )}
              </div>

              {activeImageModal.description && (
                <p
                  className={`text-xs font-light leading-relaxed ${
                    isLight ? 'text-[#52453B]' : 'text-[#8C7A6B]'
                  }`}
                >
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
