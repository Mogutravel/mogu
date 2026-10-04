import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase();

function limpiarSlug(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: Request) {
  // 1. Verificar que quien llama es el administrador
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const anon = createClient(url, publishable);
  const {
    data: { user },
  } = await anon.auth.getUser(token);

  if (!user || !adminEmail || user.email?.toLowerCase() !== adminEmail) {
    return NextResponse.json({ error: "No tienes permiso" }, { status: 403 });
  }

  // 2. Validar los datos
  const b = await req.json();
  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim().toLowerCase();
  const password = String(b.password ?? "");
  const slug = limpiarSlug(String(b.slug || name));

  if (!name || !email || !slug) {
    return NextResponse.json(
      { error: "Faltan nombre, correo o dirección" },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres" },
      { status: 400 }
    );
  }

  const admin = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 3. Crear el usuario dueño
  const { data: creado, error: e1 } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (e1 || !creado.user) {
    return NextResponse.json(
      { error: e1?.message ?? "No se pudo crear el usuario" },
      { status: 400 }
    );
  }

  // 4. Crear el negocio
  const { data: negocio, error: e2 } = await admin
    .from("businesses")
    .insert({
      owner_id: creado.user.id,
      slug,
      name,
      description: b.description || null,
      color: b.color || "#0f766e",
    })
    .select()
    .single();

  if (e2 || !negocio) {
    await admin.auth.admin.deleteUser(creado.user.id);
    const duplicado = e2?.message?.includes("duplicate");
    return NextResponse.json(
      {
        error: duplicado
          ? "Esa dirección ya existe, prueba con otra"
          : e2?.message ?? "No se pudo crear el negocio",
      },
      { status: 400 }
    );
  }

  // 5. Crear los botones que vengan con datos
  const botones: { type: string; label: string; url: string }[] = [];

  if (b.review) {
    botones.push({
      type: "review",
      label: "Déjanos una reseña en Google",
      url: String(b.review),
    });
  }
  if (b.whatsapp) {
    const numero = String(b.whatsapp).replace(/\D/g, "");
    botones.push({
      type: "whatsapp",
      label: "Escríbenos por WhatsApp",
      url: `https://wa.me/${numero}`,
    });
  }
  if (b.instagram) {
    const ig = String(b.instagram).trim();
    botones.push({
      type: "instagram",
      label: "Síguenos en Instagram",
      url: ig.startsWith("http")
        ? ig
        : `https://instagram.com/${ig.replace("@", "")}`,
    });
  }
  if (b.menu) {
    botones.push({ type: "menu", label: "Ver la carta", url: String(b.menu) });
  }

  if (botones.length > 0) {
    await admin.from("links").insert(
      botones.map((x, i) => ({
        ...x,
        business_id: negocio.id,
        position: i + 1,
      }))
    );
  }

  return NextResponse.json({ ok: true, slug });
}
