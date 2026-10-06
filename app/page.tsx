import { Header, Footer } from "@/components/layout";
import { ButtonLink, Card, Container, Section } from "@/components/ui";

const WHATSAPP = "56928689888";
const MENSAJE = encodeURIComponent(
  "Hola, me interesa una tarjeta NFC de Mogu para mi negocio"
);
const WA_URL = `https://wa.me/${WHATSAPP}?text=${MENSAJE}`;

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-mogu-cream text-mogu-wine">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <Section background="cream" spacing="lg" className="pt-10 sm:pt-16">
          <Container size="md" className="text-center">
            <img
              src="/mogu-logo.png"
              alt="Mogu"
              className="mx-auto mb-6 h-32 w-auto sm:h-40"
            />
            <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Más reseñas y clientes con un solo toque
            </h1>
            <p className="mx-auto mb-8 max-w-lg text-base text-mogu-gray-600 sm:text-lg">
              Una tarjeta NFC para tu negocio. Tus clientes acercan el celular y
              acceden a tu reseña de Google, WhatsApp, Instagram, carta y
              ubicación.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink
                href={WA_URL}
                variant="primary"
                size="lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Cotizar por WhatsApp
              </ButtonLink>
              <ButtonLink
                href="/nfc/cafe-raices"
                variant="secondary"
                size="lg"
              >
                Ver un ejemplo
              </ButtonLink>
            </div>
            <p className="mt-6 text-sm text-mogu-gray-500">
              Compatible iOS y Android · Sin apps · Envío a Chile
            </p>
          </Container>
        </Section>

        {/* Beneficios */}
        <Section background="white" spacing="md">
          <Container size="lg">
            <h2 className="mb-3 text-center text-2xl font-bold sm:text-3xl">
              Por qué funciona
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-center text-mogu-gray-600">
              Menos fricción para tu cliente, más reseñas y contactos para tu
              negocio.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  titulo: "Más reseñas",
                  texto:
                    "Un toque y llegan directo a Google. Sin buscar tu negocio ni escribir URLs.",
                },
                {
                  titulo: "Más WhatsApp",
                  texto:
                    "Tus clientes te escriben en el momento, cuando la experiencia está fresca.",
                },
                {
                  titulo: "Tu marca",
                  texto:
                    "Página con tu logo, colores y los botones que tú elijas.",
                },
                {
                  titulo: "Reprogramable",
                  texto:
                    "Cambias enlaces cuando quieras, sin reimprimir la tarjeta.",
                },
              ].map((b) => (
                <Card key={b.titulo} padding="md" hover>
                  <p className="mb-2 font-semibold text-mogu-wine">
                    {b.titulo}
                  </p>
                  <p className="text-sm leading-relaxed text-mogu-gray-600">
                    {b.texto}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* Cómo funciona */}
        <Section background="cream" spacing="md">
          <Container size="md">
            <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">
              Cómo funciona
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  n: "1",
                  titulo: "Eliges tu tarjeta",
                  texto: "Te la entregamos lista y con tu marca.",
                },
                {
                  n: "2",
                  titulo: "Armamos tu página",
                  texto: "Con tus enlaces, tu logo y tus colores.",
                },
                {
                  n: "3",
                  titulo: "Tus clientes la tocan",
                  texto: "Y llegan directo a lo que necesitas.",
                },
              ].map((paso) => (
                <Card key={paso.n} padding="md" hover>
                  <p className="mb-1 text-xl font-bold text-mogu-red">
                    {paso.n}
                  </p>
                  <p className="mb-1 font-semibold text-mogu-wine">
                    {paso.titulo}
                  </p>
                  <p className="text-sm text-mogu-gray-600">{paso.texto}</p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* CTA final */}
        <Section background="white" spacing="lg">
          <Container size="sm" className="text-center">
            <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
              Empieza a recibir más reseñas
            </h2>
            <p className="mb-8 text-mogu-gray-600">
              Cotiza por WhatsApp y te armamos tu tarjeta lista para usar.
            </p>
            <ButtonLink
              href={WA_URL}
              variant="primary"
              size="lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cotizar por WhatsApp
            </ButtonLink>
          </Container>
        </Section>
      </main>

      <Footer />
    </div>
  );
}