import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDown, Pin, PinOff, Save, Upload, Trash2, Eraser } from "lucide-react";
import { useRef } from "react";

interface SettingsSidebarProps {
  onExportPdf: () => void;
  onSave: () => void;
  onClear: () => void;
  onToggleTemplatePin: () => void;
  onDeleteTemplate: () => void;
  onDeleteDocument: () => void;
  letterheadUrl: string | null;
  onLetterheadUpload: (url: string) => void;
  onLetterheadRemove: () => void;
  documentTitle: string;
  onDocumentTitleChange: (title: string) => void;
  isExporting?: boolean;
  isTemplateMode?: boolean;
  isTemplatePinned?: boolean;
  canManageTemplate?: boolean;
  canDeleteDocument?: boolean;
}

export function SettingsSidebar({
  onExportPdf,
  onSave,
  onClear,
  onToggleTemplatePin,
  onDeleteTemplate,
  onDeleteDocument,
  letterheadUrl,
  onLetterheadUpload,
  onLetterheadRemove,
  documentTitle,
  onDocumentTitleChange,
  isExporting = false,
  isTemplateMode = false,
  isTemplatePinned = false,
  canManageTemplate = false,
  canDeleteDocument = false,
}: SettingsSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        onLetterheadUpload(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <aside className="w-full md:w-64 border-l border-border bg-card flex flex-col shrink-0">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Configurações
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Document Title */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Título do Documento
          </label>
          <Input
            type="text"
            value={documentTitle}
            onChange={(e) => onDocumentTitleChange(e.target.value)}
            placeholder="Sem título"
          />
        </div>

        {/* Letterhead */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Papel Timbrado
          </label>
          {letterheadUrl ? (
            <div className="space-y-2">
              <img
                src={letterheadUrl}
                alt="Papel timbrado"
                className="w-full h-auto rounded-md border border-border"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={onLetterheadRemove}
                className="w-full text-destructive hover:text-destructive"
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
              className="w-full"
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
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Ações
          </label>
          <Button onClick={onSave} variant="outline" size="sm" className="w-full justify-start">
            <Save className="h-3.5 w-3.5 mr-2" />
            {isTemplateMode ? "Salvar Template" : "Salvar Documento"}
          </Button>
          {isTemplateMode && (
            <>
              <Button
                onClick={onToggleTemplatePin}
                variant="outline"
                size="sm"
                disabled={!canManageTemplate}
                className="w-full justify-start"
              >
                {isTemplatePinned ? (
                  <PinOff className="h-3.5 w-3.5 mr-2" />
                ) : (
                  <Pin className="h-3.5 w-3.5 mr-2" />
                )}
                {isTemplatePinned ? "Desafixar Template" : "Fixar Template"}
              </Button>
            </>
          )}
          <Button onClick={onClear} variant="outline" size="sm" className="w-full justify-start">
            <Eraser className="h-3.5 w-3.5 mr-2" />
            Limpar Tudo
          </Button>
          {!isTemplateMode && (
            <Button
              onClick={onDeleteDocument}
              variant="outline"
              size="sm"
              disabled={!canDeleteDocument}
              className="w-full justify-start border-destructive text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Excluir Documento
            </Button>
          )}
          {isTemplateMode && (
            <Button
              onClick={onDeleteTemplate}
              variant="outline"
              size="sm"
              disabled={!canManageTemplate}
              className="w-full justify-start border-destructive text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Excluir Template
            </Button>
          )}
        </div>
      </div>

      {/* Export button pinned to bottom */}
      <div className="p-4 border-t border-border">
        <Button onClick={onExportPdf} className="w-full" size="default" disabled={isExporting}>
          <FileDown className="h-4 w-4 mr-2" />
          {isExporting ? "Gerando PDF..." : "Gerar PDF"}
        </Button>
      </div>
    </aside>
  );
}
