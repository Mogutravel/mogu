import { ButtonLink } from "@/components/ui";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-mogu-pink/60 bg-mogu-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 sm:px-6">
        <a href="/" className="flex items-center gap-2" aria-label="Mogu — Inicio">
          <img
            src="/mogu-icon.png"
            alt=""
            className="h-9 w-auto"
            width={36}
            height={36}
          />
          <span className="hidden text-lg font-bold text-mogu-wine sm:inline">
            Mogu
          </span>
        </a>

        <nav className="flex items-center gap-2 sm:gap-3">
          <ButtonLink href="/login" variant="secondary" size="sm">
            Ingresar
          </ButtonLink>
          <ButtonLink
            href="https://wa.me/56928689888?text=Hola%2C%20me%20interesa%20una%20tarjeta%20NFC%20de%20Mogu%20para%20mi%20negocio"
            variant="primary"
            size="sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cotizar
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}