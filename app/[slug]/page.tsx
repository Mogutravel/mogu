'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
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
  FaCalendarAlt 
} from 'react-icons/fa'

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
  has_menu?: boolean
}

interface LinkItem {
  id: string
  title: string
  url: string
  position: number
  is_active: boolean
  emoji?: string
}

// Helper para traducir el theme_color a clases CSS de degradado
const getThemeGlowClass = (themeColor?: string | null) => {
  switch (themeColor) {
    case 'from-blue-500 to-indigo-500':
      return 'from-blue-500 to-indigo-500'
    case 'from-pink-500 to-rose-500':
      return 'from-pink-500 to-rose-500'
    case 'from-amber-400 to-orange-500':
      return 'from-amber-400 to-orange-500'
    case 'from-purple-500 to-violet-600':
      return 'from-purple-500 to-violet-600'
    default:
      return 'from-emerald-500 to-teal-400'
  }
}

// Helper para traducir el theme_color a Hexadecimal
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

// MAPA DE ICONOS DE MARCA CON COLORES OFICIALES EXPLICITOS
const SOCIAL_OPTIONS = [
  { key: "whatsapp", emoji: "💬", label: "WhatsApp", icon: <FaWhatsapp style={{ color: "#25D366" }} className="text-xl" /> },
  { key: "instagram", emoji: "📸", label: "Instagram", icon: <FaInstagram style={{ color: "#E4405F" }} className="text-xl" /> },
  { key: "facebook", emoji: "📘", label: "Facebook", icon: <FaFacebook style={{ color: "#1877F2" }} className="text-xl" /> },
  { key: "web", emoji: "🌐", label: "Sitio Web", icon: <FaGlobe style={{ color: "#38BDF8" }} className="text-xl" /> },
  { key: "map", emoji: "📍", label: "Ubicación", icon: <FaMapMarkerAlt style={{ color: "#F43F5E" }} className="text-xl" /> },
  { key: "menu", emoji: "📖", label: "Menú Digital", icon: <FaUtensils style={{ color: "#F59E0B" }} className="text-xl" /> },
  { key: "phone", emoji: "📞", label: "Teléfono", icon: <FaPhone style={{ color: "#2DD4BF" }} className="text-xl" /> },
  { key: "star", emoji: "⭐", label: "Reseña Google", icon: <FaStar style={{ color: "#FACC15" }} className="text-xl" /> },
  { key: "shop", emoji: "🛍️", label: "Tienda Online", icon: <FaShoppingBag style={{ color: "#A855F7" }} className="text-xl" /> },
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

export default function PublicProfilePage() {
  const params = useParams()
  const slug = params?.slug as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [expired, setExpired] = useState(false)
  const [copied, setCopied] = useState(false)
  const [savedContact, setSavedContact] = useState(false)
  const [isInstagramBrowser, setIsInstagramBrowser] = useState(false)

  useEffect(() => {
    // Detectar si se está navegando desde el In-App Browser de Instagram
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || navigator.vendor
      const isIG = /Instagram/i.test(ua)
      setIsInstagramBrowser(isIG)

      // Si es Android dentro de Instagram, intentar forzar la apertura en Chrome
      if (isIG && /Android/i.test(ua)) {
        const cleanUrl = window.location.href.replace(/^https?:\/\//, '')
        window.location.href = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end;`
      }
    }
  }, [])

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

      const { data: linksData } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', profileData.id)
        .eq('is_active', true)
        .order('position', { ascending: true })

      if (linksData) setLinks(linksData)
      setLoading(false)
    }

    loadPublicData()
  }, [slug])

  // MANEJADOR UNIVERSAL DE vCARD COMPATIBLE CON INSTAGRAM
  const handleDownloadVCard = () => {
    if (!profile) return

    const fullName = profile.full_name || profile.name || slug

    const vCardContent = [
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

    try {
      if (isInstagramBrowser) {
        // En WebView de Instagram creamos una Data URI para activar la agenda
        const encodedVCard = encodeURIComponent(vCardContent)
        const dataUrl = `data:text/vcard;charset=utf-8,${encodedVCard}`
        
        const win = window.open(dataUrl, '_self')
        if (!win && profile.phone) {
          window.location.href = `tel:${profile.phone}`
        }
      } else {
        // Descarga estándar por Blob
        const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8;' })
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
      }

      setSavedContact(true)
      setTimeout(() => setSavedContact(false), 3000)
    } catch (err) {
      console.warn('Fallback por bloqueo de navegador:', err)
      if (profile.phone) {
        window.location.href = `tel:${profile.phone}`
      }
    }
  }

  // Compartir Perfil
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
      <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center p-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <div className="absolute font-black text-xs text-emerald-400 tracking-wider">MOGU</div>
        </div>
      </div>
    )
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-extrabold text-white mb-2">Este perfil MOGU ha expirado</h1>
        <p className="text-xs text-neutral-400 mb-6 max-w-xs leading-relaxed">
          El período de activación de este enlace digital ha concluido. El propietario debe renovar su membresía.
        </p>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-neutral-900/80 border border-neutral-800 rounded-3xl flex items-center justify-center mb-4 text-3xl shadow-2xl">
          🔍
        </div>
        <h1 className="text-xl font-extrabold text-white mb-2">Perfil No Encontrado</h1>
        <p className="text-xs text-neutral-400 mb-6 max-w-xs leading-relaxed">
          La tarjeta digital consultada no está vinculada a ningún perfil activo.
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs font-semibold rounded-2xl transition-all"
        >
          Ir al Inicio de MOGU
        </a>
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

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white font-sans selection:bg-emerald-500/35 selection:text-emerald-300 relative overflow-hidden flex flex-col justify-between">
      
      {/* GLOW DE FONDO CON EL COLOR DEL TEMA */}
      <div className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-r ${themeGlowClass} opacity-15 blur-[120px] rounded-full pointer-events-none`} />

      <main className="relative z-10 max-w-md w-full mx-auto px-5 pt-10 pb-16 flex-1 flex flex-col justify-center">
        
        {/* AVISO RECOMENDADO SI SE ABRE EN INSTAGRAM IN-APP */}
        {isInstagramBrowser && (
          <div className="mb-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center animate-pulse">
            <p className="text-[11px] text-amber-300 font-medium leading-relaxed">
              💡 <b>Para descargar contactos o usar la app fluida:</b> Presiona los tres puntos (<b>•••</b>) en la esquina superior y selecciona <b>"Abrir en el navegador"</b>.
            </p>
          </div>
        )}

        {/* AVATAR Y DATOS DE LA MARCA */}
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <div className="relative group">
            <div className={`absolute -inset-1 bg-gradient-to-r ${themeGlowClass} rounded-full blur opacity-50 group-hover:opacity-75 transition duration-500`} />
            
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/80 p-1 flex items-center justify-center shadow-2xl overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={fullName} className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center text-2xl font-black text-emerald-400 tracking-wider">
                  {initials}
                </div>
              )}
            </div>

            <div className="absolute bottom-0 right-0 bg-emerald-400 text-black p-1 rounded-full shadow-lg border-2 border-[#0A0A0C]" title="Verificado por MOGU">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
              {fullName}
            </h1>
            {profile.title && (
              <p 
                className="text-xs font-semibold tracking-wider uppercase"
                style={{ color: themeHex }}
              >
                {profile.title}
              </p>
            )}
            {profile.bio && (
              <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed pt-1 font-normal">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* ACCIÓN PRINCIPAL: GUARDAR CONTACTO */}
        <div className="mb-4">
          <button
            onClick={handleDownloadVCard}
            className={`group relative w-full py-3.5 px-6 bg-gradient-to-r ${themeGlowClass} text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 overflow-hidden cursor-pointer`}
          >
            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:left-[100%] transition-all duration-1000 ease-in-out" />
            
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
            <span>{savedContact ? '¡Contacto Guardado con Éxito! 🚀' : 'Guardar en Contactos'}</span>
          </button>
        </div>

        {/* BOTÓN CARTA / MENÚ DIGITAL (SI TIENE MENU HABILITADO) */}
        {profile.has_menu && (
          <div className="mb-4">
            <a
              href={`/menu/${profile.slug}`}
              className="group flex items-center justify-between py-3.5 px-6 bg-neutral-900/80 hover:bg-neutral-800 border border-emerald-500/40 hover:border-emerald-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all duration-200 active:scale-[0.98]"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">📖</span>
                <span>Ver Carta / Menú Digital</span>
              </div>
              <svg className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        )}

        {/* LISTA DE ENLACES CON ICONOS A COLOR */}
        <div className="space-y-3.5">
          {links.length === 0 ? (
            <div className="p-6 bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 rounded-2xl text-center">
              <p className="text-xs text-neutral-500 font-medium">Aún no hay enlaces configurados.</p>
            </div>
          ) : (
            links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-between p-4 bg-neutral-900/50 hover:bg-neutral-800/70 backdrop-blur-xl border border-neutral-800/80 hover:border-emerald-500/40 rounded-2xl transition-all duration-200 active:scale-[0.99] shadow-lg"
              >
                <div className="flex items-center space-x-3.5 overflow-hidden pr-2">
                  <div className="w-10 h-10 rounded-xl bg-neutral-800/90 border border-neutral-700/60 flex items-center justify-center shadow-inner group-hover:scale-105 transition-all flex-shrink-0">
                    {renderLinkIcon(link.emoji)}
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-neutral-100 group-hover:text-white transition-colors block truncate">
                      {link.title}
                    </span>
                    <span className="text-[10px] text-neutral-400 block truncate font-light mt-0.5">
                      {getLinkSubtitle(link.title)}
                    </span>
                  </div>
                </div>

                <div className="text-neutral-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </a>
            ))
          )}
        </div>

        {/* BOTÓN COMPARTIR */}
        <div className="mt-6 text-center">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800/80 rounded-xl text-[11px] text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-5.367 3 3 0 000 5.367zm0 8.005a3 3 0 100-5.367 3 3 0 000 5.367z" />
            </svg>
            <span>{copied ? '¡Enlace copiado!' : 'Compartir este Perfil'}</span>
          </button>
        </div>

        {/* BANNER DE CONVERSIÓN MOGU */}
        <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-neutral-900/60 to-teal-950/40 border border-emerald-500/30 text-center relative overflow-hidden shadow-2xl backdrop-blur-md">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
            Tecnología MOGU
          </span>
          <h3 className="text-sm font-extrabold text-white mb-1">
            ¿Tienes un negocio y quieres una tarjeta así?
          </h3>
          <p className="text-[11px] text-neutral-400 mb-4 max-w-xs mx-auto leading-relaxed">
            Comparte tus datos, menú o redes al instante con un solo tap.
          </p>
          <a
            href="/"
            className="inline-block w-full py-2.5 px-4 bg-white hover:bg-neutral-200 text-black font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all duration-200 shadow-lg cursor-pointer"
          >
            Quiero mi tarjeta Mogu 🚀
          </a>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 py-6 text-center border-t border-neutral-900">
        <a href="https://mogu.cl" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-500 hover:text-emerald-400 transition">
          <span>POWERED BY</span>
          <span className="font-black text-white tracking-wider">MOGU</span>
        </a>
      </footer>

    </div>
  )
}