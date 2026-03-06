import { useState, useRef, useCallback } from "react";
import { VariablesSidebar } from "@/components/VariablesSidebar";
import { SettingsSidebar } from "@/components/SettingsSidebar";
import { DocumentEditor, DocumentEditorRef } from "@/components/DocumentEditor";
import { Scale, Settings } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "legal-doc-editor";

const Index = () => {
  const [letterheadUrl, setLetterheadUrl] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState("Novo Documento");
  const [showSettings, setShowSettings] = useState(true);
  const editorRef = useRef<DocumentEditorRef>(null);
  const [initialContent, setInitialContent] = useState("");

  const handleExportPdf = useCallback(async () => {
    const element = editorRef.current?.getEditorElement();
    if (!element) return;

    toast.info("Gerando PDF...");
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `${documentTitle || "documento"}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save();
      toast.success("PDF gerado com sucesso!");
    } catch {
      toast.error("Erro ao gerar PDF.");
    }
  }, [documentTitle]);

  const handleSave = useCallback(() => {
    const html = editorRef.current?.getHTML() || "";
    const data = { html, letterheadUrl, documentTitle };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    toast.success("Documento salvo no navegador!");
  }, [letterheadUrl, documentTitle]);

  const handleLoadSaved = useCallback(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      toast.error("Nenhum documento salvo encontrado.");
      return;
    }
    try {
      const data = JSON.parse(raw);
      setLetterheadUrl(data.letterheadUrl || null);
      setDocumentTitle(data.documentTitle || "Novo Documento");
      setInitialContent(data.html || "");
      toast.success("Documento carregado!");
    } catch {
      toast.error("Erro ao carregar documento.");
    }
  }, []);

  const handleClear = useCallback(() => {
    setLetterheadUrl(null);
    setDocumentTitle("Novo Documento");
    setInitialContent(" ");
    setTimeout(() => setInitialContent(""), 50);
    toast.success("Editor limpo.");
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Scale className="h-5 w-5 text-primary" />
          <h1 className="text-base font-semibold text-foreground">
            Editor Jurídico
          </h1>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
            {documentTitle}
          </span>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Configurações"
        >
          <Settings className="h-5 w-5" />
        </button>
      </header>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        <VariablesSidebar />
        <DocumentEditor
          ref={editorRef}
          letterheadUrl={letterheadUrl}
          initialContent={initialContent}
        />
        {showSettings && (
          <SettingsSidebar
            onExportPdf={handleExportPdf}
            onSave={handleSave}
            onLoadSaved={handleLoadSaved}
            onClear={handleClear}
            letterheadUrl={letterheadUrl}
            onLetterheadUpload={setLetterheadUrl}
            onLetterheadRemove={() => setLetterheadUrl(null)}
            documentTitle={documentTitle}
            onDocumentTitleChange={setDocumentTitle}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
