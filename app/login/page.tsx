"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button, Input } from "@/components/ui";

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
    <main className="flex min-h-screen items-center justify-center bg-mogu-cream px-4">
      <div className="w-full max-w-sm rounded-2xl border border-mogu-pink bg-white p-6 shadow-sm">
        <a href="/" className="mb-4 block text-center">
          <img
            src="/mogu-logo.png"
            alt="Mogu"
            className="mx-auto h-24 w-auto"
          />
        </a>

        <h1 className="mb-1 text-center text-lg font-semibold text-mogu-wine">
          Ingresa a tu panel
        </h1>
        <p className="mb-6 text-center text-sm text-mogu-wine">
          Administra tu tarjeta NFC y tus enlaces
        </p>

        <div className="flex flex-col gap-3">
          <Input
            type="email"
            name="email"
            label="Correo"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            type="password"
            name="password"
            label="Contraseña"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && entrar()}
            autoComplete="current-password"
            error={error || undefined}
          />

          <Button
            onClick={entrar}
            disabled={loading}
            fullWidth
            size="lg"
            className="mt-1"
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </div>

        <a
          href="/recuperar"
          className="mt-5 block text-center text-sm text-mogu-gray-500 hover:text-mogu-red hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </main>
  );
}