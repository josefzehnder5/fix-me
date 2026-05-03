import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lock } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) {
          setError(err.message);
          return;
        }
        navigate("/admin/payments");
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin/payments` },
        });
        if (err) {
          setError(err.message);
          return;
        }
        setInfo(
          "Cuenta creada. Revisa tu email para confirmar. Un administrador debe asignarte el rol 'admin' en la base de datos antes de poder acceder al panel."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Acceso · Castle Tours</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <main className="flex min-h-screen items-center justify-center bg-[color:var(--color-paper)] px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[var(--shadow-card)]">
          <Link to="/" className="text-xs text-[color:var(--color-muted-foreground)] hover:underline">
            ← Volver al sitio
          </Link>
          <div className="mt-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-paper-warm)]">
            <Lock className="h-5 w-5 text-[color:var(--color-ink)]" />
          </div>
          <h1 className="mt-4 font-display text-2xl text-balance">
            {mode === "login" ? "Acceso operadores" : "Crear cuenta"}
          </h1>
          <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
            Panel de administración de pagos Wompi.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[color:var(--color-border)] bg-white px-3 py-2.5 text-sm focus:border-[color:var(--color-ink)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[color:var(--color-border)] bg-white px-3 py-2.5 text-sm focus:border-[color:var(--color-ink)] focus:outline-none"
              />
            </div>

            {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            {info && <div className="rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-800">{info}</div>}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--color-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Entrar" : "Crear cuenta"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
                setInfo(null);
              }}
              className="block w-full text-center text-xs text-[color:var(--color-muted-foreground)] hover:underline"
            >
              {mode === "login" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Entrar"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
