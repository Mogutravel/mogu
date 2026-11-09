import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mogu | Software de Gestión y Operaciones para Restaurantes y Cafés",
  description: "Plataforma integral de operaciones para restaurantes y cafés. Conecta caja, garzones, administración y clientes en tiempo real con pedidos inteligentes y la comunidad Mogu Travel.",
  keywords: [
    "software restaurantes",
    "sistema operativo gastronómico",
    "gestión de cafés",
    "pedidos garzones",
    "mogu travel",
    "fidelización gastronómica",
    "pos restaurantes chile"
  ],
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "Mogu | Software de Gestión y Operaciones Gastronómicas",
    description: "Conecta tu caja, garzones y administración en una sola plataforma. Gestión en tiempo real para restaurantes y cafés.",
    url: "https://mogu.cl",
    siteName: "Mogu",
    locale: "es_CL",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Mogu",
    "operatingSystem": "Web",
    "applicationCategory": "BusinessApplication",
    "description": "Sistema operativo de gestión interna y atención para restaurantes, cafés y locales gastronómicos.",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "CLP"
    }
  };

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0A0A0C] text-neutral-100">
        {children}
      </body>
    </html>
  );
}npm run dev