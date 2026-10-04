const WHATSAPP = "56928689888";
const MENSAJE = encodeURIComponent(
  "Hola, me interesa una tarjeta NFC de Mogu para mi negocio"
);

export default function Home() {
  return (
    <main className="min-h-screen bg-mogu-cream text-mogu-wine">
            <header className="max-w-2xl mx-auto px-6 pt-6 flex items-center justify-between">
        <img src="/mogu-icon.png" alt="Mogu" className="h-10 w-auto" />
        <a
          href="/login"
          className="border border-mogu-pink bg-white text-sm font-medium rounded-lg px-4 py-2"
        >
          Ingresar
        </a>
      </header>
      <section className="max-w-2xl mx-auto px-6 pt-20 pb-12 text-center">
        <img src="/mogu-logo.png" alt="Mogu" className="h-40 w-auto mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">
          Más reseñas y clientes con un solo toque
        </h1>
        <p className="text-lg text-mogu-wine/70 mb-8">
          Una tarjeta NFC para tu negocio. Tus clientes acercan el celular y
          acceden a tu reseña de Google, WhatsApp, Instagram, carta y ubicación.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`https://wa.me/${WHATSAPP}?text=${MENSAJE}`}
            className="bg-mogu-red text-white font-medium rounded-lg px-6 py-3"
          >
            Cotizar por WhatsApp
          </a>
          <a
            href="/n/cafe-raices"
            className="border border-mogu-pink bg-white font-medium rounded-lg px-6 py-3"
          >
            Ver un ejemplo
          </a>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Cómo funciona</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["1", "Eliges tu tarjeta", "Te la entregamos lista y con tu marca."],
            ["2", "Armamos tu página", "Con tus enlaces, tu logo y tus colores."],
            ["3", "Tus clientes la tocan", "Y llegan directo a lo que necesitas."],
          ].map(([n, titulo, texto]) => (
            <div
              key={n}
              className="bg-white border border-mogu-pink rounded-xl p-5"
            >
              <p className="text-mogu-red font-bold text-xl mb-1">{n}</p>
              <p className="font-medium mb-1">{titulo}</p>
              <p className="text-sm text-mogu-wine/70">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-xs text-mogu-wine/50 pb-8">
        Mogu · Curicó, Chile
      </footer>
    </main>
  );
}