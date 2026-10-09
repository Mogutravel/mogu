"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  slug: string;
  full_name: string;
};

type Category = {
  id: string;
  profile_id: string;
  name: string;
  position: number;
};

type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: string | null;
  image_url: string | null;
  active: boolean;
  position: number;
};

export default function PanelMenu() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [subiendoImgId, setSubiendoImgId] = useState<string | null>(null);

  useEffect(() => {
    async function loadMenuData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: p } = await supabase
        .from("profiles")
        .select("id, slug, full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (p) {
        setProfile(p);
        
        // Cargar categorías del perfil
        const { data: cats } = await supabase
          .from("menu_categories")
          .select("*")
          .eq("profile_id", p.id)
          .order("position", { ascending: true });

        setCategories(cats ?? []);

        if (cats && cats.length > 0) {
          const catIds = cats.map((c) => c.id);
          // Cargar platos de todas las categorías del usuario
          const { data: menuItems } = await supabase
            .from("menu_items")
            .select("*")
            .in("category_id", catIds)
            .order("position", { ascending: true });

          setItems(menuItems ?? []);
        }
      }
      setLoading(false);
    }
    loadMenuData();
  }, [router]);

  // --- ACCIONES DE CATEGORÍAS ---
  async function agregarCategoria() {
    if (!profile) return;
    const { data, error } = await supabase
      .from("menu_categories")
      .insert({
        profile_id: profile.id,
        name: "Nueva Categoría",
        position: categories.length + 1,
      })
      .select()
      .single();

    if (error) {
      setMsg("Error al crear categoría: " + error.message);
      return;
    }
    setCategories([...categories, data]);
  }

  function updateCategory(id: string, name: string) {
    setCategories(categories.map((c) => (c.id === id ? { ...c, name } : c)));
  }

  async function borrarCategoria(id: string) {
    const { error } = await supabase.from("menu_categories").delete().eq("id", id);
    if (error) {
      setMsg("Error al eliminar categoría: " + error.message);
      return;
    }
    setCategories(categories.filter((c) => c.id !== id));
    setItems(items.filter((i) => i.category_id !== id));
  }

  // --- ACCIONES DE PLATOS / ÍTEMS ---
  async function agregarItem(categoryId: string) {
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        category_id: categoryId,
        name: "Nuevo Plato",
        description: "",
        price: "$0",
        active: true,
        position: items.filter((i) => i.category_id === categoryId).length + 1,
      })
      .select()
      .single();

    if (error) {
      setMsg("Error al crear plato: " + error.message);
      return;
    }
    setItems([...items, data]);
  }

  function updateItem(id: string, patch: Partial<MenuItem>) {
    setItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  async function borrarItem(id: string) {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) {
      setMsg("Error al eliminar plato: " + error.message);
      return;
    }
    setItems(items.filter((i) => i.id !== id));
  }

  // --- GUARDAR CAMBIOS GENERALES ---
  async function guardarTodo() {
    setMsg("Guardando carta...");
    let fallo: string | null = null;

    // Guardar categorías
    for (const [i, c] of categories.entries()) {
      const { error } = await supabase
        .from("menu_categories")
        .update({ name: c.name, position: i + 1 })
        .eq("id", c.id);
      if (error) fallo = error.message;
    }

    // Guardar platos
    for (const [i, item] of items.entries()) {
      const { error } = await supabase
        .from("menu_items")
        .update({
          name: item.name,
          description: item.description,
          price: item.price,
          active: item.active,
          position: i + 1,
        })
        .eq("id", item.id);
      if (error) fallo = error.message;
    }

    setMsg(fallo ? "Error: " + fallo : "¡Carta actualizada con éxito! ✓");
    setTimeout(() => setMsg(""), 3000);
  }

  // --- SUBIR FOTO DE UN PLATO ---
  async function subirFotoItem(e: ChangeEvent<HTMLInputElement>, itemId: string) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setMsg("Usa una imagen PNG, JPG o WebP");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMsg("La imagen pesa más de 2 MB");
      return;
    }

    setSubiendoImgId(itemId);
    setMsg("Subiendo imagen...");

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const ruta = profile.id + "/menu-item-" + itemId + "-" + Date.now() + "." + ext;

    const { error } = await supabase.storage
      .from("logos")
      .upload(ruta, file, { contentType: file.type });

    if (error) {
      setMsg("Error al subir imagen: " + error.message);
      setSubiendoImgId(null);
      return;
    }

    const { data } = supabase.storage.from("logos").getPublicUrl(ruta);
    const url = data.publicUrl;

    const { error: errUpdate } = await supabase
      .from("menu_items")
      .update({ image_url: url })
      .eq("id", itemId);

    if (errUpdate) {
      setMsg("Error al actualizar plato: " + errUpdate.message);
      setSubiendoImgId(null);
      return;
    }

    updateItem(itemId, { image_url: url });
    setMsg("Imagen actualizada ✓");
    setSubiendoImgId(null);
    e.target.value = "";
  }

  if (loading) {
    return <main className="p-8 text-mogu-wine/70">Cargando carta...</main>;
  }

  const campo = "w-full border border-mogu-pink rounded-lg px-3 py-2 text-mogu-wine bg-white text-xs";

  return (
    <main className="min-h-screen bg-mogu-cream px-4 py-8 flex justify-center">
      <div className="w-full max-w-xl">
        
        {/* ENCABEZADO */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src="/mogu-icon.png" alt="Mogu" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold text-mogu-wine">Carta Digital</h1>
          </div>
          <a href="/panel" className="text-xs text-mogu-wine/70 underline">
            ← Volver a mi Tarjeta
          </a>
        </div>

        {/* NAVEGACIÓN SUPERIOR DE PESTAÑAS */}
        <div className="flex bg-white border border-mogu-pink p-1 rounded-xl mb-6 shadow-sm">
          <a
            href="/panel"
            className="flex-1 py-2 text-center text-xs font-bold rounded-lg text-mogu-wine hover:bg-mogu-cream transition"
          >
            🔗 Mi Tarjeta y Enlaces
          </a>
          <a
            href="/panel/menu"
            className="flex-1 py-2 text-center text-xs font-bold rounded-lg bg-mogu-red text-white shadow"
          >
            📖 Menú / Catálogo
          </a>
        </div>

        {/* BOTÓN NUEVA CATEGORÍA */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-mogu-wine text-sm">Estructura de la Carta</h2>
            <p className="text-[11px] text-mogu-wine/60">Organiza por secciones (ej: Entradas, Fondos, Bebidas).</p>
          </div>
          <button
            onClick={agregarCategoria}
            className="px-4 py-2 bg-mogu-red text-white text-xs font-bold rounded-xl shadow hover:opacity-95 transition"
          >
            + Nueva Categoría
          </button>
        </div>

        {/* LISTADO DE CATEGORÍAS Y SUS PLATOS */}
        <div className="flex flex-col gap-6 mb-6">
          {categories.length === 0 ? (
            <div className="p-8 bg-white border border-mogu-pink rounded-2xl text-center">
              <p className="text-xs text-mogu-wine/60 font-medium">Aún no tienes categorías creadas. Comienza agregando una.</p>
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="bg-white border border-mogu-pink rounded-2xl p-4 shadow-sm space-y-4">
                
                {/* CABECERA DE CATEGORÍA */}
                <div className="flex items-center gap-3 pb-3 border-b border-mogu-pink/40">
                  <input
                    className="flex-1 font-bold text-mogu-wine text-sm border border-mogu-pink rounded-lg px-3 py-1.5 bg-mogu-cream/50"
                    value={cat.name}
                    onChange={(e) => updateCategory(cat.id, e.target.value)}
                    placeholder="Nombre de la categoría..."
                  />
                  <button
                    onClick={() => borrarCategoria(cat.id)}
                    className="text-xs text-red-600 font-semibold hover:underline"
                  >
                    Eliminar categoría
                  </button>
                </div>

                {/* LISTADO DE PLATOS DE ESTA CATEGORÍA */}
                <div className="flex flex-col gap-3">
                  {items
                    .filter((item) => item.category_id === cat.id)
                    .map((item) => (
                      <div key={item.id} className="bg-mogu-cream/30 border border-mogu-pink/60 rounded-xl p-3 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          {/* FOTO */}
                          <div className="relative w-12 h-12 rounded-lg border border-mogu-pink bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[9px] text-mogu-wine/40">Sin foto</span>
                            )}
                          </div>

                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-mogu-wine/70 font-semibold">Plato / Producto</label>
                              <input
                                className={campo}
                                value={item.name}
                                onChange={(e) => updateItem(item.id, { name: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-mogu-wine/70 font-semibold">Precio</label>
                              <input
                                className={campo}
                                value={item.price || ""}
                                onChange={(e) => updateItem(item.id, { price: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] text-mogu-wine/70 font-semibold">Descripción o ingredientes</label>
                          <input
                            className={campo}
                            value={item.description || ""}
                            onChange={(e) => updateItem(item.id, { description: e.target.value })}
                            placeholder="Detalle breve..."
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-3">
                            <label className="text-xs text-mogu-wine flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.active}
                                onChange={(e) => updateItem(item.id, { active: e.target.checked })}
                              />
                              Visible
                            </label>

                            <label className="cursor-pointer text-xs text-mogu-red font-semibold underline">
                              {subiendoImgId === item.id ? "Subiendo..." : "Subir foto"}
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={(e) => subirFotoItem(e, item.id)}
                                disabled={subiendoImgId === item.id}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <button
                            onClick={() => borrarItem(item.id)}
                            className="text-xs text-red-600 font-semibold hover:underline"
                          >
                            Eliminar plato
                          </button>
                        </div>
                      </div>
                    ))}

                  <button
                    onClick={() => agregarItem(cat.id)}
                    className="mt-1 text-xs text-mogu-red font-semibold text-left hover:underline py-1"
                  >
                    + Agregar plato a &quot;{cat.name}&quot;
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

        <button
          onClick={guardarTodo}
          className="w-full bg-mogu-red text-white font-medium text-xs rounded-lg py-3 shadow"
        >
          Guardar Cambios de la Carta
        </button>
        {msg && <p className="text-center text-xs text-mogu-wine mt-3">{msg}</p>}

      </div>
    </main>
  );
}