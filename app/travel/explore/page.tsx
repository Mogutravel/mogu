'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  FiCompass, 
  FiMapPin, 
  FiSearch, 
  FiCoffee, 
  FiHome, 
  FiArrowLeft, 
  FiStar,
  FiExternalLink
} from 'react-icons/fi'

interface AllyPlace {
  id: string
  store_slug: string
  name: string
  city: string
  country: string
  category: 'gastronomia' | 'hostel' | 'cafe'
  rating: number
  perk_description: string
  cover_image: string
}

export default function ExploreTravelPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('todos')
  const [places, setPlaces] = useState<AllyPlace[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAllies() {
      try {
        // Datos de ejemplo robustos para la comunidad global Mogu Travel
        const mockPlaces: AllyPlace[] = [
          {
            id: '1',
            store_slug: 'la-barra',
            name: 'La Barra Restobar',
            city: 'Curicó',
            country: 'Chile',
            category: 'gastronomia',
            rating: 4.9,
            perk_description: '10% de descuento en carta y 1 sello doble para el pasaporte',
            cover_image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
          },
          {
            id: '2',
            store_slug: 'cafe-central',
            name: 'Café Central Artisanal',
            city: 'Santiago',
            country: 'Chile',
            category: 'cafe',
            rating: 4.8,
            perk_description: 'Café de especialidad gratis al canjear 100 puntos Mogu',
            cover_image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80'
          },
          {
            id: '3',
            store_slug: 'hostel-bistro',
            name: 'Mendoza Backpacker Hostel',
            city: 'Mendoza',
            country: 'Argentina',
            category: 'hostel',
            rating: 4.9,
            perk_description: '15% de descuento en estadías nocturnas para miembros Mogu Travel',
            cover_image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'
          },
          {
            id: '4',
            store_slug: 'patagonia-pub',
            name: 'Patagonia Craft Pub',
            city: 'Bariloche',
            country: 'Argentina',
            category: 'gastronomia',
            rating: 4.7,
            perk_description: 'Pinta de bienvenida artesanal al sellar tu pasaporte',
            cover_image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80'
          }
        ]

        setPlaces(mockPlaces)
      } catch (err) {
        console.error('Error al cargar aliados:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAllies()
  }, [])

  // Filtrado por búsqueda y categoría
  const filteredPlaces = places.filter((place) => {
    const matchesSearch = 
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.country.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === 'todos' || place.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-[#0E0C0A] text-[#F2F2EE] font-sans p-4 md:p-8 pb-32">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/travel/passport')}
            className="flex items-center gap-2 text-xs font-medium text-white/60 hover:text-white transition cursor-pointer"
          >
            <FiArrowLeft /> Mi Pasaporte
          </button>
          <span className="bg-[#FF7A45]/15 text-[#FF7A45] border border-[#FF7A45]/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <FiCompass /> Red Global Mogu
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight">Explora Aliados & Hostels</h1>
          <p className="text-xs text-white/50">
            Descubre locales gastronómicos, cafés y hospedajes conectados a Mogu Travel en todo el mundo.
          </p>
        </div>

        {/* Buscador */}
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Busca por ciudad, país o nombre de local..."
            className="w-full bg-[#141210] border border-[#2E2A27] rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#FF7A45] transition"
          />
        </div>

        {/* Filtros de Categoría */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'gastronomia', label: 'Restobares' },
            { id: 'cafe', label: 'Cafés' },
            { id: 'hostel', label: 'Hostels' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#FF7A45] text-black shadow-lg shadow-[#FF7A45]/25'
                  : 'bg-[#141210] border border-[#2E2A27] text-white/70 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Lista de Aliados */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-xs text-center text-white/40 py-12">Cargando red de aliados...</p>
          ) : filteredPlaces.length === 0 ? (
            <div className="bg-[#141210] border border-[#2E2A27] rounded-3xl p-12 text-center space-y-2">
              <p className="text-sm font-bold text-white/60">No se encontraron resultados</p>
              <p className="text-xs text-white/40">Prueba buscando otra ciudad o categoría.</p>
            </div>
          ) : (
            filteredPlaces.map((place) => (
              <div 
                key={place.id}
                className="bg-[#141210] border border-[#2E2A27] hover:border-[#FF7A45]/50 rounded-3xl overflow-hidden shadow-xl transition space-y-4"
              >
                <div className="relative h-44 w-full">
                  <img 
                    src={place.cover_image} 
                    alt={place.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-transparent to-black/30" />

                  <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
                    {place.category}
                  </span>

                  <span className="absolute top-4 right-4 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                    <FiStar /> {place.rating}
                  </span>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-lg font-black text-white">{place.name}</h2>
                    <p className="text-xs text-white/70 flex items-center gap-1 mt-0.5">
                      <FiMapPin className="text-[#FF7A45]" /> {place.city}, {place.country}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-4">
                  <div className="bg-[#1B1917] border border-white/5 rounded-2xl p-3 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#FF7A45]">Beneficio Mogu Travel</p>
                    <p className="text-xs text-white/80 font-medium">{place.perk_description}</p>
                  </div>

                  <button
                    onClick={() => router.push(`/menu/${place.store_slug}`)}
                    className="w-full py-3 bg-[#FF7A45] hover:bg-[#FF652D] text-black font-extrabold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#FF7A45]/20"
                  >
                    Ver Menú y Visitar <FiExternalLink />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}