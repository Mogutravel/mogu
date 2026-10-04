"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function entrar() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
      return;
    }
    router.push("/panel");
  }

  return (
    <main className="min-h-screen bg-mogu-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-mogu-pink p-6">
        <img src="/mogu-logo.png" alt="Mogu" className="h-28 w-auto mx-auto mb-4" />
        <p className="text-mogu-wine/70 mb-6">Ingresa a tu panel</p>

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-mogu-pink rounded-lg px-3 py-3 mb-3 text-mogu-wine"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && entrar()}
          className="w-full border border-mogu-pink rounded-lg px-3 py-3 mb-3 text-mogu-wine"
        />

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <button
          onClick={entrar}
          disabled={loading}
          className="w-full bg-mogu-red text-white font-medium rounded-lg py-3 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </main>
  );
}