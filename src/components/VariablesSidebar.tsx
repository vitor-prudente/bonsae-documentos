import { GripVertical } from "lucide-react";

const variables = [
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
  const handleDragStart = (e: React.DragEvent, variable: typeof variables[number]) => {
    e.dataTransfer.setData("text/plain", `{{${variable.key}}}`);
    e.dataTransfer.setData("application/x-variable", variable.key);
    e.dataTransfer.setData("application/x-variable-label", variable.label);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Variáveis Disponíveis
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Arraste para o editor
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {variables.map((v) => (
          <div
            key={v.key}
            draggable
            onDragStart={(e) => handleDragStart(e, v)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-accent/60 hover:bg-accent cursor-grab active:cursor-grabbing transition-colors group border border-transparent hover:border-border"
          >
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity" />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-foreground">{v.label}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
