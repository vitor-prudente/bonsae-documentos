import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  FileText,
  LayoutTemplate,
  Braces,
  Home,
  Users,
  Pin,
  ChevronRight,
  PanelLeftClose,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo-bonsae.png";
import { getStoredUser, logout, type BackendUser } from "@/lib/api";
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
  to: string;
  badge?: number;
  collapsed?: boolean;
}

function NavItem({ icon, label, active, to, badge, collapsed }: NavItemProps) {
  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={cn(
        "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
        "transition-[background-color,color] duration-[var(--duration-base)]",
        collapsed && "justify-center px-2",
        active
          ? "bg-primary/10 text-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      )}
    >
      {active && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary animate-fade-in" />
      )}
      {icon}
      {!collapsed && <span className="flex-1 text-left">{label}</span>}
      {!collapsed && badge !== undefined && (
        <span className="text-xs bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground">
          {badge}
        </span>
      )}
    </Link>
  );
}

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [pinned, setPinned] = useState<PinnedTemplate[]>([]);
  const [user, setUser] = useState<BackendUser | null>(getStoredUser());

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

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    window.addEventListener("bonsae-auth-changed", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("bonsae-auth-changed", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const isHome =
    location.pathname === "/" &&
    (!location.search ||
      (!location.search.includes("tab=documents") &&
        !location.search.includes("tab=templates") &&
        !location.search.includes("tab=variables") &&
        !location.search.includes("tab=clients")));
  const isDocuments = location.search.includes("tab=documents");
  const isTemplates = location.search.includes("tab=templates");
  const isVariables = location.search.includes("tab=variables");
  const isClients = location.search.includes("tab=clients");
  const isExplicitHome = location.search.includes("tab=home");

  const handleCreateTemplate = () => {
    navigate(`/editor?type=template&draftId=${crypto.randomUUID()}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Sessao encerrada.");
      navigate("/login", { replace: true });
    } catch {
      toast.success("Sessao encerrada.");
      navigate("/login", { replace: true });
    }
  };

  return (
    <aside
      className={cn(
        "h-screen flex flex-col bg-card border-r border-border shrink-0 overflow-hidden",
        "transition-[width] duration-[220ms] [transition-timing-function:cubic-bezier(0.25,1,0.5,1)]",
        isOpen ? "w-[260px]" : "w-0"
      )}
    >
      <div className="px-4 py-5 flex items-center gap-2">
        <Link to="/">
          <img src={logoImg} alt="Bonsae" className="h-7 cursor-pointer object-contain" />
        </Link>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors ml-auto"
          title="Fechar sidebar"
          aria-label="Fechar sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 mb-2">
        <Button onClick={handleCreateTemplate} className="w-full gap-2 justify-start" size="default">
          <Plus className="h-4 w-4" />
          Criar Template
        </Button>
      </div>

      <nav className="px-3 space-y-0.5 mt-2">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-3 mb-2">
          Geral
        </p>
        <NavItem icon={<Home className="h-4 w-4" />} label="Home" active={isHome || isExplicitHome} to="/" />
        <NavItem icon={<LayoutTemplate className="h-4 w-4" />} label="Templates" active={isTemplates} to="/?tab=templates" />
        <NavItem icon={<FileText className="h-4 w-4" />} label="Documentos" active={isDocuments} to="/?tab=documents" />
        <NavItem icon={<Users className="h-4 w-4" />} label="Clientes" active={isClients} to="/?tab=clients" />
        <NavItem icon={<Braces className="h-4 w-4" />} label="Variaveis" active={isVariables} to="/?tab=variables" />
      </nav>

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
              <Link
                key={t.id}
                to={`/editor?id=${t.id}&type=template`}
                className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
              >
                <LayoutTemplate className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate flex-1 text-left">{t.title}</span>
                <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        {user && (
          <div className="px-3 py-2 mb-2 rounded-lg bg-muted/40 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        <Button onClick={handleLogout} variant="outline" size="sm" className="w-full gap-2 justify-start">
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
