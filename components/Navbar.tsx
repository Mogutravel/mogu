'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  const closeMenu = () => setIsOpen(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleOutsideInteraction = (event: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideInteraction)
    document.addEventListener('touchstart', handleOutsideInteraction)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction)
      document.removeEventListener('touchstart', handleOutsideInteraction)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <header
      ref={navRef}
      className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-50"
    >
      <div className="px-5 sm:px-6 py-3.5 flex items-center justify-between bg-[#0E0C0A]/85 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]">
        {/* Logo */}
        <Link href="/" onClick={closeMenu} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center shadow-inner group-hover:border-white/40 transition">
            <img
              src="/logo-mogu.png"
              alt="Mogu Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-lg font-black tracking-widest text-white">
            MOGU<span className="text-cyan-400">.</span>
          </span>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-white/80 md:flex">
          <Link href="/cafeterias" className="transition hover:text-white">
            Cafés y Restaurantes
          </Link>
          <Link href="/comida-rapida" className="transition hover:text-white">
            Comida Rápida
          </Link>
          <Link href="/travel" className="transition hover:text-cyan-300 font-semibold text-cyan-400">
            Mogu Travel
          </Link>
          <Link href="#ecosistema" className="transition hover:text-white">
            Planes
          </Link>
          <Link href="#faq" className="transition hover:text-white">
            FAQ
          </Link>
        </nav>

        {/* Acciones Desktop + Botón Hamburguesa Móvil */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-block px-4 py-2 text-xs font-semibold text-white/80 hover:text-white transition"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/checkout/mogu-start"
            className="px-3.5 sm:px-4 py-2 bg-white hover:bg-slate-100 text-[#0E0C0A] text-[11px] sm:text-xs font-bold rounded-xl transition shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] flex items-center gap-1.5"
          >
            <span className="hidden xs:inline">Crea tu perfil digital gratis</span>
            <span className="xs:hidden">Perfil gratis</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isOpen}
            className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white transition"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {isOpen && (
        <div className="md:hidden mt-2 p-5 rounded-2xl bg-[#0E0C0A]/95 backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1 text-sm font-medium text-white/85">
            <Link
              href="/cafeterias"
              onClick={closeMenu}
              className="px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition"
            >
              Cafés y Restaurantes
            </Link>
            <Link
              href="/comida-rapida"
              onClick={closeMenu}
              className="px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition"
            >
              Comida Rápida
            </Link>
            <Link
              href="/travel"
              onClick={closeMenu}
              className="px-3 py-2.5 rounded-xl hover:bg-white/10 text-cyan-400 font-semibold transition"
            >
              Mogu Travel
            </Link>
            <Link
              href="#ecosistema"
              onClick={closeMenu}
              className="px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition"
            >
              Planes
            </Link>
            <Link
              href="#faq"
              onClick={closeMenu}
              className="px-3 py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition"
            >
              FAQ
            </Link>
          </nav>

          <div className="mt-4 pt-4 border-t border-white/15 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={closeMenu}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-center text-xs font-bold uppercase tracking-wider text-white transition"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/checkout/mogu-start"
              onClick={closeMenu}
              className="w-full py-3 rounded-xl bg-white hover:bg-slate-100 text-[#0E0C0A] text-center text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5"
            >
              <span>Crea tu perfil digital gratis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}