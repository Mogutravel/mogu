'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  FiGift,
  FiShield,
  FiCheck,
  FiKey,
  FiStar,
  FiZap,
  FiAward,
  FiX,
} from 'react-icons/fi'

// ============================================================================
// 1. MOTOR DE PARTÍCULAS Y CONFETI TRIDIMENSIONAL (CANVAS EN TIEMPO REAL)
// ============================================================================

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  decay: number
  rotation: number
  vRot: number
  shape: 'square' | 'circle' | 'star' | 'ribbon'
}

class CelebrationCanvasManager {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private particles: Particle[] = []
  private animationFrameId: number | null = null
  private width: number = 0
  private height: number = 0

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const context = canvas.getContext('2d')
    if (!context) throw new Error('No se pudo obtener el contexto 2D')
    this.ctx = context
    this.resize()
  }

  public resize() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.canvas.width = this.width
    this.canvas.height = this.height
  }

  public burst(originX?: number, originY?: number, count = 180) {
    const x = originX ?? this.width / 2
    const y = originY ?? this.height / 2

    const colors = [
      '#10B981', // Emerald
      '#F59E0B', // Amber
      '#3B82F6', // Blue
      '#EC4899', // Pink
      '#8B5CF6', // Purple
      '#101010', // Dark Apple Accent
      '#FFFFFF', // Pure White Glass
    ]

    const shapes: ('square' | 'circle' | 'star' | 'ribbon')[] = [
      'square',
      'circle',
      'star',
      'ribbon',
    ]

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const velocity = 8 + Math.random() * 18

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - (3 + Math.random() * 6),
        size: 6 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.008 + Math.random() * 0.012,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      })
    }

    if (!this.animationFrameId) {
      this.loop()
    }
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    r: number,
    n: number,
    inset: number
  ) {
    ctx.beginPath()
    ctx.save()
    ctx.rotate(Math.PI / n)
    for (let i = 0; i < 2 * n; i++) {
      const radius = i % 2 === 0 ? r : r * inset
      const angle = (i * Math.PI) / n
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  private loop = () => {
    this.ctx.clearRect(0, 0, this.width, this.height)

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]

      p.vx *= 0.98
      p.vy += 0.35
      p.x += p.vx
      p.y += p.vy
      p.rotation += p.vRot
      p.alpha -= p.decay

      if (p.alpha <= 0 || p.y > this.height + 50) {
        this.particles.splice(i, 1)
        continue
      }

      this.ctx.save()
      this.ctx.globalAlpha = Math.max(0, p.alpha)
      this.ctx.translate(p.x, p.y)
      this.ctx.rotate((p.rotation * Math.PI) / 180)
      this.ctx.fillStyle = p.color

      if (p.shape === 'square') {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
      } else if (p.shape === 'circle') {
        this.ctx.beginPath()
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        this.ctx.fill()
      } else if (p.shape === 'star') {
        this.drawStar(this.ctx, p.size, 5, 0.5)
      } else if (p.shape === 'ribbon') {
        this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size * 1.5, p.size / 2)
      }

      this.ctx.restore()
    }

    if (this.particles.length > 0) {
      this.animationFrameId = requestAnimationFrame(this.loop)
    } else {
      this.animationFrameId = null
      this.ctx.clearRect(0, 0, this.width, this.height)
    }
  }

  public destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
  }
}

function playCelebrationAudioSound() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5]

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.08)

      gain.gain.setValueAtTime(0, now + idx * 0.08)
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + idx * 0.08)
      osc.stop(now + idx * 0.08 + 0.45)
    })
  } catch (err) {
    console.log('Audio contextual no iniciado:', err)
  }
}

// ============================================================================
// 2. INTERFAZ Y COMPONENTE PRINCIPAL (CORREGIDO CON REWARDCODE)
// ============================================================================

interface LoyaltyCardProps {
  businessName: string
  programName: string
  categoryTitle: string
  themeType?: string
  currentStamps: number
  totalStamps: number
  rewardTitle: string
  rewardDescription: string
  membershipId: string
  rewardCode?: string // 👈 SOPORTE PARA CÓDIGO VIP PERSISTENTE
  onValidatePin: (pin: string) => Promise<boolean>
}

