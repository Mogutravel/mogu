"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NuevaClave() {
  const router = useRouter();
  const [cargado, setCargado] = useState(false);
  const [valido, setValido] = useState(false);
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((evento, sesion) => {
      if (evento === "PASSWORD_RECOVERY" || sesion) setValido(true);
    });
    supabase.auth.getSession().then(({ data: d }) => {
      if (d.session) setValido(true);
      setCargado(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function guardar() {
    setError("");
    if (nueva.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (nueva !== repetir) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setGuardando(true);
    const { error } = await supabase.auth.updateUser({ password: nueva });
    if (error) {
      setError("No se pudo cambiar: " + error.message);
      setGuardando(false);
      return;
    }
    router.push("/panel");
  }

  const campo =
    "w-full border border-mogu-pink rounded-lg px-3 py-3 mb-3 text-mogu-wine";

  return (
    <main className="min-h-screen bg-mogu-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-mogu-pink p-6">
        <img src="/mogu-logo.png" alt="Mogu" className="h-28 w-auto mx-auto mb-4" />
        <h1 className="text-xl font-bold text-mogu-wine mb-4">
          Crea tu contraseña nueva
        </h1>

        {!cargado && <p className="text-mogu-wine/70">Verificando enlace...</p>}

        {cargado && !valido && (
          <>
            <p className="text-mogu-wine/70 mb-5">
              Este enlace no es válido o ya venció. Pide uno nuevo.
            </p>
            <a href="/recuperar" className="text-mogu-red font-medium">
              Pedir otro enlace
            </a>
          </>
        )}

        {cargado && valido && (
          <>
            <input
              type="password"
              placeholder="Contraseña nueva (mínimo 8)"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              className={campo}
            />
            <input
              type="password"
              placeholder="Repite la contraseña"
              value={repetir}
              onChange={(e) => setRepetir(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && guardar()}
              className={campo}
            />
            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
            <button
              onClick={guardar}
              disabled={guardando}
              className="w-full bg-mogu-red text-white font-medium rounded-lg py-3 disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Guardar contraseña"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
