import { User, CreditCard, MapPin, DollarSign, Calendar, FileText, Briefcase, BadgeCheck, Building, Gavel, type LucideIcon } from "lucide-react";
import { variableIconMap } from "./variableIcons";
import { useEffect, useState } from "react";

const iconComponents: Record<string, LucideIcon> = {
  user: User,
  "id-card": CreditCard,
  "map-pin": MapPin,
  "dollar-sign": DollarSign,
  calendar: Calendar,
  "file-text": FileText,
  briefcase: Briefcase,
  "badge-check": BadgeCheck,
  building: Building,
  gavel: Gavel,
};

interface SidebarVariable {
  id?: string;
  key: string;
  label: string;
}

const defaultVariables: SidebarVariable[] = [
  { key: "nome_cliente", label: "Nome do Cliente" },
  { key: "cpf_cnpj", label: "CPF/CNPJ" },
  { key: "endereco", label: "Endereço" },
  { key: "valor_causa", label: "Valor da Causa" },
  { key: "data_atual", label: "Data Atual" },
  { key: "numero_processo", label: "Nº do Processo" },
  { key: "nome_advogado", label: "Nome do Advogado" },
  { key: "oab", label: "Número OAB" },
  { key: "comarca", label: "Comarca" },
  { key: "vara", label: "Vara" },
];

export function VariablesSidebar() {
  const [variables, setVariables] = useState<SidebarVariable[]>(defaultVariables);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bonsae-variable-list");
      if (!raw) return;
      const custom = JSON.parse(raw) as SidebarVariable[];
      if (Array.isArray(custom) && custom.length > 0) {
        setVariables(custom);
      }
    } catch {
      // ignore malformed localStorage and keep defaults
    }
  }, []);

  const handleDragStart = (e: React.DragEvent, variable: SidebarVariable) => {
    e.dataTransfer.setData("text/plain", `{{${variable.key}}}`);
    e.dataTransfer.setData("application/x-variable", variable.key);
    e.dataTransfer.setData("application/x-variable-label", variable.label);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleInsertClick = (variable: SidebarVariable) => {
    window.dispatchEvent(
      new CustomEvent("insert-variable", {
        detail: { key: variable.key, label: variable.label },
      })
    );
  };

  return (
    <aside className="w-full md:w-64 border-r border-border bg-card flex flex-col shrink-0">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Variáveis Disponíveis
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Arraste ou clique para inserir no editor
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {variables.map((v) => {
          const iconName = variableIconMap[v.key] || "user";
          const IconComponent = iconComponents[iconName] || User;
          return (
            <button
              key={v.key}
              draggable
              onDragStart={(e) => handleDragStart(e, v)}
              onClick={() => handleInsertClick(v)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md bg-accent/60 hover:bg-accent cursor-grab active:cursor-grabbing transition-[background-color,border-color,transform] duration-[var(--duration-base)] border border-transparent hover:border-border hover:translate-x-0.5 active:scale-[0.97] text-left"
              title={`Inserir variável ${v.label}`}
            >
              <IconComponent className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground">{v.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
