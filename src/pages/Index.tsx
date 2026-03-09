import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { VariablesSidebar } from "@/components/VariablesSidebar";
import { SettingsSidebar } from "@/components/SettingsSidebar";
import { DocumentEditor, DocumentEditorRef } from "@/components/DocumentEditor";
import { Settings, ArrowLeft } from "lucide-react";
import logoImg from "@/assets/logo-bonsae.png";
import { toast } from "sonner";
import {
  getDocumentList,
  saveDocumentList,
  type SavedDocument,
} from "@/pages/Documents";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const docId = searchParams.get("id");

  const [letterheadUrl, setLetterheadUrl] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState("Novo Documento");
  const [showSettings, setShowSettings] = useState(true);
  const editorRef = useRef<DocumentEditorRef>(null);
  const [initialContent, setInitialContent] = useState("");
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);

  // Load existing document if id is provided
  useEffect(() => {
    if (docId) {
      const docs = getDocumentList();
      const doc = docs.find((d) => d.id === docId);
      if (doc) {
        setDocumentTitle(doc.title);
        setLetterheadUrl(doc.letterheadUrl);
        setInitialContent(doc.html);
        setCurrentDocId(doc.id);
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
    const docs = getDocumentList();
    const now = new Date().toISOString();

    if (currentDocId) {
      const idx = docs.findIndex((d) => d.id === currentDocId);
      if (idx !== -1) {
        docs[idx] = {
          ...docs[idx],
          title: documentTitle,
          html,
          letterheadUrl,
          updatedAt: now,
        };
      }
    } else {
      const newDoc: SavedDocument = {
        id: crypto.randomUUID(),
        title: documentTitle,
        html,
        letterheadUrl,
        updatedAt: now,
      };
      docs.unshift(newDoc);
      setCurrentDocId(newDoc.id);
    }

    saveDocumentList(docs);
    toast.success("Documento salvo!");
  }, [letterheadUrl, documentTitle, currentDocId]);

  const handleClear = useCallback(() => {
    setLetterheadUrl(null);
    setDocumentTitle("Novo Documento");
    setInitialContent(" ");
    setCurrentDocId(null);
    setTimeout(() => setInitialContent(""), 50);
    toast.success("Editor limpo.");
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Voltar aos documentos"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
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