export function LoyaltyCard({
  businessName,
  programName,
  categoryTitle,
  currentStamps,
  totalStamps,
  rewardTitle,
  rewardDescription,
  membershipId,
  rewardCode,
  onValidatePin,
}: LoyaltyCardProps) {
  const [showPinModal, setShowPinModal] = useState(false)
  const [pin, setPin] = useState('')
  const [validating, setValidating] = useState(false)
  const [pinError, setPinError] = useState(false)

  const [animatingStampIndex, setAnimatingStampIndex] = useState<number | null>(null)
  const [showRewardCelebrationModal, setShowRewardCelebrationModal] = useState(false)
  const [pulseWave, setPulseWave] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasManagerRef = useRef<CelebrationCanvasManager | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 })

  useEffect(() => {
    if (canvasRef.current) {
      canvasManagerRef.current = new CelebrationCanvasManager(canvasRef.current)

      const handleResize = () => canvasManagerRef.current?.resize()
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        canvasManagerRef.current?.destroy()
      }
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    const x = clientX - rect.left
    const y = clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rX = ((y - centerY) / centerY) * -14
    const rY = ((x - centerX) / centerX) * 14

    setRotateX(rX)
    setRotateY(rY)

    const glareX = (x / rect.width) * 100
    const glareY = (y / rect.height) * 100
    setGlarePosition({ x: glareX, y: glareY, opacity: 0.4 })
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }))
  }

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin.trim()) return

    setValidating(true)
    setPinError(false)

    const isValid = await onValidatePin(pin)
    setValidating(false)

    if (isValid) {
      setShowPinModal(false)
      setPin('')

      const nextStampIndex = currentStamps + 1
      setAnimatingStampIndex(nextStampIndex)
      setPulseWave(true)

      playCelebrationAudioSound()

      if (canvasManagerRef.current) {
        canvasManagerRef.current.burst(window.innerWidth / 2, window.innerHeight / 2, 220)
      }

      if (nextStampIndex >= totalStamps) {
        setTimeout(() => {
          setShowRewardCelebrationModal(true)
          if (canvasManagerRef.current) {
            canvasManagerRef.current.burst(window.innerWidth / 2, window.innerHeight * 0.4, 300)
          }
        }, 1200)
      }

      setTimeout(() => {
        setAnimatingStampIndex(null)
        setPulseWave(false)
      }, 2500)
    } else {
      setPinError(true)
    }
  }

  const isRewardReady = currentStamps >= totalStamps

  return (
    <div className="w-full max-w-sm mx-auto space-y-4 font-sans selection:bg-[#E8E8ED] perspective-1000">
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-50 w-full h-full"
      />

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchEnd={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
          transition: rotateX === 0 ? 'transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
        }}
        className={`relative overflow-hidden rounded-[38px] bg-gradient-to-b from-white via-[#FAF9F6] to-[#ECEAE4] border border-white/90 p-6 sm:p-7 space-y-6 cursor-pointer touch-none select-none transition-shadow duration-500 ${
          pulseWave
            ? 'shadow-[0_0_80px_rgba(16,185,129,0.45)] ring-4 ring-emerald-400/50'
            : 'shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)]'
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-[38px] transition-opacity duration-300 z-30"
          style={{
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 65%)`,
            opacity: glarePosition.opacity,
          }}
        />

        <div
          className="flex items-start justify-between relative z-10"
          style={{ transform: 'translateZ(20px)' }}
        >
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#86868B] block mb-0.5">
              {categoryTitle}
            </span>
            <h2 className="text-xl font-black text-[#1D1D1F] tracking-tight flex items-center gap-1.5">
              {businessName}
            </h2>
          </div>

          <div className="px-3 py-1 bg-[#1D1D1F] text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-md flex items-center gap-1">
            <FiZap className="text-amber-400 text-xs" />
            <span>{programName}</span>
          </div>
        </div>

        <div
          className="grid grid-cols-5 gap-2.5 py-1 relative z-10"
          style={{ transform: 'translateZ(30px)' }}
        >
          {Array.from({ length: totalStamps }).map((_, index) => {
            const stampNum = index + 1
            const isStamped = stampNum <= currentStamps
            const isJustAnimated = stampNum === animatingStampIndex

            return (
              <div
                key={stampNum}
                className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-500 relative ${
                  isJustAnimated
                    ? 'scale-125 bg-gradient-to-tr from-emerald-500 to-teal-300 text-white shadow-[0_0_30px_rgba(16,185,129,0.8)] border-2 border-white z-20 animate-pulse'
                    : isStamped
                    ? 'bg-gradient-to-b from-[#2C2C2E] to-[#1D1D1F] text-white shadow-[0_8px_20px_rgba(0,0,0,0.25)] scale-[1.05] border border-neutral-700'
                    : 'bg-[#EFECE6] text-[#86868B] border border-white/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]'
                }`}
              >
                {isStamped || isJustAnimated ? (
                  <div className="flex items-center justify-center">
                    <FiCheck
                      className={`text-base stroke-[3] ${
                        isJustAnimated
                          ? 'text-white scale-125 animate-bounce'
                          : 'text-emerald-400'
                      }`}
                    />
                  </div>
                ) : (
                  <span className="text-xs font-extrabold font-mono opacity-60">
                    {stampNum}
                  </span>
                )}

                {isJustAnimated && (
                  <span className="absolute inset-0 rounded-2xl bg-emerald-400/40 animate-ping pointer-events-none" />
                )}
              </div>
            )
          })}
        </div>

        <div
          className={`p-4 rounded-2xl backdrop-blur-xl border transition-all duration-300 relative z-10 ${
            isRewardReady
              ? 'bg-amber-500/10 border-amber-300 shadow-[0_10px_25px_rgba(245,158,11,0.2)]'
              : 'bg-white/70 border-[#E5E5EA] shadow-2xs'
          }`}
          style={{ transform: 'translateZ(25px)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform ${
                  isRewardReady
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-amber-500/10 text-amber-600'
                }`}
              >
                {isRewardReady ? (
                  <FiStar className="text-base fill-current" />
                ) : (
                  <FiGift className="text-sm" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-[#1D1D1F] block">
                  {rewardTitle}
                </span>
                <span className="text-[10px] text-[#86868B] font-medium">
                  {rewardDescription}
                </span>
              </div>
            </div>

            <span className="text-xs font-black font-mono text-[#1D1D1F] bg-white/80 px-2.5 py-1 rounded-lg border border-[#E5E5EA]">
              {currentStamps}/{totalStamps}
            </span>
          </div>

          <div className="w-full h-2.5 bg-[#E5E5EA] rounded-full overflow-hidden p-0.5 border border-white/50">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              style={{
                width: `${Math.min(100, (currentStamps / totalStamps) * 100)}%`,
              }}
            />
          </div>
        </div>

        <div
          className="pt-2 border-t border-[#E5E5EA]/80 flex items-center justify-between gap-3 relative z-10"
          style={{ transform: 'translateZ(15px)' }}
        >
          <div className="truncate">
            <span className="text-[10px] font-semibold text-[#86868B] block">
              Socio Activo
            </span>
            <span className="text-xs font-bold font-mono text-[#1D1D1F] truncate block">
              {membershipId}
            </span>
          </div>

          {isRewardReady ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowRewardCelebrationModal(true)
              }}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-extrabold rounded-2xl shadow-[0_10px_20px_rgba(245,158,11,0.3)] transition-all flex items-center gap-2 shrink-0 cursor-pointer border border-amber-400 animate-bounce"
            >
              <FiGift className="text-xs" />
              <span>VER CÓDIGO VIP</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowPinModal(true)
              }}
              className="px-5 py-3 bg-[#1D1D1F] hover:bg-black active:scale-95 text-white text-xs font-extrabold rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.18)] transition-all flex items-center gap-2 shrink-0 cursor-pointer border border-neutral-800"
            >
              <FiShield className="text-xs text-emerald-400" />
              <span>REGISTRAR SELLO</span>
            </button>
          )}
        </div>
      </div>

      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white/95 backdrop-blur-2xl rounded-[36px] p-6 shadow-2xl border border-white/80 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F2F2F7] border border-[#E5E5EA] flex items-center justify-center text-[#1D1D1F] mx-auto text-lg shadow-2xs">
              <FiKey />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#1D1D1F]">
                Validación de Caja
              </h3>
              <p className="text-xs text-[#86868B] mt-1">
                Ingresa el PIN de autorización para sumar tu sello.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input
                type="password"
                maxLength={6}
                autoFocus
                placeholder="• • • •"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-[#F2F2F7] border border-[#E5E5EA] rounded-2xl px-4 py-3.5 text-center text-lg font-mono font-black tracking-widest text-[#1D1D1F] outline-none focus:ring-2 focus:ring-[#1D1D1F]"
              />

              {pinError && (
                <p className="text-[11px] text-red-500 font-bold">
                  Clave incorrecta. Inténtalo de nuevo.
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false)
                    setPin('')
                    setPinError(false)
                  }}
                  className="w-1/2 py-3 bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1D1D1F] font-bold text-xs rounded-xl transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={validating}
                  className="w-1/2 py-3 bg-[#1D1D1F] hover:bg-black text-white font-bold text-xs rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {validating ? 'Validando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRewardCelebrationModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-gradient-to-b from-white via-[#FBFBFD] to-[#F2F2F7] rounded-[40px] p-8 text-center space-y-5 border border-white/80 shadow-[0_25px_70px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <button
              onClick={() => setShowRewardCelebrationModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#1D1D1F] cursor-pointer"
            >
              <FiX />
            </button>

            <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-amber-200 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl shadow-[0_10px_30px_rgba(245,158,11,0.4)]">
              <FiAward />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-700 font-extrabold text-[10px] uppercase tracking-widest rounded-full border border-amber-300">
                ¡Recompensa Desbloqueada!
              </span>
              <h3 className="text-xl font-black text-[#1D1D1F] tracking-tight pt-1">
                {rewardTitle}
              </h3>
              <p className="text-xs text-[#86868B] leading-relaxed">
                ¡Felicitaciones! Has acumulado todos tus sellos. Muéstrale esta
                pantalla al personal para canjear tu premio.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E5E5EA] shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-[#86868B] block uppercase tracking-wider">
                Código VIP
              </span>
              <span className="text-lg font-mono font-black text-[#1D1D1F] tracking-widest">
                {rewardCode || 'REWARD-VIP'}
              </span>
            </div>

            <button
              onClick={() => setShowRewardCelebrationModal(false)}
              className="w-full py-4 bg-[#1D1D1F] hover:bg-black text-white font-extrabold text-xs rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiStar className="text-amber-400 fill-current" />
              <span>Entendido, ¡gracias!</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}