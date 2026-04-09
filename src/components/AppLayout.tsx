import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Braces, FileText, Home, LayoutTemplate, PanelLeftOpen } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const isHome =
    location.pathname === "/" &&
    !location.search.includes("tab=documents") &&
    !location.search.includes("tab=variables") &&
    !location.search.includes("tab=templates");
  const isDocuments = location.search.includes("tab=documents");
  const isTemplates = location.search.includes("tab=templates");
  const isVariables = location.search.includes("tab=variables");

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
      />
      {!isSidebarOpen && (
        <div className="w-14 h-full border-r border-border bg-card shrink-0 flex flex-col items-center pt-4 gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Abrir sidebar"
            aria-label="Abrir sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
          <div className="w-8 border-t border-border" />
          <Link
            to="/"
            title="Home"
            aria-label="Home"
            className={cn(
              "p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
              isHome && "bg-accent text-foreground"
            )}
          >
            <Home className="h-4 w-4" />
          </Link>
          <Link
            to="/?tab=templates"
            title="Templates"
            aria-label="Templates"
            className={cn(
              "p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
              isTemplates && "bg-accent text-foreground"
            )}
          >
            <LayoutTemplate className="h-4 w-4" />
          </Link>
          <Link
            to="/?tab=documents"
            title="Documentos"
            aria-label="Documentos"
            className={cn(
              "p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
              isDocuments && "bg-accent text-foreground"
            )}
          >
            <FileText className="h-4 w-4" />
          </Link>
          <Link
            to="/?tab=variables"
            title="Variáveis"
            aria-label="Variáveis"
            className={cn(
              "p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
              isVariables && "bg-accent text-foreground"
            )}
          >
            <Braces className="h-4 w-4" />
          </Link>
        </div>
      )}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
