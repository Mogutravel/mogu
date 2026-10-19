'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaGlobe,
  FaMapMarkerAlt,
  FaUtensils,
  FaPhone,
  FaStar,
  FaShoppingBag,
  FaCalendarAlt,
  FaArrowRight
} from 'react-icons/fa'
import { FiShare2, FiCheck, FiShield } from 'react-icons/fi'

interface Profile {
  id: string
  slug: string
  full_name?: string
  name?: string
  title: string | null
  bio: string | null
  phone: string | null
  email: string | null
  avatar_url?: string | null
  theme_color?: string | null
  expires_at?: string | null
  subscription_status?: string | null
  plan_id?: string | null
  has_menu?: boolean
  has_catalogo?: boolean
}

interface LinkItem {
  id: string
  title: string
  url: string
  position: number
  is_active: boolean
  emoji?: string
}

interface LoyaltyProgram {
  id: string
  program_name: string
  is_active: boolean
}

const getThemeGlowClass = (themeColor?: string | null) => {
  switch (themeColor) {
    case 'from-blue-500 to-indigo-500':
      return 'from-blue-500 to-indigo-500 text-white shadow-blue-500/20'
    case 'from-pink-500 to-rose-500':
      return 'from-pink-500 to-rose-500 text-white shadow-pink-500/20'
    case 'from-amber-400 to-orange-500':
      return 'from-amber-400 to-orange-500 text-black shadow-amber-500/20'
    case 'from-purple-500 to-violet-600':
      return 'from-purple-500 to-violet-600 text-white shadow-purple-500/20'
    default:
      return 'from-emerald-500 to-teal-400 text-black shadow-emerald-500/20'
  }
}

const getThemeHex = (themeColor?: string | null) => {
  switch (themeColor) {
    case 'from-blue-500 to-indigo-500':
      return '#3B82F6'
    case 'from-pink-500 to-rose-500':
      return '#EC4899'
    case 'from-amber-400 to-orange-500':
      return '#F59E0B'
    case 'from-purple-500 to-violet-600':
      return '#8B5CF6'
    default:
      return '#10B981'
  }
}

const SOCIAL_OPTIONS = [
  { key: "whatsapp", emoji: "💬", label: "WhatsApp", icon: <FaWhatsapp style={{ color: "#25D366" }} className="text-xl" /> },
  { key: "instagram", emoji: "📸", label: "Instagram", icon: <FaInstagram style={{ color: "#E4405F" }} className="text-xl" /> },
  { key: "facebook", emoji: "📘", label: "Facebook", icon: <FaFacebook style={{ color: "#1877F2" }} className="text-xl" /> },
  { key: "web", emoji: "🌐", label: "Sitio Web", icon: <FaGlobe style={{ color: "#38BDF8" }} className="text-xl" /> },
  { key: "map", emoji: "📍", label: "Ubicación", icon: <FaMapMarkerAlt style={{ color: "#F43F5E" }} className="text-xl" /> },
  { key: "menu", emoji: "📖", label: "Menu digital", icon: <FaUtensils style={{ color: "#F59E0B" }} className="text-xl" /> },
  { key: "phone", emoji: "📞", label: "Teléfono", icon: <FaPhone style={{ color: "#2DD4BF" }} className="text-xl" /> },
  { key: "star", emoji: "⭐", label: "Reseña Google", icon: <FaStar style={{ color: "#FACC15" }} className="text-xl" /> },
  { key: "shop", emoji: "🛍️", label: "Tienda online", icon: <FaShoppingBag style={{ color: "#A855F7" }} className="text-xl" /> },
  { key: "booking", emoji: "📅", label: "Reservas", icon: <FaCalendarAlt style={{ color: "#60A5FA" }} className="text-xl" /> },
]

function renderLinkIcon(keyOrEmoji?: string) {
  if (!keyOrEmoji) return <FaGlobe style={{ color: "#38BDF8" }} className="text-xl" />
  const found = SOCIAL_OPTIONS.find(
    (opt) => opt.key === keyOrEmoji || opt.emoji === keyOrEmoji
  )
  if (found) return found.icon
  return <span className="text-base">{keyOrEmoji}</span>
}

