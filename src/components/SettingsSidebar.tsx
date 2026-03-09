import { Button } from "@/components/ui/button";
import { FileDown, Save, Upload, Trash2 } from "lucide-react";
import { useRef } from "react";

interface SettingsSidebarProps {
  onExportPdf: () => void;
  onSave: () => void;
  onClear: () => void;
  letterheadUrl: string | null;
  onLetterheadUpload: (url: string) => void;
  onLetterheadRemove: () => void;
  documentTitle: string;
  onDocumentTitleChange: (title: string) => void;
}

export function SettingsSidebar({
  onExportPdf,
  onSave,
  onClear,
  letterheadUrl,
  onLetterheadUpload,
  onLetterheadRemove,
  documentTitle,
  onDocumentTitleChange,
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
    <aside className="w-64 border-l border-border bg-card flex flex-col shrink-0">
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
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => onDocumentTitleChange(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-accent/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
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
            Salvar Documento
          </Button>
          <Button onClick={onClear} variant="ghost" size="sm" className="w-full justify-start text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5 mr-2" />
            Limpar Tudo
          </Button>
        </div>
      </div>

      {/* Export button pinned to bottom */}
      <div className="p-4 border-t border-border">
        <Button onClick={onExportPdf} className="w-full" size="default">
          <FileDown className="h-4 w-4 mr-2" />
          Gerar PDF
        </Button>
      </div>
    </aside>
  );
}
