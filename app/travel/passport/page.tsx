'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  FiCompass, 
  FiGlobe, 
  FiAward, 
  FiMapPin, 
  FiCheckCircle, 
  FiLock, 
  FiArrowLeft,
  FiUser,
  FiZap,
  FiShare2
} from 'react-icons/fi'

interface TravelerProfile {
  id: string
  username: string
  full_name: string
  avatar_url: string
  country_origin: string
  points_balance: number
}

interface Stamp {
  id: string
  store_slug: string
  city: string
  country: string
  unlocked_at: string
  store_name?: string
  logo_url?: string
}

const LEVEL_THRESHOLD = 5 // Cada 5 sellos sube de nivel

export default function PassportPage() {
  const router = useRouter()

  const [profile, setProfile] = useState<TravelerProfile | null>(null)
  const [stamps, setStamps] = useState<Stamp[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPassportData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        // Perfil por defecto de demostración si aún no hay sesión activa
        if (!user) {
          setProfile({
            id: 'demo-user',
            username: 'nomad_chile',
            full_name: 'Viajero Mogu',
            avatar_url: '',
            country_origin: 'Chile 🇨🇱',
            points_balance: 350
          })

          setStamps([
            { id: '1', store_slug: 'la-barra', city: 'Curicó', country: 'Chile', unlocked_at: '2026-10-15' },
            { id: '2', store_slug: 'cafe-central', city: 'Santiago', country: 'Chile', unlocked_at: '2026-10-28' },
            { id: '3', store_slug: 'hostel-bistro', city: 'Mendoza', country: 'Argentina', unlocked_at: '2026-11-02' }
          ])
          setLoading(false)
          return
        }

        // Cargar perfil real desde Supabase
        const { data: profileData } = await supabase
          .from('traveler_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (profileData) {
          setProfile(profileData)

          // Cargar sellos del viajero
          const { data: stampsData } = await supabase
            .from('traveler_stamps')
            .select('*')
            .eq('traveler_id', profileData.id)
            .order('unlocked_at', { ascending: false })

          setStamps(stampsData || [])
        }
      } catch (err) {
        console.error('Error al cargar pasaporte:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPassportData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E0C0A] text-[#F2F2EE] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#FF7A45] animate-spin" />
        <span className="mt-4 text-xs uppercase tracking-widest text-white/50">
          Abriendo Pasaporte Mogu Travel...
        </span>
      </div>
    )
  }

  const stampCount = stamps.length
  const currentLevel = Math.floor(stampCount / LEVEL_THRESHOLD) + 1
  const stampsToNextLevel = LEVEL_THRESHOLD - (stampCount % LEVEL_THRESHOLD)

  return (
    <div className="min-h-screen bg-[#0E0C0A] text-[#F2F2EE] font-sans p-4 md:p-8 pb-32">
      <div className="max-w-md mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/travel')}
            className="flex items-center gap-2 text-xs font-medium text-white/60 hover:text-white transition cursor-pointer"
          >
            <FiArrowLeft /> Mogu Travel
          </button>
          <span className="bg-[#FF7A45]/15 text-[#FF7A45] border border-[#FF7A45]/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <FiCompass className="animate-spin-slow" /> Pasaporte Digital
          </span>
        </div>

        {/* TARJETA DEL PASAPORTE (ESTÉTICA INDUSTRIAL / DARK GLOW) */}
        <div className="relative bg-gradient-to-br from-[#1B1917] via-[#141210] to-[#0E0C0A] border border-[#2E2A27] rounded-3xl p-6 shadow-2xl overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7A45]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Encabezado del documento */}
          <div className="flex justify-between items-start border-b border-white/10 pb-4">
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-[#FF7A45]">Mogu Travel Passport</p>
              <h1 className="text-xl font-extrabold tracking-tight mt-0.5">{profile?.full_name || 'Explorador'}</h1>
              <p className="text-xs text-white/50">@{profile?.username || 'viajero'}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FF7A45]/20 border border-[#FF7A45]/40 flex items-center justify-center text-xl text-[#FF7A45] shrink-0">
              <FiUser />
            </div>
          </div>

          {/* Datos del Viajero */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold block">Origen</span>
              <span className="font-semibold text-white/90">{profile?.country_origin || 'Internacional'}</span>
            </div>
            <div>
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold block">Rango</span>
              <span className="font-bold text-[#FF7A45]">Nivel {currentLevel} • Trotamundos</span>
            </div>
            <div>
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold block">Sellos Totales</span>
              <span className="font-mono text-base font-extrabold text-white">{stampCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold block">Puntos Mogu</span>
              <span className="font-mono text-base font-extrabold text-amber-400">{profile?.points_balance || 0} pts</span>
            </div>
          </div>

          {/* Barra de Progreso al Siguiente Nivel */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-white/60">Progreso a Nivel {currentLevel + 1}</span>
              <span className="text-[#FF7A45]">{stampsToNextLevel} sellos más</span>
            </div>
            <div className="w-full h-2 bg-[#2E2A27] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF7A45] to-amber-400 transition-all duration-500"
                style={{ width: `${((LEVEL_THRESHOLD - stampsToNextLevel) / LEVEL_THRESHOLD) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN DE SELLOS / TIMBRES VIRTUALES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-white/80 flex items-center gap-2">
              <FiGlobe className="text-[#FF7A45]" /> Sellos Desbloqueados
            </h2>
            <span className="text-xs text-white/40 font-mono">{stampCount} Coleccionados</span>
          </div>

          {stamps.length === 0 ? (
            <div className="bg-[#141210] border border-[#2E2A27] rounded-3xl p-8 text-center space-y-3">
              <FiLock className="text-3xl text-white/20 mx-auto" />
              <p className="text-xs font-bold text-white/60">Aún no tienes sellos en tu pasaporte.</p>
              <p className="text-[11px] text-white/40">
                Escanea el código QR al consumir en cualquier comercio aliado a Mogu para registrar tu primer sello.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {stamps.map((stamp) => (
                <div
                  key={stamp.id}
                  className="bg-[#141210] border border-[#2E2A27] hover:border-[#FF7A45]/50 rounded-2xl p-4 flex flex-col items-center text-center space-y-2 shadow-lg transition"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FF7A45]/10 border border-[#FF7A45]/40 flex items-center justify-center text-xl text-[#FF7A45] relative">
                    <FiMapPin />
                    <span className="absolute -top-1 -right-1 text-emerald-400 text-xs">
                      <FiCheckCircle />
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-white uppercase">{stamp.city}</p>
                    <p className="text-[10px] text-[#FF7A45] font-semibold">{stamp.store_slug}</p>
                    <p className="text-[9px] text-white/30 font-mono mt-1">{stamp.country}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}