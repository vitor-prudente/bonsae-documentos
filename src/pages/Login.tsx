import { FormEvent, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, UserPlus } from "lucide-react";
import { toast } from "sonner";
import logoImg from "@/assets/logo-bonsae.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage, isAuthenticated, login, register } from "@/lib/api";

type AuthMode = "login" | "register";

interface LoginLocationState {
  from?: {
    pathname?: string;
    search?: string;
  };
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LoginLocationState | null;
  const redirectTo = `${state?.from?.pathname || "/"}${state?.from?.search || ""}`;
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo]);

  if (isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        await register({ name, email, password });
        toast.success("Conta criada.");
      } else {
        await login({ email, password });
        toast.success("Login realizado.");
      }

      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px] rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <img src={logoImg} alt="Bonsae" className="h-8 object-contain mb-5" />
          <div className="flex items-center gap-2">
            {mode === "login" ? (
              <LockKeyhole className="h-4 w-4 text-primary" />
            ) : (
              <UserPlus className="h-4 w-4 text-primary" />
            )}
            <h1 className="text-lg font-semibold text-foreground">
              {mode === "login" ? "Entrar" : "Criar conta"}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login"
              ? "Use seu e-mail e senha para acessar seus documentos."
              : "Crie um usuario para receber um token de acesso."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === "register" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Nome
              </label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                disabled={isSubmitting}
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              E-mail
            </label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Senha
            </label>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={mode === "register" ? 6 : undefined}
              disabled={isSubmitting}
              required
            />
          </div>

          <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
            {mode === "login" ? <LockKeyhole className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {isSubmitting ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </Button>

          <button
            type="button"
            onClick={() => setMode((current) => (current === "login" ? "register" : "login"))}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            disabled={isSubmitting}
          >
            {mode === "login" ? "Criar uma nova conta" : "Ja tenho uma conta"}
          </button>
        </form>
      </div>
    </main>
  );
}
