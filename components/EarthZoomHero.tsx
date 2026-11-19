"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Satellite } from "lucide-react";

interface EarthZoomHeroProps {
  onCompleteToNext?: () => void;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function easeInOutCubic(t: number) {
  const c = clamp01(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

function mapSmooth(progress: number, input: number[], output: number[]) {
  if (progress <= input[0]) return output[0];
  if (progress >= input[input.length - 1]) return output[output.length - 1];

  for (let i = 0; i < input.length - 1; i++) {
    const start = input[i];
    const end = input[i + 1];
    if (progress >= start && progress <= end) {
      const rawT = (progress - start) / (end - start);
      const t = easeInOutCubic(rawT);
      return output[i] + t * (output[i + 1] - output[i]);
    }
  }
  return output[0];
}

export default function EarthZoomHero({ onCompleteToNext }: EarthZoomHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [satImgError, setSatImgError] = useState(false);
  const [descImgError, setDescImgError] = useState(false);
  const [localImgError, setLocalImgError] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;

    const updateProgress = () => {
      rafId = null;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable > 0) {
        setProgress(clamp01(-rect.top / scrollable));
      }
    };

    const onScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateProgress);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Etapa 1: Satélite / Tierra (0.00 -> 0.40)
  const satScale = mapSmooth(progress, [0, 0.4], [1, 1.55]);
  const satOpacity = mapSmooth(progress, [0.24, 0.42], [1, 0]);
  const satBlur = mapSmooth(progress, [0.24, 0.42], [0, 2.5]);

  // Etapa 2: Descenso sobre la ciudad (0.28 -> 0.72)
  const descScale = mapSmooth(progress, [0.28, 0.72], [1.04, 1.5]);
  const descOpacity = mapSmooth(progress, [0.26, 0.42, 0.56, 0.74], [0, 1, 1, 0]);
  const descBlur = mapSmooth(progress, [0.56, 0.74], [0, 2.5]);

  // Etapa 3: Fachada del local a pantalla completa (0.58 -> 1.00)
  const venueOpacity = mapSmooth(progress, [0.58, 0.76], [0, 1]);
  const venueScale = mapSmooth(progress, [0.6, 1], [1.02, 1.32]);
  const venueBlur = mapSmooth(progress, [0.88, 1], [0, 1.5]);

  const altitudeKm = Math.round(
    mapSmooth(progress, [0, 0.42, 0.72, 1], [420, 36, 1.8, 0.01])
  );

  const phaseLabel =
    progress < 0.36
      ? "Vista Satelital • Tierra"
      : progress < 0.68
      ? "Descenso Urbano • Ruta al Local"
      : "Fachada del Local • Operación en Vivo";

  return (
    <section
      id="earthzoom"
      ref={containerRef}
      aria-label="Recorrido satelital EarthZoom hacia el local"
      className="relative h-[340vh] w-full bg-[#070811]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* =================================================================
            CAPA 01: VISTA SATELITAL (IMAGEN 1)
           ================================================================= */}
        <div
          style={{
            opacity: satOpacity,
            pointerEvents: satOpacity < 0.15 ? "none" : "auto",
            willChange: "transform, opacity, filter",
          }}
          className="absolute inset-0 z-10 w-full h-full"
        >
          {!satImgError ? (
            <Image
              src="/images/satelite-tierra.jpg"
              alt="Vista satelital de la Tierra con estelas orbitales y galaxias"
              fill
              priority
              unoptimized
              sizes="100vw"
              onError={() => setSatImgError(true)}
              style={{
                transform: `scale(${satScale})`,
                transformOrigin: "50% 50%",
                filter: `blur(${satBlur}px)`,
                willChange: "transform, filter",
              }}
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center px-6 text-center bg-[#090d1f]">
              <p className="text-xs font-bold text-cyan-300">
                Falta guardar public/images/satelite-tierra.jpg
              </p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#070811]/75 via-black/15 to-[#070811]/85 pointer-events-none" />
        </div>

        {/* =================================================================
            CAPA 02: DESCENSO SOBRE LA CIUDAD (IMAGEN 2)
           ================================================================= */}
        <div
          style={{
            opacity: descOpacity,
            pointerEvents: descOpacity < 0.15 ? "none" : "auto",
            willChange: "transform, opacity, filter",
          }}
          className="absolute inset-0 z-20 w-full h-full"
        >
          {!descImgError ? (
            <Image
              src="/images/descenso-ciudad.jpg"
              alt="Descenso aéreo sobre ciudad iluminada bajo nubes y cielo cósmico"
              fill
              unoptimized
              sizes="100vw"
              onError={() => setDescImgError(true)}
              style={{
                transform: `scale(${descScale})`,
                transformOrigin: "50% 55%",
                filter: `blur(${descBlur}px)`,
                willChange: "transform, filter",
              }}
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center px-6 text-center bg-[#0b0e1a]">
              <p className="text-xs font-bold text-cyan-300">
                Falta guardar public/images/descenso-ciudad.jpg
              </p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E0C0A]/75 via-black/20 to-[#0E0C0A]/85 pointer-events-none" />
        </div>

        {/* =================================================================
            CAPA 03: LLEGADA AL LOCAL A PANTALLA COMPLETA (IMAGEN 3)
           ================================================================= */}
        <div
          style={{
            opacity: venueOpacity,
            pointerEvents: venueOpacity < 0.2 ? "none" : "auto",
            willChange: "opacity",
          }}
          className="absolute inset-0 z-30 w-full h-full"
        >
          {!localImgError ? (
            <Image
              src="/images/cosmos-local.jpg"
              alt="Fachada nocturna del restaurante bajo cielo cósmico"
              fill
              unoptimized
              sizes="100vw"
              onError={() => setLocalImgError(true)}
              style={{
                transform: `scale(${venueScale})`,
                transformOrigin: "50% 48%",
                filter: `blur(${venueBlur}px)`,
                willChange: "transform, filter",
              }}
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center px-6 text-center space-y-1.5 bg-[#120f1d]">
              <p className="text-xs font-bold text-cyan-300">
                Falta guardar public/images/cosmos-local.jpg
              </p>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-[#0E0C0A]/85 via-black/25 to-[#0E0C0A]/90 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,transparent_28%,rgba(14,12,10,0.86)_90%)] pointer-events-none" />
        </div>

        {/* =================================================================
            ENCABEZADO SUPERIOR LIMPIO
           ================================================================= */}
        <div className="relative z-40 h-full w-full max-w-6xl mx-auto pt-24 pb-10 px-4 sm:px-8 flex flex-col justify-between">
          <div className="text-center space-y-3 max-w-4xl mx-auto">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E0C0A]/80 border border-white/15 backdrop-blur-md text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-300 shadow-lg">
              <Satellite className="w-3.5 h-3.5 text-cyan-300" />
              <span>{phaseLabel}</span>
              <span className="text-white/40">•</span>
              <span className="text-white/90">Altitud ~{altitudeKm} km</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[3.55rem] font-extrabold tracking-tight text-white leading-[1.08] [text-shadow:0_4px_24px_rgba(14,12,10,0.95)]">
              Del satélite a tu local,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-purple-200">
                conectado de punta a punta.
              </span>
            </h1>

            <p className="text-xs sm:text-base text-white/90 max-w-xl mx-auto leading-relaxed [text-shadow:0_2px_16px_rgba(14,12,10,0.95)]">
              Desliza para acercarte desde la órbita hasta el restaurante y
              pasar directo a la mesa, la app de pedidos, cocina, caja y planes.
            </p>
          </div>

          {onCompleteToNext && (
            <div className="text-center">
              <button
                type="button"
                onClick={onCompleteToNext}
                className="text-xs font-bold text-cyan-200/90 hover:text-cyan-300 transition cursor-pointer [text-shadow:0_2px_12px_rgba(14,12,10,0.95)]"
              >
                Desliza o haz clic para ir a la mesa ↓
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}