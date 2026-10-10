"use client";

import React, { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";

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
  emoji?: string;
};

const EMOJIS = ["🛍️", "⭐", "📍", "📸", "💬", "📖", "📞", "🌐", "📅", "🔗"];

export default function StudioPanel() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // Campos para nuevo enlace
  const [newEmoji, setNewEmoji] = useState("🛍️");
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");

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
          .order("position", { ascending: true });
        setLinks(l ?? []);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  // Manejador del Drag & Drop al soltar un elemento
  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;

    const items = Array.from(links);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updated = items.map((item, index) => ({
      ...item,
      position: index + 1,
    }));

    setLinks(updated);
  }

  async function agregarEnlace() {
    if (!business || !newLabel.trim()) return;

    const { data, error } = await supabase
      .from("links")
      .insert({
        business_id: business.id,
        type: "custom",
        label: newLabel,
        url: newUrl.startsWith("http") ? newUrl : `https://${newUrl}`,
        emoji: newEmoji,
        position: links.length + 1,
        active: true,
      })
      .select()
      .single();

    if (error) {
      setMsg("Error al crear botón: " + error.message);
      return;
    }

    setLinks([...links, data]);
    setNewLabel("");
    setNewUrl("");
  }

  async function borrar(id: string) {
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (error) {
      setMsg("Error al borrar: " + error.message);
      return;
    }
    setLinks(links.filter((l) => l.id !== id));
  }

  async function guardarOrden() {
    if (!business) return;
    setMsg("Guardando orden...");

    let fallo = false;
    for (const [i, l] of links.entries()) {
      const { error } = await supabase
        .from("links")
        .update({ position: i + 1 })
        .eq("id", l.id);
      if (error) fallo = true;
    }

    setMsg(fallo ? "Error al guardar el orden" : "Orden actualizado ✓");
    setTimeout(() => setMsg(""), 3000);
  }

  if (loading) {
    return <main className="min-h-screen bg-[#0A0A0C] text-white p-8 flex items-center justify-center">Cargando estudio...</main>;
  }

  if (!business) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white font-sans selection:bg-emerald-500/30">
      
      {/* BARRA SUPERIOR HEADER */}
      <header className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between bg-neutral-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="font-black text-xl tracking-wider text-white">MOGU.</span>
          <span className="text-xs text-neutral-400 font-medium">Estudio de Personalización PyME</span>
        </div>
        <a
          href={`/${business.slug}`}
          target="_blank"
          className="px-4 py-2 bg-neutral-900 border border-neutral-700/80 hover:border-emerald-500/50 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
        >
          <span>Ver mi Perfil en Vivo</span>
          <span>↗</span>
        </a>
      </header>

      {/* CONTENEDOR PRINCIPAL DOS COLUMNAS */}
      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO Y LISTA DRAG & DROP */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Canales y Enlaces Interactivos</h2>
            <p className="text-xs text-neutral-400">Elige el emoji representativo para cada botón de tu negocio.</p>
          </div>

          {/* CREADOR DE ENLACE */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 space-y-3">
            <div className="flex gap-2">
              <select
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 text-white rounded-xl px-3 py-2 text-base cursor-pointer focus:border-emerald-500 outline-none"
              >
                {EMOJIS.map((emoji) => (
                  <option key={emoji} value={emoji}>{emoji}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Título (ej. Menú Digital, WhatsApp)"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-800 text-white rounded-xl px-3.5 py-2 text-xs focus:border-emerald-500 outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="URL de destino (https://...)"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl px-3.5 py-2 text-xs focus:border-emerald-500 outline-none"
            />
            <button
              onClick={agregarEnlace}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              + AÑADIR ENLACE INTERACTIVO
            </button>
          </div>

          {/* LISTA DE BOTONES REORDENABLES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Mantén presionado <b>⋮⋮</b> para cambiar el orden</span>
              {msg && <span className="text-emerald-400 font-bold">{msg}</span>}
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="studio-links">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {links.map((link, index) => (
                      <Draggable key={link.id} draggableId={link.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center justify-between p-4 bg-neutral-900/60 border rounded-2xl transition-all ${
                              snapshot.isDragging
                                ? "border-emerald-500 bg-neutral-800 shadow-2xl scale-[1.01] z-50"
                                : "border-neutral-800/80 hover:border-neutral-700"
                            }`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              {/* MANIJA PARA MOVER */}
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-500 hover:text-white transition flex items-center justify-center"
                                title="Arrastrar para mover"
                              >
                                <span className="text-base font-black leading-none">⋮⋮</span>
                              </div>

                              <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-base flex-shrink-0">
                                {link.emoji || "🔗"}
                              </div>

                              <div className="overflow-hidden">
                                <h4 className="text-xs font-bold text-white truncate">{link.label}</h4>
                                <p className="text-[10px] text-neutral-400 truncate">{link.url}</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => borrar(link.id)}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-bold rounded-xl transition cursor-pointer"
                            >
                              Borrar
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {links.length > 0 && (
              <button
                onClick={guardarOrden}
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl border border-neutral-700 transition cursor-pointer mt-2"
              >
                Guardar nuevo orden ✓
              </button>
            )}
          </div>

        </div>

        {/* COLUMNA DERECHA: MOCKUP DEL TELÉFONO EN TIEMPO REAL */}
        <div className="lg:col-span-5 flex justify-center sticky top-8">
          <div className="w-[320px] h-[640px] bg-[#0E0E11] border-[8px] border-neutral-800 rounded-[40px] p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            
            {/* BARRA SUPERIOR SIMULADA DE TELÉFONO */}
            <div className="w-28 h-4 bg-neutral-800 rounded-full mx-auto mb-4" />

            <div className="space-y-4 text-center overflow-y-auto pr-1">
              <div className="w-16 h-16 rounded-full bg-emerald-400 text-black mx-auto flex items-center justify-center text-2xl font-black shadow-lg">
                M
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{business.name}</h3>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">Ecosistema Digital</p>
                <p className="text-[10px] text-neutral-400 mt-1">Comparte tu identidad digital con un solo Tap</p>
              </div>

              <div className="w-full py-2.5 bg-emerald-400 text-black text-[10px] font-black uppercase tracking-wider rounded-xl shadow">
                GUARDAR EN CONTACTOS
              </div>

              {/* LISTA EN TIEMPO REAL DENTRO DEL MOCKUP */}
              <div className="space-y-2 pt-2">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl flex items-center justify-between text-left transition-all"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-xs">{link.emoji || "🔗"}</span>
                      <span className="text-[11px] font-bold text-white truncate">{link.label}</span>
                    </div>
                    <span className="text-xs text-neutral-500">→</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[9px] text-neutral-600 text-center uppercase tracking-widest pt-3">POWERED BY MOGU</p>
          </div>
        </div>

      </main>
    </div>
  );
}