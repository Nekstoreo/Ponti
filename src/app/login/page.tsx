"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const loginSuccess = useAuthStore((s) => s.loginSuccess);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirigir si ya está autenticado, respetando si falta completar onboarding
  useEffect(() => {
    if (isAuthenticated) {
      const hasCompleted = useAuthStore.getState().hasCompletedOnboarding();
      router.replace(hasCompleted ? "/" : "/onboarding");
    }
  }, [isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { profile } = await login({ studentId, password });
      loginSuccess(profile);
      // La navegación será manejada por el useEffect según si completó onboarding
    } catch (err) {
      const message = (err as Error).message ?? "Ocurrió un error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // No renderizar nada si está autenticado (el useEffect se encargará de la navegación)
  if (isAuthenticated) {
    return null;
  }

  const canSubmit = studentId.trim().length > 0 && password.trim().length > 0;

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-32 h-12 flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">Ponti</span>
          </div>
          <h1 className="text-xl font-semibold">Bienvenido</h1>
          <p className="text-sm text-muted-foreground">
            Ingresa con tu ID estudiantil y contraseña
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="studentId">
              ID Estudiantil
            </label>
            <input
              id="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="000123456"
              className="w-full rounded-md border px-3 py-2 bg-background"
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2 bg-background"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full h-10 rounded-md bg-foreground text-background disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
            )}
            {loading ? "Iniciando..." : "Ingresar"}
          </button>
        </form>
        <div className="text-center">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:underline"
          >
            ¿Problemas para ingresar?
          </button>
        </div>
      </div>
    </div>
  );
}


