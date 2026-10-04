"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CambiarClave() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function cambiar() {
    setMsg("");
    setOk(false);
    if (!actual) {
      setMsg("Escribe tu contraseña actual");
      return;
    }
    if (nueva.length < 8) {
      setMsg("La contraseña nueva debe tener al menos 8 caracteres");
      return;
    }
    if (nueva !== repetir) {
      setMsg("Las contraseñas nuevas no coinciden");
      return;
    }

    setGuardando(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      setMsg("Vuelve a iniciar sesión");
      setGuardando(false);
      return;
    }

    // Comprobar la contraseña actual
    const { error: e1 } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: actual,
    });
    if (e1) {
      setMsg("La contraseña actual no es correcta");
      setGuardando(false);
      return;
    }

    const { error: e2 } = await supabase.auth.updateUser({ password: nueva });
    setGuardando(false);
    if (e2) {
      setMsg("No se pudo cambiar: " + e2.message);
      return;
    }
    setOk(true);
    setMsg("Contraseña actualizada ✓");
    setActual("");
    setNueva("");
    setRepetir("");
  }

  const campo =
    "w-full border border-mogu-pink rounded-lg px-3 py-2 text-mogu-wine bg-white";

  return (
    <section className="bg-white border border-mogu-pink rounded-xl p-4 mt-8 flex flex-col gap-3">
      <h2 className="font-bold text-mogu-wine">Cambiar contraseña</h2>
      <input
        type="password"
        placeholder="Contraseña actual"
        value={actual}
        onChange={(e) => setActual(e.target.value)}
        className={campo}
      />
      <input
        type="password"
        placeholder="Contraseña nueva (mínimo 8)"
        value={nueva}
        onChange={(e) => setNueva(e.target.value)}
        className={campo}
      />
      <input
        type="password"
        placeholder="Repite la contraseña nueva"
        value={repetir}
        onChange={(e) => setRepetir(e.target.value)}
        className={campo}
      />
      <button
        onClick={cambiar}
        disabled={guardando}
        className="bg-mogu-wine text-white font-medium rounded-lg py-2 disabled:opacity-50"
      >
        {guardando ? "Guardando..." : "Cambiar contraseña"}
      </button>
      {msg && (
        <p className={"text-sm " + (ok ? "text-green-700" : "text-red-600")}>
          {msg}
        </p>
      )}
    </section>
  );
}
