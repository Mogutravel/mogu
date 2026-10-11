'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiArrowRight, FiHeart, FiShoppingBag, FiX, FiCheck, FiMessageCircle } from 'react-icons/fi'

interface PhotoScene {
  id: number
  title: string
  category: string
  year: string
  image: string
  layout: 'centered' | 'aside-left' | 'aside-right' | 'fullscreen'
  description: string
  specs: string[]
}

const GALLERY_SCENES: PhotoScene[] = [
  {
    id: 1,
    title: "The Amber Essence",
    category: "Still Life & Atmosphere",
    year: "2026",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1200&auto=format&fit=crop",
    layout: "fullscreen",
    description: "Ideal si querés un aroma constante y sutil durante todo el día.",
    specs: ["Perfuma sin encender nada", "Decora cualquier ambiente", "Genera presencia y armonía"]
  },
  {
    id: 2,
    title: "Silhouettes in Concrete",
    category: "Architecture & Light",
    year: "2026",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
    layout: "aside-left",
    description: "Geometrías puras interactuando con la luz natural del atardecer.",
    specs: ["Luz de mediodía", "Contraste estructurado", "Minimalismo puro"]
  },
  {
    id: 3,
    title: "Ephemeral Textures",
    category: "Organic Fashion",
    year: "2025",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
    layout: "aside-right",
    description: "Estudio de pliegues, sombras y movimiento en tejidos fluidos.",
    specs: ["Texturas orgánicas", "Movimiento natural", "Alta definición"]
  },
  {
    id: 4,
    title: "Silent Horizon",
    category: "Landscape Minimal",
    year: "2026",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
    layout: "fullscreen",
    description: "La quietud absoluta del agua fusionada con el cielo despejado.",
    specs: ["Exposición prolongada", "Tono neutro", "Horizonte limpio"]
  },
  {
    id: 5,
    title: "Chroma Studio",
    category: "Contemporary Art",
    year: "2026",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop",
    layout: "centered",
    description: "Exploración cromática y saturación en entornos controlados.",
    specs: ["Paleta primaria", "Iluminación de estudio", "Contraste vibrante"]
  },
  {
    id: 6,
    title: "Nordic Solitude",
    category: "Interior Design",
    year: "2025",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
    layout: "aside-left",
    description: "Espacios habitados por la luz suave del norte europeo.",
    specs: ["Madera de roble", "Luz difusa", "Diseño atemporal"]
  }
]

