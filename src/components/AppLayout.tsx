import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Braces, FileText, Home, LayoutTemplate, PanelLeftOpen, X } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppLayout() {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
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
    <div className="flex h-screen overflow-hidden relative">
      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={cn(
        isMobile && "fixed inset-y-0 left-0 z-50 transition-transform duration-200",
        isMobile && !isSidebarOpen && "-translate-x-full"
      )}>
        <AppSidebar
          isOpen={isSidebarOpen || isMobile}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
        />
      </div>

      {!isSidebarOpen && !isMobile && (
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
          <Link to="/" title="Home" aria-label="Home" className={cn("p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors", isHome && "bg-accent text-foreground")}>
            <Home className="h-4 w-4" />
          </Link>
          <Link to="/?tab=templates" title="Templates" aria-label="Templates" className={cn("p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors", isTemplates && "bg-accent text-foreground")}>
            <LayoutTemplate className="h-4 w-4" />
          </Link>
          <Link to="/?tab=documents" title="Documentos" aria-label="Documentos" className={cn("p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors", isDocuments && "bg-accent text-foreground")}>
            <FileText className="h-4 w-4" />
          </Link>
          <Link to="/?tab=variables" title="Variáveis" aria-label="Variáveis" className={cn("p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors", isVariables && "bg-accent text-foreground")}>
            <Braces className="h-4 w-4" />
          </Link>
        </div>
      )}

      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile top bar */}
        {isMobile && (
          <header className="h-12 flex items-center px-3 border-b border-border bg-card shrink-0 gap-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Abrir menu"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-foreground truncate">Bonsae</span>
          </header>
        )}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
