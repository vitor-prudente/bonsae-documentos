import { User, CreditCard, MapPin, Mail, Phone, Building, type LucideIcon } from "lucide-react";
import { variableIconMap } from "./variableIcons";
import { useEffect, useState } from "react";
import { getAvailableVariables, type CustomVariable } from "@/pages/Documents";

const iconComponents: Record<string, LucideIcon> = {
  user: User,
  "id-card": CreditCard,
  "map-pin": MapPin,
  mail: Mail,
  phone: Phone,
  building: Building,
};

interface VariablesSidebarProps {
  variableValues?: Record<string, string>;
}

export function VariablesSidebar({ variableValues = {} }: VariablesSidebarProps) {
  const [variables, setVariables] = useState<CustomVariable[]>([]);

  useEffect(() => {
    setVariables(getAvailableVariables());
  }, []);

  const handleDragStart = (e: React.DragEvent, variable: CustomVariable) => {
    const value = variableValues[variable.key]?.trim() || "";
    e.dataTransfer.setData("text/plain", value || `{{${variable.key}}}`);
    e.dataTransfer.setData("application/x-variable", variable.key);
    e.dataTransfer.setData("application/x-variable-label", variable.label);
    e.dataTransfer.setData("application/x-variable-value", value);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleInsertClick = (variable: CustomVariable) => {
    const value = variableValues[variable.key]?.trim() || "";
    window.dispatchEvent(
      new CustomEvent("insert-variable", {
        detail: { key: variable.key, label: variable.label, value },
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
          const value = variableValues[v.key]?.trim();
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
                <span className="block text-sm font-medium text-foreground truncate">{v.label}</span>
                {value && (
                  <span className="block text-xs text-muted-foreground truncate mt-0.5">
                    {value}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
