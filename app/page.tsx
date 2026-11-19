"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import EarthZoomHero from "@/components/EarthZoomHero";
import PricingSection from "@/components/PricingSection";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  Check,
  Star,
  Stamp,
  Compass,
  Smartphone,
  ShoppingBag,
  Monitor,
  LayoutGrid,
  QrCode,
  BarChart3,
  Lock,
  Sliders,
} from "lucide-react";

interface Dish {
  id: number;
  name: string;
  subtitle: string;
  price: number;
  station: "Cocina" | "Barra" | "Cafetería";
  points: number;
}

interface PlacedOrderItem extends Dish {
  uid: string;
  qty: number;
  status: "En cocina" | "Preparando" | "Servido";
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  badge: string | null;
  interval: string;
  subtitle?: string;
  features: string[];
}

type FlowStage = "cocina" | "mesero" | "caja";
type ClientPhoneTab = "menu" | "estado";

const DINE_IN_DISHES: Dish[] = [
  {
    id: 1,
    name: "Smash Burger Trufada",
    subtitle: "Doble carne, cheddar madurado, mayo trufada",
    price: 11900,
    station: "Cocina",
    points: 120,
  },
  {
    id: 2,
    name: "Flat White de Origen",
    subtitle: "Doble espresso, leche sedosa a 62 °C",
    price: 4200,
    station: "Cafetería",
    points: 45,
  },
  {
    id: 3,
    name: "Acevichado Nikkei",
    subtitle: "Salmón fresco, palta hass, leche de tigre suave",
    price: 10500,
    station: "Barra",
    points: 105,
  },
  {
    id: 4,
    name: "Sourdough & Palta",
    subtitle: "Pan de masa madre, palta, huevo pochado",
    price: 6800,
    station: "Cafetería",
    points: 70,
  },
];

const HOME_ORDER_DISHES: Dish[] = [
  {
    id: 101,
    name: "Combo Doble Smash + Papas",
    subtitle: "Empaque térmico listo para delivery o retiro",
    price: 14900,
    station: "Cocina",
    points: 150,
  },
  {
    id: 102,
    name: "Poke Bowl Salmón & Mango",
    subtitle: "Arroz de sushi, palta, sésamo, salsa cítrica",
    price: 9800,
    station: "Barra",
    points: 100,
  },
  {
    id: 103,
    name: "Cold Brew & Medialuna",
    subtitle: "Extracción en frío + medialuna artesanal",
    price: 6400,
    station: "Cafetería",
    points: 65,
  },
];

const DEFAULT_START_PLAN: Plan = {
  id: "mogu-start",
  name: "Mogu Start",
  slug: "mogu-start",
  price: 0,
  original_price: null,
  badge: "GRATIS PARA SIEMPRE",
  interval: "mensual",
  subtitle: "Tu identidad gastronómica en un solo enlace inteligente.",
  features: [
    "Perfil digital optimizado (mogu.cl/tu-local)",
    "Enlaces externos ilimitados (Instagram, WhatsApp, ubicación, web)",
    "Diseño 100% adaptado a dispositivos móviles",
    "Código QR descargable para compartir tu perfil",
  ],
};

const DEFAULT_MONTHLY_PLANS: Plan[] = [
  {
    id: "mogu-core",
    name: "Mogu Core",
    slug: "mogu-core",
    price: 14990,
    original_price: null,
    badge: "NÚCLEO DIGITAL",
    interval: "mensual",
    subtitle: "Digitaliza tu carta y olvídate de reimprimir precios.",
    features: [
      "Todo lo incluido en Mogu Start",
      "Menú digital interactivo con código QR",
      "Hasta 100 productos activos en catálogo",
      "Actualización de precios y disponibilidad en tiempo real",
      "Gestión de categorías, fotos y modificadores de productos",
      "Personalización con los colores y logo de tu marca",
    ],
  },
  {
    id: "mogu-pro",
    name: "Mogu Pro",
    slug: "mogu-pro",
    price: 29900,
    original_price: null,
    badge: "MÁS ELEGIDO • 0% COMISIÓN",
    interval: "mensual",
    subtitle:
      "Tu propia app de pedidos y sistema de fidelización sin intermediarios.",
    features: [
      "Todo lo incluido en Mogu Core",
      "App web de pedidos dedicada para retiro en local y delivery propio",
      "Pedidos directos al WhatsApp de tu local (¡Conserva el 100% de tu margen con 0% de comisión!)",
      "Catálogo optimizado de hasta 150 productos activos",
      "Fidelización integrada: Motor de Mogu Puntos + Red Mogu Travel",
    ],
  },
  {
    id: "mogu-ecosystem",
    name: "Mogu Ecosystem",
    slug: "mogu-ecosystem",
    price: 49900,
    original_price: null,
    badge: "OPERACIÓN TOTAL",
    interval: "mensual",
    subtitle:
      "Control absoluto de tu salón, cocina y caja con catálogo ilimitado.",
    features: [
      "Todo lo incluido en Mogu Pro",
      "Catálogo de productos 100% ilimitado (sin restricciones)",
      "Ecosistema operativo en vivo: Sincronización instantánea entre Caja, Cocina (KDS), Garzones y Admin",
      "Analítica financiera avanzada, cierres seguros por PIN y métricas de ventas",
      "Hasta 10 estaciones conectadas y visibilidad destacada en Mogu Travel",
    ],
  },
];

const DEFAULT_ANNUAL_PLANS: Plan[] = [
  {
    id: "mogu-core-anual",
    name: "Mogu Core",
    slug: "mogu-core-anual",
    price: 149900,
    original_price: 179880,
    badge: "2 MESES GRATIS",
    interval: "anual",
    subtitle: "Digitaliza tu carta y olvídate de reimprimir precios todo el año.",
    features: [
      "Todo lo incluido en Mogu Start",
      "Menú digital interactivo con código QR",
      "Hasta 100 productos activos en catálogo",
      "Actualización de precios y disponibilidad en tiempo real",
      "Gestión de categorías, fotos y modificadores de productos",
      "Personalización con los colores y logo de tu marca",
    ],
  },
  {
    id: "mogu-pro-anual",
    name: "Mogu Pro",
    slug: "mogu-pro-anual",
    price: 299900,
    original_price: 358800,
    badge: "MÁS ELEGIDO • AHORRA $58.900",
    interval: "anual",
    subtitle:
      "Tu propia app de pedidos y sistema de fidelización sin intermediarios.",
    features: [
      "Todo lo incluido en Mogu Core",
      "App web de pedidos dedicada para retiro en local y delivery propio",
      "Pedidos directos al WhatsApp de tu local (¡Conserva el 100% de tu margen con 0% de comisión!)",
      "Catálogo optimizado de hasta 150 productos activos",
      "Fidelización integrada: Motor de Mogu Puntos + Red Mogu Travel",
    ],
  },
  {
    id: "mogu-ecosystem-anual",
    name: "Mogu Ecosystem",
    slug: "mogu-ecosystem-anual",
    price: 399000,
    original_price: 598800,
    badge: "OPERACIÓN TOTAL • AHORRA $199.800",
    interval: "anual",
    subtitle:
      "Control absoluto de tu salón, cocina y caja con catálogo ilimitado.",
    features: [
      "Todo lo incluido en Mogu Pro",
      "Catálogo de productos 100% ilimitado (sin restricciones)",
      "Ecosistema operativo en vivo: Sincronización instantánea entre Caja, Cocina (KDS), Garzones y Admin",
      "Analítica financiera avanzada, cierres seguros por PIN y métricas de ventas",
      "Hasta 10 estaciones conectadas y visibilidad destacada en Mogu Travel",
    ],
  },
];

