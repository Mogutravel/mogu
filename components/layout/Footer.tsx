export function Footer() {
  return (
    <footer className="border-t border-mogu-pink/50 bg-white">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2">
            <img
              src="/mogu-icon.png"
              alt=""
              className="h-8 w-auto"
              width={32}
              height={32}
            />
            <div>
              <p className="font-semibold text-mogu-wine">Mogu</p>
              <p className="text-sm text-mogu-gray-500">
                Tarjetas NFC para negocios · Curicó, Chile
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 text-sm text-mogu-gray-600 sm:items-end">
            <a
              href="https://wa.me/56928689888?text=Hola%2C%20me%20interesa%20una%20tarjeta%20NFC%20de%20Mogu%20para%20mi%20negocio"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-mogu-red hover:underline"
            >
              Cotizar por WhatsApp
            </a>
            <a href="/login" className="hover:text-mogu-wine hover:underline">
              Ingresar al panel
            </a>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-mogu-gray-400">
          © {new Date().getFullYear()} Mogu. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}