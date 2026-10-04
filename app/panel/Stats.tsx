"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Fila = { dia: string; tipo: string; link_id: string | null; total: number };
type Boton = { id: string; label: string };

const TZ = "America/Santiago";

function ultimosDias(n: number) {
  const salida: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    salida.push(
      new Date(Date.now() - i * 86400000).toLocaleDateString("en-CA", {
        timeZone: TZ,
      })
    );
  }
  return salida;
}

const suma = (filas: Fila[]) => filas.reduce((s, f) => s + f.total, 0);
const corto = (d: string) => d.slice(8) + "/" + d.slice(5, 7);

export default function Stats({ businessId }: { businessId: string }) {
  const [dias, setDias] = useState(7);
  const [filas, setFilas] = useState<Fila[]>([]);
  const [botones, setBotones] = useState<Boton[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      const { data, error } = await supabase.rpc("stats_negocio", {
        p_business: businessId,
        p_days: 30,
      });
      if (error) {
        setError(error.message);
        setCargando(false);
        return;
      }
      const { data: bt } = await supabase
        .from("links")
        .select("id, label")
        .eq("business_id", businessId);
      setFilas(
        (data ?? []).map((f: Fila) => ({ ...f, total: Number(f.total) }))
      );
      setBotones(bt ?? []);
      setCargando(false);
    }
    cargar();
  }, [businessId]);

  const lista = ultimosDias(dias);
  const rango = new Set(lista);
  const enRango = filas.filter((f) => rango.has(f.dia));
  const vistas = enRango.filter((f) => f.tipo === "view");
  const clics = enRango.filter((f) => f.tipo === "click");

  const porDia = lista.map((d) => suma(vistas.filter((f) => f.dia === d)));
  const max = Math.max(1, ...porDia);

  const porBoton = botones
    .map((b) => ({
      label: b.label,
      total: suma(clics.filter((f) => f.link_id === b.id)),
    }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);
  const otros = suma(clics) - porBoton.reduce((s, x) => s + x.total, 0);

  const pestana = (n: number) =>
    "text-sm rounded-lg px-3 py-1 border " +
    (dias === n
      ? "bg-mogu-red text-white border-mogu-red"
      : "bg-white text-mogu-wine border-mogu-pink");

  return (
    <section className="bg-white border border-mogu-pink rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-mogu-wine">Estadísticas</h2>
        <div className="flex gap-2">
          <button className={pestana(7)} onClick={() => setDias(7)}>
            7 días
          </button>
          <button className={pestana(30)} onClick={() => setDias(30)}>
            30 días
          </button>
        </div>
      </div>

      {cargando && <p className="text-sm text-mogu-wine/70">Cargando...</p>}
      {error && (
        <p className="text-sm text-red-600">No se pudieron cargar: {error}</p>
      )}

      {!cargando && !error && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-mogu-cream rounded-lg p-3">
              <p className="text-2xl font-bold text-mogu-wine">
                {suma(vistas)}
              </p>
              <p className="text-xs text-mogu-wine/70">Toques a tu tarjeta</p>
            </div>
            <div className="bg-mogu-cream rounded-lg p-3">
              <p className="text-2xl font-bold text-mogu-wine">
                {suma(clics)}
              </p>
              <p className="text-xs text-mogu-wine/70">Clics en botones</p>
            </div>
          </div>

          <div className="flex items-end gap-px h-20 mb-1">
            {porDia.map((v, i) => (
              <div
                key={lista[i]}
                title={corto(lista[i]) + ": " + v}
                className="flex-1 bg-mogu-red/80 rounded-t"
                style={{ height: Math.max(2, (v / max) * 100) + "%" }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-mogu-wine/50 mb-4">
            <span>{corto(lista[0])}</span>
            <span>{corto(lista[lista.length - 1])}</span>
          </div>

          <h3 className="text-sm font-medium text-mogu-wine mb-2">
            Botones más presionados
          </h3>
          {porBoton.length === 0 && otros === 0 ? (
            <p className="text-sm text-mogu-wine/70">
              Aún no hay clics en este período.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {porBoton.map((b) => (
                <div
                  key={b.label}
                  className="flex justify-between text-sm text-mogu-wine"
                >
                  <span>{b.label}</span>
                  <span className="font-medium">{b.total}</span>
                </div>
              ))}
              {otros > 0 && (
                <div className="flex justify-between text-sm text-mogu-wine/70">
                  <span>Botones eliminados</span>
                  <span>{otros}</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
