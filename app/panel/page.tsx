"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Business = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  color: string;
};

type LinkItem = {
  id: string;
  type: string;
  label: string;
  url: string;
  position: number;
  active: boolean;
};

const TYPES = [
  ["review", "⭐ Reseña de Google"],
  ["whatsapp", "💬 WhatsApp"],
  ["instagram", "📸 Instagram"],
  ["menu", "📖 Carta o menú"],
  ["map", "📍 Ubicación"],
  ["phone", "📞 Teléfono"],
  ["web", "🌐 Sitio web"],
  ["booking", "📅 Reservas"],
];

export default function Panel() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data: b } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (b) {
        setBusiness(b);
        const { data: l } = await supabase
          .from("links")
          .select("*")
          .eq("business_id", b.id)
          .order("position");
        setLinks(l ?? []);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  function updateLink(id: string, patch: Partial<LinkItem>) {
    setLinks(links.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  async function guardar() {
    if (!business) return;
    setMsg("Guardando...");
    let fallo: string | null = null;

    const { error } = await supabase
      .from("businesses")
      .update({
        name: business.name,
        description: business.description,
        color: business.color,
        logo_url: business.logo_url || null,
      })
      .eq("id", business.id);
    if (error) fallo = error.message;

    for (const [i, l] of links.entries()) {
      const { error: e } = await supabase
        .from("links")
        .update({
          type: l.type,
          label: l.label,
          url: l.url,
          active: l.active,
          position: i + 1,
        })
        .eq("id", l.id);
      if (e) fallo = e.message;
    }

    setMsg(fallo ? "Error: " + fallo : "Cambios guardados ✓");
  }

  async function agregar() {
    if (!business) return;
    const { data, error } = await supabase
      .from("links")
      .insert({
        business_id: business.id,
        type: "web",
        label: "Nuevo botón",
        url: "https://",
        position: links.length + 1,
      })
      .select()
      .single();
    if (error) {
      setMsg("Error: " + error.message);
      return;
    }
    setLinks([...links, data]);
  }

  async function borrar(id: string) {
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (error) {
      setMsg("Error: " + error.message);
      return;
    }
    setLinks(links.filter((l) => l.id !== id));
  }

  async function salir() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return <main className="p-8 text-mogu-wine/70">Cargando...</main>;
  }

  if (!business) {
    return (
      <main className="p-8 text-mogu-wine">
        <p>Tu cuenta todavía no tiene un negocio asignado.</p>
        <button onClick={salir} className="underline mt-4">
          Salir
        </button>
      </main>
    );
  }

  const campo =
    "w-full border border-mogu-pink rounded-lg px-3 py-2 text-mogu-wine bg-white";

  return (
    <main className="min-h-screen bg-mogu-cream px-4 py-8 flex justify-center">
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3"><img src="/mogu-icon.png" alt="Mogu" className="h-10 w-auto" /><h1 className="text-2xl font-bold text-mogu-wine">Mi página</h1></div>
          <button onClick={salir} className="text-sm text-mogu-wine/70 underline">
            Salir
          </button>
        </div>

        <a
          href={`/n/${business.slug}`}
          target="_blank"
          className="block bg-white border border-mogu-pink rounded-xl p-4 mb-6 text-mogu-red"
        >
          Ver mi página pública: mogu.cl/n/{business.slug} ↗
        </a>

        <section className="bg-white border border-mogu-pink rounded-xl p-4 mb-6 flex flex-col gap-3">
          <h2 className="font-bold text-mogu-wine">Datos del negocio</h2>
          <label className="text-sm text-mogu-wine/70">Nombre</label>
          <input
            className={campo}
            value={business.name}
            onChange={(e) => setBusiness({ ...business, name: e.target.value })}
          />
          <label className="text-sm text-mogu-wine/70">Descripción</label>
          <input
            className={campo}
            value={business.description ?? ""}
            onChange={(e) =>
              setBusiness({ ...business, description: e.target.value })
            }
          />
          <label className="text-sm text-mogu-wine/70">Color de tu marca</label>
          <input
            type="color"
            value={business.color}
            onChange={(e) => setBusiness({ ...business, color: e.target.value })}
            className="w-16 h-10"
          />
          <label className="text-sm text-mogu-wine/70">
            Enlace de tu logo (opcional)
          </label>
          <input
            className={campo}
            placeholder="https://..."
            value={business.logo_url ?? ""}
            onChange={(e) =>
              setBusiness({ ...business, logo_url: e.target.value })
            }
          />
        </section>

        <section className="mb-6">
          <h2 className="font-bold text-mogu-wine mb-3">Botones</h2>
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <div
                key={l.id}
                className="bg-white border border-mogu-pink rounded-xl p-4 flex flex-col gap-2"
              >
                <select
                  className={campo}
                  value={l.type}
                  onChange={(e) => updateLink(l.id, { type: e.target.value })}
                >
                  {TYPES.map(([valor, nombre]) => (
                    <option key={valor} value={valor}>
                      {nombre}
                    </option>
                  ))}
                </select>
                <input
                  className={campo}
                  placeholder="Texto del botón"
                  value={l.label}
                  onChange={(e) => updateLink(l.id, { label: e.target.value })}
                />
                <input
                  className={campo}
                  placeholder="https://..."
                  value={l.url}
                  onChange={(e) => updateLink(l.id, { url: e.target.value })}
                />
                <div className="flex items-center justify-between">
                  <label className="text-sm text-mogu-wine flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={l.active}
                      onChange={(e) =>
                        updateLink(l.id, { active: e.target.checked })
                      }
                    />
                    Visible
                  </label>
                  <button
                    onClick={() => borrar(l.id)}
                    className="text-sm text-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={agregar}
            className="mt-3 text-mogu-red font-medium"
          >
            + Agregar botón
          </button>
        </section>

        <button
          onClick={guardar}
          className="w-full bg-mogu-red text-white font-medium rounded-lg py-3"
        >
          Guardar cambios
        </button>
        {msg && <p className="text-center text-sm text-mogu-wine mt-3">{msg}</p>}
      </div>
    </main>
  );
}