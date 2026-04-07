import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { VariablesSidebar } from "@/components/VariablesSidebar";
import { SettingsSidebar } from "@/components/SettingsSidebar";
import { DocumentEditor, DocumentEditorRef } from "@/components/DocumentEditor";
import { Settings, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  getDocumentList,
  saveDocumentList,
  getTemplateList,
  saveTemplateList,
  type SavedDocument,
  type SavedTemplate,
} from "@/pages/Documents";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const docId = searchParams.get("id");
  const isTemplate = searchParams.get("type") === "template";

  const [letterheadUrl, setLetterheadUrl] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState(
    isTemplate ? "Novo Template" : "Novo Documento"
  );
  const [showSettings, setShowSettings] = useState(true);
  const editorRef = useRef<DocumentEditorRef>(null);
  const [initialContent, setInitialContent] = useState("");
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [savingAsTemplate, setSavingAsTemplate] = useState(isTemplate);

  // Load existing document or template
  useEffect(() => {
    if (docId) {
      const docs = getDocumentList();
      const doc = docs.find((d) => d.id === docId);
      if (doc) {
        setDocumentTitle(doc.title);
        setLetterheadUrl(doc.letterheadUrl);
        setInitialContent(doc.html);
        setCurrentDocId(doc.id);
        setSavingAsTemplate(false);
        return;
      }
      // Check templates
      const templates = getTemplateList();
      const tmpl = templates.find((t) => t.id === docId);
      if (tmpl) {
        setDocumentTitle(tmpl.title);
        setLetterheadUrl(tmpl.letterheadUrl);
        setInitialContent(tmpl.html);
        setCurrentDocId(tmpl.id);
        setSavingAsTemplate(true);
      }
    }
  }, [docId]);

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
    const now = new Date().toISOString();

    if (savingAsTemplate) {
      const templates = getTemplateList();
      if (currentDocId) {
        const idx = templates.findIndex((t) => t.id === currentDocId);
        if (idx !== -1) {
          templates[idx] = { ...templates[idx], title: documentTitle, html, letterheadUrl, updatedAt: now };
        } else {
          const newT: SavedTemplate = { id: crypto.randomUUID(), title: documentTitle, html, letterheadUrl, updatedAt: now };
          templates.unshift(newT);
          setCurrentDocId(newT.id);
        }
      } else {
        const newT: SavedTemplate = { id: crypto.randomUUID(), title: documentTitle, html, letterheadUrl, updatedAt: now };
        templates.unshift(newT);
        setCurrentDocId(newT.id);
      }
      saveTemplateList(templates);
      toast.success("Template salvo!");
    } else {
      const docs = getDocumentList();
      if (currentDocId) {
        const idx = docs.findIndex((d) => d.id === currentDocId);
        if (idx !== -1) {
          docs[idx] = { ...docs[idx], title: documentTitle, html, letterheadUrl, updatedAt: now };
        }
      } else {
        const newDoc: SavedDocument = { id: crypto.randomUUID(), title: documentTitle, html, letterheadUrl, updatedAt: now };
        docs.unshift(newDoc);
        setCurrentDocId(newDoc.id);
      }
      saveDocumentList(docs);
      toast.success("Documento salvo!");
    }
  }, [letterheadUrl, documentTitle, currentDocId, savingAsTemplate]);

  const handleClear = useCallback(() => {
    setLetterheadUrl(null);
    setDocumentTitle(savingAsTemplate ? "Novo Template" : "Novo Documento");
    setInitialContent(" ");
    setCurrentDocId(null);
    setTimeout(() => setInitialContent(""), 50);
    toast.success("Editor limpo.");
  }, [savingAsTemplate]);

  return (
    <div className="flex flex-col h-full">
      {/* Compact top bar */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground">·</span>
          {savingAsTemplate && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
              Template
            </span>
          )}
          <span className="text-sm text-muted-foreground truncate max-w-[250px]">
            {documentTitle}
          </span>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Configurações"
        >
          <Settings className="h-4 w-4" />
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
