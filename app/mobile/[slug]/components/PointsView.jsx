'use client';

import { useState } from 'react';
import {
  Phone,
  Store,
  Globe,
  Sparkles,
  MapPin,
  Copy,
  Check,
  ExternalLink,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function ProfileView({ store }) {
  const [copied, setCopied] = useState(false);

  const config = Array.isArray(store?.store_config) ? store.store_config[0] : store?.store_config;
  const primaryColor = config?.primary_color || '#10B981';
  const buttonColor = config?.button_color || primaryColor;
  const borderRadius = config?.border_radius || 'rounded-2xl';
  const shadowStyle = config?.shadow_style || 'shadow-sm';

  const handleCopyPhone = () => {
    if (!store?.phone) return;
    navigator.clipboard.writeText(store.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Limpia el número para enlace directo de WhatsApp (ej: +56 9 1234 5678 -> 56912345678)
  const cleanPhone = store?.phone ? store.phone.replace(/\D/g, '') : '';
  const mapsUrl = store?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`
    : null;

  return (
    <div className="pb-8 space-y-4">
      {/* Encabezado editorial de sección */}
      <div className="flex items-end justify-between">
        <div>
          <span
            className="text-[10px] font-extrabold uppercase tracking-[0.2em]"
            style={{ color: primaryColor }}
          >
            Ficha del comercio
          </span>
          <h2 className="text-xl font-black tracking-tight text-zinc-900">
            Información & Contacto
          </h2>
        </div>

        {/* Estado verificable */}
        <span
          className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border"
          style={{
            backgroundColor: `${primaryColor}12`,
            borderColor: `${primaryColor}30`,
            color: primaryColor,
          }}
        >
          <ShieldCheck size={12} />
          Verificado
        </span>
      </div>

      {/* Tarjeta Principal: Credencial Operativa del Local */}
      <div
        className={`relative overflow-hidden bg-white/95 backdrop-blur-md border border-zinc-200/80 p-5 ${borderRadius} ${shadowStyle}`}
      >
        {/* Resplandor ambiental superior dinámico */}
        <div
          className="pointer-events-none absolute -top-20 -right-12 w-48 h-48 rounded-full opacity-15 blur-3xl transition-colors duration-500"
          style={{ backgroundColor: primaryColor }}
        />

        {/* Cabecera compacta tipo Pass / Credencial */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div
            className="w-14 h-14 rounded-2xl p-[2px] flex-shrink-0 shadow-md"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, rgba(255,255,255,0.2))`,
            }}
          >
            <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#0C0A09] flex items-center justify-center">
              {store?.avatar_url ? (
                <img
                  src={store.avatar_url}
                  alt={store?.full_name || 'Logo'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl">🏪</span>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 text-left">
            <h3 className="text-base font-black tracking-tight text-zinc-900 truncate">
              {store?.full_name || 'Mogu Store'}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                <Store size={11} style={{ color: primaryColor }} />
                <span>Retiro en Local</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                <Clock size={11} style={{ color: primaryColor }} />
                <span>Pedido Directo</span>
              </span>
            </div>
          </div>
        </div>

        {/* Divisor elegante */}
        <div className="my-4 h-[1px] w-full bg-zinc-100" />

        {/* Detalles de Ubicación y Contacto */}
        <div className="relative z-10 space-y-2.5">
          {/* Bloque de Dirección interactiva con Google Maps */}
          {store?.address ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50/90 hover:bg-zinc-100/80 border border-zinc-200/60 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  <MapPin size={17} />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Dirección del local
                  </p>
                  <p className="text-xs font-extrabold text-zinc-800 truncate">
                    {store.address}
                  </p>
                </div>
              </div>
              <ExternalLink size={14} className="text-zinc-400 group-hover:text-zinc-700 flex-shrink-0" />
            </a>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50/70 border border-zinc-100">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 opacity-60"
                style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
              >
                <MapPin size={17} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Modalidad de atención
                </p>
                <p className="text-xs font-bold text-zinc-700">
                  Pedido digital en mesa y retiro en mostrador
                </p>
              </div>
            </div>
          )}

          {/* Bloque de Teléfono con acciones rápidas */}
          {store?.phone ? (
            <div className="pt-1 space-y-2">
              <div className="flex items-center gap-2">
                {/* Botón principal de llamada */}
                <a
                  href={`tel:${store.phone}`}
                  className="flex-1 py-3 px-4 rounded-xl text-white text-xs font-extrabold tracking-tight flex items-center justify-center gap-2 shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-95"
                  style={{
                    backgroundColor: buttonColor,
                    boxShadow: `0 8px 20px -6px ${buttonColor}85`,
                  }}
                >
                  <Phone size={15} strokeWidth={2.5} />
                  <span>Llamar: {store.phone}</span>
                </a>

                {/* Botón secundario para copiar número */}
                <button
                  onClick={handleCopyPhone}
                  type="button"
                  className="py-3 px-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 border border-zinc-200/70 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                  title="Copiar número"
                >
                  {copied ? (
                    <Check size={16} style={{ color: primaryColor }} strokeWidth={2.5} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              {/* Botón de WhatsApp directo si tiene número válido */}
              {cleanPhone.length >= 8 && (
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold tracking-tight flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span>Escribir por WhatsApp</span>
                  <ExternalLink size={13} className="opacity-70" />
                </a>
              )}
            </div>
          ) : (
            <div className="w-full py-2.5 px-4 rounded-xl bg-zinc-100/80 text-zinc-400 text-xs font-bold flex items-center justify-center gap-2">
              <Phone size={14} />
              <span>Teléfono de contacto no disponible</span>
            </div>
          )}
        </div>
      </div>

      {/* Tarjeta de Programa de Viajeros Mogu Travel */}
      <div
        className={`relative overflow-hidden border p-4 flex items-center gap-3.5 ${borderRadius}`}
        style={{
          background: `linear-gradient(135deg, ${primaryColor}14 0%, ${primaryColor}05 100%)`,
          borderColor: `${primaryColor}30`,
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm"
          style={{ backgroundColor: primaryColor }}
        >
          <Sparkles size={18} />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p
            className="text-[10px] font-extrabold uppercase tracking-[0.16em]"
            style={{ color: primaryColor }}
          >
            Beneficio Mogu Travel
          </p>
          <p className="text-xs font-bold text-zinc-800 leading-snug mt-0.5">
            Acumula puntos con tus pedidos aquí y canjéalos en locales y hostels asociados.
          </p>
        </div>
      </div>

      {/* Sello de respaldo */}
      <div className="flex items-center justify-center gap-1.5 pt-1 opacity-65">
        <Globe size={12} style={{ color: primaryColor }} />
        <span className="text-[11px] font-semibold text-zinc-500">
          Operado con tecnología <strong className="text-zinc-800">Mogu</strong>
        </span>
      </div>
    </div>
  );
}