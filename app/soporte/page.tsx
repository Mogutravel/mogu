import React from 'react'
import Link from 'next/link'

export default function SoportePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white font-sans selection:bg-emerald-500/35 selection:text-emerald-300 flex flex-col justify-between">
      
      {/* NAVBAR */}
      <header className="border-b border-neutral-900 bg-[#0A0A0C]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-lg font-black tracking-wider text-white">
            MOGU<span className="text-emerald-500">.</span>
          </Link>
          <Link
            href="/"
            className="text-xs text-neutral-400 hover:text-white transition font-medium"
          >
            ← Volver al Inicio
          </Link>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-3xl mx-auto px-6 py-12 flex-1 space-y-10">
        
        {/* ENCABEZADO */}
        <div className="space-y-3 border-b border-neutral-800 pb-6">
          <span className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest rounded-full">
            Centro de Ayuda y Experiencia al Cliente
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Soporte y Contacto Oficial MOGU
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Estamos aquí para acompañarte. Nuestro equipo de atención al cliente está disponible para resolver cualquier duda sobre tus tarjetas NFC, perfiles digitales o pedidos en Chile.
          </p>
        </div>

        {/* 1. CANALES OFICIALES Y HORARIOS */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>🕒</span> 1. Canales Oficiales y Horarios de Atención
          </h2>
          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-xl space-y-2 text-xs text-neutral-300">
            <p><strong className="text-white">Correo Electrónico de Soporte:</strong> contacto@mogu.cl</p>
            <p><strong className="text-white">Horario Continuo (Chile Continental):</strong> Lunes a Viernes de 09:00 a 18:00 hrs.</p>
            <p><strong className="text-white">Plazo Máximo de Respuesta Comprometido:</strong> Entre <span className="text-emerald-400 font-bold">24 a 48 horas hábiles</span> para cualquier solicitud, requerimiento o reclamo.</p>
          </div>
        </section>

        {/* 2. PROCEDIMIENTO PASO A PASO PARA RECLAMOS */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>⚙️</span> 2. ¿Cómo ingresar un reclamo o incidencia?
          </h2>
          <p className="text-xs text-neutral-400">
            Si tuviste un inconveniente con un pedido retrasado, incompleto o un producto defectuoso, sigue estos sencillos pasos:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-2">
              <span className="text-emerald-400 font-black text-sm">Paso 1</span>
              <h3 className="text-xs font-bold text-white">Escríbenos</h3>
              <p className="text-[11px] text-neutral-400">Envía un correo a contacto@mogu.cl detallando tu número de pedido y el motivo de tu contacto.</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-2">
              <span className="text-emerald-400 font-black text-sm">Paso 2</span>
              <h3 className="text-xs font-bold text-white">Adjunta Evidencia</h3>
              <p className="text-[11px] text-neutral-400">Si el producto presenta daños o fallas, incluye fotografías o videos cortos que nos ayuden a validarlo rápidamente.</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-2">
              <span className="text-emerald-400 font-black text-sm">Paso 3</span>
              <h3 className="text-xs font-bold text-white">Resolución</h3>
              <p className="text-[11px] text-neutral-400">Nuestro equipo procesará tu caso y te dará una respuesta formal dentro del plazo de 24 a 48 horas hábiles.</p>
            </div>
          </div>
        </section>

        {/* 3. PREGUNTAS FRECUENTES (FAQ) */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>❓</span> 3. Preguntas Frecuentes (FAQ)
          </h2>
          
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-1.5">
              <h3 className="font-bold text-white">¿Cuál es el estado y plazo de despacho de mi tarjeta NFC?</h3>
              <p className="text-neutral-400 leading-relaxed">
                Los envíos físicos se realizan a todo Chile a través de operadores logísticos asociados. El plazo estimado de entrega varía entre 3 a 7 días hábiles dependiendo de la región de destino. Recibirás actualizaciones de seguimiento en tu correo.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-1.5">
              <h3 className="font-bold text-white">¿Cómo funcionan los reembolsos y la anulación de compras?</h3>
              <p className="text-neutral-400 leading-relaxed">
                Las solicitudes de anulación y reembolso se evalúan caso a caso conforme a la Ley del Consumidor. Ten en cuenta que las tarjetas físicas personalizadas con el logo y diseño exclusivo de la PyME están excluidas del derecho de retracto por tratarse de bienes confeccionados a medida. Si hay un error de fabricación, opera plenamente la garantía legal.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-1.5">
              <h3 className="font-bold text-white">¿Qué hago si mi tarjeta NFC no lee correctamente?</h3>
              <p className="text-neutral-400 leading-relaxed">
                Asegúrate de acercar la tarjeta a la parte superior trasera de los teléfonos compatibles (la gran mayoría de smartphones modernos tienen el lector NFC en esa zona). Si el problema persiste o presenta defectos físicos, escríbenos a contacto@mogu.cl para activar la reposición por garantía legal de 6 meses.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-900 py-8 text-center text-neutral-500 text-[11px] space-y-2">
        <div className="flex justify-center space-x-6">
          <Link href="/terminos" className="hover:text-emerald-400 transition">Términos y Condiciones</Link>
          <Link href="/privacidad" className="hover:text-emerald-400 transition">Política de Privacidad</Link>
          <Link href="/soporte" className="hover:text-emerald-400 transition">Soporte</Link>
        </div>
        <p>© 2026 Mogu SpA. Todos los derechos reservados.</p>
      </footer>

    </div>
  )
}