'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { FiArrowRight, FiHeart, FiShoppingBag, FiX, FiMessageCircle } from 'react-icons/fi'

interface Profile {
  id: string
  slug: string
  full_name: string
  phone?: string | null
  has_catalogo?: boolean
}

interface Category {
  id: string
  name: string
  position: number
}

interface Item {
  id: string
  category_id: string
  name: string
  description: string | null
  price: string | null
  image_url: string | null
  active: boolean
}

export default function LightEditorialCatalogPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  const [wishlist, setWishlist] = useState<string[]>([])
  const [showDrawer, setShowDrawer] = useState(false)

  useEffect(() => {
    async function loadCatalogData() {
      if (!slug) return
      setLoading(true)

      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', slug)
          .maybeSingle()

        if (profileData && profileData.has_catalogo) {
          setProfile(profileData)

          const { data: catsData } = await supabase
            .from('catalogo_categories')
            .select('*')
            .eq('profile_id', profileData.id)
            .order('position', { ascending: true })

          if (catsData && catsData.length > 0) {
            setCategories(catsData)

            const catIds = catsData.map((c) => c.id)
            const { data: itemsData } = await supabase
              .from('catalogo_items')
              .select('*')
              .in('category_id', catIds)
              .eq('active', true)
              .order('position', { ascending: true })

            setItems(itemsData || [])
          }
        }
      } catch (err) {
        console.error('Error al cargar catálogo:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCatalogData()
  }, [slug])

  const toggleWishlist = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] text-[#1C1917] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#A37B4C]/20 border-t-[#A37B4C] animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] text-[#1C1917] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h1 className="font-serif text-2xl font-light">Catálogo no disponible</h1>
        <p className="text-xs text-[#78716C] max-w-sm">
          Este perfil no existe o no tiene activo el módulo de tienda/catálogo.
        </p>
        <Link 
          href="/" 
          className="px-6 py-2.5 rounded-full bg-[#1C1917] text-white font-serif text-xs uppercase tracking-widest"
        >
          Volver al Inicio
        </Link>
      </div>
    )
  }

  const allActiveItems = items

  const handleWhatsAppConsult = () => {
    const selectedItems = allActiveItems.filter(i => wishlist.includes(i.id))
    if (selectedItems.length === 0) return

    let text = `Hola *${profile.full_name}*, me interesa consultar sobre la siguiente selección de tu catálogo:\n\n`
    selectedItems.forEach(item => {
      text += `• *${item.name}* ${item.price ? `(${item.price})` : ''}\n`
    })

    const rawPhone = profile.phone ? profile.phone.replace(/\D/g, '') : ''

    const whatsappUrl = rawPhone 
      ? `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`

    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="bg-[#F9F8F6] text-[#1C1917] font-sans selection:bg-[#B88E56]/20 selection:text-[#1C1917] min-h-screen relative">
      
      {/* NAVBAR FLOTANTE ILUMINADA */}
      <header className="fixed top-0 left-0 w-full z-50 px-6 lg:px-12 py-5 flex items-center justify-between backdrop-blur-md bg-[#F9F8F6]/80 border-b border-[#E8E4DF]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-serif font-bold tracking-[0.3em] uppercase text-[#A37B4C]">{profile.full_name}</span>
          <span className="text-[#D6D0C7]">/</span>
          <span className="text-xs font-medium tracking-widest uppercase text-[#78716C]">Editorial Collection</span>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowDrawer(true)}
            className="relative px-5 py-2 rounded-full bg-white border border-[#E8E4DF] hover:border-[#A37B4C] text-xs font-serif tracking-wider text-[#1C1917] transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer"
          >
            <FiShoppingBag className="text-[#A37B4C]" />
            <span>Selección</span>
            {wishlist.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#A37B4C] text-white font-bold text-[9px] flex items-center justify-center shadow-sm">
                {wishlist.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* HERO EDITORIAL CLARO Y LUMINOSO */}
      <section className="relative h-screen w-full flex flex-col justify-end p-6 lg:p-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={allActiveItems[0]?.image_url || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1600&auto=format&fit=crop"} 
            alt="Hero background" 
            className="w-full h-full object-cover opacity-85 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F9F8F6] via-[#F9F8F6]/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl space-y-4 pb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#E8E4DF] text-[10px] uppercase tracking-[0.3em] text-[#A37B4C] shadow-sm">
            <span>✦</span> {profile.full_name} Collection <span>✦</span>
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif font-light text-[#1C1917] tracking-wide leading-none">
            Curaduría <br /><span className="italic text-[#A37B4C]">Exclusiva</span>
          </h1>
          <p className="text-sm sm:text-base text-[#78716C] font-light max-w-lg leading-relaxed pt-2">
            Una selección donde la luz, las texturas y el espacio dialogan en perfecta armonía.
          </p>
        </div>

        <div className="absolute bottom-6 right-6 lg:right-12 z-10 hidden sm:flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#78716C]">
          <span>Desliza para explorar</span>
          <FiArrowRight className="text-[#A37B4C] animate-pulse" />
        </div>
      </section>

      {/* GALERÍA DE ESCENAS EDITORIALES */}
      <div className="space-y-32 py-24 px-6 lg:px-16 max-w-7xl mx-auto">
        {allActiveItems.length === 0 ? (
          <div className="text-center py-20 text-[#78716C] font-serif text-sm italic">
            No hay productos publicados en este catálogo todavía.
          </div>
        ) : (
          allActiveItems.map((item, index) => {
            const isLiked = wishlist.includes(item.id)
            const isEven = index % 2 === 1
            const categoryObj = categories.find(c => c.id === item.category_id)

            return (
              <article 
                key={item.id}
                className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${
                  isEven ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* TARJETA FOTOGRÁFICA DE ALTA DEFINICIÓN */}
                <div 
                  className="w-full lg:w-7/12 relative group cursor-pointer overflow-hidden rounded-[32px] border border-[#E8E4DF] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-700 hover:shadow-[0_25px_60px_rgba(163,123,76,0.12)] hover:border-[#A37B4C]/40"
                  onClick={() => toggleWishlist(item.id)}
                >
                  <div className="relative h-[480px] sm:h-[620px] w-full overflow-hidden bg-[#F2EFF9]">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">🛍️</div>
                    )}
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
                    
                    {/* BOTÓN FAVORITO */}
                    <button 
                      onClick={(e) => toggleWishlist(item.id, e)}
                      className={`absolute top-6 right-6 w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-md border ${
                        isLiked 
                          ? 'bg-[#A37B4C] border-[#A37B4C] text-white' 
                          : 'bg-white/80 border-white text-[#1C1917] hover:border-[#A37B4C]'
                      }`}
                    >
                      <FiHeart className={`text-base ${isLiked ? 'fill-current' : ''}`} />
                    </button>

                    <div className="absolute bottom-6 left-6 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-white/60 text-xs font-serif tracking-widest text-[#1C1917] shadow-sm">
                      Pieza 0{index + 1} {item.price ? `— ${item.price}` : ''}
                    </div>
                  </div>
                </div>

                {/* INFORMACIÓN EDITORIAL EN FONDO CLARO */}
                <div className="w-full lg:w-5/12 space-y-6">
                  <span className="text-[10px] uppercase font-serif tracking-[0.3em] font-semibold text-[#A37B4C]">
                    {categoryObj?.name || 'Colección Exclusiva'}
                  </span>

                  <h2 className="text-3xl sm:text-5xl font-serif font-light text-[#1C1917] tracking-wide leading-tight">
                    {item.name}
                  </h2>

                  <div className="flex items-center gap-2 py-1">
                    <div className="w-8 h-[1px] bg-[#D6D0C7]" />
                    <span className="text-[#A8A096] text-[10px]">•••</span>
                    <div className="w-8 h-[1px] bg-[#D6D0C7]" />
                  </div>

                  <p className="text-sm text-[#78716C] font-light leading-relaxed">
                    {item.description || 'Diseño y calidad excepcional seleccionada especialmente para ti.'}
                  </p>

                  <div className="pt-4">
                    <button
                      onClick={() => toggleWishlist(item.id)}
                      className={`px-6 py-3.5 rounded-full font-serif text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-2.5 cursor-pointer shadow-sm ${
                        isLiked 
                          ? 'bg-[#A37B4C] text-white font-medium shadow-md' 
                          : 'bg-white border border-[#E8E4DF] text-[#1C1917] hover:border-[#A37B4C] hover:bg-[#F4F1EA]'
                      }`}
                    >
                      <FiHeart className={isLiked ? 'fill-current' : ''} />
                      <span>{isLiked ? 'Añadido a tu Selección' : 'Agregar a la Selección'}</span>
                    </button>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </div>

      {/* FOOTER SOBRIO Y MINIMALISTA */}
      <footer className="border-t border-[#E8E4DF] bg-[#F2EFF9] py-20 px-6 lg:px-12 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2">
            <span className="text-xs uppercase font-serif font-bold tracking-[0.3em] text-[#A37B4C]">{profile.full_name}</span>
            <h3 className="text-2xl font-serif font-light text-[#1C1917]">Curaduría digital y diseño inmersivo.</h3>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowDrawer(true)}
              className="px-6 py-3 rounded-full bg-[#A37B4C] text-white font-serif text-xs uppercase tracking-wider font-medium hover:bg-[#8B673E] transition-all shadow-md"
            >
              Ver Selección ({wishlist.length})
            </button>
          </div>
        </div>
      </footer>

      {/* DRAWER LATERAL EN FONDO CLARO */}
      {showDrawer && (
        <div 
          onClick={() => setShowDrawer(false)}
          className="fixed inset-0 z-50 bg-[#1C1917]/40 backdrop-blur-sm flex justify-end transition-opacity"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#F9F8F6] border-l border-[#E8E4DF] h-full p-6 sm:p-8 flex flex-col justify-between shadow-2xl"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#E8E4DF] pb-4">
                <div className="flex items-center gap-2.5">
                  <FiShoppingBag className="text-[#A37B4C] text-lg" />
                  <h2 className="text-sm font-serif uppercase tracking-[0.2em] font-semibold text-[#1C1917]">Tu Selección</h2>
                </div>
                <button 
                  onClick={() => setShowDrawer(false)}
                  className="w-8 h-8 rounded-full bg-white text-[#78716C] hover:text-[#1C1917] flex items-center justify-center transition border border-[#E8E4DF]"
                >
                  <FiX className="text-xs" />
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-1">
                {wishlist.length === 0 ? (
                  <div className="text-center py-16 text-[#78716C] text-xs font-serif italic">
                    Tu selección está vacía. Haz clic en el ícono de favorito ❤️ en las piezas que desees destacar.
                  </div>
                ) : (
                  allActiveItems.filter(item => wishlist.includes(item.id)).map(item => (
                    <div key={item.id} className="flex items-center justify-between gap-3 p-3.5 bg-white border border-[#E8E4DF] rounded-2xl shadow-sm">
                      <div className="flex items-center gap-3.5">
                        {item.image_url ? (
                          <img src={item.image_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[#F2EFF9] flex items-center justify-center text-lg">🛍️</div>
                        )}
                        <div>
                          <h4 className="text-xs font-serif font-light text-[#1C1917] line-clamp-1">{item.name}</h4>
                          <span className="text-[11px] text-[#A37B4C] font-medium">{item.price || 'Sin precio'}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleWishlist(item.id)}
                        className="text-[#78716C] hover:text-rose-500 p-2 transition cursor-pointer"
                      >
                        <FiX className="text-sm" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E4DF]">
              <button
                onClick={handleWhatsAppConsult}
                disabled={wishlist.length === 0}
                className={`w-full py-4 px-6 rounded-full font-serif text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 shadow-md transition-all ${
                  wishlist.length > 0
                    ? 'bg-[#A37B4C] text-white font-medium hover:bg-[#8B673E] cursor-pointer'
                    : 'bg-[#E8E4DF] text-[#78716C] cursor-not-allowed'
                }`}
              >
                <FiMessageCircle className="text-base" />
                <span>Consultar por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}