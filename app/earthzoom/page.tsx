"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type EarthStep = "fachada" | "entrada" | "interaccion";

const INTERACTION_STAGES: {
  id: EarthStep;
  badge: string;
  title: string;
  desc: string;
}[] = [
  {
    id: "fachada",
    badge: "01 • Vista Cósmica del Local",
    title: "Desde el cielo nocturno hasta la esquina de tu local",
    desc: "La escena abre con el local iluminado bajo el cielo estrellado y las estelas orbitales, marcando el punto de partida del recorrido.",
  },
  {
    id: "entrada",
    badge: "02 • Zoom hacia la Puerta y el Salón",
    title: "Acercamiento progresivo hacia el interior del local",
    desc: "Al hacer scroll, la cámara enfoca el acceso y el salón cálido mientras atenúa los bordes para dar sensación de profundidad.",
  },
  {
    id: "interaccion",
    badge: "03 • Interacción Activa",
    title: "De la fachada a la mesa, la app y la operación en vivo",
    desc: "Una vez adentro, el usuario puede explorar el flujo de mesa, cocina, caja o saltar a la experiencia interactiva completa.",
  },
];

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function easeInOutCubic(t: number) {
  const c = clamp01(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

function mapRange(progress: number, input: number[], output: number[]) {
  if (progress <= input[0]) return output[0];
  if (progress >= input[input.length - 1]) return output[output.length - 1];

  for (let i = 0; i < input.length - 1; i++) {
    const start = input[i];
    const end = input[i + 1];
    if (progress >= start && progress <= end) {
      const rawT = (progress - start) / (end - start);
      const smoothT = easeInOutCubic(rawT);
      return output[i] + smoothT * (output[i + 1] - output[i]);
    }
  }
  return output[0];
}

export default function EarthZoomPage() {
  const zoomStageRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [localImgError, setLocalImgError] = useState(false);
  const [selectedStep, setSelectedStep] = useState<EarthStep>("fachada");

  useEffect(() => {
    let rafId: number | null = null;

    const updateProgress = () => {
      rafId = null;
      if (!zoomStageRef.current) return;
      const rect = zoomStageRef.current.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable > 0) {
        const p = clamp01(-rect.top / scrollable);
        setScrollProgress(p);
        if (p < 0.34) {
          setSelectedStep("fachada");
        } else if (p < 0.68) {
          setSelectedStep("entrada");
        } else {
          setSelectedStep("interaccion");
        }
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

  // Zoom óptico controlado hacia la entrada/interior del local (50% 48%)
  const zoomScale = mapRange(scrollProgress, [0, 0.72], [1, 1.62]);
  const zoomBlur = mapRange(scrollProgress, [0.45, 0.75], [0, 2.5]);
  const vignetteOpacity = mapRange(scrollProgress, [0, 0.65], [0.25, 0.85]);
  const panelOpacity = mapRange(scrollProgress, [0.18, 0.42, 1], [0.4, 1, 1]);

  const goToStep = (step: EarthStep) => {
    setSelectedStep(step);
    if (!zoomStageRef.current) return;
    const top = zoomStageRef.current.offsetTop;
    const scrollable = Math.max(
      0,
      zoomStageRef.current.offsetHeight - window.innerHeight
    );
    const ratio = step === "fachada" ? 0.05 : step === "entrada" ? 0.48 : 0.88;
    window.scrollTo({
      top: top + scrollable * ratio,
      behavior: "smooth",
    });
  };

  const currentStageInfo =
    INTERACTION_STAGES.find((s) => s.id === selectedStep) ??
    INTERACTION_STAGES[0];

  return (
    <div
      style={{ backgroundColor: "#0E0C0A", overflowX: "clip" }}
      className="min-h-screen text-white font-sans antialiased selection:bg-cyan-400 selection:text-[#0E0C0A]"
    >
      <div className="fixed inset-0 bg-gradient-to-b from-[#2f115e] via-[#122661] to-[#0E0C0A] opacity-90 pointer-events-none" />
      <div className="fixed -top-24 left-1/2 -translate-x-1/2 w-[960px] h-[460px] rounded-full bg-cyan-400/15 blur-[160px] pointer-events-none" />

      <div className="relative z-10">
        <Navbar />

        {/* ESCENA PRINCIPAL EARTHZOOM DESDE EL LOCAL */}
        <section ref={zoomStageRef} className="relative h-[280vh]">
          <div className="sticky top-0 h-screen w-full flex items-center justify-center pt-20 pb-6 px-4 sm:px-8">
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              {/* VENTANA DE ZOOM HACIA EL LOCAL */}
              <div className="lg:col-span-7 relative h-[320px] sm:h-[430px] lg:h-[500px] rounded-[36px] overflow-hidden border border-white/15 shadow-[0_24px_80px_rgba(6,182,212,0.2)] bg-[#120f1d]">
                {!localImgError ? (
                  <Image
                    src="/images/cosmos-local.jpg"
                    alt="Fachada nocturna de Cosmos Burger & Pizza bajo cielo con galaxias y estelas luminosas"
                    fill
                    priority
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    onError={() => setLocalImgError(true)}
                    style={{
                      transform: `scale(${zoomScale})`,
                      transformOrigin: "50% 48%",
                      filter: `blur(${zoomBlur}px)`,
                      willChange: "transform, filter",
                    }}
                    className="object-cover object-center pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center px-6 text-center space-y-2">
                    <p className="text-sm font-bold text-cyan-300">
                      Guarda la imagen en public/images/cosmos-local.jpg
                    </p>
                    <p className="text-xs text-white/70">
                      Así arrancará el zoom desde la fachada del local.
                    </p>
                  </div>
                )}

                <div
                  style={{ opacity: vignetteOpacity }}
                  className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,transparent_26%,rgba(14,12,10,0.88)_86%)] pointer-events-none"
                />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                    EarthZoom • {Math.round(zoomScale * 100)}%
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-[10px] font-semibold text-white/80">
                    Haz scroll para acercarte
                  </span>
                </div>
              </div>

              {/* PANEL INTERACTIVO POST-ZOOM */}
              <div
                style={{ opacity: panelOpacity }}
                className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-white/[0.06] border border-white/15 backdrop-blur-xl space-y-5"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300 block">
                    {currentStageInfo.badge}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                    {currentStageInfo.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                    {currentStageInfo.desc}
                  </p>
                </div>

                {/* CONTROLES DE NAVEGACIÓN ENTRE FASES */}
                <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-[#0E0C0A]/70 border border-white/10 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => goToStep("fachada")}
                    className={`py-2 rounded-xl transition cursor-pointer ${
                      selectedStep === "fachada"
                        ? "bg-cyan-400 text-[#0E0C0A]"
                        : "text-white/75 hover:text-white"
                    }`}
                  >
                    1. Local
                  </button>
                  <button
                    type="button"
                    onClick={() => goToStep("entrada")}
                    className={`py-2 rounded-xl transition cursor-pointer ${
                      selectedStep === "entrada"
                        ? "bg-cyan-400 text-[#0E0C0A]"
                        : "text-white/75 hover:text-white"
                    }`}
                  >
                    2. Zoom
                  </button>
                  <button
                    type="button"
                    onClick={() => goToStep("interaccion")}
                    className={`py-2 rounded-xl transition cursor-pointer ${
                      selectedStep === "interaccion"
                        ? "bg-cyan-400 text-[#0E0C0A]"
                        : "text-white/75 hover:text-white"
                    }`}
                  >
                    3. Interacción
                  </button>
                </div>

                {/* ACCIONES DE CONTINUIDAD */}
                <div className="pt-1 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/#pedido-desde-casa"
                    className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-[#0E0C0A] text-center text-xs font-extrabold uppercase tracking-wider transition"
                  >
                    Ir a la interacción completa
                  </Link>
                  <Link
                    href="/checkout/mogu-start"
                    className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-center text-xs font-bold uppercase tracking-wider text-white transition"
                  >
                    Crear local
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}