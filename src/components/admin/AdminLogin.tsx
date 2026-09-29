"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export const AdminLogin: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "No se pudo iniciar sesión.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#121212] px-4 text-[#FFFFFF]">
      <div className="w-full max-w-md rounded-3xl border border-[#3F3F46] bg-[#27272A] p-7 shadow-2xl sm:p-9">
        <div className="flex flex-col items-center text-center gap-4">
          <Image
            src="/zona-audio-logo.png"
            alt="Zona Audio"
            width={757}
            height={187}
            className="h-12 w-auto max-w-[210px] object-contain"
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d47217]">
              Acceso privado
            </p>
            <h1 className="mt-2 text-2xl font-black">Panel de administración</h1>
            <p className="mt-2 text-sm text-[#e3deda]">
              Gestiona productos, imágenes, categorías y marcas.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="text-xs font-semibold text-[#e3deda]">
              Correo electrónico
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-[#52525B] bg-[#121212] px-3.5 py-3 text-sm outline-none transition focus:border-[#d47217]"
              placeholder="tu-correo@ejemplo.com"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="text-xs font-semibold text-[#e3deda]">
              Contraseña
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-[#52525B] bg-[#121212] px-3.5 py-3 text-sm outline-none transition focus:border-[#d47217]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2.5 text-xs text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#d47217] px-4 py-3 text-sm font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Verificando..." : "Entrar al panel"}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-[#e3deda]">
          Acceso exclusivo para administradores de Zona Audio.
        </p>
      </div>
    </main>
  );
};
