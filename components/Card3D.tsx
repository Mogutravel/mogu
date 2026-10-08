'use client'

import { useState, useRef, MouseEvent } from 'react'

interface Card3DProps {
  imageSrc: string
  altText: string
  badgeText?: string | null
}

export default function Card3D({ imageSrc, altText, badgeText }: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  // Estados para la rotación y el brillo dinámico
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 })

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    
    // Coordenadas del mouse relativas a la tarjeta
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Centro de la tarjeta
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    // Calcular ángulos de rotación (limitados a máx 12 grados para elegancia)
    const rX = -((y - centerY) / centerY) * 12
    const rY = ((x - centerX) / centerX) * 12

    setRotateX(rX)
    setRotateY(rY)

    // Posición del reflejo de luz (Glare)
    const glareX = (x / rect.width) * 100
    const glareY = (y / rect.height) * 100
    setGlarePosition({ x: glareX, y: glareY, opacity: 0.35 })
  }

  const handleMouseLeave = () => {
    // Restablecer posición suavemente al salir
    setRotateX(0)
    setRotateY(0)
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }))
  }

  return (
    <div className="perspective-[1000px] w-full flex items-center justify-center mb-6">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
          transition: rotateX === 0 && rotateY === 0 ? 'transform 0.5s ease-out' : 'transform 0.1s ease-out',
        }}
        className="relative h-60 w-full rounded-2xl cursor-pointer select-none overflow-hidden border border-neutral-700/80 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black shadow-[0_25px_50px_rgba(0,0,0,0.8)] flex items-center justify-center p-4 group"
      >
        {/* Fondo sutil con brillo radial ambiental */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] pointer-events-none" />

        {/* Imagen de la tarjeta completa, centrada y sin recortes */}
        <img
          src={imageSrc}
          alt={altText}
          className="max-h-full max-w-full object-contain rounded-xl shadow-2xl transform group-hover:scale-105 transition duration-500"
        />

        {/* Efecto de Luz Holográfica Dinámica (Glare) */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl"
          style={{
            opacity: glarePosition.opacity,
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.4) 0%, rgba(16,185,129,0.2) 40%, transparent 80%)`,
          }}
        />

        {/* Badge flotante si el producto lo tiene */}
        {badgeText && (
          <div className="absolute top-3 left-3 z-10">
            <span className="rounded-md bg-neutral-950/90 backdrop-blur-md border border-emerald-500/30 px-2.5 py-1 text-[10px] font-bold text-emerald-400 shadow-lg">
              {badgeText}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}