"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Negocio = { id: string; slug: string; name: string };

const VACIO = {
  name: "",
  slug: "",
  description: "",
  color: "#0f766e",
  email: "",
  password: "",
  review: "",
  whatsapp: "",
  instagram: "",
  menu: "",
};

export default function Admin() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [form, setForm] = useState(VACIO);
  const [msg, setMsg] = useState("");
  const [creado, setCreado] = useState<{
    slug: string;
    email: string;
    password: string;
  } | null>(null);
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  async function cargarNegocios() {
    const { data } = await supabase
      .from("businesses")
      .select("id, slug, name")
      .order("created_at", { ascending: false });
    setNegocios(data ?? []);
  }

  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setToken(session.access_token);
      await cargarNegocios();
      setCargando(false);
    }
    init();
  }, [router]);

  function cambiar(campo: string, valor: string) {
    setForm({ ...form, [campo]: valor });
  }

  async function crear() {
    setEnviando(true);
    setMsg("");
    setCreado(null);

    const res = await fetch("/api/admin/crear-negocio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setEnviando(false);

    if (!res.ok) {
      setMsg(data.error ?? "Ocurrió un error");
      return;
    }

    setCreado({ slug: data.slug, email: form.email, password: form.password });
    setForm(VACIO);
    cargarNegocios();
  }

  if (cargando) {
    return <main className="p-8 text-gray-600">Cargando...</main>;
  }

  const campo =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 flex justify-center">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Administrador Mogu
        </h1>

        <section className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-col gap-3">
          <h2 className="font-bold text-gray-900">Crear negocio nuevo</h2>

          <label className="text-sm text-gray-600">Nombre del negocio</label>
          <input
            className={campo}
            value={form.name}
            onChange={(e) => cambiar("name", e.target.value)}
          />

          <label className="text-sm text-gray-600">
            Dirección (opcional, se arma con el nombre)
          </label>
          <input
            className={campo}
            placeholder="cafe-raices"
            value={form.slug}
            onChange={(e) => cambiar("slug", e.target.value)}
          />

          <label className="text-sm text-gray-600">Descripción</label>
          <input
            className={campo}
            value={form.description}
            onChange={(e) => cambiar("description", e.target.value)}
          />

          <label className="text-sm text-gray-600">Color de la marca</label>
          <input
            type="color"
            value={form.color}
            onChange={(e) => cambiar("color", e.target.value)}
            className="w-16 h-10"
          />

          <h3 className="font-medium text-gray-900 mt-2">Acceso del dueño</h3>
          <input
            className={campo}
            type="email"
            placeholder="Correo del dueño"
            value={form.email}
            onChange={(e) => cambiar("email", e.target.value)}
          />
          <input
            className={campo}
            placeholder="Contraseña temporal (mínimo 8)"
            value={form.password}
            onChange={(e) => cambiar("password", e.target.value)}
          />

          <h3 className="font-medium text-gray-900 mt-2">
            Botones (deja vacío los que no use)
          </h3>
          <input
            className={campo}
            placeholder="Enlace de reseña de Google"
            value={form.review}
            onChange={(e) => cambiar("review", e.target.value)}
          />
          <input
            className={campo}
            placeholder="WhatsApp: 56912345678"
            value={form.whatsapp}
            onChange={(e) => cambiar("whatsapp", e.target.value)}
          />
          <input
            className={campo}
            placeholder="Instagram: @usuario"
            value={form.instagram}
            onChange={(e) => cambiar("instagram", e.target.value)}
          />
          <input
            className={campo}
            placeholder="Enlace de la carta o menú"
            value={form.menu}
            onChange={(e) => cambiar("menu", e.target.value)}
          />

          <button
            onClick={crear}
            disabled={enviando}
            className="w-full bg-teal-700 text-white font-medium rounded-lg py-3 mt-2 disabled:opacity-50"
          >
            {enviando ? "Creando..." : "Crear negocio"}
          </button>
          {msg && <p className="text-red-600 text-sm">{msg}</p>}
        </section>

        {creado && (
          <section className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-gray-800">
            <p className="font-bold mb-2">Negocio creado ✓</p>
            <p>
              Página para la tarjeta NFC:
              <br />
              <b>https://mogu.cl/n/{creado.slug}</b>
            </p>
            <p className="mt-2">
              Acceso del cliente (mogu.cl/login):
              <br />
              Correo: <b>{creado.email}</b>
              <br />
              Contraseña: <b>{creado.password}</b>
            </p>
            <p className="mt-2 text-gray-600">
              Copia estos datos ahora: la contraseña no se vuelve a mostrar.
            </p>
          </section>
        )}

        <section className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="font-bold text-gray-900 mb-3">
            Negocios creados ({negocios.length})
          </h2>
          <div className="flex flex-col gap-2">
            {negocios.map((n) => (
              <a
                key={n.id}
                href={`/n/${n.slug}`}
                target="_blank"
                className="flex justify-between text-sm text-gray-800 border-b border-gray-100 pb-2"
              >
                <span>{n.name}</span>
                <span className="text-teal-700">/n/{n.slug} ↗</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
