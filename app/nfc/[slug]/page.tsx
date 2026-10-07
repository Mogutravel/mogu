import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { esBot, dispositivo } from "@/lib/track";

export const dynamic = "force-dynamic";

const ICONS: Record<string, string> = {
  review: "⭐",
  whatsapp: "💬",
  instagram: "📸",
  menu: "📖",
  map: "📍",
  phone: "📞",
  web: "🌐",
  booking: "📅",
};

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!business) notFound();

  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("business_id", business.id)
    .eq("active", true)
    .order("position");

  const ua = (await headers()).get("user-agent") ?? "";
  if (!esBot(ua)) {
    await supabaseAdmin.from("events").insert({
      business_id: business.id,
      type: "view",
      device: dispositivo(ua),
    });
  }

  return (
    <main className="min-h-screen bg-mogu-cream">
      <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col px-4 py-10">
        {/* Cabecera del negocio */}
        <div className="mb-8 text-center">
          {business.logo_url ? (
            <img
              src={business.logo_url}
              alt={business.name}
              className="mx-auto mb-4 h-24 w-24 rounded-full object-cover shadow-md ring-2 ring-white"
            />
          ) : (
            <div
              className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full text-4xl font-bold text-white shadow-md"
              style={{ backgroundColor: business.color || "#E11D48" }}
            >
              {business.name.charAt(0)}
            </div>
          )}
          <h1 className="text-2xl font-bold text-mogu-wine">{business.name}</h1>
          {business.description && (
            <p className="mt-2 text-sm leading-relaxed text-mogu-gray-600">
              {business.description}
            </p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-1 flex-col gap-3">
          {links?.map((link) => {
            const destacado = link.type === "review";
            const icono = ICONS[link.type] ?? "🔗";

            return (
              <a
                key={link.id}
                href={`/r/${link.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  "flex items-center gap-3 rounded-xl px-4 py-4 font-medium transition active:scale-[0.98] " +
                  (destacado
                    ? "bg-mogu-red text-white shadow-md"
                    : "border border-mogu-pink bg-white text-mogu-wine shadow-sm hover:border-mogu-red/30 hover:shadow-md")
                }
              >
                <span className="text-xl" aria-hidden>
                  {icono}
                </span>
                <span className="flex-1 text-left">{link.label}</span>
              </a>
            );
          })}
        </div>

        {/* Marca Mogu */}
        <p className="mt-10 text-center text-xs text-mogu-gray-400">
          Hecho con{" "}
          <a href="/" className="font-medium text-mogu-red hover:underline">
            Mogu
          </a>
        </p>
      </div>
    </main>
  );
}