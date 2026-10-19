'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheck, FiLock, FiStar, FiAward, FiShield } from 'react-icons/fi'

interface LoyaltyCardProps {
  businessName: string
  programName: string
  categoryTitle: string
  themeType?: 'retail' | 'gastronomy'
  currentStamps: number
  totalStamps: number
  rewardTitle: string
  rewardDescription: string
  membershipId: string
  onValidatePin: (pin: string) => Promise<boolean>
}

export function LoyaltyCard({
  businessName,
  programName,
  categoryTitle,
  themeType = 'gastronomy',
  currentStamps,
  totalStamps,
  rewardTitle,
  rewardDescription,
  membershipId,
  onValidatePin,
}: LoyaltyCardProps) {
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [validating, setValidating] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Clases y colores según el tema
  const isGastronomy = themeType === 'gastronomy'
  const bgColor = isGastronomy ? 'bg-[#EADECF]' : 'bg-[#EAE8E3]'
  const textColor = isGastronomy ? 'text-[#382A21]' : 'text-[#2B2A28]'
  const accentColor = isGastronomy ? 'text-amber-800' : 'text-neutral-700'

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pinInput.trim()) return

    setValidating(true)
    setErrorMsg('')

    try {
      const success = await onValidatePin(pinInput.trim())
      if (success) {
        setPinInput('')
        setShowPinModal(false)
      } else {
        setErrorMsg('PIN incorrecto o sello ya registrado hoy.')
      }
    } catch (err) {
      setErrorMsg('Error al validar.')
    } finally {
      setValidating(false)
    }
  }

  // Generar array de sellos
  const stampsArray = Array.from({ length: totalStamps }, (_, i) => i < currentStamps)

  return (
    <div className="w-full max-w-sm mx-auto perspective-1000">
      <style jsx global>{`
        .neu-card {
          background: ${isGastronomy ? '#EADECF' : '#EAE8E3'};
          box-shadow: 14px 14px 28px ${isGastronomy ? '#c5bbae' : '#c4baad'}, 
                      -14px -14px 28px #ffffff;
        }
        .neu-pressed {
          background: ${isGastronomy ? '#EADECF' : '#EAE8E3'};
          box-shadow: inset 5px 5px 10px ${isGastronomy ? '#c5bbae' : '#c4baad'}, 
                      inset -5px -5px 10px #ffffff;
        }
        .neu-button {
          background: ${isGastronomy ? '#EADECF' : '#EAE8E3'};
          box-shadow: 6px 6px 12px ${isGastronomy ? '#c5bbae' : '#c4baad'}, 
                      -6px -6px 12px #ffffff;
          transition: all 0.2s ease;
        }
        .neu-button:active {
          box-shadow: inset 3px 3px 6px ${isGastronomy ? '#c5bbae' : '#c4baad'}, 
                      inset -3px -3px 6px #ffffff;
        }
      `}</style>

      {/* TARJETA PRINCIPAL NEUMÓRFICA 3D */}
      <motion.div
        whileHover={{ scale: 1.01, rotateX: 1, rotateY: -1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`neu-card rounded-[32px] p-6 sm:p-7 ${textColor} relative overflow-hidden`}
      >
        {/* ENCABEZADO DE LA TARJETA */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-60">
              {categoryTitle}
            </span>
            <h2 className="text-lg font-black tracking-tight mt-0.5">{businessName}</h2>
          </div>
          <div className="px-3 py-1 rounded-xl neu-pressed text-[10px] font-extrabold uppercase tracking-wider opacity-80">
            {programName}
          </div>
        </div>

        {/* GRILLA DE SELLOS */}
        <div className="grid grid-cols-5 gap-3.5 my-6">
          {stampsArray.map((isStamped, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${
                isStamped ? 'neu-pressed text-emerald-600 shadow-inner' : 'neu-button opacity-70'
              }`}
            >
              {isStamped ? (
                <FiCheck className="text-base font-black stroke-[3]" />
              ) : (
                <span className="text-[11px] font-mono font-bold opacity-40">{index + 1}</span>
              )}
            </motion.div>
          ))}
        </div>

        {/* BARRA DE PROGRESO Y RECOMPENSA */}
        <div className="neu-pressed rounded-2xl p-4 mb-6 space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <FiAward className="text-sm opacity-80" /> {rewardTitle}
            </span>
            <span className="font-mono">{currentStamps} / {totalStamps}</span>
          </div>
          <p className="text-[11px] opacity-70 leading-snug">{rewardDescription}</p>
        </div>

        {/* PIE DE TARJETA Y BOTÓN DE VALIDAR */}
        <div className="flex items-center justify-between pt-2 border-t border-black/5">
          <span className="text-[10px] font-mono font-bold opacity-60 tracking-wider">
            {membershipId}
          </span>

          <button
            onClick={() => setShowPinModal(true)}
            className="neu-button px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 hover:scale-105 active:scale-95"
          >
            <FiShield className="text-xs" /> Registrar Sello
          </button>
        </div>
      </motion.div>

      {/* MODAL PIN DE CAJA */}
      <AnimatePresence>
        {showPinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`neu-card w-full max-w-xs rounded-3xl p-6 ${textColor} space-y-4 shadow-2xl`}
            >
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl neu-pressed mx-auto flex items-center justify-center mb-2">
                  <FiLock className="text-lg opacity-80" />
                </div>
                <h3 className="text-base font-bold">Validación de Personal</h3>
                <p className="text-xs opacity-70">Ingresa el PIN de caja para otorgar el sello de hoy.</p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="neu-pressed rounded-2xl p-1">
                  <input
                    type="password"
                    maxLength={6}
                    autoFocus
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-transparent text-center py-3 text-xl font-mono tracking-widest outline-none font-bold"
                  />
                </div>

                {errorMsg && (
                  <p className="text-[11px] text-rose-600 text-center font-medium">{errorMsg}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPinModal(false)
                      setPinInput('')
                      setErrorMsg('')
                    }}
                    className="flex-1 py-2.5 rounded-2xl neu-button text-xs font-bold uppercase tracking-wider opacity-80"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={validating}
                    className="flex-1 py-2.5 rounded-2xl neu-button text-xs font-extrabold uppercase tracking-wider text-emerald-700 disabled:opacity-50"
                  >
                    {validating ? 'Validando...' : 'Confirmar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}