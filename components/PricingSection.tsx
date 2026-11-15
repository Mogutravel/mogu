'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ArrowRight, Calendar, Sparkles } from 'lucide-react'

interface Plan {
  id: string
  name: string
  slug: string
  price: number
  original_price: number | null
  badge: string | null
  interval: string
  subtitle?: string
  features: string[]
}

interface PricingSectionProps {
  startPlan: Plan
  monthlyPlans: Plan[]
  annualPlans: Plan[]
}

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function PricingSection({
  startPlan,
  monthlyPlans,
  annualPlans,
}: PricingSectionProps) {
  const [billingInterval, setBillingInterval] = useState<'mensual' | 'anual'>('mensual')

  const activePlans = billingInterval === 'mensual' ? monthlyPlans : annualPlans

  const renderPlanCard = (plan: Plan, isPopular: boolean) => {
    if (isPopular) {
      return (
        <div
          key={plan.id}
          className="p-8 rounded-3xl bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-xl border-2 border-cyan-400 shadow-[0_0_50px_-10px_rgba(6,182,212,0.4)] relative flex flex-col justify-between md:-translate-y-3"
        >
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-extrabold uppercase px-4 py-1.5 rounded-full tracking-widest shadow-lg">
              {plan.badge || 'MÁS ELEGIDO'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase px-3.5 py-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 tracking-wider">
              {plan.name}
            </span>
            <h3 className="text-2xl font-bold text-white mt-4">{plan.name}</h3>
            {plan.subtitle && (
              <p className="text-xs text-white/75 mt-1.5 leading-relaxed">{plan.subtitle}</p>
            )}
            <div className="flex items-baseline gap-2 mt-4">
              <p className="text-3xl font-extrabold text-white">{formatPrice(plan.price)}</p>
              {plan.original_price && (
                <span className="text-xs text-white/50 line-through">
                  {formatPrice(plan.original_price)}
                </span>
              )}
            </div>
            <span className="text-xs text-[#D4CEC7] block font-medium mt-1">
              + IVA / pago {plan.interval}
            </span>

            <ul className="space-y-3.5 mt-6 text-xs font-normal text-white">
              {plan.features?.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href={`/checkout/${plan.slug}`}
            className="group w-full mt-8 py-3.5 text-xs font-bold uppercase tracking-wider rounded-2xl bg-white hover:bg-slate-100 text-[#0E0C0A] text-center transition-all shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <span>Elegir {plan.name}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )
    }

    const isEcosystem = plan.slug.includes('ecosystem')

    return (
      <div
        key={plan.id}
        className={`p-8 rounded-3xl backdrop-blur-xl flex flex-col justify-between transition-all shadow-xl ${
          isEcosystem
            ? 'bg-gradient-to-b from-purple-950/35 via-white/[0.06] to-white/[0.04] border border-purple-400/35 hover:border-purple-400/65'
            : 'bg-white/[0.06] border border-white/15 hover:border-white/30'
        }`}
      >
        <div>
          <span
            className={`text-[10px] font-bold uppercase px-3.5 py-1 rounded-full tracking-wider ${
              isEcosystem
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                : 'bg-white/10 text-white'
            }`}
          >
            {plan.badge || plan.name}
          </span>
          <h3 className="text-2xl font-bold text-white mt-4">{plan.name}</h3>
          {plan.subtitle && (
            <p className="text-xs text-white/70 mt-1.5 leading-relaxed">{plan.subtitle}</p>
          )}
          <div className="flex items-baseline gap-2 mt-4">
            <p className="text-3xl font-extrabold text-white">{formatPrice(plan.price)}</p>
            {plan.original_price && (
              <span className="text-xs text-white/50 line-through">
                {formatPrice(plan.original_price)}
              </span>
            )}
          </div>
          <span className="text-xs text-[#D4CEC7] block font-medium mt-1">
            + IVA / pago {plan.interval}
          </span>

          <ul className="space-y-3.5 mt-6 text-xs font-normal text-white">
            {plan.features?.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href={`/checkout/${plan.slug}`}
          className="group w-full mt-8 py-3.5 text-xs font-bold uppercase tracking-wider rounded-2xl bg-white/10 hover:bg-white hover:text-[#0E0C0A] text-white text-center transition-all border border-white/20 shadow-md flex items-center justify-center gap-2"
        >
          <span>Elegir {plan.name}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    )
  }

  return (
    <section id="ecosistema" className="mx-auto max-w-7xl px-6 py-28 relative z-20 border-t border-white/15">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold tracking-widest uppercase bg-white/10 text-cyan-300 px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
          Planes Mogu SpA
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
          Planes de Software y Operaciones
        </h2>
        <p className="text-[#D4CEC7] text-sm md:text-base font-normal mt-3">
          Comienza gratis con Mogu Start o escala a nuestros planes sin comisiones por venta.
        </p>
      </div>

      {/* 1. PLAN GRATUITO ARRIBA DE TODO: MOGU START */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-r from-white/[0.09] via-white/[0.06] to-cyan-950/30 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 text-[10px] font-extrabold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{startPlan.badge || 'GRATIS PARA SIEMPRE'}</span>
              </div>
              <h3 className="text-3xl font-extrabold text-white">{startPlan.name}</h3>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                {startPlan.subtitle}
              </p>
              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-xs text-[#D4CEC7] font-medium">
                  / siempre • No requiere tarjeta
                </span>
              </div>
            </div>

            <div className="lg:col-span-4">
              <ul className="space-y-3 text-xs text-white">
                {startPlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3 flex flex-col justify-center">
              <Link
                href={`/checkout/${startPlan.slug}`}
                className="group w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 text-[#0E0C0A] text-xs font-bold uppercase tracking-wider text-center transition-all shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span>Comenzar Gratis</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BOTÓN / SELECTOR ESTILO APP (UBICADO ABAJO DE MOGU START Y ANTES DE LOS PLANES DE PAGO) */}
      <div className="max-w-6xl mx-auto flex justify-center mb-16">
        <div className="inline-flex items-center p-1.5 rounded-full bg-[#141218]/80 border border-white/15 backdrop-blur-xl shadow-2xl">
          <button
            onClick={() => setBillingInterval('mensual')}
            className={`px-8 py-3 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-300 ${
              billingInterval === 'mensual'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Pago Mensual
          </button>
          <button
            onClick={() => setBillingInterval('anual')}
            className={`px-8 py-3 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              billingInterval === 'anual'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Pago Anual (Ahorra meses)</span>
          </button>
        </div>
      </div>

      {/* 3. GRILLA DINÁMICA DE LOS 3 PLANES DE PAGO (MENSUAL / ANUAL) */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
              {billingInterval === 'mensual' ? 'Facturación Flexible' : 'Inversión Anual Congelada'}
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
              Planes {billingInterval === 'mensual' ? 'Mensuales' : 'Anuales'}
            </h3>
          </div>
          <p className="text-xs text-[#D4CEC7]">
            {billingInterval === 'mensual'
              ? 'Valores netos + IVA. Cancela cuando quieras.'
              : 'Incluye descuento equivalente a meses de regalo + IVA.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-2">
          {activePlans.map((plan) => {
            const isPopular = plan.slug.includes('pro') || plan.badge?.includes('ELEGIDO')
            return renderPlanCard(plan, Boolean(isPopular))
          })}
        </div>
      </div>
    </section>
  )
}