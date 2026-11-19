"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

const SAMPLE_MENU = [
  {
    id: 1,
    name: "Burger Trufada Mogu",
    desc: "Doble smash, queso cheddar madurado, mayo trufada",
    price: "$11.900",
    tag: "Top Ventas",
  },
  {
    id: 2,
    name: "Flat White Especialidad",
    desc: "Doble ristretto, leche texturizada sedosa",
    price: "$4.200",
    tag: "Cafetería",
  },
  {
    id: 3,
    name: "Roll Acevichado Nikkei",
    desc: "Salmón fresco, palta, salsa acevichada de la casa",
    price: "$10.500",
    tag: "Sushi",
  },
];

function interpolate(progress: number, input: number[], output: number[]) {
  if (progress <= input[0]) return output[0];
  if (progress >= input[input.length - 1]) return output[output.length - 1];

  for (let i = 0; i < input.length - 1; i++) {
    if (progress >= input[i] && progress <= input[i + 1]) {
      const ratio = (progress - input[i]) / (input[i + 1] - input[i]);
      return output[i] + ratio * (output[i + 1] - output[i]);
    }
  }
  return output[0];
}

export default function CinematicHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [orderSent, setOrderSent] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const scrollableDistance = rect.height - window.innerHeight;
          if (scrollableDistance <= 0) return;

          const currentScrolled = -rect.top;
          const p = Math.max(0, Math.min(1, currentScrolled / scrollableDistance));
          setProgress(p);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 1. Escena del restaurante (zoom sutil sin salirse de pantalla)
  const roomScale = interpolate(progress, [0, 0.45], [1, 1.35]);
  const roomOpacity = interpolate(progress, [0.2, 0.48], [1, 0]);

  // 2. Tótem NFC / QR en la mesa
  const totemScale = interpolate(progress, [0, 0.35], [1, 1.25]);
  const totemY = interpolate(progress, [0, 0.4], [0, 40]);
  const totemOpacity = interpolate(progress, [0.22, 0.45], [1, 0]);

  // 3. Smartphone con el menú (entra centrado sin quedar cortado)
  const phoneY = interpolate(progress, [0.22, 0.58], [80, 0]);
  const phoneScale = interpolate(progress, [0.22, 0.58, 0.9], [0.88, 1, 1]);
  const phoneOpacity = interpolate(progress, [0.2, 0.42], [0, 1]);

  // 4. Textos por etapa
  const titleOpacity = interpolate(progress, [0, 0.18], [1, 0]);
  const titleY = interpolate(progress, [0, 0.18], [0, -24]);

  const step3Opacity = interpolate(progress, [0.52, 0.72, 1], [0, 1, 1]);

  const handleAddItem = () => {
    setCartCount((prev) => prev + 1);
    setOrderSent(false);
  };

  const handleSendOrder = () => {
    if (cartCount === 0) setCartCount(1);
    setOrderSent(true);
  };

  return (
    <section
      ref={containerRef}
      className="relative h-[280vh] text-white selection:bg-cyan-400 selection:text-[#0E0C0A]"
    >
      {/* Contenedor pegajoso limpio */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center pt-20 sm:pt-24 pb-6 px-4">
        {/* CAPA 1: Escenario del Restaurante */}
        <div
          style={{
            transform: `scale(${roomScale})`,
            opacity: roomOpacity,
            willChange: "transform, opacity",
          }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(251,191,36,0.14),rgba(14,12,10,0.78)_70%)]" />
          <div className="absolute top-24 left-[18%] w-40 h-40 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="absolute top-32 right-[18%] w-52 h-52 rounded-full bg-cyan-400/15 blur-3xl" />

          {/* Siluetas de la pareja en la mesa */}
          <div className="absolute inset-x-0 top-[24%] flex justify-center gap-36 sm:gap-52 opacity-35 blur-[1px]">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/20" />
              <div className="w-36 h-44 -mt-2 rounded-t-[56px] bg-gradient-to-b from-white/15 to-transparent" />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/20" />
              <div className="w-36 h-44 -mt-2 rounded-t-[56px] bg-gradient-to-b from-white/15 to-transparent" />
            </div>
          </div>

          {/* Superficie de mesa inferior */}
          <div className="absolute bottom-0 inset-x-0 h-[34vh] bg-gradient-to-t from-[#0E0C0A] via-[#171412]/80 to-transparent border-t border-cyan-400/15" />
        </div>

        {/* ESCENA INICIAL: Titular + Tótem NFC */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            pointerEvents: titleOpacity < 0.1 ? "none" : "auto",
          }}
          className="relative z-20 flex flex-col items-center text-center max-w-4xl mx-auto gap-8"
        >
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase bg-white/10 text-cyan-300 border border-white/20 backdrop-blur-md">
              Sistema Operativo Gastronómico
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-teal-200 leading-[1.06]">
              Llegan a la mesa. <br className="hidden sm:block" />
              Abren el menú.
            </h1>
            <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto leading-relaxed">
              Desliza hacia abajo para acercarte a la mesa y abrir la carta digital conectada a cocina, caja y Mogu Travel.
            </p>
          </div>

          {/* Tótem NFC / QR */}
          <div
            style={{
              transform: `translateY(${totemY}px) scale(${totemScale})`,
              opacity: totemOpacity,
            }}
            className="relative flex flex-col items-center"
          >
            <span className="absolute w-32 h-32 rounded-full border border-cyan-400/30 animate-ping" />
            <div className="w-24 h-32 rounded-2xl bg-gradient-to-b from-[#1c1917] to-[#0E0C0A] border border-cyan-400/40 shadow-[0_20px_50px_rgba(6,182,212,0.25)] flex flex-col items-center justify-between p-3">
              <span className="text-[11px] font-black tracking-[0.2em] text-white">
                MOGU<span className="text-cyan-400">.</span>
              </span>
              <div className="w-10 h-10 rounded-full bg-cyan-400/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <svg
                  className="w-5 h-5 rotate-90"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
                </svg>
              </div>
              <span className="text-[9px] text-cyan-300 font-bold uppercase tracking-wider">
                Mesa 04 • NFC
              </span>
            </div>
          </div>
        </div>

        {/* ESCENA AL BAJAR: Smartphone con el Menú Interactivo */}
        <div
          style={{
            transform: `translateY(${phoneY}px) scale(${phoneScale})`,
            opacity: phoneOpacity,
            pointerEvents: phoneOpacity < 0.35 ? "none" : "auto",
            willChange: "transform, opacity",
          }}
          className="absolute inset-x-0 z-30 flex flex-col lg:flex-row items-center justify-center gap-8 px-6 max-w-6xl mx-auto pt-16 sm:pt-20"
        >
          {/* Mockup del Teléfono ajustado al alto de pantalla */}
          <div className="w-[300px] sm:w-[330px] max-h-[74vh] h-[540px] rounded-[38px] bg-[#0E0C0A] border-[5px] border-white/15 shadow-[0_25px_80px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col">
            <div className="w-24 h-5 bg-black rounded-full mx-auto mt-2 mb-1.5 flex items-center justify-end px-2.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>

            <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] text-cyan-300 font-bold">
                  Mesa 04 • Salón en Vivo
                </span>
                <h3 className="text-sm font-extrabold text-white">
                  Bistró & Café Mogu
                </h3>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-[10px] text-cyan-200 font-bold">
                +120 pts
              </div>
            </div>

            <div className="p-3.5 space-y-2.5 flex-1 overflow-y-auto">
              {SAMPLE_MENU.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-between gap-2.5"
                >
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 font-bold inline-block">
                      {item.tag}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-white/65 truncate">
                      {item.desc}
                    </p>
                    <p className="text-xs font-extrabold text-cyan-300">
                      {item.price}
                    </p>
                  </div>
                  <button
                    onClick={handleAddItem}
                    aria-label={`Agregar ${item.name}`}
                    className="w-8 h-8 rounded-xl bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-[#0E0C0A] font-black text-base flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              ))}

              {orderSent && (
                <div className="p-2.5 rounded-xl bg-cyan-400/15 border border-cyan-400/40 text-[11px] text-white font-semibold">
                  ✓ Comanda enviada a Cocina (KDS) y Caja en vivo.
                </div>
              )}
            </div>

            <div className="p-3.5 bg-[#0E0C0A] border-t border-white/10 shrink-0">
              <button
                onClick={handleSendOrder}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#0E0C0A] font-extrabold text-[11px] uppercase tracking-wider cursor-pointer"
              >
                {cartCount > 0
                  ? `Enviar a Cocina (${cartCount})`
                  : "Probar pedir a cocina"}
              </button>
            </div>
          </div>

          {/* Info lateral en escritorio */}
          <div
            style={{ opacity: step3Opacity }}
            className="hidden lg:flex flex-col max-w-md space-y-4"
          >
            <span className="text-cyan-300 text-xs font-bold uppercase tracking-[0.2em]">
              Operación en Tiempo Real
            </span>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight">
              Un toque en la mesa activa todo tu local.
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Agrega un plato en el teléfono y envía la comanda. En Mogu, la orden llega al instante a cocina, caja y garzones con 0% comisiones.
            </p>
            <div className="pt-1 flex items-center gap-3">
              <Link
                href="/checkout/mogu-start"
                className="rounded-xl bg-white hover:bg-slate-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#0E0C0A] transition"
              >
                Crea tu perfil gratis
              </Link>
              <Link
                href="#ecosistema-completo"
                className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition"
              >
                Ver Ecosistema
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}