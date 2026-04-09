import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card p-8 text-center shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Erro de rota</p>
        <h1 className="mb-3 text-4xl font-bold tracking-tight">404</h1>
        <p className="mb-6 text-base text-muted-foreground">
          A página que você tentou acessar não existe ou foi movida.
        </p>
        <Link
          to="/"
          className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Voltar para início
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
