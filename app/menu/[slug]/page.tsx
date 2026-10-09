'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  slug: string
  full_name?: string
  name?: string
  has_menu?: boolean
  menu_style?: 'modern' | 'classic' | 'cards'
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

export default function PublicMenuPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [noMenu, setNoMenu] = useState(false)

  useEffect(() => {
    async function loadMenu() {
      if (!slug) return
      setLoading(true)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, slug, full_name, name, has_menu, menu_style, avatar_url')
        .eq('slug', slug)
        .single()

      if (profileError || !profileData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      if (!profileData.has_menu) {
        setNoMenu(true)
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
          .eq('active', true)
          .order('position', { ascending: true })

        const catsWithItems: MenuCategory[] = catsData.map((cat) => ({
          ...cat,
          items: itemsData?.filter((item) => item.category_id === cat.id) || [],
        })).filter((cat) => cat.items.length > 0)

        setCategories(catsWithItems)
      }

      setLoading(false)
    }

    loadMenu()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center p-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <div className="absolute font-black text-xs text-emerald-400 tracking-wider">MOGU</div>
        </div>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-extrabold text-white mb-2">Perfil No Encontrado</h1>
        <p className="text-xs text-neutral-400 mb-6">La carta digital consultada no existe.</p>
        <a href="/" className="px-6 py-3 bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs font-semibold rounded-2xl">
          Ir al Inicio
        </a>
      </div>
    )
  }

  if (noMenu) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-extrabold text-white mb-2">Menú no disponible</h1>
        <p className="text-xs text-neutral-400 mb-6">Este negocio no tiene habilitada una carta digital.</p>
        <a href={`/${slug}`} className="px-6 py-3 bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs font-semibold rounded-2xl">
          ← Volver al Perfil
        </a>
      </div>
    )
  }

  const fullName = profile.full_name || profile.name || slug
  const style = profile.menu_style || 'modern'

  // ESTILO 1: MODERN
  if (style === 'modern') {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white font-sans selection:bg-emerald-500/35 relative flex flex-col justify-between">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-r from-emerald-500 to-teal-400 opacity-15 blur-[120px] rounded-full pointer-events-none" />
        
        <main className="relative z-10 max-w-md w-full mx-auto px-5 pt-8 pb-16 flex-1">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Carta Digital</span>
              <h1 className="text-xl font-black text-white">{fullName}</h1>
            </div>
            <a href={`/${slug}`} className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-[11px] font-semibold rounded-xl transition">
              ← Volver
            </a>
          </div>

          <div className="space-y-8">
            {categories.map((cat) => (
              <div key={cat.id} className="space-y-3">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-3.5 py-2 rounded-xl">
                  {cat.name}
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {cat.items.map((item) => (
                    <div key={item.id} className="p-3.5 bg-neutral-900/50 backdrop-blur-xl border border-neutral-800/80 rounded-2xl flex items-center justify-between shadow-lg gap-3 hover:border-emerald-500/40 transition">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        {item.image_url && (
                          <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-xl object-cover border border-neutral-700/60 flex-shrink-0" />
                        )}
                        <div className="overflow-hidden">
                          <h3 className="text-xs font-bold text-white truncate">{item.name}</h3>
                          {item.description && <p className="text-[10px] text-neutral-400 line-clamp-2 mt-0.5 font-light">{item.description}</p>}
                        </div>
                      </div>
                      {item.price && (
                        <span className="text-xs font-extrabold text-emerald-400 bg-neutral-800/90 border border-neutral-700/60 px-3 py-1.5 rounded-xl flex-shrink-0">
                          {item.price}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>

        <footer className="relative z-10 py-6 text-center border-t border-neutral-900">
          <a href="https://mogu.cl" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 hover:text-emerald-400 transition">
            <span>POWERED BY</span> <span className="font-black text-white tracking-wider">MOGU</span>
          </a>
        </footer>
      </div>
    )
  }

  // ESTILO 2: CLASSIC
  if (style === 'classic') {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-neutral-800 font-serif relative flex flex-col justify-between selection:bg-amber-100">
        <main className="relative z-10 max-w-md w-full mx-auto px-5 pt-10 pb-16 flex-1">
          <div className="text-center mb-8 pb-4 border-b border-amber-900/20 relative">
            <a href={`/${slug}`} className="absolute left-0 top-0 text-xs text-amber-900/60 hover:text-amber-900 underline font-sans">
              ← Volver
            </a>
            <h1 className="text-2xl font-bold tracking-wide text-amber-950 uppercase">{fullName}</h1>
            <p className="text-xs italic text-amber-900/70 mt-1 font-sans">Carta y Menús Digital</p>
          </div>

          <div className="space-y-8">
            {categories.map((cat) => (
              <div key={cat.id} className="space-y-4">
                <div className="text-center">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-amber-900 inline-block border-b border-amber-900/30 pb-1 font-sans">
                    {cat.name}
                  </h2>
                </div>
                <div className="space-y-4">
                  {cat.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-baseline gap-4 border-b border-dashed border-amber-900/10 pb-3">
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">{item.name}</h3>
                        </div>
                        {item.description && <p className="text-[11px] text-neutral-600 font-sans italic">{item.description}</p>}
                      </div>
                      {item.price && (
                        <span className="text-xs font-bold text-amber-950 font-sans tracking-tight">
                          {item.price}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>

        <footer className="py-6 text-center border-t border-amber-900/10 font-sans">
          <a href="https://mogu.cl" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 hover:text-amber-900 transition">
            <span>POWERED BY</span> <span className="font-black text-neutral-800 tracking-wider">MOGU</span>
          </a>
        </footer>
      </div>
    )
  }

  // ESTILO 3: CARDS
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans relative flex flex-col justify-between">
      <main className="relative z-10 max-w-md w-full mx-auto px-4 pt-6 pb-16 flex-1">
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            {profile.avatar_url && <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border" />}
            <div>
              <h1 className="text-sm font-black text-neutral-900">{fullName}</h1>
              <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">Menú Visual</span>
            </div>
          </div>
          <a href={`/${slug}`} className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition">
            Volver
          </a>
        </div>

        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-neutral-700 px-1">
                {cat.name}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-200 flex flex-col justify-between">
                    <div>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-28 object-cover" />
                      ) : (
                        <div className="w-full h-28 bg-neutral-200 flex items-center justify-center text-[10px] text-neutral-400 font-bold">
                          Sin foto
                        </div>
                      )}
                      <div className="p-3">
                        <h3 className="text-xs font-bold text-neutral-900 line-clamp-1">{item.name}</h3>
                        {item.description && <p className="text-[10px] text-neutral-500 line-clamp-2 mt-1">{item.description}</p>}
                      </div>
                    </div>
                    <div className="p-3 pt-0 flex items-center justify-between mt-auto">
                      <span className="text-xs font-extrabold text-emerald-600">{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center border-t border-neutral-200 bg-white">
        <a href="https://mogu.cl" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 hover:text-neutral-800 transition">
          <span>POWERED BY</span> <span className="font-black text-neutral-900 tracking-wider">MOGU</span>
        </a>
      </footer>
    </div>
  )
}