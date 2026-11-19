"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Pause, Play, Radio } from "lucide-react";

interface EarthZoomHeroProps {
  onCompleteToNext?: () => void;
}

interface StageConfig {
  id: string;
  step: string;
  label: string;
  nodeTitle: string;
  nodeSub: string;
  start: number;
  end: number;
  maxScale: number;
  panFrom: [number, number];
  panTo: [number, number];
  origin: string;
}

const IMAGE_DURATION_MS = 3000;
const STAGES: StageConfig[] = [
  {
    id: "satellite",
    step: "01",
    label: "RED GLOBAL MOGU TRAVEL",
    nodeTitle: "Red Global",
    nodeSub: "Mogu Travel",
    start: 0,
    end: 1 / 3,
    maxScale: 1.14,
    panFrom: [0, 0],
    panTo: [-1.5, -1],
    origin: "50% 48%",
  },
  {
    id: "city",
    step: "02",
    label: "PEDIDOS DIRECTOS EN TU CIUDAD",
    nodeTitle: "Ruta Directa",
    nodeSub: "0% Comisión",
    start: 1 / 3,
    end: 2 / 3,
    maxScale: 1.15,
    panFrom: [1.2, 0.8],
    panTo: [-1.2, -1.2],
    origin: "50% 55%",
  },
  {
    id: "venue",
    step: "03",
    label: "SALÓN, COCINA KDS Y CAJA EN VIVO",
    nodeTitle: "En el Local",
    nodeSub: "KDS · Mesas · Caja",
    start: 2 / 3,
    end: 1,
    maxScale: 1.13,
    panFrom: [-0.8, 0.6],
    panTo: [0.8, -0.8],
    origin: "50% 50%",
  },
];

const TOTAL_CYCLE_MS = IMAGE_DURATION_MS * STAGES.length;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function easeInOutQuart(t: number) {
  const c = clamp01(t);
  return c < 0.5 ? 8 * c * c * c * c : 1 - Math.pow(-2 * c + 2, 4) / 2;
}

function segmentMotion(progress: number, stage: StageConfig) {
  const span = stage.end - stage.start;
  const rawT = clamp01((progress - stage.start) / span);
  const eased = easeInOutQuart(rawT);

  const scale = 1 + eased * (stage.maxScale - 1);
  const x = stage.panFrom[0] + eased * (stage.panTo[0] - stage.panFrom[0]);
  const y = stage.panFrom[1] + eased * (stage.panTo[1] - stage.panFrom[1]);

  return { scale, x, y, localProgress: eased };
}

function stageOpacity(progress: number, start: number, end: number) {
  const fade = 0.07;
  if (progress < start - fade || progress > end + fade) return 0;

  if (progress < start + fade) {
    return easeInOutQuart((progress - (start - fade)) / (fade * 2));
  }

  if (progress > end - fade) {
    return 1 - easeInOutQuart((progress - (end - fade)) / (fade * 2));
  }

  return 1;
}