export default function LightEditorialCatalogPage() {
  const [wishlist, setWishlist] = useState<number[]>([])
  const [showDrawer, setShowDrawer] = useState(false)

  const toggleWishlist = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  return (
    <div className="bg-[#F9F8F6] text-[#1C1917] font-sans selection:bg-[#B88E56]/20 selection:text-[#1C1917] min-h-screen relative">
      
      {/* NAVBAR FLOTANTE ILUMINADA */}
      <header className="fixed top-0 left-0 w-full z-50 px-6 lg:px-12 py-5 flex items-center justify-between backdrop-blur-md bg-[#F9F8F6]/80 border-b border-[#E8E4DF]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-serif font-bold tracking-[0.3em] uppercase text-[#A37B4C]">MOGU</span>
          <span className="text-[#D6D0C7]">/</span>
          <span className="text-xs font-medium tracking-widest uppercase text-[#78716C]">Editorial Collection</span>
        </div>

        <div className="flex items-center gap-6">
          <Link 
            href="/admin/mogu" 
            className="text-xs uppercase tracking-widest text-[#78716C] hover:text-[#1C1917] transition-colors"
          >
            Panel Admin
          </Link>

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
            src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1600&auto=format&fit=crop" 
            alt="Hero background" 
            className="w-full h-full object-cover opacity-85 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F9F8F6] via-[#F9F8F6]/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl space-y-4 pb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#E8E4DF] text-[10px] uppercase tracking-[0.3em] text-[#A37B4C] shadow-sm">
            <span>✦</span> Visual Stories 2026 <span>✦</span>
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif font-light text-[#1C1917] tracking-wide leading-none">
            Beyond <br /><span className="italic text-[#A37B4C]">the Frame</span>
          </h1>
          <p className="text-sm sm:text-base text-[#78716C] font-light max-w-lg leading-relaxed pt-2">
            Una colección donde la luz, las texturas orgánicas y el espacio dialogan en perfecta serenidad.
          </p>
        </div>

        <div className="absolute bottom-6 right-6 lg:right-12 z-10 hidden sm:flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#78716C]">
          <span>Desliza para explorar</span>
          <FiArrowRight className="text-[#A37B4C] animate-pulse" />
        </div>
      </section>

      {/* GALERÍA DE ESCENAS EDITORIALES */}
      <div className="space-y-32 py-24 px-6 lg:px-16 max-w-7xl mx-auto">
        {GALLERY_SCENES.map((scene, index) => {
          const isLiked = wishlist.includes(scene.id)

          return (
            <article 
              key={scene.id}
              className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${
                scene.layout === 'aside-right' ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* TARJETA FOTOGRÁFICA DE ALTA DEFINICIÓN */}
              <div 
                className="w-full lg:w-7/12 relative group cursor-pointer overflow-hidden rounded-[32px] border border-[#E8E4DF] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-700 hover:shadow-[0_25px_60px_rgba(163,123,76,0.12)] hover:border-[#A37B4C]/40"
                onClick={() => toggleWishlist(scene.id)}
              >
                <div className="relative h-[480px] sm:h-[620px] w-full overflow-hidden">
                  <img 
                    src={scene.image} 
                    alt={scene.title}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                  
                  {/* BOTÓN FAVORITO */}
                  <button 
                    onClick={(e) => toggleWishlist(scene.id, e)}
                    className={`absolute top-6 right-6 w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-md border ${
                      isLiked 
                        ? 'bg-[#A37B4C] border-[#A37B4C] text-white' 
                        : 'bg-white/80 border-white text-[#1C1917] hover:border-[#A37B4C]'
                    }`}
                  >
                    <FiHeart className={`text-base ${isLiked ? 'fill-current' : ''}`} />
                  </button>

                  <div className="absolute bottom-6 left-6 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-white/60 text-xs font-serif tracking-widest text-[#1C1917] shadow-sm">
                    Escena 0{index + 1} — {scene.year}
                  </div>
                </div>
              </div>

              {/* INFORMACIÓN EDITORIAL EN FONDO CLARO */}
              <div className="w-full lg:w-5/12 space-y-6">
                <span className="text-[10px] uppercase font-serif tracking-[0.3em] font-semibold text-[#A37B4C]">
                  {scene.category}
                </span>

                <h2 className="text-3xl sm:text-5xl font-serif font-light text-[#1C1917] tracking-wide leading-tight">
                  {scene.title}
                </h2>

                <div className="flex items-center gap-2 py-1">
                  <div className="w-8 h-[1px] bg-[#D6D0C7]" />
                  <span className="text-[#A8A096] text-[10px]">•••</span>
                  <div className="w-8 h-[1px] bg-[#D6D0C7]" />
                </div>

                <p className="text-sm text-[#78716C] font-light leading-relaxed">
                  {scene.description}
                </p>

                <div className="space-y-2.5 pt-2">
                  {scene.specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-[#44403C] font-normal">
                      <FiCheck className="text-[#A37B4C] text-sm" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => toggleWishlist(scene.id)}
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
        })}
      </div>

      {/* FOOTER SOBRIO Y MINIMALISTA */}
      <footer className="border-t border-[#E8E4DF] bg-[#F2EFF9] py-20 px-6 lg:px-12 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2">
            <span className="text-xs uppercase font-serif font-bold tracking-[0.3em] text-[#A37B4C]">MOGU Studios</span>
            <h3 className="text-2xl font-serif font-light text-[#1C1917]">Curaduría digital y diseño inmersivo.</h3>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/admin/mogu" className="text-xs uppercase tracking-widest text-[#78716C] hover:text-[#1C1917] transition-colors">
              Administración
            </Link>
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
                    Tu selección está vacía. Haz clic en el ícono de favorito ❤️ en las escenas que desees destacar.
                  </div>
                ) : (
                  GALLERY_SCENES.filter(scene => wishlist.includes(scene.id)).map(scene => (
                    <div key={scene.id} className="flex items-center justify-between gap-3 p-3.5 bg-white border border-[#E8E4DF] rounded-2xl shadow-sm">
                      <div className="flex items-center gap-3.5">
                        <img src={scene.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <h4 className="text-xs font-serif font-light text-[#1C1917] line-clamp-1">{scene.title}</h4>
                          <span className="text-[11px] text-[#A37B4C] font-medium">{scene.category}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleWishlist(scene.id)}
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
              <a
                href={`https://wa.me/?text=${encodeURIComponent("Hola, me interesa conocer más sobre la colección editorial de Mogu.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-4 px-6 rounded-full font-serif text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 shadow-md transition-all ${
                  wishlist.length > 0
                    ? 'bg-[#A37B4C] text-white font-medium hover:bg-[#8B673E] cursor-pointer'
                    : 'bg-[#E8E4DF] text-[#78716C] cursor-not-allowed pointer-events-none'
                }`}
              >
                <FiMessageCircle className="text-base" />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}