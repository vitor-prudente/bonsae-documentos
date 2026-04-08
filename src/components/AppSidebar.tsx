import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  FileText,
  LayoutTemplate,
  Braces,
  Pin,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo-bonsae.png";
import { cn } from "@/lib/utils";

export interface PinnedTemplate {
  id: string;
  title: string;
}

const PINNED_KEY = "bonsae-pinned-templates";

export function getPinnedTemplates(): PinnedTemplate[] {
  try {
    return JSON.parse(localStorage.getItem(PINNED_KEY) || "[]");
  } catch {
    return [];
  }
}

export function savePinnedTemplates(pins: PinnedTemplate[]) {
  localStorage.setItem(PINNED_KEY, JSON.stringify(pins));
}

export function togglePinTemplate(t: PinnedTemplate) {
  const pins = getPinnedTemplates();
  const exists = pins.find((p) => p.id === t.id);
  if (exists) {
    savePinnedTemplates(pins.filter((p) => p.id !== t.id));
  } else {
    savePinnedTemplates([...pins, t]);
  }
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: number;
}

function NavItem({ icon, label, active, onClick, badge }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && (
        <span className="text-xs bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground">
          {badge}
        </span>
      )}
    </button>
  );
}

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pinned, setPinned] = useState<PinnedTemplate[]>([]);

  useEffect(() => {
    setPinned(getPinnedTemplates());

    const handleStorage = () => setPinned(getPinnedTemplates());
    window.addEventListener("storage", handleStorage);
    window.addEventListener("pinned-updated", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pinned-updated", handleStorage);
    };
  }, []);

  const isDocuments = location.search.includes("tab=documents");
  const isTemplates =
    (location.pathname === "/" &&
      !location.search.includes("tab=documents") &&
      !location.search.includes("tab=variables")) ||
    location.search.includes("tab=templates");
  const isVariables = location.search.includes("tab=variables");

  return (
    <aside className="w-[260px] h-screen flex flex-col bg-card border-r border-border shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2">
        <img
          src={logoImg}
          alt="Bonsae"
          className="h-7 cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      {/* Create button */}
      <div className="px-3 mb-2">
        <Button
          onClick={() => navigate("/editor?type=template")}
          className="w-full gap-2 justify-start"
          size="default"
        >
          <Plus className="h-4 w-4" />
          Criar Template
        </Button>
      </div>

      {/* Main nav */}
      <nav className="px-3 space-y-0.5 mt-2">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-3 mb-2">
          Geral
        </p>
        <NavItem
          icon={<LayoutTemplate className="h-4 w-4" />}
          label="Templates"
          active={isTemplates}
          onClick={() => navigate("/")}
        />
        <NavItem
          icon={<FileText className="h-4 w-4" />}
          label="Documentos"
          active={isDocuments}
          onClick={() => navigate("/?tab=documents")}
        />
        <NavItem
          icon={<Variable className="h-4 w-4" />}
          label="Variáveis"
          active={isVariables}
          onClick={() => navigate("/?tab=variables")}
        />
      </nav>

      {/* Pinned templates */}
      <div className="px-3 mt-6 flex-1 overflow-y-auto">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-3 mb-2 flex items-center gap-1.5">
          <Pin className="h-3 w-3" />
          Fixados
        </p>
        {pinned.length === 0 ? (
          <p className="text-xs text-muted-foreground/60 px-3 py-2">
            Nenhum template fixado.
          </p>
        ) : (
          <div className="space-y-0.5">
            {pinned.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate(`/editor?id=${t.id}`)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
              >
                <LayoutTemplate className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate flex-1 text-left">{t.title}</span>
                <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