export default function AppleDynamicPublicProfilePage() {
  const params = useParams()
  const slug = params?.slug as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [expired, setExpired] = useState(false)
  const [copied, setCopied] = useState(false)
  const [savedContact, setSavedContact] = useState(false)

  useEffect(() => {
    async function loadPublicData() {
      if (!slug) return
      setLoading(true)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      if (profileError || !profileData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const now = new Date()
      const expirationDate = profileData.expires_at ? new Date(profileData.expires_at) : null

      if (expirationDate && now > expirationDate && profileData.subscription_status === 'expired') {
        setExpired(true)
        setLoading(false)
        return
      }

      setProfile(profileData)

      // Cargar Enlaces Activos
      const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', profileData.id)
        .eq('is_active', true)
        .order('position', { ascending: true })

      if (linksData) setLinks(linksData)

      // Cargar Programa de Fidelización Activo
      const { data: loyaltyData } = await supabase
        .from('loyalty_programs')
        .select('*')
        .eq('profile_id', profileData.id)
        .eq('is_active', true)
        .maybeSingle()

      if (loyaltyData) {
        setLoyaltyProgram(loyaltyData)
      }

      setLoading(false)
    }

    loadPublicData()
  }, [slug])

  const handleDownloadVCard = () => {
    if (!profile) return

    const fullName = profile.full_name || profile.name || slug

    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${fullName};;;;`,
      `FN:${fullName}`,
      profile.title ? `TITLE:${profile.title}` : '',
      profile.phone ? `TEL;TYPE=CELL:${profile.phone}` : '',
      profile.email ? `EMAIL:${profile.email}` : '',
      `URL:https://mogu.cl/${profile.slug}`,
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\r\n')

    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${fullName.replace(/\s+/g, '_')}_MOGU.vcf`)
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 250)

    setSavedContact(true)
    setTimeout(() => setSavedContact(false), 3000)
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    const fullName = profile?.full_name || profile?.name || 'Perfil MOGU'
    if (navigator.share) {
      try {
        await navigator.share({
          title: fullName,
          text: `Conecta con ${fullName}`,
          url: shareUrl,
        })
      } catch (err) {
        console.log('Share cancelado')
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getLinkSubtitle = (title: string) => {
    const t = title.toLowerCase()
    if (t.includes('whatsapp') || t.includes('wtsp') || t.includes('chat')) return 'Canal directo de atención'
    if (t.includes('instagram') || t.includes('ig')) return 'Síguenos en nuestra comunidad'
    if (t.includes('catalogo') || t.includes('menu') || t.includes('productos')) return 'Ver productos y precios'
    return 'Visita nuestro sitio oficial'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col items-center justify-center p-4 font-sans">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#E5E5EA] border-t-[#1D1D1F] animate-spin" />
          <div className="absolute font-bold text-[10px] text-[#1D1D1F] tracking-wider">MOGU</div>
        </div>
      </div>
    )
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col items-center justify-center p-6 text-center font-sans animate-fade-in">
        <div className="p-8 bg-white/80 backdrop-blur-2xl border border-[#E5E5EA] rounded-[32px] shadow-sm max-w-sm w-full space-y-3">
          <h1 className="text-base font-bold text-[#1D1D1F]">Este perfil MOGU ha expirado</h1>
          <p className="text-xs text-[#86868B] leading-relaxed">
            El período de activación de este enlace digital ha concluido. El propietario debe renovar su membresía.
          </p>
        </div>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col items-center justify-center p-6 text-center font-sans animate-fade-in">
        <div className="p-8 bg-white/80 backdrop-blur-2xl border border-[#E5E5EA] rounded-[32px] shadow-sm max-w-sm w-full space-y-4">
          <div className="w-16 h-16 bg-[#F5F5F7] border border-[#E5E5EA] rounded-2xl mx-auto flex items-center justify-center text-2xl shadow-inner">
            🔍
          </div>
          <h1 className="text-base font-bold text-[#1D1D1F]">Perfil No Encontrado</h1>
          <p className="text-xs text-[#86868B] leading-relaxed">
            La tarjeta digital consultada no está vinculada a ningún perfil activo.
          </p>
          <a
            href="/"
            className="inline-block w-full py-3 bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold rounded-2xl shadow-sm transition-all duration-300 active:scale-[0.98]"
          >
            Ir al Inicio de MOGU
          </a>
        </div>
      </div>
    )
  }

  const fullName = profile.full_name || profile.name || slug
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const themeGlowClass = getThemeGlowClass(profile.theme_color)
  const themeHex = getThemeHex(profile.theme_color)

  // Determinar la ruta del pase según el tipo de catálogo o menú disponible
  const passRoute = profile.has_catalogo 
    ? `/catalogo/${profile.slug}/pass` 
    : `/menu/${profile.slug}/pass`

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-[#E8E8ED] relative overflow-hidden flex flex-col justify-between">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent blur-[120px] pointer-events-none" />

      {copied && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#1D1D1F]/90 backdrop-blur-xl text-white text-xs font-medium rounded-full shadow-2xl animate-fade-in flex items-center gap-2 border border-white/10">
          <FiCheck className="text-emerald-400" />
          <span>¡Enlace copiado al portapapeles!</span>
        </div>
      )}

      <button
        onClick={handleShare}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/80 backdrop-blur-xl border border-[#E5E5EA] shadow-sm flex items-center justify-center text-[#1D1D1F] hover:bg-white hover:shadow transition-all duration-300 active:scale-95 cursor-pointer z-20"
        title="Compartir tarjeta"
      >
        <FiShare2 className="text-sm" />
      </button>

      <main className="relative z-10 max-w-md w-full mx-auto px-5 pt-12 pb-16 flex-1 flex flex-col justify-center animate-fade-in">
        
        {/* TARJETA PRINCIPAL DE PERFIL */}
        <div className="bg-white/90 backdrop-blur-2xl border border-[#E5E5EA]/80 rounded-[36px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] text-center space-y-4 mb-4 transition-all duration-500 hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)]">
          <div className="relative w-24 h-24 rounded-full mx-auto overflow-hidden border-2 border-white shadow-md bg-[#F5F5F7] flex items-center justify-center group">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={fullName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full rounded-full bg-[#E5E5EA] flex items-center justify-center text-xl font-bold text-[#1D1D1F]">
                {initials}
              </div>
            )}

            <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full shadow-md border-2 border-white" title="Verificado por MOGU">
              <FiShield className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
              {fullName}
            </h1>
            {profile.title && (
              <p
                className="text-xs font-semibold tracking-wider uppercase transition-colors"
                style={{ color: themeHex }}
              >
                {profile.title}
              </p>
            )}
            {profile.bio && (
              <p className="text-xs text-[#86868B] max-w-xs mx-auto leading-relaxed pt-1 font-normal">
                {profile.bio}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={handleDownloadVCard}
              className={`group relative w-full py-3.5 px-6 bg-gradient-to-r ${themeGlowClass} font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden cursor-pointer`}
            >
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:left-[100%] transition-all duration-1000 ease-in-out pointer-events-none" />
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
              <span>{savedContact ? '¡Contacto Guardado con Éxito! 🚀' : 'Guardar en Contactos'}</span>
            </button>
          </div>
        </div>

        {/* 🛍️ BOTÓN TIENDA ONLINE */}
        {profile.has_catalogo && (
          <div className="mb-3">
            <a
              href={`/catalogo/${profile.slug}`}
              className="group relative flex items-center justify-between p-4 bg-white/90 hover:bg-white backdrop-blur-xl border border-[#E5E5EA] hover:border-purple-400/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.99] overflow-hidden"
            >
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-purple-500/10 to-transparent group-hover:left-[100%] transition-all duration-1000 ease-in-out pointer-events-none" />

              <div className="flex items-center space-x-3.5 z-10">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                  🛍️
                </div>
                <div className="text-left overflow-hidden">
                  <h3 className="text-xs font-bold text-[#1D1D1F] tracking-tight group-hover:text-purple-600 transition-colors">
                    Tienda online
                  </h3>
                  <p className="text-[10px] text-[#86868B] mt-0.5 truncate font-normal">
                    Explora productos, precios y haz tu pedido
                  </p>
                </div>
              </div>

              <div className="text-[#86868B] group-hover:text-purple-600 group-hover:translate-x-1 transition-all z-10 flex-shrink-0 ml-2">
                <FaArrowRight className="text-sm" />
              </div>
            </a>
          </div>
        )}

        {/* 📖 BOTÓN MENÚ DIGITAL */}
        {profile.has_menu && (
          <div className="mb-3">
            <a
              href={`/menu/${profile.slug}`}
              className="group relative flex items-center justify-between p-4 bg-white/90 hover:bg-white backdrop-blur-xl border border-[#E5E5EA] hover:border-amber-400/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.99] overflow-hidden"
            >
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-amber-500/10 to-transparent group-hover:left-[100%] transition-all duration-1000 ease-in-out pointer-events-none" />

              <div className="flex items-center space-x-3.5 z-10">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                  📖
                </div>
                <div className="text-left overflow-hidden">
                  <h3 className="text-xs font-bold text-[#1D1D1F] tracking-tight group-hover:text-amber-600 transition-colors">
                    Menu digital
                  </h3>
                  <p className="text-[10px] text-[#86868B] mt-0.5 truncate font-normal">
                    Explora nuestra carta, platos y especialidades
                  </p>
                </div>
              </div>

              <div className="text-[#86868B] group-hover:text-amber-600 group-hover:translate-x-1 transition-all z-10 flex-shrink-0 ml-2">
                <FaArrowRight className="text-sm" />
              </div>
            </a>
          </div>
        )}

        {/* 🎁 NUEVO: BOTÓN TARJETA DE FIDELIZACIÓN (SE MUESTRA SÓLO SI EL PROGRAMA ESTÁ ACTIVO) */}
        {loyaltyProgram && (
          <div className="mb-3">
            <Link
              href={passRoute}
              className="group relative flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl border border-emerald-400/30 shadow-md transition-all duration-300 active:scale-[0.99] overflow-hidden scale-[1.01]"
            >
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[100%] transition-all duration-1000 ease-in-out pointer-events-none" />

              <div className="flex items-center space-x-3.5 z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center text-lg flex-shrink-0 backdrop-blur-md group-hover:scale-105 transition-transform">
                  🎁
                </div>
                <div className="text-left overflow-hidden">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white tracking-tight">
                      {loyaltyProgram.program_name || 'Tarjeta de Fidelización'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-white text-emerald-700 shadow-sm">
                      VIP
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-100 mt-0.5 truncate font-normal">
                    Acumula sellos en cada visita y gana premios
                  </p>
                </div>
              </div>

              <div className="text-white group-hover:translate-x-1 transition-all z-10 flex-shrink-0 ml-2">
                <FaArrowRight className="text-sm" />
              </div>
            </Link>
          </div>
        )}

        {/* LISTA DE ENLACES */}
        <div className="space-y-3">
          {links.length === 0 ? (
            <div className="p-6 bg-white/80 backdrop-blur-xl border border-[#E5E5EA] rounded-2xl text-center shadow-sm">
              <p className="text-xs text-[#86868B] font-medium">Aún no hay enlaces configurados.</p>
            </div>
          ) : (
            links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-between p-4 bg-white/90 hover:bg-white backdrop-blur-xl border border-[#E5E5EA] hover:border-[#1D1D1F]/30 rounded-2xl transition-all duration-300 active:scale-[0.99] shadow-sm hover:shadow"
              >
                <div className="flex items-center space-x-3.5 overflow-hidden pr-2">
                  <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-all">
                    {renderLinkIcon(link.emoji)}
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-semibold text-[#1D1D1F] group-hover:text-black transition-colors block truncate">
                      {link.title}
                    </span>
                    <span className="text-[10px] text-[#86868B] block truncate font-normal mt-0.5">
                      {getLinkSubtitle(link.title)}
                    </span>
                  </div>
                </div>

                <div className="text-[#86868B] group-hover:text-[#1D1D1F] group-hover:translate-x-1 transition-all flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </a>
            ))
          )}
        </div>

        {/* BANNER MOGU */}
        <div className="mt-8 p-6 rounded-[28px] bg-white/90 backdrop-blur-2xl border border-[#E5E5EA] text-center relative overflow-hidden shadow-sm hover:shadow transition-shadow duration-300">
          <span className="inline-block px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-2">
            Tecnología MOGU
          </span>
          <h3 className="text-xs font-bold text-[#1D1D1F] mb-1">
            ¿Tienes un negocio y quieres una tarjeta así?
          </h3>
          <p className="text-[11px] text-[#86868B] mb-4 max-w-xs mx-auto leading-relaxed">
            Comparte tus datos, menú o redes al instante con un solo tap.
          </p>
          <a
            href="/"
            className="inline-block w-full py-3 px-4 bg-[#1D1D1F] hover:bg-black text-white font-medium text-[11px] rounded-xl transition-all duration-300 active:scale-[0.98] shadow-sm cursor-pointer"
          >
            Quiero mi tarjeta Mogu 🚀
          </a>
        </div>

      </main>

      <footer className="relative z-10 py-6 text-center border-t border-[#E5E5EA] bg-white/60 backdrop-blur-xl">
        <a href="https://mogu.cl" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#86868B] hover:text-[#1D1D1F] transition">
          <span>POWERED BY</span>
          <span className="font-bold text-[#1D1D1F] tracking-wider">MOGU</span>
        </a>
      </footer>

    </div>
  )
}