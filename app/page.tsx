
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import PhoneMockup from '@/components/PhoneMockup'

export const revalidate = 0

interface Plan {
  id: string
  name: string
  slug: string
  price: number
  original_price: number | null
  badge: string | null
  interval: string
  features: string[]
}

async function getPlans(): Promise<Plan[]> {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })

    if (error) {
      console.error('Error cargando planes Cloud:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Error de conexión planes:', err)
    return []
  }
}

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function Home() {
  const planes = await getPlans()

  return (
    <div style={{ backgroundColor: '#0E0C0A', color: '#D4CEC7', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }} className="font-sans">
      
      {/* 🌟 HERO & FULL-PAGE GRADIENT ESTILO REMOTE (MANTENIDO EN TODA LA PÁGINA) */}
      <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-[#4c1d95] via-[#1e40af] to-[#0E0C0A] opacity-90 pointer-events-none -z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-gradient-to-r from-purple-500/15 via-cyan-400/15 to-blue-600/15 blur-[160px] pointer-events-none -z-0" />

      <div className="relative z-10">
        
        {/* 1. HEADER / NAVBAR (ESTILO REMOTE GLASS PILL) */}
        <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl px-6 py-3.5 flex items-center justify-between z-50 bg-[#0E0C0A]/80 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center shadow-inner group-hover:border-white/40 transition">
              <img 
                src="/logo-mogu.png" 
                alt="Mogu Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
            <span className="text-lg font-black tracking-widest text-white">
              MOGU<span className="text-cyan-400">.</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-white/80 md:flex">
            <Link href="#ecosistema" className="transition hover:text-white">Plataforma Cloud</Link>
            <Link href="#testimonios" className="transition hover:text-white">Opiniones</Link>
            <Link href="#como-funciona" className="transition hover:text-white">¿Cómo funciona?</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-xs font-semibold text-white/80 hover:text-white transition">
              Iniciar Sesión
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2 bg-white hover:bg-slate-100 text-[#0E0C0A] text-xs font-bold rounded-xl transition shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] flex items-center gap-1.5"
            >
              Crear mi Perfil 🚀
            </Link>
          </div>
        </header>

        {/* 2. HERO SECTION CON ESTÉTICA REMOTE */}
        <section className="relative overflow-hidden px-6 pt-36 pb-24 md:pt-44 md:pb-32">
          
          {/* WORDMARK / TÍTULO GIGANTE ESTILO "REMOTE" */}
          <div className="mx-auto max-w-7xl text-center mb-6 select-none">
            <h2 className="text-6xl sm:text-8xl lg:text-[10rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-cyan-100 uppercase opacity-95 leading-none">
              mogu
            </h2>
          </div>

          <div className="mx-auto max-w-5xl text-center space-y-6 relative z-20">
            
            {/* TÍTULO PRINCIPAL CON DEGRADADO COMPLETO */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-teal-200 leading-[1.08] drop-shadow-md">
              El sistema operativo digital <br className="hidden sm:block" />
              para tu negocio global.
            </h1>

            {/* SUBTÍTULO */}
            <p className="text-base sm:text-lg text-white/95 max-w-2xl mx-auto font-normal leading-relaxed">
              Una plataforma integral para menús digitales, catálogos interactivos y gestión en tiempo real. Disponible en todo Chile.
            </p>

            {/* BOTONES DUALES ESTILO REMOTE */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto rounded-xl bg-white hover:bg-slate-100 px-8 py-4 text-xs font-bold uppercase tracking-wider text-[#0E0C0A] transition-all text-center shadow-2xl border border-white/20 hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                Comenzar ahora →
              </Link>
              <Link
                href="#ecosistema"
                className="w-full sm:w-auto rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white transition-all text-center backdrop-blur-md"
              >
                Ver Planes Cloud
              </Link>
            </div>

          </div>

          {/* MOCKUP FLOTANTE */}
          <div className="mt-16 flex justify-center relative z-25">
            <PhoneMockup />
          </div>

        </section>

        {/* 3. TARJETAS DE CARACTERÍSTICAS / BENEFICIOS (ESTILO GLASSMORPHISM UNIFICADO) */}
        <section className="mx-auto max-w-7xl px-6 py-20 relative z-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">SaaS</span>
                <h3 className="text-lg font-extrabold text-white mt-4 mb-2">Perfil institucional centralizado</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Rely on our platform to make sure your brand gets noticed everywhere online.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">01 / MOGU CORE</div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">Digital</span>
                <h3 className="text-lg font-extrabold text-white mt-4 mb-2">Menú QR & Catálogos NFC</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Local compliance, interactive menus, and real-time updates for your customers.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">02 / INTERACTIVE</div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">Velocidad</span>
                <h3 className="text-lg font-extrabold text-white mt-4 mb-2">Actualizaciones instantáneas</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Hire and manage your products effortlessly through cloud infrastructure.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">03 / REAL-TIME</div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between transition hover:border-white/30">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">Soporte</span>
                <h3 className="text-lg font-extrabold text-white mt-4 mb-2">Asistencia técnica 24/7</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Connect your business tools via our secure backend and dedicated expert team.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] font-bold text-white/40">04 / SUPPORT</div>
            </div>

          </div>
        </section>

        {/* 4. PLANES ANUALES MOGU.CL */}
        <section id="ecosistema" className="mx-auto max-w-7xl px-6 py-28 relative z-20 border-t border-white/15">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest uppercase bg-white/10 text-cyan-300 px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
              Planes Anuales Mogu.cl
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">Planes de Ecosistema Digital</h2>
            <p className="text-[#D4CEC7] text-sm md:text-base font-normal mt-3">
              Selecciona el plan perfecto para tu marca con diseño editorial de alta gama y gestión en tiempo real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
            
            {/* PLAN BÁSICO */}
            <div className="p-8 rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/15 flex flex-col justify-between transition-all hover:border-white/30 shadow-xl">
              <div>
                <span className="text-[10px] font-bold uppercase px-3.5 py-1 rounded-full bg-white/10 text-white tracking-wider">
                  Plan Básico
                </span>
                <h3 className="text-2xl font-bold text-white mt-4">Plan Básico</h3>
                <p className="text-3xl font-extrabold text-white mt-2">
                  {formatPrice(39900)}
                </p>
                <span className="text-xs text-[#D4CEC7] block font-medium mt-1">+ IVA / pago anual</span>
                
                <ul className="space-y-3.5 mt-6 text-xs font-normal text-white">
                  <li className="flex items-center gap-2.5">
                    <span className="text-cyan-400 font-bold">✓</span> Perfil institucional Mogu
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-cyan-400 font-bold">✓</span> Ubicación y Redes Sociales
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-cyan-400 font-bold">✓</span> Horarios de atención
                  </li>
                  <li className="flex items-center gap-2.5 text-white/30 line-through pt-1">
                    <span>—</span> Carta / Menú digital QR
                  </li>
                  <li className="flex items-center gap-2.5 text-white/30 line-through pt-1">
                    <span>—</span> Catálogo interactivo
                  </li>
                  <li className="flex items-center gap-2.5 text-white/30 line-through pt-1">
                    <span>—</span> Tarjeta de fidelización
                  </li>
                </ul>
              </div>

              <Link
                href="/login"
                className="w-full mt-8 py-3.5 text-xs font-bold uppercase tracking-wider rounded-2xl bg-white/10 hover:bg-white hover:text-[#0E0C0A] text-white text-center transition-all border border-white/20 shadow-md"
              >
                Elegir Plan Básico →
              </Link>
            </div>

            {/* PLAN PRO (MÁS POPULAR) */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-xl border-2 border-cyan-400 shadow-[0_0_50px_-10px_rgba(6,182,212,0.4)] relative flex flex-col justify-between md:-translate-y-3">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[10px] font-extrabold uppercase px-4 py-1.5 rounded-full tracking-widest shadow-lg">
                  ⭐ MÁS POPULAR
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase px-3.5 py-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 tracking-wider">
                  Plan Pro
                </span>
                <h3 className="text-2xl font-bold text-white mt-4">Plan Pro</h3>
                <p className="text-3xl font-extrabold text-white mt-2">
                  {formatPrice(79900)}
                </p>
                <span className="text-xs text-[#D4CEC7] block font-medium mt-1">+ IVA / pago anual</span>
                
                <ul className="space-y-3.5 mt-6 text-xs font-normal text-white">
                  <li className="flex items-center gap-2.5">
                    <span className="text-cyan-400 font-bold">✓</span> Perfil institucional Mogu
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-cyan-400 font-bold">✓</span> Carta o Menú Digital QR/NFC
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-cyan-400 font-bold">✓</span> Actualizaciones ilimitadas
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-cyan-400 font-bold">✓</span> Gestión de promociones
                  </li>
                  <li className="flex items-center gap-2.5 text-white/30 line-through pt-1">
                    <span>—</span> Catálogo interactivo
                  </li>
                  <li className="flex items-center gap-2.5 text-white/30 line-through pt-1">
                    <span>—</span> Tarjeta de fidelización
                  </li>
                </ul>
              </div>

              <Link
                href="/login"
                className="w-full mt-8 py-3.5 text-xs font-bold uppercase tracking-wider rounded-2xl bg-white hover:bg-slate-100 text-[#0E0C0A] text-center transition-all shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-[1.02]"
              >
                Elegir Plan Pro →
              </Link>
            </div>

            {/* PLAN EMPRESA */}
            <div className="p-8 rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/15 flex flex-col justify-between transition-all hover:border-white/30 shadow-xl">
              <div>
                <span className="text-[10px] font-bold uppercase px-3.5 py-1 rounded-full bg-white/10 text-white tracking-wider">
                  Plan Empresa
                </span>
                <h3 className="text-2xl font-bold text-white mt-4">Plan Empresa</h3>
                <p className="text-3xl font-extrabold text-white mt-2">
                  {formatPrice(119900)}
                </p>
                <span className="text-xs text-[#D4CEC7] block font-medium mt-1">+ IVA / pago anual</span>
                
                <ul className="space-y-3.5 mt-6 text-xs font-normal text-white">
                  <li className="flex items-center gap-2.5">
                    <span className="text-cyan-400 font-bold">✓</span> Perfil institucional Mogu
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-cyan-400 font-bold">✓</span> Carta o Menú Digital QR/NFC
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-cyan-400 font-bold">✓</span> Catálogo completo de productos
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-cyan-400 font-bold">✓</span> Tarjeta de Fidelización
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-cyan-400 font-bold">✓</span> Soporte Prioritario 24/7
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-cyan-400 font-bold">✓</span> Métricas de escaneo
                  </li>
                </ul>
              </div>

              <Link
                href="/login"
                className="w-full mt-8 py-3.5 text-xs font-bold uppercase tracking-wider rounded-2xl bg-white/10 hover:bg-white hover:text-[#0E0C0A] text-white text-center transition-all border border-white/20 shadow-md"
              >
                Elegir Plan Empresa →
              </Link>
            </div>

          </div>
        </section>

        {/* 5. SECCIÓN DE TESTIMONIOS / USUARIOS SATISFECHOS */}
        <section id="testimonios" className="mx-auto max-w-7xl px-6 py-28 relative z-20 border-t border-white/15">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest uppercase bg-white/10 text-cyan-300 px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
              Casos de Éxito
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">Lo que dicen nuestros clientes</h2>
            <p className="text-[#D4CEC7] text-sm md:text-base font-normal mt-3">
              Negocios gastronómicos y comerciales que ya transformaron su experiencia digital con Mogu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            <div className="p-8 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 text-sm mb-4">★★★★★</div>
                <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed italic">
                  &ldquo;Implementar el menú digital con Mogu cambió por completo la dinámica de nuestro local. Los clientes escanean el QR y piden de forma inmediata. ¡Increíble soporte!&rdquo;
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center font-bold text-white text-xs">
                  CR
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Carlos Ramírez</h4>
                  <span className="text-[10px] text-cyan-300 font-medium">Café & Bistró Santiago</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 text-sm mb-4">★★★★★</div>
                <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed italic">
                  &ldquo;La interfaz es súper elegante y profesional. Nos da una presencia de marca increíble frente a nuestra competencia y podemos actualizar precios en segundos.&rdquo;
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center font-bold text-white text-xs">
                  FV
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Fernanda Valenzuela</h4>
                  <span className="text-[10px] text-cyan-300 font-medium">Boutique & Showroom</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 text-sm mb-4">★★★★★</div>
                <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed italic">
                  &ldquo;Tener todo centralizado en un perfil inteligente con WhatsApp y catálogos enlazados nos ha ayudado a cerrar muchísimas más ventas este año. 100% recomendado.&rdquo;
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center font-bold text-white text-xs">
                  MS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Matías Soto</h4>
                  <span className="text-[10px] text-cyan-300 font-medium">Gastronomía & Eventos</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 6. SECCIÓN: ¿CÓMO FUNCIONA? */}
        <section id="como-funciona" className="mx-auto max-w-7xl px-6 py-28 relative z-20 border-t border-white/15">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest uppercase bg-white/10 text-cyan-300 px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
              Tecnología Web App
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">Simple para ti, impecable para tus clientes</h2>
            <p className="text-[#D4CEC7] text-sm md:text-base font-normal mt-3">
              Lanza tu ecosistema digital en menos de 5 minutos y edítalo cuantas veces quieras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="p-8 rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-cyan-400 font-bold flex items-center justify-center text-sm mb-6 border border-white/20 shadow-inner">01</div>
              <h3 className="text-lg font-bold text-white mb-2">Crea tu Cuenta</h3>
              <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed">
                Elige tu enlace personalizado y configura el estilo visual de tu perfil o carta interactiva.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-cyan-400 font-bold flex items-center justify-center text-sm mb-6 border border-white/20 shadow-inner">02</div>
              <h3 className="text-lg font-bold text-white mb-2">Publica y Comparte</h3>
              <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed">
                Añade tus platos, servicios y redes sociales. Compártelo en Instagram, WhatsApp o código QR.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-cyan-400 font-bold flex items-center justify-center text-sm mb-6 border border-white/20 shadow-inner">03</div>
              <h3 className="text-lg font-bold text-white mb-2">Crece sin Límites</h3>
              <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed">
                Actualiza precios e información al instante desde cualquier celular o computador.
              </p>
            </div>
          </div>
        </section>

        {/* 7. FOOTER */}
        <footer id="contacto" className="border-t border-white/15 bg-[#0E0C0A]/80 backdrop-blur-md py-12 relative z-20">
          <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <span className="text-lg font-black text-white tracking-widest">MOGU<span className="text-cyan-400">.</span></span>
              <p className="mt-1 text-xs text-[#D4CEC7] font-medium">
                © {new Date().getFullYear()} Mogu SpA. Todos los derechos reservados. Cumplimiento Ley N° 19.496.
              </p>
            </div>
            <div className="flex gap-6 text-xs font-medium text-white/90">
              <Link href="/terminos" className="hover:text-white transition">Términos</Link>
              <Link href="/privacidad" className="hover:text-white transition">Privacidad</Link>
              <Link href="/soporte" className="hover:text-white transition">Soporte</Link>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}