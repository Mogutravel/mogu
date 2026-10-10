'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  slug: string
  full_name?: string
  name?: string
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

export default function MoguSubtleAmbientMenu() {
  const params = useParams()
  const slug = params?.slug as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const [activeImageModal, setActiveImageModal] = useState<{
    url: string
    name: string
    description: string | null
    price: string | null
  } | null>(null)

  useEffect(() => {
    async function loadMenuData() {
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
          setErrorMsg(`No se encontró el establecimiento: "${slug}".`)
          setLoading(false)
          return
        }

        setProfile(profileData)

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

          const catsWithItems: MenuCategory[] = catsData.map((cat) => ({
            ...cat,
            items: itemsData?.filter((item) => item.category_id === cat.id && item.active !== false) || [],
          })).filter((cat) => cat.items.length > 0)

          setCategories(catsWithItems)
        }
      } catch (err) {
        console.error(err)
        setErrorMsg('Error al conectar con la base de datos.')
      } finally {
        setLoading(false)
      }
    }
    loadMenuData()
  }, [slug])

  const filteredCategories = useMemo(() => {
    return categories
      .map((cat) => {
        if (activeCategory !== 'all' && cat.id !== activeCategory) return null

        const filteredItems = cat.items.filter((item) => {
          const query = searchTerm.toLowerCase()
          return item.name.toLowerCase().includes(query) || (item.description?.toLowerCase().includes(query) ?? false)
        })

        if (filteredItems.length === 0) return null
        return { ...cat, items: filteredItems }
      })
      .filter(Boolean) as MenuCategory[]
  }, [categories, searchTerm, activeCategory])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E0C0A] text-[#D4CEC7] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border border-[#8C7A6B]/20 border-t-[#8C7A6B] animate-spin" />
        <span className="mt-4 font-serif italic text-xs tracking-[0.2em] text-[#8C7A6B]">Cargando atmósfera...</span>
      </div>
    )
  }

  if (errorMsg || !profile) {
    return (
      <div className="min-h-screen bg-[#0E0C0A] text-[#D4CEC7] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h1 className="font-serif text-lg tracking-wide text-[#E8E4DF]">Establecimiento no disponible</h1>
        <p className="text-xs text-[#8C7A6B]">{errorMsg}</p>
        <a href={`/panel/menu/${slug}`} className="px-5 py-2 bg-[#26211D] text-[#D4CEC7] text-xs font-serif rounded-full hover:bg-[#38312B] transition">
          Ir al Panel
        </a>
      </div>
    )
  }

  const displayName = profile.full_name || profile.name || slug
  const menuStyle = profile.menu_style || 'modern'
  const isLight = profile.menu_theme === 'light'

  // Paleta dinámica con el tono Blanco Arena personalizado (#D1C7B8)
  const theme = {
    bg: isLight ? 'bg-[#D1C7B8] text-[#1C1815]' : 'bg-[#0E0C0A] text-[#D4CEC7]',
    headerBg: isLight ? 'bg-[#D1C7B8]/95 border-[#BCB1A1]' : 'bg-[#0E0C0A]/90 border-[#211C18]/60',
    titleMain: isLight ? 'text-[#1C1815]' : 'text-[#EFECE6]',
    subtitle: isLight ? 'text-[#615448]' : 'text-[#9E8D80]',
    searchBg: isLight ? 'bg-[#C5BBB0] border-[#B2A79C] text-[#1C1815] placeholder-[#615448] focus:border-[#42382F]' : 'bg-[#161311] border-[#26211D] text-[#D4CEC7] placeholder-[#73655B] focus:border-[#66584E]',
    pillActive: isLight ? 'bg-[#1C1815] text-[#D1C7B8] border-[#1C1815]' : 'bg-[#26211D] text-[#EFECE6] border border-[#38312B]',
    pillInactive: isLight ? 'bg-[#C5BBB0] text-[#42382F] hover:text-[#1C1815] border-[#B2A79C]' : 'bg-[#13100E] text-[#8C7A6B] hover:text-[#D4CEC7] border border-[#211C18]',
    cardBg: isLight ? 'bg-[#DDD4C6] border-[#C2B7A8] hover:border-[#A89D8E] shadow-sm' : 'bg-[#13100E]/70 hover:bg-[#161311] border border-[#211C18] hover:border-[#38312B]',
    itemTitle: isLight ? 'text-[#1C1815] group-hover:text-[#52453B]' : 'text-[#E8E4DF] group-hover:text-[#B3A497]',
    itemDesc: isLight ? 'text-[#52453B]' : 'text-[#8C7A6B]',
    itemPrice: isLight ? 'text-[#42382F] font-extrabold' : 'text-[#A8988C]',
    divider: isLight ? 'border-[#C2B7A8]' : 'border-[#211C18]',
    badgeBg: isLight ? 'bg-[#C5BBB0] border-[#B2A79C] text-[#42382F]' : 'bg-[#161311]/60 border-[#26211D] text-[#9E8D80]',
    halo: isLight ? 'bg-gradient-to-b from-[#B2A79C]/30 to-transparent' : 'bg-gradient-to-b from-[#8C7A6B]/10 via-[#594B3F]/5 to-transparent',
    footerBg: isLight ? 'bg-[#C5BBB0] border-[#B2A79C] text-[#52453B]' : 'bg-[#0A0807] border-[#1C1714] text-[#594B3F]',
  }

  return (
    <div className={`min-h-screen font-sans selection:bg-[#8C7A6B]/25 relative overflow-hidden flex flex-col justify-between transition-colors duration-500 ${theme.bg}`}>
      
      {/* Halo de luz ambiental difuminado sutil en el fondo */}
      <div className={`absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] ${theme.halo} blur-[140px] rounded-full pointer-events-none`} />

      {/* ==========================================
          ESTILO 1: CLÁSICO (Alta Gama / Fine Dining)
         ========================================== */}
      {menuStyle === 'classic' && (
        <div className="flex-1 flex flex-col justify-between relative z-10">
          <header className={`pt-16 pb-10 px-6 text-center relative border-b backdrop-blur-xl space-y-6 ${theme.headerBg}`}>
            <div className="max-w-xl mx-auto space-y-2">
              <span className={`text-[9px] uppercase tracking-[0.4em] block ${theme.subtitle}`}>Fine Dining Experience</span>
              <h1 className={`text-3xl md:text-4xl font-serif font-light tracking-wide ${theme.titleMain}`}>{displayName}</h1>
              <div className={`w-10 h-[1px] mx-auto my-3 ${isLight ? 'bg-[#B2A79C]' : 'bg-[#38312B]'}`} />
            </div>

            <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-2 max-w-xl mx-auto flex-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-serif tracking-wider transition whitespace-nowrap flex-shrink-0 cursor-pointer border ${
                  activeCategory === 'all' ? theme.pillActive : theme.pillInactive
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-serif tracking-wider transition whitespace-nowrap flex-shrink-0 cursor-pointer border ${
                    activeCategory === cat.id ? theme.pillActive : theme.pillInactive
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </header>

          <main className="max-w-2xl w-full mx-auto px-6 py-12 flex-1 space-y-16">
            {filteredCategories.map((cat) => (
              <section key={cat.id} className="space-y-6">
                <div className="text-center">
                  <h2 className={`text-xs font-serif uppercase tracking-[0.3em] inline-block border-b pb-2 ${theme.subtitle} ${isLight ? 'border-[#C2B7A8]' : 'border-[#26211D]'}`}>
                    {cat.name}
                  </h2>
                </div>
                <div className="space-y-8 font-serif">
                  {cat.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 group">
                      {item.image_url && (
                        <div 
                          onClick={() => setActiveImageModal({ url: item.image_url!, name: item.name, description: item.description, price: item.price })}
                          className={`w-12 h-12 rounded-full overflow-hidden border flex-shrink-0 cursor-pointer relative group/img shadow-sm ${isLight ? 'border-[#B2A79C] bg-[#C5BBB0]' : 'border-[#26211D] bg-[#0A0807]'}`}
                        >
                          <img src={item.image_url} alt="" className="w-full h-full object-cover group-hover/img:scale-105 transition duration-700" />
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-baseline gap-4">
                          <span className={`text-sm font-light tracking-wider transition ${theme.itemTitle}`}>{item.name}</span>
                          <div className={`flex-1 border-b border-dotted mx-3 ${theme.divider}`} />
                          <span className={`text-sm font-sans tracking-wide ${theme.itemPrice}`}>{item.price}</span>
                        </div>
                        {item.description && (
                          <p className={`text-xs font-sans font-light italic leading-relaxed ${theme.itemDesc}`}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </main>
        </div>
      )}

      {/* ==========================================
          ESTILO 2: MODERNO
         ========================================== */}
      {menuStyle === 'modern' && (
        <div className="flex-1 flex flex-col justify-between relative z-10">
          <header className={`sticky top-0 z-30 backdrop-blur-xl border-b px-6 py-4 space-y-3 ${theme.headerBg}`}>
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
              <h1 className={`text-xs font-serif uppercase tracking-widest truncate ${theme.subtitle}`}>{displayName}</h1>
              <input
                type="text"
                placeholder="Buscar preparación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`rounded-full px-4 py-2 text-xs outline-none w-48 md:w-60 shadow-inner transition ${theme.searchBg}`}
              />
            </div>

            <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 flex-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-1.5 rounded-xl text-xs font-serif tracking-wider transition whitespace-nowrap flex-shrink-0 cursor-pointer border ${
                  activeCategory === 'all' ? theme.pillActive : theme.pillInactive
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-serif tracking-wider transition whitespace-nowrap flex-shrink-0 cursor-pointer border ${
                    activeCategory === cat.id ? theme.pillActive : theme.pillInactive
                  }`}
                >
                  {cat.name}
                </button>
              ))}
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
                    <div key={item.id} className={`rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-500 shadow-sm border ${theme.cardBg}`}>
                      <div className="space-y-1 overflow-hidden">
                        <h3 className={`text-xs font-serif font-medium transition truncate ${theme.itemTitle}`}>{item.name}</h3>
                        {item.description && <p className={`text-[11px] font-light line-clamp-2 leading-relaxed ${theme.itemDesc}`}>{item.description}</p>}
                        <span className={`inline-block text-xs font-serif font-medium pt-1 ${theme.itemPrice}`}>{item.price}</span>
                      </div>
                      {item.image_url && (
                        <div 
                          onClick={() => setActiveImageModal({ url: item.image_url!, name: item.name, description: item.description, price: item.price })}
                          className={`w-15 h-15 rounded-xl overflow-hidden border flex-shrink-0 relative cursor-pointer group/img ${isLight ? 'border-[#B2A79C] bg-[#C5BBB0]' : 'border-[#26211D] bg-[#0A0807]'}`}
                        >
                          <img src={item.image_url} alt="" className="w-full h-full object-cover group-hover/img:scale-110 transition duration-700" />
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

      {/* ==========================================
          ESTILO 3: TARJETAS EDITORIAL
         ========================================== */}
      {menuStyle === 'cards' && (
        <div className="flex-1 flex flex-col justify-between relative z-10">
          <header className={`backdrop-blur-xl border-b sticky top-0 z-30 px-6 py-5 space-y-4 ${theme.headerBg}`}>
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
              <div>
                <span className={`text-[9px] font-serif uppercase tracking-[0.3em] block ${theme.subtitle}`}>Café de Especialidad</span>
                <h1 className={`text-sm font-serif font-medium tracking-wide mt-0.5 ${theme.titleMain}`}>{displayName}</h1>
              </div>
              <input
                type="text"
                placeholder="Buscar café o tostado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`rounded-2xl px-4 py-2 text-xs outline-none w-44 md:w-56 shadow-inner transition ${theme.searchBg}`}
              />
            </div>

            <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 flex-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-1.5 rounded-xl text-xs font-serif tracking-wider transition whitespace-nowrap flex-shrink-0 cursor-pointer border ${
                  activeCategory === 'all' ? theme.pillActive : theme.pillInactive
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-serif tracking-wider transition whitespace-nowrap flex-shrink-0 cursor-pointer border ${
                    activeCategory === cat.id ? theme.pillActive : theme.pillInactive
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </header>

          <main className="max-w-3xl w-full mx-auto px-6 py-12 flex-1 space-y-12">
            {filteredCategories.map((cat) => (
              <section key={cat.id} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className={`text-xs font-serif uppercase tracking-[0.25em] ${theme.subtitle}`}>
                    {cat.name}
                  </h2>
                  <div className={`flex-1 h-[1px] ${isLight ? 'bg-[#C2B7A8]' : 'bg-[#211C18]'}`} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cat.items.map((item) => (
                    <article key={item.id} className={`rounded-3xl overflow-hidden transition-all duration-700 flex flex-col justify-between shadow-md border ${theme.cardBg}`}>
                      {item.image_url && (
                        <div 
                          onClick={() => setActiveImageModal({ url: item.image_url!, name: item.name, description: item.description, price: item.price })}
                          className="h-48 overflow-hidden relative cursor-pointer group/img"
                        >
                          <img 
                            src={item.image_url} 
                            alt={item.name} 
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" 
                          />
                        </div>
                      )}
                      <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-baseline gap-2">
                            <h3 className={`font-serif text-sm font-medium transition ${theme.itemTitle}`}>{item.name}</h3>
                            <span className={`font-serif text-xs font-light ${theme.itemPrice}`}>{item.price}</span>
                          </div>
                          {item.description && (
                            <p className={`text-xs font-light leading-relaxed ${theme.itemDesc}`}>{item.description}</p>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </main>
        </div>
      )}

      {/* ==========================================
          BANNER DE CONVERSIÓN COMERCIAL MOGU
         ========================================== */}
      <section className={`relative z-10 border-t py-16 px-6 text-center ${isLight ? 'bg-gradient-to-b from-[#C5BBB0]/50 to-[#B2A79C]/80 border-[#B2A79C]' : 'bg-gradient-to-b from-transparent via-[#120F0D] to-[#0A0807] border-[#211C18]/60'}`}>
        <div className="max-w-md mx-auto space-y-3">
          <span className={`text-[9px] font-serif uppercase tracking-[0.35em] ${theme.subtitle}`}>Plataforma Mogu</span>
          <h3 className={`text-base font-serif font-light ${theme.titleMain}`}>Eleva la experiencia digital de tu local</h3>
          <p className={`text-xs font-light ${theme.itemDesc}`}>Crea cartas interactivas de alta gama en minutos.</p>
          <div className="pt-3">
            <a href="https://mogu.cl" target="_blank" rel="noopener noreferrer" className={`inline-block px-7 py-3 text-xs font-serif uppercase tracking-widest rounded-full transition shadow-lg border ${isLight ? 'bg-[#DDD4C6] hover:bg-[#C2B7A8] text-[#1C1815] border-[#B2A79C]' : 'bg-[#1C1714] hover:bg-[#26211D] border-[#38312B] text-[#D4CEC7]'}`}>
              Crear mi carta Mogu ↗
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`relative z-10 py-6 text-center border-t text-[9px] tracking-[0.25em] font-serif ${theme.footerBg}`}>
        CURATED BY <span className={`font-medium ${isLight ? 'text-[#1C1815]' : 'text-[#A8988C]'}`}>MOGU DIGITAL</span>
      </footer>

      {/* ==========================================
          MODAL DIFUMINADO INMERSIVO
         ========================================== */}
      {activeImageModal && (
        <div 
          onClick={() => setActiveImageModal(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 transition-all"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`relative max-w-lg w-full border rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col ${isLight ? 'bg-[#DDD4C6] border-[#C2B7A8]' : 'bg-[#13100E] border-[#26211D]'}`}
          >
            <button 
              onClick={() => setActiveImageModal(null)}
              className={`absolute top-4 right-4 z-40 w-8 h-8 rounded-full flex items-center justify-center text-xs transition border cursor-pointer ${isLight ? 'bg-[#C5BBB0] hover:bg-[#B2A79C] text-[#1C1815] border-[#B2A79C]' : 'bg-black/50 hover:bg-black text-[#D4CEC7] border-[#26211D]'}`}
            >
              ✕
            </button>

            <div className={`relative h-[45vh] flex items-center justify-center overflow-hidden ${isLight ? 'bg-[#C5BBB0]' : 'bg-[#0A0807]'}`}>
              <img 
                src={activeImageModal.url} 
                alt={activeImageModal.name} 
                className="max-h-[42vh] object-contain rounded-xl" 
              />
            </div>

            <div className={`p-6 space-y-2 border-t ${isLight ? 'bg-[#DDD4C6] border-[#C2B7A8]' : 'bg-[#13100E] border-[#211C18]'}`}>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className={`font-serif text-base font-medium ${isLight ? 'text-[#1C1815]' : 'text-[#E8E4DF]'}`}>
                  {activeImageModal.name}
                </h3>
                {activeImageModal.price && (
                  <span className={`font-serif text-xs px-3 py-1 rounded-xl border ${isLight ? 'bg-[#C5BBB0] border-[#B2A79C] text-[#1C1815]' : 'bg-[#1A1613] border-[#26211D] text-[#A8988C]'}`}>
                    {activeImageModal.price}
                  </span>
                )}
              </div>
              {activeImageModal.description && (
                <p className={`text-xs font-light leading-relaxed ${isLight ? 'text-[#52453B]' : 'text-[#8C7A6B]'}`}>
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