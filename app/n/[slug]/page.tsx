import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          {business.logo_url ? (
            <img
              src={business.logo_url}
              alt={business.name}
              className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white"
              style={{ backgroundColor: business.color }}
            >
              {business.name.charAt(0)}
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
          {business.description && (
            <p className="text-gray-600 mt-2">{business.description}</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {links?.map((link) => {
            const destacado = link.type === "review";
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  "flex items-center gap-3 rounded-xl px-4 py-4 font-medium transition active:scale-95 " +
                  (destacado
                    ? "text-white shadow-md"
                    : "bg-white text-gray-900 border border-gray-200")
                }
                style={destacado ? { backgroundColor: business.color } : undefined}
              >
                <span className="text-xl">{ICONS[link.type] ?? "🔗"}</span>
                <span>{link.label}</span>
              </a>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-10">
          Hecho con Mogu
        </p>
      </div>
    </main>
  );
}