export default function EarthZoomHero({ onCompleteToNext }: EarthZoomHeroProps) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [satImgError, setSatImgError] = useState(false);
  const [descImgError, setDescImgError] = useState(false);
  const [localImgError, setLocalImgError] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    let rafId: number | null = null;
    const startPerf = performance.now() - progress * TOTAL_CYCLE_MS;

    const tick = (now: number) => {
      const elapsed = (now - startPerf) % TOTAL_CYCLE_MS;
      setProgress(elapsed / TOTAL_CYCLE_MS);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const satMotion = segmentMotion(progress, STAGES[0]);
  const satOpacity = stageOpacity(progress, STAGES[0].start, STAGES[0].end);

  const descMotion = segmentMotion(progress, STAGES[1]);
  const descOpacity = stageOpacity(progress, STAGES[1].start, STAGES[1].end);

  const venueMotion = segmentMotion(progress, STAGES[2]);
  const venueOpacity = stageOpacity(progress, STAGES[2].start, STAGES[2].end);

  const activeStage =
    STAGES.find((s) => progress >= s.start && progress < s.end) ??
    STAGES[STAGES.length - 1];

  const elapsedSeconds = ((progress * TOTAL_CYCLE_MS) / 1000).toFixed(1);
  const totalSeconds = (TOTAL_CYCLE_MS / 1000).toFixed(1);

  const jumpToStage = (targetProgress: number) => {
    setProgress(clamp01(targetProgress));
  };

  return (
    <section
      id="earthzoom"
      aria-label="Todo tu restaurante, conectado en un solo sistema"
      className="relative h-dvh w-full bg-[#070811] overflow-hidden"
    >
      <style jsx>{`
        @keyframes badgeReveal {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .stage-badge-reveal {
          animation: badgeReveal 260ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* CAPA 01: VISTA SATELITAL */}
      <div
        style={{
          opacity: satOpacity,
          pointerEvents: satOpacity < 0.15 ? "none" : "auto",
          willChange: "transform, opacity",
        }}
        className="absolute inset-0 z-10 w-full h-full"
      >
        {!satImgError ? (
          <Image
            src="/images/satelite-tierra.jpg"
            alt="Vista satelital de la Tierra con estelas orbitales y galaxias"
            fill
            priority
            quality={95}
            sizes="100vw"
            onError={() => setSatImgError(true)}
            style={{
              transform: `translate3d(${satMotion.x}%, ${satMotion.y}%, 0) scale(${satMotion.scale})`,
              transformOrigin: STAGES[0].origin,
              willChange: "transform",
            }}
            className="w-full h-full object-cover object-center pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center px-6 text-center bg-[#090d1f]">
            <p className="text-xs font-bold text-cyan-300">
              Falta guardar public/images/satelite-tierra.jpg
            </p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070811]/80 via-black/20 to-[#070811]/85 pointer-events-none" />
      </div>

      {/* CAPA 02: DESCENSO SOBRE LA CIUDAD */}
      <div
        style={{
          opacity: descOpacity,
          pointerEvents: descOpacity < 0.15 ? "none" : "auto",
          willChange: "transform, opacity",
        }}
        className="absolute inset-0 z-20 w-full h-full"
      >
        {!descImgError ? (
          <Image
            src="/images/descenso-ciudad.jpg"
            alt="Descenso aéreo sobre ciudad iluminada bajo nubes y cielo cósmico"
            fill
            priority
            quality={95}
            sizes="100vw"
            onError={() => setDescImgError(true)}
            style={{
              transform: `translate3d(${descMotion.x}%, ${descMotion.y}%, 0) scale(${descMotion.scale})`,
              transformOrigin: STAGES[1].origin,
              willChange: "transform",
            }}
            className="w-full h-full object-cover object-center pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center px-6 text-center bg-[#0b0e1a]">
            <p className="text-xs font-bold text-cyan-300">
              Falta guardar public/images/descenso-ciudad.jpg
            </p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E0C0A]/80 via-black/20 to-[#0E0C0A]/85 pointer-events-none" />
      </div>

      {/* CAPA 03: LLEGADA AL LOCAL */}
      <div
        style={{
          opacity: venueOpacity,
          pointerEvents: venueOpacity < 0.15 ? "none" : "auto",
          willChange: "transform, opacity",
        }}
        className="absolute inset-0 z-30 w-full h-full"
      >
        {!localImgError ? (
          <Image
            src="/images/cosmos-local.jpg"
            alt="Fachada nocturna del restaurante bajo cielo cósmico"
            fill
            priority
            quality={95}
            sizes="100vw"
            onError={() => setLocalImgError(true)}
            style={{
              transform: `translate3d(${venueMotion.x}%, ${venueMotion.y}%, 0) scale(${venueMotion.scale})`,
              transformOrigin: STAGES[2].origin,
              willChange: "transform",
            }}
            className="w-full h-full object-cover object-center pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center px-6 text-center bg-[#120f1d]">
            <p className="text-xs font-bold text-cyan-300">
              Falta guardar public/images/cosmos-local.jpg
            </p>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-[#0E0C0A]/85 via-black/25 to-[#0E0C0A]/90 pointer-events-none" />
      </div>

      {/* VIÑETA EDITORIAL DE PROFUNDIDAD */}
      <div className="absolute inset-0 z-30 bg-[radial-gradient(circle_at_50%_48%,transparent_34%,rgba(14,12,10,0.82)_95%)] pointer-events-none" />

      {/* CONTENIDO PRINCIPAL DEL HERO */}
      <div className="relative z-40 h-full w-full max-w-5xl mx-auto pt-24 pb-5 px-4 sm:px-8 flex flex-col justify-between">
        <div className="text-center space-y-3.5 max-w-4xl mx-auto">
          <div
            key={activeStage.id}
            className="stage-badge-reveal inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E0C0A]/85 border border-cyan-400/25 backdrop-blur-md text-[10px] sm:text-xs font-bold uppercase tracking-wider text-cyan-300 shadow-[0_8px_28px_rgba(6,182,212,0.16)]"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-300 animate-pulse shrink-0" />
            <span>{activeStage.label}</span>
            <span className="text-white/40">•</span>
            <span className="text-white/95">0% COMISIÓN POR PEDIDO</span>
          </div>

          <h1 className="text-2xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-white leading-[1.1] [text-shadow:0_4px_24px_rgba(14,12,10,0.95)]">
            Todo tu restaurante,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-purple-200">
              conectado en un solo sistema.
            </span>
          </h1>

          <p className="text-xs sm:text-base text-white/90 max-w-2xl mx-auto leading-relaxed [text-shadow:0_2px_16px_rgba(14,12,10,0.95)]">
            Pedidos, cocina, garzones y caja en tiempo real. Digitaliza tu
            atención, recibe pedidos desde QR, NFC o tu propia app web y
            administra cada operación desde una sola plataforma.
          </p>
        </div>

        {/* BARRA INFERIOR DE SINCRONIZACIÓN OPERATIVA */}
        <div className="max-w-2xl w-full mx-auto space-y-2.5">
          <div className="rounded-2xl bg-[#0E0C0A]/80 border border-white/15 backdrop-blur-xl p-2 sm:p-2.5 shadow-[0_14px_40px_rgba(0,0,0,0.55)] space-y-2">
            <div className="flex items-center justify-between px-1.5 text-[10px] font-semibold tracking-wider uppercase text-white/70">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                Recorrido Operativo MOGU
              </span>
              <span className="font-mono text-[10px] text-white/75">
                {elapsedSeconds}s / {totalSeconds}s
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                aria-label={isPlaying ? "Pausar recorrido" : "Reanudar recorrido"}
                className="min-h-[42px] min-w-[42px] rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-cyan-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
              </button>

              <div className="grid grid-cols-3 gap-1.5 flex-1">
                {STAGES.map((seg, idx) => {
                  const segFill = clamp01(
                    (progress - seg.start) / (seg.end - seg.start)
                  );
                  const isCurrent = activeStage.id === seg.id;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => jumpToStage(seg.start + 0.01)}
                      className={`group text-left rounded-xl px-2.5 py-1.5 transition cursor-pointer border ${
                        isCurrent
                          ? "bg-cyan-400/12 border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.12)]"
                          : "bg-white/[0.03] border-white/10 hover:border-white/25"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-[9px] font-mono font-bold ${
                            isCurrent ? "text-cyan-300" : "text-white/50"
                          }`}
                        >
                          {seg.step}
                        </span>
                        <span
                          className={`text-[10px] font-bold truncate ${
                            isCurrent
                              ? "text-white"
                              : "text-white/75 group-hover:text-cyan-200"
                          }`}
                        >
                          {seg.nodeTitle}
                        </span>
                      </div>

                      <div className="h-1 w-full rounded-full bg-white/15 overflow-hidden mb-1">
                        <div
                          style={{ width: `${segFill * 100}%` }}
                          className="h-full bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-300 transition-none"
                        />
                      </div>

                      <span className="text-[9px] text-white/60 block truncate">
                        {seg.nodeSub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {onCompleteToNext && (
            <div className="text-center">
              <button
                type="button"
                onClick={onCompleteToNext}
                className="min-h-[44px] px-5 py-2 rounded-full bg-[#0E0C0A]/85 hover:bg-[#14110f] border border-cyan-400/35 backdrop-blur-md text-xs font-bold text-cyan-200 hover:text-cyan-300 transition cursor-pointer shadow-lg"
              >
                Explorar la operación en mesa ↓
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}