const FAQS = [
  {
    question: "¿Qué es la plataforma Mogu?",
    answer:
      "Mogu SpA es un ecosistema integral de gestión y operaciones para restaurantes, cafés y locales gastronómicos. Centraliza la caja registradora, los garzones, la pantalla de cocina (KDS), el control administrativo y la app web para pedidos de los clientes en tiempo real.",
  },
  {
    question:
      "¿Mis clientes pueden hacer pedidos para retiro en local y delivery?",
    answer:
      "Sí. Cada local cuenta con su propia aplicación web móvil personalizada donde los clientes exploran la carta visual, arman su carrito y realizan pedidos tanto para consumo en mesa (vía QR o NFC) como para retiro en mostrador o envío a domicilio, sin descargas ni comisiones por venta.",
  },
  {
    question: "¿Cómo se conectan la caja, la cocina y los garzones en Mogu?",
    answer:
      "Cuando un cliente o garzón confirma una orden, la comanda llega al instante al KDS de cocina por orden de llegada y actualiza el estado de la mesa en el panel de caja y salón, registrando métricas de ventas desglosadas por medio de pago.",
  },
  {
    question: "¿Qué es la comunidad Mogu Travel y los Mogu Puntos?",
    answer:
      "Es la red internacional de fidelización incluida desde el plan Mogu Pro y Mogu Ecosystem que conecta locales gastronómicos con clientes frecuentes y una comunidad global de viajeros, permitiendo acumular y canjear Mogu Puntos por recompensas e incentivos de consumo.",
  },
  {
    question: "¿Puedo modificar mi carta, colores y precios por mi cuenta?",
    answer:
      "Sí. Desde tu panel de administración cuentas con un editor visual en tiempo real para cambiar colores de identidad, logotipo, banners promocionales, enlaces directos (WhatsApp, Instagram, Google Reviews) y activar o pausar platos agotados con un clic.",
  },
  {
    question: "¿Cuáles son los planes de Mogu para restaurantes?",
    answer:
      "Contamos con Mogu Start ($0, perfil digital con enlaces ilimitados), Mogu Core ($14.990 + IVA/mes, carta digital QR hasta 100 productos), Mogu Pro ($29.900 + IVA/mes, app de pedidos hasta 150 productos + comunidad y fidelización) y Mogu Ecosystem ($49.900 + IVA/mes, catálogo ilimitado + caja, garzones, KDS en tiempo real y fidelización). Todos los planes de pago cuentan con opción anual.",
  },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

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

function formatCLP(amount: number) {
  return `$${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export default function HomePage() {
  const [startPlan, setStartPlan] = useState<Plan>(DEFAULT_START_PLAN);

  // Escena 01: Mesa -> Zoom nítido al teléfono -> Teléfono interactivo HD
  const stageRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [bistroImgError, setBistroImgError] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([1]);
  const [phoneTab, setPhoneTab] = useState<ClientPhoneTab>("menu");
  const [placedOrders, setPlacedOrders] = useState<PlacedOrderItem[]>([
    {
      ...DINE_IN_DISHES[1],
      uid: "init-2",
      qty: 1,
      status: "Servido",
    },
  ]);
  const [waiterRequested, setWaiterRequested] = useState(false);
  const [billRequested, setBillRequested] = useState(false);
  const [lastOrderBanner, setLastOrderBanner] = useState<string | null>(null);

  // Recorrido post-escena 01: Cocina -> Celular Mesero -> Caja
  const orderFlowRef = useRef<HTMLDivElement>(null);
  const [flowProgress, setFlowProgress] = useState(0);
  const [activeStationTab, setActiveStationTab] = useState<FlowStage>("cocina");

  // Escena 02: Junta de amigos en departamento + app del local
  const apartmentStageRef = useRef<HTMLDivElement>(null);
  const [homeProgress, setHomeProgress] = useState(0);
  const [friendsImgError, setFriendsImgError] = useState(false);
  const [homeSelectedIds, setHomeSelectedIds] = useState<number[]>([101]);
  const [deliveryMode, setDeliveryMode] = useState<"Delivery" | "Retiro">(
    "Delivery"
  );
  const [homeOrderSent, setHomeOrderSent] = useState(false);

  useEffect(() => {
    let active = true;
    supabase
      .from("plans")
      .select("*")
      .eq("slug", "mogu-start")
      .single()
      .then(({ data }) => {
        if (active && data) {
          setStartPlan({ ...DEFAULT_START_PLAN, ...data });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let rafId: number | null = null;

    const calculateScroll = () => {
      rafId = null;
      const vh = window.innerHeight || 1;

      if (stageRef.current) {
        const rect = stageRef.current.getBoundingClientRect();
        const scrollable = rect.height - vh;
        if (scrollable > 0) {
          setProgress(clamp01(-rect.top / scrollable));
        }
      }

      if (orderFlowRef.current) {
        const rect = orderFlowRef.current.getBoundingClientRect();
        const scrollable = rect.height - vh;
        if (scrollable > 0) {
          const p = clamp01(-rect.top / scrollable);
          setFlowProgress(p);
          if (p < 0.36) {
            setActiveStationTab("cocina");
          } else if (p < 0.7) {
            setActiveStationTab("mesero");
          } else {
            setActiveStationTab("caja");
          }
        }
      }

      if (apartmentStageRef.current) {
        const rect = apartmentStageRef.current.getBoundingClientRect();
        const scrollable = rect.height - vh;
        if (scrollable > 0) {
          setHomeProgress(clamp01(-rect.top / scrollable));
        }
      }
    };

    const handleScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(calculateScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    calculateScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const photoZoom = mapRange(progress, [0, 0.46], [1, 1.48]);
  const photoBlur = mapRange(progress, [0.24, 0.46], [0, 2.5]);
  const act1Opacity = mapRange(progress, [0, 0.28, 0.46], [1, 1, 0]);
  const headerFade = mapRange(progress, [0, 0.18], [1, 0]);

  const phoneOpacity = mapRange(progress, [0.34, 0.52, 1], [0, 1, 1]);
  const phoneScale = mapRange(progress, [0.34, 0.54], [0.9, 1]);
  const phoneY = mapRange(progress, [0.34, 0.54], [20, 0]);

  const kitchenScale = mapRange(flowProgress, [0, 0.35, 0.48], [0.97, 1.02, 0.97]);
  const kitchenOpacity = mapRange(
    flowProgress,
    [0, 0.14, 0.45, 0.62],
    [0.55, 1, 1, 0.6]
  );

  const waiterY = mapRange(flowProgress, [0.24, 0.52, 0.78], [24, 0, -10]);
  const waiterOpacity = mapRange(
    flowProgress,
    [0.24, 0.45, 0.78, 0.95],
    [0.55, 1, 1, 0.7]
  );

  const posY = mapRange(flowProgress, [0.52, 0.82, 1], [28, 0, 0]);
  const posOpacity = mapRange(flowProgress, [0.52, 0.76, 1], [0.5, 1, 1]);

  const friendsPhotoZoom = mapRange(homeProgress, [0, 0.42], [1, 1.42]);
  const friendsPhotoBlur = mapRange(homeProgress, [0.22, 0.42], [0, 2.2]);
  const aptSceneOpacity = mapRange(homeProgress, [0, 0.26, 0.44], [1, 1, 0]);
  const aptHeaderFade = mapRange(homeProgress, [0, 0.18], [1, 0]);

  const homePhoneOpacity = mapRange(
    homeProgress,
    [0.32, 0.5, 0.95, 1],
    [0, 1, 1, 0.96]
  );
  const homePhoneY = mapRange(homeProgress, [0.32, 0.52], [24, 0]);
  const homePhoneScale = mapRange(homeProgress, [0.32, 0.52], [0.9, 1]);
  const homeFlowOpacity = mapRange(homeProgress, [0.44, 0.65], [0, 1]);

  const toggleDish = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSendDineInOrder = () => {
    const chosen =
      selectedIds.length > 0
        ? DINE_IN_DISHES.filter((d) => selectedIds.includes(d.id))
        : [DINE_IN_DISHES[0]];

    setPlacedOrders((prev) => {
      const next = [...prev];
      chosen.forEach((dish, idx) => {
        const existingIndex = next.findIndex(
          (entry) => entry.id === dish.id && entry.status !== "Servido"
        );
        if (existingIndex >= 0) {
          next[existingIndex] = {
            ...next[existingIndex],
            qty: next[existingIndex].qty + 1,
          };
        } else {
          next.unshift({
            ...dish,
            uid: `ord-${dish.id}-${Date.now()}-${idx}`,
            qty: 1,
            status: idx === 0 ? "Preparando" : "En cocina",
          });
        }
      });
      return next;
    });

    setSelectedIds([]);
    setPhoneTab("estado");
    setLastOrderBanner(
      "Pedido enviado a cocina. Revisa el estado o vuelve al menú."
    );
  };

  const handleRequestWaiter = () => {
    setWaiterRequested(true);
    setLastOrderBanner("Mesero notificado para acudir a Mesa 04.");
  };

  const handleRequestBill = () => {
    setBillRequested(true);
    setLastOrderBanner("Cuenta solicitada a Caja y Mesero.");
  };

  const toggleHomeDish = (id: number) => {
    setHomeOrderSent(false);
    setHomeSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSendHomeOrder = () => {
    if (homeSelectedIds.length === 0) setHomeSelectedIds([101]);
    setHomeOrderSent(true);
  };

  const draftDishesSelected = DINE_IN_DISHES.filter((d) =>
    selectedIds.includes(d.id)
  );
  const draftTotal = draftDishesSelected.reduce((acc, d) => acc + d.price, 0);
  const draftPoints = draftDishesSelected.reduce((acc, d) => acc + d.points, 0);

  const totalItemsInAccount = placedOrders.reduce(
    (acc, item) => acc + item.qty,
    0
  );
  const accountSubtotal = placedOrders.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  const accountPoints = placedOrders.reduce(
    (acc, item) => acc + item.points * item.qty,
    0
  );

  const homeDishesSelected = HOME_ORDER_DISHES.filter((d) =>
    homeSelectedIds.includes(d.id)
  );
  const homeTotal = homeDishesSelected.reduce((acc, d) => acc + d.price, 0);
  const homePoints = homeDishesSelected.reduce((acc, d) => acc + d.points, 0);

  const scrollToFlowStage = (stage: FlowStage) => {
    setActiveStationTab(stage);
    if (!orderFlowRef.current) return;
    const top = orderFlowRef.current.offsetTop;
    const scrollable = Math.max(
      0,
      orderFlowRef.current.offsetHeight - window.innerHeight
    );
    const ratio = stage === "cocina" ? 0.12 : stage === "mesero" ? 0.5 : 0.88;
    window.scrollTo({
      top: top + scrollable * ratio,
      behavior: "smooth",
    });
  };

  const scrollToSection = (
    ref: React.RefObject<HTMLDivElement | null>,
    offsetRatio = 0.55
  ) => {
    if (!ref.current) return;
    const top = ref.current.offsetTop;
    const height = ref.current.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: top + Math.max(0, height * offsetRatio),
      behavior: "smooth",
    });
  };

  return (
    <div
      style={{ backgroundColor: "#0E0C0A", overflowX: "clip" }}
      className="min-h-dvh text-[#D4CEC7] font-sans antialiased selection:bg-cyan-400 selection:text-[#0E0C0A]"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      <div className="fixed inset-0 w-full h-dvh bg-gradient-to-b from-[#4c1d95] via-[#1e40af] to-[#0E0C0A] opacity-90 pointer-events-none" />
      <div className="fixed -top-24 left-1/2 -translate-x-1/2 w-[960px] h-[460px] rounded-full bg-cyan-400/15 blur-[160px] pointer-events-none" />

      <div className="relative z-10">
        <Navbar />

        {/* =====================================================================
            ESCENA 00: EARTHZOOM DESDE SATÉLITE HACIA LA TIERRA Y EL LOCAL
           ===================================================================== */}
        <EarthZoomHero onCompleteToNext={() => scrollToSection(stageRef, 0)} />

        {/* =====================================================================
            ESCENA 01: ZOOM ÓPTICO SIN PIXELADO -> TELÉFONO INTERACTIVO HD
           ===================================================================== */}
        <section
          ref={stageRef}
          style={{ touchAction: "pan-y" }}
          className="relative h-[250vh] sm:h-[290vh]"
        >
          <div className="sticky top-0 h-dvh w-full flex items-center justify-center pt-20 sm:pt-20 pb-4 sm:pb-6 px-3.5 sm:px-8">
            <div
              style={{
                opacity: act1Opacity,
                pointerEvents: act1Opacity < 0.2 ? "none" : "auto",
                willChange: "opacity",
              }}
              className="relative z-20 w-full max-w-5xl mx-auto h-full max-h-[760px] flex flex-col items-center justify-between text-center gap-2"
            >
              <div
                style={{
                  opacity: headerFade,
                  willChange: "opacity",
                }}
                className="space-y-2 sm:space-y-3 pt-1"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                  Escena 01 • En la Mesa del Restaurante
                </div>
                <h2 className="text-2xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-white leading-[1.1]">
                  Se sientan, escanean y disfrutan.{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-teal-200">
                    Piden a su ritmo y cierran la cuenta sin esperas.
                  </span>
                </h2>
                <p className="text-xs sm:text-base text-white/85 max-w-xl mx-auto leading-relaxed px-2">
                  Desliza para acercarte al teléfono en la mesa y probar cómo
                  ordenan, siguen su comanda o piden la cuenta al instante.
                </p>
              </div>

              <div className="relative w-full flex-1 min-h-0 flex flex-col items-center justify-end pb-1">
                <div className="relative w-full max-w-3xl flex-1 min-h-[190px] max-h-[380px] rounded-[28px] sm:rounded-[36px] overflow-hidden border border-white/10 shadow-[0_-15px_60px_rgba(6,182,212,0.12)] bg-[#15120f] flex items-center justify-center">
                  {!bistroImgError ? (
                    <Image
                      src="/images/bistro-mesa.jpg"
                      alt="Pareja en mesa con teléfono y exhibidor QR y NFC Mogu Coffee"
                      fill
                      priority
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 768px"
                      onError={() => setBistroImgError(true)}
                      style={{
                        transform: `scale(${photoZoom})`,
                        transformOrigin: "68% 87%",
                        filter: `blur(${photoBlur}px)`,
                        willChange: "transform, filter",
                      }}
                      className="object-cover object-center pointer-events-none"
                    />
                  ) : (
                    <div className="px-6 text-center space-y-1.5">
                      <p className="text-xs font-bold text-cyan-300">
                        Falta guardar public/images/bistro-mesa.jpg
                      </p>
                      <p className="text-[11px] text-white/65">
                        Guarda la imagen en public/images/bistro-mesa.jpg para
                        mostrarla aquí.
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      opacity: mapRange(progress, [0, 0.38], [0, 0.75]),
                    }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_68%_87%,transparent_22%,rgba(14,12,10,0.85)_82%)] pointer-events-none"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#0E0C0A] to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 top-0 h-1/6 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
                </div>

                <div className="w-full max-w-3xl bg-gradient-to-b from-transparent to-[#0E0C0A] pt-3 pb-2 sm:pb-4 px-4 sm:px-6 flex flex-col items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => scrollToSection(stageRef, 0.65)}
                    className="min-h-[44px] px-4 py-2 rounded-2xl bg-cyan-400/15 hover:bg-cyan-400/25 active:scale-[0.99] border border-cyan-400/45 text-xs font-bold text-cyan-300 transition cursor-pointer"
                  >
                    Acercar al teléfono en la mesa ↓
                  </button>
                  <p className="mt-1.5 text-[11px] sm:text-sm text-cyan-200/90 font-medium">
                    Haz scroll para acercarte al teléfono en alta definición ↓
                  </p>
                </div>
              </div>
            </div>

            {/* TELÉFONO EN ALTA DEFINICIÓN */}
            <div
              style={{
                opacity: phoneOpacity,
                transform: `translateY(${phoneY}px) scale(${phoneScale})`,
                pointerEvents: phoneOpacity < 0.35 ? "none" : "auto",
                willChange: "transform, opacity",
              }}
              className="absolute inset-x-0 z-30 max-w-6xl mx-auto px-3.5 sm:px-6 pt-16 sm:pt-16 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-10 items-center"
            >
              <div className="lg:col-span-5 flex justify-center w-full">
                <div className="w-full max-w-[338px] sm:max-w-[342px] h-[min(66dvh,545px)] sm:h-[min(75dvh,565px)] rounded-[34px] sm:rounded-[40px] bg-[#0B0A09] border-[4px] sm:border-[5px] border-white/15 shadow-[0_24px_80px_rgba(6,182,212,0.24)] overflow-hidden flex flex-col">
                  <div className="h-5 sm:h-6 bg-black flex items-center justify-center shrink-0">
                    <div className="w-20 sm:w-24 h-3 sm:h-3.5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-end pr-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    </div>
                  </div>

                  <div className="px-3 sm:px-3.5 pt-2 pb-2 border-b border-white/10 bg-white/[0.02] shrink-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block">
                          Mesa 04 • Local Aliado Mogu
                        </span>
                        <h3 className="text-sm font-extrabold text-white">
                          {phoneTab === "menu"
                            ? "Carta Digital"
                            : "Estado y Cuenta"}
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-[10px] font-bold text-cyan-200 shrink-0">
                        {formatCLP(accountSubtotal)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/[0.05] border border-white/10 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPhoneTab("menu")}
                        className={`min-h-[36px] py-1.5 rounded-lg transition cursor-pointer ${
                          phoneTab === "menu"
                            ? "bg-cyan-400 text-[#0E0C0A]"
                            : "text-white/75 hover:text-white"
                        }`}
                      >
                        Menú ({DINE_IN_DISHES.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhoneTab("estado")}
                        className={`min-h-[36px] py-1.5 rounded-lg transition cursor-pointer ${
                          phoneTab === "estado"
                            ? "bg-cyan-400 text-[#0E0C0A]"
                            : "text-white/75 hover:text-white"
                        }`}
                      >
                        Pedido y Cuenta ({totalItemsInAccount})
                      </button>
                    </div>
                  </div>

                  {phoneTab === "menu" ? (
                    <>
                      <div className="p-2.5 sm:p-3 space-y-2 flex-1 overflow-y-auto overscroll-contain">
                        {DINE_IN_DISHES.map((dish) => {
                          const active = selectedIds.includes(dish.id);
                          return (
                            <button
                              key={dish.id}
                              type="button"
                              onClick={() => toggleDish(dish.id)}
                              className={`w-full min-h-[54px] text-left p-2.5 rounded-2xl border transition-all duration-150 flex items-center justify-between gap-2 cursor-pointer active:scale-[0.99] ${
                                active
                                  ? "bg-cyan-400/15 border-cyan-400/65"
                                  : "bg-white/[0.04] border-white/10 hover:border-white/25"
                              }`}
                            >
                              <div className="min-w-0">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-300/90 block">
                                  {dish.station}
                                </span>
                                <h4 className="text-xs font-bold text-white truncate">
                                  {dish.name}
                                </h4>
                                <p className="text-[10px] text-white/65 truncate">
                                  {dish.subtitle}
                                </p>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs font-extrabold text-white block">
                                  {formatCLP(dish.price)}
                                </span>
                                <span
                                  className={`mt-1 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    active
                                      ? "bg-cyan-400 text-[#0E0C0A]"
                                      : "bg-white/10 text-white/80"
                                  }`}
                                >
                                  {active ? "Elegido ✓" : "+ Pedir"}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="p-2.5 sm:p-3 bg-[#0B0A09] border-t border-white/10 space-y-2 shrink-0">
                        <div className="flex items-center justify-between text-[11px] px-1">
                          <span className="text-white/70">
                            Selección: {formatCLP(draftTotal)} (+{draftPoints}{" "}
                            pts)
                          </span>
                          <button
                            type="button"
                            onClick={() => setPhoneTab("estado")}
                            className="text-cyan-300 font-bold hover:underline cursor-pointer py-1"
                          >
                            Ver cuenta →
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleSendDineInOrder}
                          className="w-full min-h-[44px] py-2.5 rounded-xl bg-white hover:bg-slate-100 active:scale-[0.99] text-[#0E0C0A] font-extrabold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg"
                        >
                          Enviar pedido a cocina
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2.5 sm:p-3 space-y-2.5 flex-1 overflow-y-auto overscroll-contain">
                        {lastOrderBanner && (
                          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-400/35 text-[10px] text-emerald-200 font-semibold">
                            ✓ {lastOrderBanner}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={handleRequestWaiter}
                            className={`min-h-[42px] p-2 rounded-xl border text-[11px] font-bold transition cursor-pointer active:scale-[0.99] ${
                              waiterRequested
                                ? "bg-cyan-400/20 border-cyan-400 text-cyan-200"
                                : "bg-white/[0.05] border-white/15 text-white hover:border-cyan-400/50"
                            }`}
                          >
                            {waiterRequested
                              ? "Mesero avisado ✓"
                              : "Ayuda del mesero"}
                          </button>
                          <button
                            type="button"
                            onClick={handleRequestBill}
                            className={`min-h-[42px] p-2 rounded-xl border text-[11px] font-bold transition cursor-pointer active:scale-[0.99] ${
                              billRequested
                                ? "bg-amber-400/20 border-amber-300 text-amber-200"
                                : "bg-white/[0.05] border-white/15 text-white hover:border-cyan-400/50"
                            }`}
                          >
                            {billRequested
                              ? "Cuenta solicitada ✓"
                              : "Pedir la cuenta"}
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block">
                            Estado de tu pedido
                          </span>
                          {placedOrders.map((item) => (
                            <div
                              key={item.uid}
                              className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">
                                  {item.qty}x {item.name}
                                </p>
                                <span className="text-[10px] text-white/60">
                                  {item.station} •{" "}
                                  {formatCLP(item.price * item.qty)}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold shrink-0 ${
                                  item.status === "Servido"
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : item.status === "Preparando"
                                    ? "bg-amber-400/20 text-amber-200"
                                    : "bg-cyan-400/20 text-cyan-200"
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/15 space-y-1.5 text-[11px]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block">
                            Desglose de cuenta
                          </span>
                          <div className="flex items-center justify-between text-white/75">
                            <span>Consumo en mesa ({totalItemsInAccount} ítems)</span>
                            <span>{formatCLP(accountSubtotal)}</span>
                          </div>
                          <div className="flex items-center justify-between text-cyan-300">
                            <span>Mogu Travel / Puntos ganados</span>
                            <span className="font-bold">
                              +{accountPoints} pts
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-extrabold text-white pt-1.5 border-t border-white/10">
                            <span>Total a pagar</span>
                            <span className="text-cyan-300">
                              {formatCLP(accountSubtotal)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 sm:p-3 bg-[#0B0A09] border-t border-white/10 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPhoneTab("menu")}
                          className="w-full min-h-[44px] py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 active:scale-[0.99] text-[#0E0C0A] font-extrabold text-xs uppercase tracking-wider transition cursor-pointer"
                        >
                          ← Volver a la carta para pedir más
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="lg:col-span-7 space-y-2.5 sm:space-y-4 text-center lg:text-left">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 block">
                  Experiencia del Comensal en Mesa
                </span>
                <h3 className="text-lg sm:text-4xl font-extrabold text-white leading-tight">
                  Piden otra ronda, siguen su orden o llaman al mesero desde el
                  mismo lugar.
                </h3>
                <p className="hidden sm:block text-sm text-white/80 leading-relaxed max-w-xl">
                  El cliente alterna entre la{" "}
                  <strong className="text-white">carta</strong> para sumar platos
                  o bebidas y su{" "}
                  <strong className="text-white">pestaña de pedido</strong> para
                  ver el avance en vivo, pedir ayuda al garzón o solicitar la
                  cuenta con total claridad.
                </p>

                <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                      01 • Pedidos y Estado en Vivo
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">
                      Vuelve a la carta cuando quieras
                    </h4>
                    <p className="text-xs text-white/75 mt-1 leading-relaxed">
                      Suma un café, un postre o un plato más mientras ves cómo
                      avanza tu orden.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                      02 • Mesero, Cuenta y Desglose
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">
                      Atención clara y sin vueltas
                    </h4>
                    <p className="text-xs text-white/75 mt-1 leading-relaxed">
                      Avisa al mesero o pide la cuenta con el detalle exacto antes
                      de pagar.
                    </p>
                  </div>
                </div>

                <div className="pt-1 sm:pt-2 flex flex-wrap justify-center lg:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => scrollToFlowStage("cocina")}
                    className="min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl bg-white text-[#0E0C0A] text-[11px] sm:text-xs font-extrabold uppercase tracking-wider transition cursor-pointer active:scale-[0.98]"
                  >
                    Ver viaje a Cocina ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToFlowStage("mesero")}
                    className="min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-[11px] sm:text-xs font-bold text-white transition cursor-pointer active:scale-[0.98]"
                  >
                    Celular Mesero ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToFlowStage("caja")}
                    className="min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-[11px] sm:text-xs font-bold text-white transition cursor-pointer active:scale-[0.98]"
                  >
                    Caja ↓
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECUENCIA POST-ESCENA 01: COCINA -> CELULAR DEL MESERO -> CAJA
           ===================================================================== */}
        <section
          ref={orderFlowRef}
          style={{ touchAction: "pan-y" }}
          className="relative h-[280vh] sm:h-[340vh] border-t border-white/15"
        >
          <div className="sticky top-0 h-dvh w-full flex flex-col justify-center pt-20 sm:pt-20 pb-4 sm:pb-6 px-3.5 sm:px-8">
            <div className="max-w-6xl w-full mx-auto space-y-3 sm:space-y-5">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-2.5 sm:gap-3">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                    Recorrido en Tiempo Real • Mesa 04
                  </span>
                  <h2 className="text-xl sm:text-4xl font-extrabold text-white mt-0.5 leading-tight">
                    De la mesa a cocina, al celular del mesero y a caja
                  </h2>
                </div>

                <div className="grid grid-cols-3 sm:inline-flex rounded-2xl bg-white/[0.06] border border-white/15 p-1 w-full sm:w-auto self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() => scrollToFlowStage("cocina")}
                    className={`min-h-[38px] px-2.5 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer ${
                      activeStationTab === "cocina"
                        ? "bg-cyan-400 text-[#0E0C0A]"
                        : "text-white/75 hover:text-white"
                    }`}
                  >
                    1. Cocina
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToFlowStage("mesero")}
                    className={`min-h-[38px] px-2.5 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer ${
                      activeStationTab === "mesero"
                        ? "bg-cyan-400 text-[#0E0C0A]"
                        : "text-white/75 hover:text-white"
                    }`}
                  >
                    2. Mesero
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToFlowStage("caja")}
                    className={`min-h-[38px] px-2.5 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer ${
                      activeStationTab === "caja"
                        ? "bg-cyan-400 text-[#0E0C0A]"
                        : "text-white/75 hover:text-white"
                    }`}
                  >
                    3. Caja
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-stretch">
                <div
                  style={{
                    opacity: kitchenOpacity,
                    transform: `scale(${kitchenScale})`,
                    willChange: "transform, opacity",
                  }}
                  className={`lg:col-span-5 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border backdrop-blur-xl transition flex flex-col justify-between ${
                    activeStationTab === "cocina"
                      ? "bg-white/[0.09] border-cyan-400/60 shadow-[0_0_40px_rgba(6,182,212,0.16)]"
                      : "bg-white/[0.05] border-white/15"
                  }`}
                >
                  <div className="space-y-2 sm:space-y-3.5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 sm:pb-3">
                      <div>
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-cyan-300 block">
                          01 • Pantalla Cocina (KDS)
                        </span>
                        <h3 className="text-sm sm:text-base font-extrabold text-white">
                          Comanda Entrante • Mesa 04
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/35 text-[10px] font-bold text-amber-200">
                        En cola
                      </span>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2 max-h-[135px] sm:max-h-[240px] overflow-y-auto overscroll-contain pr-1">
                      {placedOrders.map((item) => (
                        <div
                          key={item.uid}
                          className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-[#0B0A09]/80 border border-white/10 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                              Estación: {item.station}
                            </span>
                            <p className="text-xs font-bold text-white truncate">
                              {item.qty}x {item.name}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-400/15 text-cyan-300 shrink-0">
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="hidden sm:flex pt-4 mt-4 border-t border-white/10 items-center justify-between text-[11px] text-white/75">
                    <span>Orden de llegada sincronizada</span>
                    <span className="font-bold text-cyan-300">Sin papel</span>
                  </div>
                </div>

                <div
                  style={{
                    opacity: waiterOpacity,
                    transform: `translateY(${waiterY}px)`,
                    willChange: "transform, opacity",
                  }}
                  className="lg:col-span-3 flex justify-center w-full"
                >
                  <div
                    className={`w-full lg:max-w-[295px] rounded-2xl sm:rounded-[34px] bg-[#0B0A09] border-2 sm:border-[4px] p-3 sm:p-3.5 flex flex-col justify-between transition ${
                      activeStationTab === "mesero"
                        ? "border-cyan-400/75 shadow-[0_0_45px_rgba(6,182,212,0.22)]"
                        : "border-white/15"
                    }`}
                  >
                    <div className="space-y-2 sm:space-y-3">
                      <div className="hidden sm:block w-16 h-1.5 rounded-full bg-white/15 mx-auto" />
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 sm:pb-2">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-300 block">
                            02 • Celular Mesero
                          </span>
                          <h3 className="text-xs font-extrabold text-white">
                            Salón • Mesa 04 Activa
                          </h3>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>

                      <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-between sm:block gap-2 sm:space-y-1">
                        <div>
                          <p className="text-[9px] sm:text-[10px] font-bold text-cyan-200 uppercase">
                            Alertas de Mesa 04
                          </p>
                          <p className="text-xs font-bold text-white">
                            {waiterRequested
                              ? "Cliente solicita ayuda en mesa"
                              : billRequested
                              ? "Cliente pidió la cuenta"
                              : `${totalItemsInAccount} ${
                                  totalItemsInAccount === 1 ? "ítem" : "ítems"
                                } registrados`}
                          </p>
                        </div>
                        <p className="hidden sm:block text-[10px] text-white/70">
                          Sincronizado con el teléfono del comensal.
                        </p>
                        <span className="sm:hidden text-xs font-extrabold text-cyan-300 shrink-0">
                          {formatCLP(accountSubtotal)}
                        </span>
                      </div>

                      <div className="hidden sm:block p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-white/70">Estado de mesa</span>
                          <span className="font-bold text-cyan-300">
                            {billRequested ? "Pide cuenta" : "Ocupada"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-white/70">Cuenta actual</span>
                          <span className="font-extrabold text-white">
                            {formatCLP(accountSubtotal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:block pt-3 mt-3 border-t border-white/10 text-center text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                      Garzón Conectado en Salón
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    opacity: posOpacity,
                    transform: `translateY(${posY}px)`,
                    willChange: "transform, opacity",
                  }}
                  className={`lg:col-span-4 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border backdrop-blur-xl transition flex flex-col justify-between ${
                    activeStationTab === "caja"
                      ? "bg-white/[0.09] border-cyan-400/60 shadow-[0_0_40px_rgba(6,182,212,0.16)]"
                      : "bg-white/[0.05] border-white/15"
                  }`}
                >
                  <div className="space-y-2 sm:space-y-3.5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 sm:pb-3">
                      <div>
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-cyan-300 block">
                          03 • Panel de Caja
                        </span>
                        <h3 className="text-sm sm:text-base font-extrabold text-white">
                          Cuenta Mesa 04 y Cobro
                        </h3>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          billRequested
                            ? "bg-amber-400/20 border-amber-300/40 text-amber-200"
                            : "bg-emerald-500/15 border-emerald-400/35 text-emerald-300"
                        }`}
                      >
                        {billRequested ? "Cuenta Solicitada" : "Sincronizada"}
                      </span>
                    </div>

                    <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#0B0A09]/80 border border-white/10 space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/70">Total Mesa 04</span>
                        <span className="font-extrabold text-white">
                          {formatCLP(accountSubtotal)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/70">Mogu Puntos / Travel</span>
                        <span className="font-bold text-cyan-300">
                          +{accountPoints} pts
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1.5 sm:pt-2 border-t border-white/10">
                        <span className="text-white/70">Medios de pago</span>
                        <span className="font-semibold text-white/90 text-[11px] sm:text-xs">
                          POS • Efectivo • Transferencia
                        </span>
                      </div>
                    </div>

                    <p className="hidden sm:block text-xs text-white/75 leading-relaxed">
                      Cuando el cliente pide la cuenta desde su teléfono, caja y
                      salón reciben el aviso con el monto listo para cobrar.
                    </p>
                  </div>

                  <div className="pt-2.5 sm:pt-4 mt-2.5 sm:mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                    <span className="hidden sm:inline text-[11px] font-bold text-cyan-300">
                      Caja + Salón al día
                    </span>
                    <button
                      type="button"
                      onClick={() => scrollToSection(apartmentStageRef, 0.05)}
                      className="w-full sm:w-auto min-h-[38px] text-center sm:text-right text-xs font-bold text-cyan-300 sm:text-white hover:text-cyan-300 transition cursor-pointer"
                    >
                      Siguiente: Pedido en casa ↓
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            ESCENA 02: JUNTA DE AMIGOS EN DEPARTAMENTO + APP DEL LOCAL (DOMICILIO)
           ===================================================================== */}
        <section
          id="pedido-desde-casa"
          ref={apartmentStageRef}
          style={{ touchAction: "pan-y" }}
          className="relative h-[260vh] sm:h-[300vh] border-t border-white/15"
        >
          <div className="sticky top-0 h-dvh w-full flex items-center justify-center pt-20 sm:pt-20 pb-4 sm:pb-6 px-3.5 sm:px-8">
            <div
              style={{
                opacity: aptSceneOpacity,
                pointerEvents: aptSceneOpacity < 0.2 ? "none" : "auto",
                willChange: "opacity",
              }}
              className="relative z-20 w-full max-w-5xl mx-auto h-full max-h-[760px] flex flex-col items-center justify-between text-center gap-2"
            >
              <div
                style={{
                  opacity: aptHeaderFade,
                  willChange: "opacity",
                }}
                className="space-y-2 sm:space-y-3 pt-1"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/35 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                  Escena 02 • Junta en el Departamento
                </div>
                <h2 className="text-2xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight text-white leading-[1.1]">
                  Junta de amigos en el departamento,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-purple-200">
                    piden comida por la app directo al local.
                  </span>
                </h2>
                <p className="text-xs sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed px-2">
                  Están reunidos en casa y deciden pedir algo para comer: abren la
                  app del local en Mogu, eligen delivery o retiro y envían su
                  orden sin comisiones.
                </p>
              </div>

              <div className="relative w-full flex-1 min-h-0 flex flex-col items-center justify-end pb-1">
                <div className="relative w-full max-w-3xl flex-1 min-h-[190px] max-h-[380px] rounded-[28px] sm:rounded-[36px] overflow-hidden border border-white/10 shadow-[0_-15px_60px_rgba(168,85,247,0.16)] bg-[#15121d] flex items-center justify-center">
                  {!friendsImgError ? (
                    <Image
                      src="/images/amigos-depto.jpg"
                      alt="Grupo de amigos en un departamento revisando la app para pedir comida"
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 768px"
                      onError={() => setFriendsImgError(true)}
                      style={{
                        transform: `scale(${friendsPhotoZoom})`,
                        transformOrigin: "50% 54%",
                        filter: `blur(${friendsPhotoBlur}px)`,
                        willChange: "transform, filter",
                      }}
                      className="object-cover object-center pointer-events-none"
                    />
                  ) : (
                    <div className="px-6 text-center space-y-1.5">
                      <p className="text-xs font-bold text-cyan-300">
                        Falta guardar public/images/amigos-depto.jpg
                      </p>
                      <p className="text-[11px] text-white/65">
                        Guarda la foto de la junta de amigos en
                        public/images/amigos-depto.jpg.
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      opacity: mapRange(homeProgress, [0, 0.36], [0, 0.72]),
                    }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_50%_54%,transparent_24%,rgba(14,12,10,0.85)_84%)] pointer-events-none"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#0E0C0A] to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 top-0 h-1/6 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
                </div>

                <div className="w-full max-w-3xl bg-gradient-to-b from-transparent to-[#0E0C0A] pt-3 pb-2 sm:pb-4 px-4 sm:px-6 flex flex-col items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => scrollToSection(apartmentStageRef, 0.65)}
                    className="min-h-[44px] px-4 py-2 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] active:scale-[0.99] border border-cyan-400/35 text-xs font-bold text-cyan-300 transition cursor-pointer"
                  >
                    Abrir App Mogu • Pedido para la Junta ↓
                  </button>
                  <p className="mt-1.5 text-[11px] sm:text-sm text-cyan-200/90 font-medium">
                    Sigue bajando para acercarte a la app y pedir hacia el
                    departamento ↓
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                opacity: homePhoneOpacity,
                transform: `translateY(${homePhoneY}px) scale(${homePhoneScale})`,
                pointerEvents: homePhoneOpacity < 0.35 ? "none" : "auto",
                willChange: "transform, opacity",
              }}
              className="absolute inset-x-0 z-30 max-w-6xl mx-auto px-3.5 sm:px-6 pt-16 sm:pt-16 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-10 items-center"
            >
              <div className="lg:col-span-5 flex justify-center w-full">
                <div className="w-full max-w-[334px] h-[min(64dvh,530px)] sm:h-[min(73dvh,548px)] rounded-[34px] sm:rounded-[40px] bg-[#0B0A09] border-[4px] sm:border-[5px] border-white/15 shadow-[0_24px_80px_rgba(168,85,247,0.22)] overflow-hidden flex flex-col">
                  <div className="h-5 sm:h-6 bg-black flex items-center justify-center shrink-0">
                    <div className="w-20 sm:w-24 h-3 sm:h-3.5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-end pr-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    </div>
                  </div>

                  <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 border-b border-white/10 bg-white/[0.02] shrink-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block">
                          App del Local • Depto 402
                        </span>
                        <h3 className="text-sm font-extrabold text-white">
                          Bistró & Delivery Mogu
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-bold text-emerald-300 shrink-0">
                        +{homePoints} pts
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/[0.05] border border-white/10 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setDeliveryMode("Delivery");
                          setHomeOrderSent(false);
                        }}
                        className={`min-h-[36px] py-1 rounded-lg transition cursor-pointer ${
                          deliveryMode === "Delivery"
                            ? "bg-cyan-400 text-[#0E0C0A]"
                            : "text-white/75 hover:text-white"
                        }`}
                      >
                        Delivery a Depto
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeliveryMode("Retiro");
                          setHomeOrderSent(false);
                        }}
                        className={`min-h-[36px] py-1 rounded-lg transition cursor-pointer ${
                          deliveryMode === "Retiro"
                            ? "bg-cyan-400 text-[#0E0C0A]"
                            : "text-white/75 hover:text-white"
                        }`}
                      >
                        Retiro en Local
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3.5 space-y-2 sm:space-y-2.5 flex-1 overflow-y-auto overscroll-contain">
                    {HOME_ORDER_DISHES.map((dish) => {
                      const active = homeSelectedIds.includes(dish.id);
                      return (
                        <button
                          key={dish.id}
                          type="button"
                          onClick={() => toggleHomeDish(dish.id)}
                          className={`w-full min-h-[54px] text-left p-2.5 rounded-2xl border transition-all duration-150 flex items-center justify-between gap-2.5 cursor-pointer active:scale-[0.99] ${
                            active
                              ? "bg-cyan-400/15 border-cyan-400/65"
                              : "bg-white/[0.04] border-white/10 hover:border-white/25"
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-300/90 block">
                              {dish.station}
                            </span>
                            <h4 className="text-xs font-bold text-white truncate">
                              {dish.name}
                            </h4>
                            <p className="text-[10px] text-white/65 truncate">
                              {dish.subtitle}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-extrabold text-white block">
                              {formatCLP(dish.price)}
                            </span>
                            <span
                              className={`mt-1 inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                active
                                  ? "bg-cyan-400 text-[#0E0C0A]"
                                  : "bg-white/10 text-white/80"
                              }`}
                            >
                              {active ? "En carrito ✓" : "+ Pedir"}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    {homeOrderSent && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-[11px] text-emerald-200 font-semibold">
                        ✓ Pedido {deliveryMode} enviado al local con 0%
                        comisión.
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 sm:p-3.5 bg-[#0B0A09] border-t border-white/10 space-y-2 shrink-0">
                    <div className="flex items-center justify-between text-[11px] px-1">
                      <span className="text-white/70">
                        {deliveryMode} • 0% comisión
                      </span>
                      <span className="font-extrabold text-cyan-300">
                        Total: {formatCLP(homeTotal)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendHomeOrder}
                      className="w-full min-h-[44px] py-2.5 rounded-xl bg-white hover:bg-slate-100 active:scale-[0.99] text-[#0E0C0A] font-extrabold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg"
                    >
                      Pedir ahora ({deliveryMode})
                    </button>
                  </div>
                </div>
              </div>

              <div
                style={{ opacity: homeFlowOpacity }}
                className="lg:col-span-7 space-y-2.5 sm:space-y-4 text-center lg:text-left"
              >
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 block">
                  Canal Directo del Local • Sin Apps Intermediarias
                </span>
                <h3 className="text-lg sm:text-4xl font-extrabold text-white leading-tight">
                  Piden para la junta y la orden entra directo a tu operación.
                </h3>
                <p className="hidden sm:block text-sm text-white/80 leading-relaxed max-w-xl">
                  Cuando están reunidos en el departamento y deciden pedir algo
                  para comer, ordenan desde el canal propio de tu local en Mogu,
                  con{" "}
                  <strong className="text-white">0% de comisión por venta</strong>{" "}
                  y conexión directa con cocina y caja.
                </p>

                <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                      01 • Venta Directa
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">
                      Todo el margen queda en tu local
                    </h4>
                    <p className="text-xs text-white/75 mt-1 leading-relaxed">
                      Evita comisiones altas por pedido y mantén la relación
                      directa con quien te compra.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/60 to-cyan-950/60 border border-cyan-400/35 backdrop-blur-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                      02 • Fidelización y Comunidad
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">
                      Motivos reales para volver
                    </h4>
                    <p className="text-xs text-white/80 mt-1 leading-relaxed">
                      Suma puntos en cada pedido para canjear beneficios locales y
                      conectar con viajeros de la red.
                    </p>
                  </div>
                </div>

                <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3">
                  <Link
                    href="/checkout/mogu-start"
                    className="min-h-[44px] rounded-xl bg-white hover:bg-slate-100 active:scale-[0.99] px-5 sm:px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#0E0C0A] transition shadow-xl flex items-center justify-center"
                  >
                    Crea la app de tu local gratis
                  </Link>
                  <Link
                    href="/comida-rapida"
                    className="min-h-[44px] rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.99] border border-white/20 px-5 sm:px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition flex items-center justify-center"
                  >
                    Ver Retiro y Delivery
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECCIÓN DIDÁCTICA: ECOSISTEMA TODO EN UNO Y FLUJO REAL
           ===================================================================== */}
        <section
          id="ecosistema"
          className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-28 relative z-20 border-t border-white/15 scroll-mt-24"
        >
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3 sm:space-y-4">
            <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase bg-white/10 text-cyan-300 px-3.5 py-1.5 rounded-full border border-white/20 shadow-sm">
              Ecosistema Todo en Uno
            </span>
            <h2 className="text-2xl sm:text-5xl font-extrabold text-white tracking-tight">
              Reemplaza sistemas antiguos y costosos por una plataforma ágil
            </h2>
            <p className="text-[#D4CEC7] text-xs sm:text-base font-normal leading-relaxed">
              Así funciona Mogu en la operación diaria de tu local: conectamos la
              nueva App de pedidos de tus clientes directamente con tu cocina,
              garzones y caja en tiempo real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-16">
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-cyan-400/20 text-cyan-300 font-bold flex items-center justify-center text-sm border border-cyan-400/30">
                    01
                  </span>
                  <Smartphone className="w-5 h-5 text-cyan-300/70" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                  El cliente pide sin fricciones
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                  Tus clientes escanean el código QR o NFC en la mesa, o abren tu
                  enlace web desde casa. Exploran la carta visual, arman su
                  carrito y eligen consumo en salón, retiro en mostrador o envío
                  a domicilio.
                </p>
              </div>
              <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-white/10 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                Salón, Retiro en Local y Delivery
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/[0.07] backdrop-blur-xl border border-cyan-400/45 shadow-[0_0_35px_rgba(6,182,212,0.18)] flex flex-col justify-between md:-translate-y-2">
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-cyan-400 text-[#0E0C0A] font-extrabold flex items-center justify-center text-sm shadow-md">
                    02
                  </span>
                  <Monitor className="w-5 h-5 text-cyan-300" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                  La orden entra directo a cocina
                </h3>
                <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-normal">
                  Al confirmar la compra, la comanda aparece al instante en el KDS
                  de cocina organizada por orden de llegada. Eliminas papeles
                  perdidos, evitas errores de transcripción y reduces tiempos de
                  espera.
                </p>
              </div>
              <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-white/10 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                Sincronización Instantánea KDS
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-cyan-400/20 text-cyan-300 font-bold flex items-center justify-center text-sm border border-cyan-400/30">
                    03
                  </span>
                  <BarChart3 className="w-5 h-5 text-cyan-300/70" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                  Control de caja y resultados
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                  Supervisa mesas disponibles y ocupadas en vivo, cierra cuentas
                  y revisa el desglose exacto de ingresos (efectivo, POS o
                  transferencias) protegido por PIN de seguridad.
                </p>
              </div>
              <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-white/10 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                Métricas Financieras en Vivo
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/10 via-white/[0.04] to-cyan-950/30 backdrop-blur-xl border border-cyan-400/30 shadow-2xl mb-10 sm:mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-10 items-center">
              <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Nueva App Móvil del Cliente</span>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white leading-tight">
                  Tu propia App de pedidos sin descargas ni comisiones por venta
                </h3>
                <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                  Entrega a tus clientes una plataforma moderna con tu propia
                  identidad visual. Pueden ver platos destacados, acumular puntos,
                  elegir retiro en local o delivery y finalizar su pedido en
                  segundos.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1 sm:pt-2">
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0E0C0A]/60 border border-white/10">
                    <h4 className="text-sm font-bold text-white mb-1">
                      Retiro en Local y Delivery
                    </h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Carrito inteligente integrado para gestionar pedidos para
                      llevar, despacho a domicilio o consumo en sala.
                    </p>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0E0C0A]/60 border border-white/10">
                    <h4 className="text-sm font-bold text-white mb-1">
                      Personalización Visual Total
                    </h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Adapta colores, logotipo, banners promocionales y enlaces
                      directos a WhatsApp, Instagram o Google Reviews.
                    </p>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0E0C0A]/60 border border-white/10">
                    <h4 className="text-sm font-bold text-white mb-1">
                      Carta Digital Multi-Vista
                    </h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Organiza categorías, destaca tus platos más pedidos y
                      alterna entre vista clásica, moderna o tarjetas.
                    </p>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0E0C0A]/60 border border-white/10">
                    <h4 className="text-sm font-bold text-white mb-1">
                      Saldo de Puntos y Recompensas
                    </h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Cada pedido suma Mogu Puntos visibles en el perfil del
                      cliente para incentivar compras recurrentes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#0E0C0A]/85 border border-white/15 space-y-5 sm:space-y-6">
                <div className="border-b border-white/10 pb-3 sm:pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                    Resultados en tu Negocio
                  </span>
                  <h4 className="text-base sm:text-lg font-extrabold text-white mt-1">
                    Por qué los locales migran a Mogu
                  </h4>
                </div>

                <ul className="space-y-3.5 sm:space-y-4 text-xs text-white/85">
                  <li className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">
                        0% comisiones por pedido
                      </strong>
                      <span className="text-white/70">
                        A diferencia de las apps tradicionales de reparto, el
                        margen completo de cada venta queda en tu local.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">
                        Autogestión en segundos
                      </strong>
                      <span className="text-white/70">
                        Si un producto se agota, lo ocultas desde tu celular o
                        computador y desaparece al instante de la carta.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">
                        Un solo sistema modular
                      </strong>
                      <span className="text-white/70">
                        Reemplaza comanderos antiguos, cartas PDF estáticas y
                        planillas manuales por un ecosistema conectado.
                      </span>
                    </div>
                  </li>
                </ul>

                <div className="pt-1 sm:pt-2">
                  <Link
                    href="/checkout/mogu-start"
                    className="group w-full min-h-[44px] py-3.5 px-6 rounded-xl bg-white hover:bg-slate-100 active:scale-[0.99] text-[#0E0C0A] text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>Crea tu perfil digital gratis</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    Cocina
                  </span>
                  <Monitor className="w-4 h-4 text-white/40" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-white mt-3 sm:mt-4 mb-2">
                  KDS Cocina en Tiempo Real
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Pantalla de gestión de platos que recibe comandas de salón,
                  retiro y delivery al instante. Ordena prioridades y agiliza el
                  despacho.
                </p>
              </div>
              <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">
                01 / KDS DISPLAY
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    Salón y Caja
                  </span>
                  <LayoutGrid className="w-4 h-4 text-white/40" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-white mt-3 sm:mt-4 mb-2">
                  Control de Caja y Mesas en Vivo
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Visualiza en tiempo real qué mesas están disponibles, ocupadas o
                  listas para cobrar, conectando garzones y caja sin demoras.
                </p>
              </div>
              <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">
                02 / LIVE FLOOR & POS
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    Mesas Inteligentes
                  </span>
                  <QrCode className="w-4 h-4 text-white/40" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-white mt-3 sm:mt-4 mb-2">
                  Gestión de QRs y Etiquetas NFC
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Administra mesas físicas y obtén códigos QR únicos y enlaces
                  NFC para tótems de mesa con identificación automática.
                </p>
              </div>
              <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">
                03 / QR & NFC MANAGER
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    Finanzas
                  </span>
                  <BarChart3 className="w-4 h-4 text-white/40" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-white mt-3 sm:mt-4 mb-2">
                  Métricas y Desglose de Ventas
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Historial analítico en vivo con ventas totales separadas por
                  efectivo, tarjeta POS y transferencias por mesa y hora.
                </p>
              </div>
              <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">
                04 / SALES ANALYTICS
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    Seguridad
                  </span>
                  <Lock className="w-4 h-4 text-white/40" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-white mt-3 sm:mt-4 mb-2">
                  Acceso Administrador por PIN
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Protege la información financiera, configuraciones críticas y
                  cierres de caja mediante PIN numérico exclusivo.
                </p>
              </div>
              <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">
                05 / ADMIN SECURITY
              </div>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    Autogestión
                  </span>
                  <Sliders className="w-4 h-4 text-white/40" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-white mt-3 sm:mt-4 mb-2">
                  Editor Visual en Tiempo Real
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Personaliza colores, banners, enlaces oficiales y previsualiza
                  en vivo cómo lucirá tu app en el celular del cliente.
                </p>
              </div>
              <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">
                06 / LIVE STUDIO
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECCIÓN MOGU TRAVEL
           ===================================================================== */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-28 relative z-25 border-t border-white/15">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-3 sm:space-y-4">
            <span className="text-[10px] sm:text-xs font-black uppercase px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-400/30 tracking-widest shadow-lg">
              Comunidad Global Mogu Travel
            </span>
            <h2 className="text-2xl sm:text-5xl font-black text-white tracking-tight">
              Una red internacional que conecta viajeros y locales
            </h2>
            <p className="text-xs sm:text-base text-white/70 leading-relaxed font-normal">
              Mogu Travel no es solo fidelización; es una comunidad en
              movimiento. Explora el ecosistema de pasaportes digitales, timbres
              oficiales y beneficios en cada ciudad y local aliado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 max-w-5xl mx-auto">
            <div className="group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-purple-950/40 via-[#141416] to-[#141416] border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
              <div className="space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Stamp className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-purple-300 transition-colors">
                  Pasaporte Digital del Viajero
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                  Visualiza tu perfil de viajero, rango actual, puntos
                  acumulados y la grilla con todos los timbres oficiales
                  desbloqueados al pagar en locales aliados alrededor del mundo.
                </p>
              </div>

              <div className="pt-6 sm:pt-8">
                <Link
                  href="/travel/passport"
                  className="w-full min-h-[44px] py-3.5 px-6 rounded-2xl bg-purple-600/20 hover:bg-purple-600 active:scale-[0.99] text-purple-200 hover:text-white border border-purple-500/40 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Abrir mi Pasaporte</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            <div className="group p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-cyan-950/40 via-[#141416] to-[#141416] border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
              <div className="space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Compass className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                  Red Global de Aliados y Nómadas
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                  Descubre cómo los cafés, restaurantes y hostels se conectan a
                  través de Mogu Travel para ofrecer experiencias
                  transfronterizas y recompensas exclusivas.
                </p>
              </div>

              <div className="pt-6 sm:pt-8">
                <Link
                  href="/travel"
                  className="w-full min-h-[44px] py-3.5 px-6 rounded-2xl bg-cyan-600/20 hover:bg-cyan-500 active:scale-[0.99] text-cyan-200 hover:text-black border border-cyan-500/40 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Explorar la Red</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            COMPONENTE INTERACTIVO DE PRECIOS Y PLANES (MENSUAL / ANUAL)
           ===================================================================== */}
        <div id="planes" className="scroll-mt-24 relative z-20">
          <PricingSection
            startPlan={startPlan}
            monthlyPlans={DEFAULT_MONTHLY_PLANS}
            annualPlans={DEFAULT_ANNUAL_PLANS}
          />
        </div>

        {/* =====================================================================
            TESTIMONIOS
           ===================================================================== */}
        <section
          id="testimonios"
          className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-28 relative z-20 border-t border-white/15"
        >
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase bg-white/10 text-cyan-300 px-3.5 py-1.5 rounded-full border border-white/20 shadow-sm">
              Casos de Éxito
            </span>
            <h2 className="text-2xl sm:text-5xl font-extrabold text-white mt-3 sm:mt-4 tracking-tight">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-[#D4CEC7] text-xs sm:text-base font-normal mt-2 sm:mt-3">
              Locales gastronómicos y cafeterías que ya conectaron su operación
              interna con Mogu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed italic">
                  &ldquo;La integración entre los garzones y la caja cambió por
                  completo nuestro ritmo de atención. Los pedidos entran limpios y
                  ordenados en tiempo real.&rdquo;
                </p>
              </div>
              <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center font-bold text-white text-xs shrink-0">
                  CR
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Carlos Ramírez</h4>
                  <span className="text-[10px] text-cyan-300 font-medium">
                    Café y Bistró Santiago
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed italic">
                  &ldquo;Poder actualizar la carta de productos al instante y
                  ofrecer la comunidad de Mogu Travel y Mogu Puntos nos da una
                  retención de clientes increíble.&rdquo;
                </p>
              </div>
              <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center font-bold text-white text-xs shrink-0">
                  FV
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Fernanda Valenzuela
                  </h4>
                  <span className="text-[10px] text-cyan-300 font-medium">
                    Cafetería de Especialidad
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed italic">
                  &ldquo;Tener el control centralizado de la administración y la
                  visualización de pedidos para el cliente final ha optimizado
                  nuestro servicio de forma única.&rdquo;
                </p>
              </div>
              <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center font-bold text-white text-xs shrink-0">
                  MS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Matías Soto</h4>
                  <span className="text-[10px] text-cyan-300 font-medium">
                    Gastronomía y Eventos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            CÓMO FUNCIONA
           ===================================================================== */}
        <section
          id="como-funciona"
          className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-28 relative z-20 border-t border-white/15"
        >
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase bg-white/10 text-cyan-300 px-3.5 py-1.5 rounded-full border border-white/20 shadow-sm">
              Implementación Rápida
            </span>
            <h2 className="text-2xl sm:text-5xl font-extrabold text-white mt-3 sm:mt-4 tracking-tight">
              Simple para el equipo, impecable para el cliente
            </h2>
            <p className="text-[#D4CEC7] text-xs sm:text-base font-normal mt-2 sm:mt-3">
              Conecta tu local al sistema operativo de Mogu en pocos minutos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-lg">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 text-cyan-400 font-bold flex items-center justify-center text-sm mb-4 sm:mb-6 border border-white/20 shadow-inner">
                01
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                Configura tu Local
              </h3>
              <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed">
                Registra tu negocio, define tu menú o catálogo interactivo y
                establece los accesos para caja y garzones.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-lg">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 text-cyan-400 font-bold flex items-center justify-center text-sm mb-4 sm:mb-6 border border-white/20 shadow-inner">
                02
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                Sincroniza Operación
              </h3>
              <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed">
                Conecta las comandas del salón directo con la caja y mantén las
                métricas en tiempo real actualizadas.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-lg">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 text-cyan-400 font-bold flex items-center justify-center text-sm mb-4 sm:mb-6 border border-white/20 shadow-inner">
                03
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                Fideliza y Escala
              </h3>
              <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed">
                Integra a tus clientes a Mogu Puntos y formen parte de la
                comunidad global de Mogu Travel.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================================
            FAQ
           ===================================================================== */}
        <section
          id="faq"
          className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-28 relative z-20 border-t border-white/15 scroll-mt-24"
        >
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase bg-white/10 text-cyan-300 px-3.5 py-1.5 rounded-full border border-white/20 shadow-sm">
              Resolución de Dudas
            </span>
            <h2 className="text-2xl sm:text-5xl font-extrabold text-white mt-3 sm:mt-4 tracking-tight">
              Preguntas Frecuentes
            </h2>
            <p className="text-[#D4CEC7] text-xs sm:text-base font-normal mt-2 sm:mt-3">
              Todo lo que necesitas saber sobre pedidos con retiro y delivery,
              operación interna y la comunidad Mogu Travel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30"
              >
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 sm:mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                    {faq.answer}
                  </p>
                </div>
                <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">
                  FAQ 0{idx + 1} / MOGU
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================================
            FOOTER
           ===================================================================== */}
        <footer className="border-t border-white/15 py-10 sm:py-12 px-4 sm:px-6 bg-[#0E0C0A]/90 relative z-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center">
                <img
                  src="/logo-mogu.png"
                  alt="Mogu Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-black tracking-widest text-white">
                MOGU<span className="text-cyan-400">.</span> SpA
              </span>
            </div>

            <p className="text-xs text-white/60">
              &copy; {new Date().getFullYear()} Mogu SpA. Todos los derechos
              reservados.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-medium text-white/80">
              <Link
                href="/cafeterias"
                className="py-1 transition hover:text-cyan-300"
              >
                Cafés y Restaurantes
              </Link>
              <Link
                href="/comida-rapida"
                className="py-1 transition hover:text-cyan-300"
              >
                Comida Rápida
              </Link>
              <Link href="/travel" className="py-1 transition hover:text-cyan-300">
                Mogu Travel
              </Link>
              <Link href="/login" className="py-1 transition hover:text-cyan-300">
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}