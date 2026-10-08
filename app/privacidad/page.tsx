import React from 'react'
import Link from 'next/link'

export default function PrivacidadPage() {
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
            Ley N° 19.628 y Ley N° 21.719 • Privacidad de Datos
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Política de Privacidad y Protección de Datos Personales
          </h1>
          <p className="text-xs text-neutral-400">
            Última actualización: Octubre de 2026
          </p>
        </div>

        <div className="space-y-6 text-xs text-neutral-300 leading-relaxed">
          <p>
            En <strong className="text-white">MOGU</strong> (operado por <strong className="text-white">Mogu SpA</strong>), nos tomamos muy en serio la privacidad y la seguridad de la información de nuestros usuarios, clientes y visitantes de nuestro sitio web <strong className="text-white">mogu.cl</strong>.
          </p>
          <p>
            La presente Política de Privacidad describe de manera transparente qué datos recopilamos, con qué fines los tratamos, bajo qué legitimidad lo hacemos, con quién los compartimos y cuáles son tus derechos conforme a la legislación chilena vigente.
          </p>

          <section className="space-y-2 pt-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Responsable del Tratamiento de Datos
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-neutral-400">
              <li><strong className="text-neutral-200">Razón Social:</strong> Mogu SpA</li>
              <li><strong className="text-neutral-200">R.U.T.:</strong> [Insertar RUT de la empresa]</li>
              <li><strong className="text-neutral-200">Domicilio Legal:</strong> [Insertar dirección comercial, Santiago, Chile]</li>
              <li><strong className="text-neutral-200">Correo Electrónico de Contacto (Derechos ARCO-P / DPO):</strong> contacto@mogu.cl</li>
            </ul>
          </section>

          <section className="space-y-2 pt-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              2. Qué Datos Recopilamos y Finalidades del Tratamiento
            </h2>
            <p>Recopilamos únicamente los datos necesarios para el funcionamiento de la plataforma y la gestión de tarjetas NFC:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
              <li><strong className="text-neutral-200">Datos de Registro y Cuenta:</strong> Nombre, correo electrónico, contraseña cifrada, teléfono y datos de la PyME para crear y gestionar tu cuenta y perfiles digitales.</li>
              <li><strong className="text-neutral-200">Datos de Transacción y Facturación:</strong> Dirección de despacho, historial de compras y RUT para procesar pagos y emitir documentos tributarios.</li>
              <li><strong className="text-neutral-200">Datos de Navegación y Analítica:</strong> Dirección IP, tipo de dispositivo y páginas visitadas a través de cookies (Google Analytics y Píxel de Meta) para medir el rendimiento del sitio y optimizar campañas.</li>
            </ul>
          </section>

          <section className="space-y-2 pt-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              3. Base Legal que Legitima el Tratamiento
            </h2>
            <p>
              El tratamiento de tus datos se fundamenta en el <strong className="text-white">consentimiento libre, informado y específico</strong> del usuario, en la <strong className="text-white">ejecución de un contrato</strong> (para la prestación de servicios y despacho de tarjetas físicas) y en el <strong className="text-white">cumplimiento de obligaciones legales</strong> tributarias y comerciales.
            </p>
          </section>

          <section className="space-y-2 pt-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              4. Con Quién Compartimos tus Datos
            </h2>
            <p>
              En MOGU <strong className="text-white">no vendemos ni comercializamos tus datos personales</strong>. Solo se comparten con proveedores estrictamente necesarios bajo cláusulas de confidencialidad: pasarelas de pago autorizadas, empresas de courier para despachos físicos en Chile e infraestructura tecnológica en la nube.
            </p>
          </section>

          <section className="space-y-2 pt-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              5. Tiempo de Conservación de los Datos
            </h2>
            <p>
              Los datos se conservarán mientras la cuenta del usuario permanezca activa o durante los plazos exigidos por la legislación fiscal y tributaria chilena (por regla general, 6 años). Los datos analíticos se rigen por los ciclos de vida estándar de las herramientas de medición o hasta que revoques tu consentimiento.
            </p>
          </section>

          <section className="space-y-2 pt-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              6. Ejercicio de tus Derechos ARCO-P
            </h2>
            <p>
              Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación, Oposición y Portabilidad enviando una solicitud formal a <strong className="text-white">contacto@mogu.cl</strong>. La solicitud será atendida conforme a los plazos legales establecidos.
            </p>
          </section>

          <section className="space-y-2 pt-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              7. Política de Cookies y Tecnologías de Seguimiento
            </h2>
            <p>
              Utilizamos cookies para mejorar la experiencia de navegación. Al ingresar al sitio, se despliega un banner informativo requiriendo tu aceptación previa y expresa antes de instalar cookies no esenciales. Puedes configurar o revocar su uso directamente desde tu navegador.
            </p>
          </section>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-900 py-8 text-center text-neutral-500 text-[11px] space-y-2">
        <div className="flex justify-center space-x-6">
          <Link href="/terminos" className="hover:text-emerald-400 transition">Términos y Condiciones</Link>
          <Link href="/privacidad" className="hover:text-emerald-400 transition">Política de Privacidad</Link>
        </div>
        <p>© 2026 Mogu SpA. Todos los derechos reservados.</p>
      </footer>

    </div>
  )
}