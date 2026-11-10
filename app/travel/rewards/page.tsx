'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  FiGift, 
  FiAward, 
  FiCheck, 
  FiLock, 
  FiArrowLeft, 
  FiTag, 
  FiHome, 
  FiCoffee,
  FiZap,
  FiCheckCircle
} from 'react-icons/fi'

interface RewardItem {
  id: string
  store_slug: string | null
  title: string
  description: string
  points_cost: number
  reward_type: 'descuento' | 'cortesia' | 'hostel_perk'
  is_active: boolean
  store_name?: string
}

export default function RewardsTravelPage() {
  const router = useRouter()

  const [pointsBalance, setPointsBalance] = useState<number>(350)
  const [userId, setUserId] = useState<string | null>(null)
  const [travelerProfileId, setTravelerProfileId] = useState<string | null>(null)
  const [rewards, setRewards] = useState<RewardItem[]>([])
  const [selectedType, setSelectedType] = useState<string>('todos')
  const [loading, setLoading] = useState(true)
  const [redeemingId, setRedeemingId] = useState<string | null>(null)

  useEffect(() => {
    async function loadRewardsData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          setUserId(user.id)
          const { data: profile } = await supabase
            .from('traveler_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()

          if (profile) {
            setTravelerProfileId(profile.id)
            setPointsBalance(profile.points_balance || 0)
          }
        }

        // Cargar recompensas reales o mock de demostración
        const { data: rewardsData, error } = await supabase
          .from('travel_rewards')
          .select('*')
          .eq('is_active', true)
          .order('points_cost', { ascending: true })

        if (!error && rewardsData && rewardsData.length > 0) {
          setRewards(rewardsData)
        } else {
          // Datos mock por defecto para demostración
          setRewards([
            {
              id: 'rew-1',
              store_slug: 'cafe-central',
              title: 'Espresso o Capuchino Gratis',
              description: 'Válido en Café Central Artisanal (Santiago)',
              points_cost: 100,
              reward_type: 'cortesia',
              is_active: true,
              store_name: 'Café Central'
            },
            {
              id: 'rew-2',
              store_slug: 'la-barra',
              title: '20% OFF en consumo total',
              description: 'Aplica para cuentas superiores a $15.000 en La Barra Restobar',
              points_cost: 250,
              reward_type: 'descuento',
              is_active: true,
              store_name: 'La Barra Restobar'
            },
            {
              id: 'rew-3',
              store_slug: 'hostel-bistro',
              title: 'Noche adicional con 30% OFF',
              description: 'Válido en Mendoza Backpacker Hostel para habitaciones compartidas',
              points_cost: 300,
              reward_type: 'hostel_perk',
              is_active: true,
              store_name: 'Mendoza Backpacker Hostel'
            },
            {
              id: 'rew-4',
              store_slug: null,
              title: 'Sello Dorado Global + 150 Puntos Extra',
              description: 'Recompensa oficial Mogu Travel para viajeros de Nivel 2+',
              points_cost: 500,
              reward_type: 'cortesia',
              is_active: true,
              store_name: 'Mogu Travel Global'
            }
          ])
        }
      } catch (err) {
        console.error('Error al cargar recompensas:', err)
      } finally {
        setLoading(false)
      }
    }

    loadRewardsData()
  }, [])

  const handleRedeemReward = async (reward: RewardItem) => {
    if (pointsBalance < reward.points_cost) {
      alert('Puntos insuficientes para realizar este canje.')
      return
    }

    setRedeemingId(reward.id)

    try {
      const newBalance = pointsBalance - reward.points_cost

      if (travelerProfileId) {
        const { error } = await supabase
          .from('traveler_profiles')
          .update({ points_balance: newBalance })
          .eq('id', travelerProfileId)

        if (error) throw error
      }

      setPointsBalance(newBalance)
      alert(`🎉 ¡Canje exitoso! Has obtenido: "${reward.title}". Presenta este cupón en el local.`)
    } catch (err) {
      console.error('Error al canjear beneficio:', err)
      alert('Ocurrió un error al procesar el canje.')
    } finally {
      setRedeemingId(null)
    }
  }

  const filteredRewards = rewards.filter(r => selectedType === 'todos' || r.reward_type === selectedType)

  return (
    <div className="min-h-screen bg-[#0E0C0A] text-[#F2F2EE] font-sans p-4 md:p-8 pb-32">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/travel/passport')}
            className="flex items-center gap-2 text-xs font-medium text-white/60 hover:text-white transition cursor-pointer"
          >
            <FiArrowLeft /> Pasaporte
          </button>
          <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <FiAward /> Catálogo Mogu Rewards
          </span>
        </div>

        {/* SALDO DE PUNTOS HEADER */}
        <div className="bg-gradient-to-br from-[#1B1917] via-[#141210] to-[#0E0C0A] border border-[#2E2A27] rounded-3xl p-6 shadow-2xl flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Tu Saldo Disponible</p>
            <p className="text-3xl font-black text-amber-400 font-mono tracking-tight">{pointsBalance} <span className="text-xs font-sans text-white/60">pts</span></p>
            <p className="text-[11px] text-white/50">Acumula puntos consumiendo en locales aliados</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl text-amber-400 shrink-0">
            <FiGift />
          </div>
        </div>

        {/* Filtros de Tipo de Beneficio */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: 'todos', label: 'Todas' },
            { id: 'cortesia', label: 'Cortesías ☕' },
            { id: 'descuento', label: 'Descuentos 🏷️' },
            { id: 'hostel_perk', label: 'Hostels 🏨' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedType === tab.id
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-[#141210] border border-[#2E2A27] text-white/70 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* LISTA DE RECOMPENSAS */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-xs text-center text-white/40 py-12">Cargando catálogo de recompensas...</p>
          ) : filteredRewards.length === 0 ? (
            <div className="bg-[#141210] border border-[#2E2A27] rounded-3xl p-12 text-center space-y-2">
              <p className="text-sm font-bold text-white/60">No hay recompensas en esta categoría</p>
              <p className="text-xs text-white/40">Vuelve más tarde para ver nuevos beneficios agregados.</p>
            </div>
          ) : (
            filteredRewards.map((reward) => {
              const canAfford = pointsBalance >= reward.points_cost
              const isRedeeming = redeemingId === reward.id

              return (
                <div
                  key={reward.id}
                  className={`bg-[#141210] border rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition shadow-xl ${
                    canAfford ? 'border-[#2E2A27] hover:border-amber-500/40' : 'border-[#2E2A27] opacity-75'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {reward.reward_type}
                      </span>
                      {reward.store_name && (
                        <span className="text-xs font-semibold text-white/40">
                          • {reward.store_name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-white">{reward.title}</h3>
                    <p className="text-xs text-white/60">{reward.description}</p>
                  </div>

                  <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <span className="text-sm font-black text-amber-400 font-mono">
                      {reward.points_cost} pts
                    </span>

                    <button
                      disabled={!canAfford || isRedeeming}
                      onClick={() => handleRedeemReward(reward)}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                          : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                      }`}
                    >
                      {isRedeeming ? (
                        'Canjeando...'
                      ) : canAfford ? (
                        <>
                          <FiZap /> Canjear
                        </>
                      ) : (
                        <>
                          <FiLock /> Faltan {reward.points_cost - pointsBalance} pts
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}