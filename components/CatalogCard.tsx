'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiHeart } from 'react-icons/fi'

interface CatalogItem {
  id: string
  name: string
  description: string | null
  price: string | null
  image_url: string | null
}

interface CatalogCardProps {
  item: CatalogItem
  containerRef: React.RefObject<HTMLDivElement>
  isLiked: boolean
  onToggleWishlist: (id: string, e: React.MouseEvent) => void
  onSelectProduct: (item: CatalogItem) => void
}

export default function CatalogCard({
  item,
  containerRef,
  isLiked,
  onToggleWishlist,
  onSelectProduct,
}: CatalogCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Vincula el scroll del contenedor principal con esta tarjeta
  const { scrollXProgress } = useScroll({
    container: containerRef,
    target: cardRef,
    offset: ['start end', 'end start'], // Desde que entra por la derecha hasta que sale por la izquierda
  })

  // Transiciones estilo Awwwards:
  // 1. Opacidad: entra opaca, se vuelve 100% visible al centro, se desvanece al salir.
  const opacity = useTransform(scrollXProgress, [0, 0.4, 0.6, 1], [0.3, 1, 1, 0.3])
  
  // 2. Escala suave: empieza pequeña (0.88), se expande al centro (1.0), se reduce al salir (0.88).
  const scale = useTransform(scrollXProgress, [0, 0.4, 0.6, 1], [0.88, 1, 1, 0.88])

  // 3. Parallax interno de la imagen: la foto se mueve ligeramente dentro de la tarjeta.
  const imageX = useTransform(scrollXProgress, [0, 1], ['-10%', '10%'])

  const descLines = item.description ? item.description.split('\n').filter(Boolean) : []

  return (
    <motion.div
      ref={cardRef}
      style={{ opacity, scale }}
      onClick={() => onSelectProduct(item)}
      className="flex-none w-[88vw] sm:w-[380px] md:w-[420px] min-h-[580px] bg-[#1A1714] border border-[#2C2621] rounded-[32px] overflow-hidden shadow-2xl snap-center relative flex flex-col justify-between group cursor-pointer transition-colors duration-500 hover:border-[#C5A880]/60"
    >
      <div className="relative w-full h-[580px] bg-[#141210] overflow-hidden flex flex-col justify-between p-6 sm:p-8">
        
        {/* FOTO CON EFECTO PARALLAX INTERNO */}
        {item.image_url ? (
          <motion.img
            style={{ x: imageX, scale: 1.15 }}
            src={item.image_url}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover opacity-85 transition-opacity duration-700 group-hover:opacity-100"
          />
        ) : (
          <div className="absolute inset-0 bg-[#25201C] flex items-center justify-center text-5xl">🕯️</div>
        )}

        {/* GRADIENTE EDITORIAL */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent pointer-events-none" />

        {/* BARRA SUPERIOR */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="px-4 py-1.5 rounded-full bg-[#141210]/70 backdrop-blur-md border border-white/10 text-xs font-serif tracking-widest text-[#F5F2EE] shadow-md">
            {item.price || 'Consultar'}
          </span>

          <button
            onClick={(e) => onToggleWishlist(item.id, e)}
            className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-lg border ${
              isLiked 
                ? 'bg-[#C5A880] border-[#C5A880] text-black' 
                : 'bg-[#141210]/60 border-white/10 text-white hover:border-[#C5A880]'
            }`}
          >
            <FiHeart className={`text-base ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* CONTENIDO EDITORIAL DE LA TARJETA */}
        <div className="relative z-10 max-w-[85%] space-y-4 pt-12 transform transition-all duration-700 ease-out group-hover:translate-x-1">
          <h3 className="text-3xl sm:text-4xl font-serif font-light text-white tracking-wide leading-tight drop-shadow-md">
            {item.name}
          </h3>

          <div className="flex items-center gap-1.5 py-1">
            <div className="w-8 h-[1px] bg-white/30 transition-all duration-500 group-hover:w-12 group-hover:bg-[#C5A880]" />
            <span className="text-white/60 text-[10px]">•••</span>
            <div className="w-8 h-[1px] bg-white/30 transition-all duration-500 group-hover:w-12 group-hover:bg-[#C5A880]" />
          </div>

          {descLines.length > 0 ? (
            <div className="space-y-2 text-xs text-white/90 font-light leading-relaxed drop-shadow-sm">
              {descLines.map((line, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  {line.trim().startsWith('✓') ? (
                    <span>{line}</span>
                  ) : (
                    <>
                      <span className="text-white font-bold">✓</span>
                      <span>{line}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            item.description && (
              <p className="text-xs text-white/90 font-light leading-relaxed drop-shadow-sm">
                {item.description}
              </p>
            )
          )}
        </div>

      </div>
    </motion.div>
  )
}