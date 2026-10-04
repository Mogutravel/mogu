"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Recuperar() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function enviar() {
    if (!email.trim()) {
      setError("Escribe tu correo");
      return;
    }
    setEnviando(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: window.location.origin + "/nueva-clave" }
    );
    setEnviando(false);

    if (error) console.error("Recuperación:", error.message);
    if (error && /rate|limit/i.test(error.message)) {
      setError("Hiciste muchos intentos. Espera unos minutos y vuelve a probar.");
      return;
    }
    // Mensaje neutro: no revela si el correo existe o no
    setEnviado(true);
  }

  return (
    <main className="min-h-screen bg-mogu-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-mogu-pink p-6">
        <img src="/mogu-logo.png" alt="Mogu" className="h-28 w-auto mx-auto mb-4" />
        <h1 className="text-xl font-bold text-mogu-wine mb-1">
          Recuperar contraseña
        </h1>

        {enviado ? (
          <>
            <p className="text-mogu-wine/70 mt-3 mb-6">
              Si ese correo tiene una cuenta, te enviamos un enlace para crear
              una contraseña nueva. Revisa también la carpeta de spam.
            </p>
            <a href="/login" className="text-mogu-red font-medium">
              Volver a ingresar
            </a>
          </>
        ) : (
          <>
            <p className="text-mogu-wine/70 mb-5">
              Escribe tu correo y te enviaremos un enlace para crear una
              contraseña nueva.
            </p>
            <input
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviar()}
              className="w-full border border-mogu-pink rounded-lg px-3 py-3 mb-3 text-mogu-wine"
            />
            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
            <button
              onClick={enviar}
              disabled={enviando}
              className="w-full bg-mogu-red text-white font-medium rounded-lg py-3 disabled:opacity-50"
            >
              {enviando ? "Enviando..." : "Enviar enlace"}
            </button>
            <a
              href="/login"
              className="block text-center text-sm text-mogu-wine/70 mt-4"
            >
              Volver
            </a>
          </>
        )}
      </div>
    </main>
  );
}
