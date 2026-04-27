import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileDown, Pin, PinOff, Save, Upload, Trash2, Eraser, Image } from "lucide-react";
import { useRef } from "react";
import type { SavedClient } from "@/lib/clients";

const NO_TEMPLATE_CLIENT = "__none__";

interface SettingsSidebarProps {
  onExportPdf: () => void;
  onSave: () => void;
  onClear: () => void;
  onToggleTemplatePin: () => void;
  onDeleteTemplate: () => void;
  onDeleteDocument: () => void;
  letterheadUrl: string | null;
  letterheadName?: string | null;
  onLetterheadUpload: (url: string, fileName: string) => void;
  onLetterheadRemove: () => void;
  documentTitle: string;
  onDocumentTitleChange: (title: string) => void;
  isExporting?: boolean;
  isTemplateMode?: boolean;
  isTemplatePinned?: boolean;
  canManageTemplate?: boolean;
  canDeleteDocument?: boolean;
  clients?: SavedClient[];
  selectedClientId?: string | null;
  onTemplateClientChange?: (clientId: string | null) => void;
}

export function SettingsSidebar({
  onExportPdf,
  onSave,
  onClear,
  onToggleTemplatePin,
  onDeleteTemplate,
  onDeleteDocument,
  letterheadUrl,
  letterheadName = null,
  onLetterheadUpload,
  onLetterheadRemove,
  documentTitle,
  onDocumentTitleChange,
  isExporting = false,
  isTemplateMode = false,
  isTemplatePinned = false,
  canManageTemplate = false,
  canDeleteDocument = false,
  clients = [],
  selectedClientId = null,
  onTemplateClientChange,
}: SettingsSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        onLetterheadUpload(ev.target.result as string, file.name);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <aside className="w-full md:w-72 border-l border-border bg-card flex flex-col shrink-0">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground tracking-wide">
          Configurações
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Ajuste, salve e gerencie este {isTemplateMode ? "template" : "documento"}.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <section className="space-y-3">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Identificação
            </h3>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Título
            </label>
            <Input
              type="text"
              value={documentTitle}
              onChange={(e) => onDocumentTitleChange(e.target.value)}
              placeholder="Sem título"
            />
          </div>

          {isTemplateMode && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Cliente do template
              </label>
              <Select
                value={selectedClientId || NO_TEMPLATE_CLIENT}
                onValueChange={(value) =>
                  onTemplateClientChange?.(value === NO_TEMPLATE_CLIENT ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_TEMPLATE_CLIENT}>Sem cliente</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Papel timbrado
          </h3>
          {letterheadUrl ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                <Image className="h-4 w-4 text-primary shrink-0" />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                  {letterheadName || "Papel timbrado enviado"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onLetterheadRemove}
                className="w-full justify-start text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Remover
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="w-full justify-start"
            >
              <Upload className="h-3.5 w-3.5 mr-1" />
              Upload Imagem
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Ação principal
          </h3>
          <Button onClick={onSave} size="default" className="w-full justify-start shadow-sm">
            <Save className="h-4 w-4 mr-2" />
            {isTemplateMode ? "Salvar Template" : "Salvar Documento"}
          </Button>
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Manutenção
          </h3>
          {isTemplateMode && (
            <Button
              onClick={onToggleTemplatePin}
              variant="outline"
              size="sm"
              disabled={!canManageTemplate}
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:border-primary/30"
            >
              {isTemplatePinned ? (
                <PinOff className="h-3.5 w-3.5 mr-2" />
              ) : (
                <Pin className="h-3.5 w-3.5 mr-2" />
              )}
              {isTemplatePinned ? "Desafixar Template" : "Fixar Template"}
            </Button>
          )}
          <Button
            onClick={onClear}
            variant="outline"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:border-primary/30"
          >
            <Eraser className="h-3.5 w-3.5 mr-2" />
            Limpar Tudo
          </Button>
          <Button
            onClick={onExportPdf}
            variant="outline"
            size="sm"
            className="w-full justify-start border-primary/35 bg-primary/5 text-foreground hover:border-primary/55 hover:bg-primary/10"
            disabled={isExporting}
          >
            <FileDown className="h-3.5 w-3.5 mr-2" />
            {isExporting ? "Gerando PDF..." : "Gerar PDF"}
          </Button>
        </section>

        <section className="space-y-2 pt-2">
          {!isTemplateMode && (
            <Button
              onClick={onDeleteDocument}
              variant="destructive"
              size="default"
              disabled={!canDeleteDocument}
              className="w-full justify-start bg-[#e5484d] text-white shadow-sm hover:bg-[#d93d42]"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Documento
            </Button>
          )}
          {isTemplateMode && (
            <Button
              onClick={onDeleteTemplate}
              variant="destructive"
              size="default"
              disabled={!canManageTemplate}
              className="w-full justify-start bg-[#e5484d] text-white shadow-sm hover:bg-[#d93d42]"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Template
            </Button>
          )}
        </section>
      </div>
    </aside>
  );
}
