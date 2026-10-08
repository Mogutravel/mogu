import React from 'react'
import Link from 'next/link'

export default function TerminosPage() {
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
      <main className="max-w-3xl mx-auto px-6 py-12 flex-1 space-y-8">
        
        <div className="space-y-3 border-b border-neutral-800 pb-6">
          <span className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest rounded-full">
            Marco Legal Chile • Ley N° 19.496
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Términos y Condiciones de Uso y Contratación
          </h1>
          <p className="text-xs text-neutral-400">
            Última actualización: Octubre de 2026
          </p>
        </div>

        <div className="space-y-6 text-xs text-neutral-300 leading-relaxed">
          <p>
            Bienvenido a <strong className="text-white">mogu.cl</strong> (en adelante, el "Sitio Web" o "MOGU"), plataforma operada por <strong className="text-white">Mogu SpA</strong>. Los presentes Términos y Condiciones regulan el acceso, navegación y uso del sitio web, así como la contratación de nuestros servicios de perfiles digitales inteligentes (SaaS) y la adquisición de tarjetas físicas con tecnología NFC para PyMEs y profesionales en Chile.
          </p>
          <p>
            El uso del sitio web, la creación de una cuenta o la contratación de servicios implica la aceptación expresa, informada y sin reservas de los presentes Términos y Condiciones, los cuales se ajustan estricta y rigurosamente a la <strong className="text-white">Ley N° 19.496 sobre Protección de los Derechos de los Consumidores</strong> y al marco normativo chileno vigente sobre comercio electrónico.
          </p>

          <section className="space-y-2 pt-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Identificación de la Empresa (Proveedor)
            </h2>
            <p>De conformidad con las exigencias del comercio electrónico en Chile, se señalan los datos de identificación del proveedor del servicio:</p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-400">
              <li><strong className="text-neutral-200">Razón Social:</strong> Mogu SpA</li>
              <li><strong className="text-neutral-200">R.U.T.:</strong> [Insertar RUT de la empresa]</li>
              <li><strong className="text-neutral-200">Domicilio Legal:</strong> [Insertar dirección comercial, Santiago, Chile]</li>
              <li><strong className="text-neutral-200">Correo Electrónico de Contacto:</strong> contacto@mogu.cl</li>
            </ul>
          </section>

          <section className="space-y-2 pt-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              2. Proceso de Compra, Contratación y Validación del Consentimiento
            </h2>
            <p>
              Para adquirir productos o contratar servicios en MOGU, el usuario deberá seguir el flujo electrónico establecido en el Sitio Web (selección de plan, registro de datos de la PyME, revisión de condiciones y aceptación explícita de estos Términos previo al pago).
            </p>
            <p>
              <strong className="text-white">Formación del Consentimiento:</strong> Toda transacción quedará sujeta a la condición suspensiva de validación de identidad y disponibilidad. Una vez validada, MOGU enviará una confirmación escrita al correo electrónico registrado, momento en el cual se entenderá perfeccionado el contrato.
            </p>
          </section>

          <section className="space-y-2 pt-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              3. Despacho, Entrega de Productos y Activación de Servicios
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
              <li><strong className="text-neutral-200">Servicios Digitales:</strong> La activación del panel y perfil público se realiza de forma inmediata tras el registro y la validación del periodo de prueba o suscripción.</li>
              <li><strong className="text-neutral-200">Productos Físicos (Tarjetas NFC):</strong> Los despachos se realizan dentro de Chile a través de operadores logísticos externos en un plazo estimado de 3 a 7 días hábiles. Los costos de envío se informan de manera desglosada antes de finalizar el pago.</li>
            </ul>
          </section>

          <section className="space-y-2 pt-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              4. Derecho de Retracto
            </h2>
            <p>
              De acuerdo con el artículo 3 bis letra b) de la Ley N° 19.496, el consumidor <strong className="text-white">no dispondrá</strong> del derecho de retracto en:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-neutral-400">
              <li>Servicios digitales o de software cuya ejecución haya comenzado con el consentimiento expreso del usuario.</li>
              <li>Bienes confeccionados a medida o personalizados (como las tarjetas físicas NFC con logotipos, nombres o diseños exclusivos de cada PyME).</li>
            </ol>
          </section>

          <section className="space-y-2 pt-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              5. Políticas de Cambios, Devoluciones y Garantía Legal
            </h2>
            <p>
              MOGU se apega estrictamente a la <strong className="text-white">Garantía Legal de 6 meses</strong> de la Ley N° 19.496. Si la tarjeta NFC presenta fallas de fábrica o defectos de material, el cliente podrá optar dentro de los 6 meses siguientes a su recepción por la reparación gratuita, reposición/cambio o la devolución del dinero. La garantía no cubre daños por maltrato físico o uso negligente. Para solicitudes, escribir a contacto@mogu.cl.
            </p>
          </section>

          <section className="space-y-2 pt-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              6. Propiedad Intelectual y Uso del Sitio
            </h2>
            <p>
              Todos los contenidos de mogu.cl (textos, software, diseños, marcas) son propiedad exclusiva de Mogu SpA o de terceros licenciantes. Queda prohibida su reproducción no autorizada. El usuario se compromete a hacer un uso lícito y de buena fe de la plataforma.
            </p>
          </section>

          <section className="space-y-2 pt-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              7. Legislación Aplicable y Jurisdicción
            </h2>
            <p>
              Estos Términos y Condiciones se rigen por las leyes de la República de Chile. Cualquier controversia será sometida a los tribunales ordinarios de justicia competentes conforme a la normativa de protección al consumidor.
            </p>
          </section>

        </div>

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