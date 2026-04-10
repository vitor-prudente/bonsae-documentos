import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { VariablesSidebar } from "@/components/VariablesSidebar";
import { SettingsSidebar } from "@/components/SettingsSidebar";
import { DocumentEditor, DocumentEditorRef } from "@/components/DocumentEditor";
import { Settings, ArrowLeft, Braces, PanelRight } from "lucide-react";
import { toast } from "sonner";
import { getPinnedTemplates, togglePinTemplate } from "@/components/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
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
  const isMobile = useIsMobile();
  const [showSettings, setShowSettings] = useState(!isMobile);
  const [showMobileVars, setShowMobileVars] = useState(false);
  const editorRef = useRef<DocumentEditorRef>(null);
  const [initialContent, setInitialContent] = useState("");
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [savingAsTemplate, setSavingAsTemplate] = useState(isTemplate);
  const [isExporting, setIsExporting] = useState(false);
  const [isTemplatePinned, setIsTemplatePinned] = useState(false);

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

  useEffect(() => {
    if (!savingAsTemplate || !currentDocId) {
      setIsTemplatePinned(false);
      return;
    }
    const pinned = getPinnedTemplates();
    setIsTemplatePinned(pinned.some((p) => p.id === currentDocId));
  }, [savingAsTemplate, currentDocId]);

  const handleExportPdf = useCallback(async () => {
    if (isExporting) return;
    const element = editorRef.current?.getEditorElement();
    if (!element) return;
    setIsExporting(true);
    toast.info("Gerando PDF...");
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `${documentTitle || "documento"}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 1.5, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save();
      toast.success("PDF gerado com sucesso!");
    } catch {
      toast.error("Erro ao gerar PDF.");
    } finally {
      setIsExporting(false);
    }
  }, [documentTitle, isExporting]);

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
    const shouldClear = window.confirm("Tem certeza que deseja limpar todo o conteúdo atual?");
    if (!shouldClear) return;

    setLetterheadUrl(null);
    setDocumentTitle(savingAsTemplate ? "Novo Template" : "Novo Documento");
    setInitialContent("");
    setCurrentDocId(null);
    setIsTemplatePinned(false);
    editorRef.current?.setContent("");
    toast.success("Editor limpo.");
  }, [savingAsTemplate]);

  const handleToggleTemplatePin = useCallback(() => {
    if (!savingAsTemplate || !currentDocId) return;

    togglePinTemplate({ id: currentDocId, title: documentTitle });
    const pinned = getPinnedTemplates();
    const nowPinned = pinned.some((p) => p.id === currentDocId);
    setIsTemplatePinned(nowPinned);
    window.dispatchEvent(new Event("pinned-updated"));
    toast.success(nowPinned ? "Template fixado." : "Template desafixado.");
  }, [savingAsTemplate, currentDocId, documentTitle]);

  const handleDeleteDocument = useCallback(() => {
    if (savingAsTemplate || !currentDocId) return;

    const shouldDelete = window.confirm("Tem certeza que deseja excluir este documento?");
    if (!shouldDelete) return;

    const docs = getDocumentList();
    const updatedDocs = docs.filter((doc) => doc.id !== currentDocId);
    saveDocumentList(updatedDocs);

    toast.success("Documento excluído.");
    navigate("/?tab=documents");
  }, [savingAsTemplate, currentDocId, navigate]);

  const handleDeleteTemplate = useCallback(() => {
    if (!savingAsTemplate || !currentDocId) return;

    const shouldDelete = window.confirm("Tem certeza que deseja excluir este template?");
    if (!shouldDelete) return;

    const templates = getTemplateList();
    const updatedTemplates = templates.filter((template) => template.id !== currentDocId);
    saveTemplateList(updatedTemplates);

    const pinned = getPinnedTemplates();
    if (pinned.some((pin) => pin.id === currentDocId)) {
      togglePinTemplate({ id: currentDocId, title: documentTitle });
      window.dispatchEvent(new Event("pinned-updated"));
    }

    toast.success("Template excluído.");
    navigate("/?tab=templates");
  }, [savingAsTemplate, currentDocId, documentTitle, navigate]);

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
        <div className="flex items-center gap-1">
          {isMobile && (
            <button
              onClick={() => setShowMobileVars(!showMobileVars)}
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Variáveis"
            >
              <Braces className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Configurações"
          >
            {showSettings ? <PanelRight className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main area */}
      {/* Mobile variables drawer */}
      {isMobile && showMobileVars && (
        <div className="border-b border-border bg-card max-h-48 overflow-y-auto">
          <VariablesSidebar />
        </div>
      )}

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {!isMobile && <VariablesSidebar />}
        <DocumentEditor
          ref={editorRef}
          letterheadUrl={letterheadUrl}
          initialContent={initialContent}
        />
        {showSettings && (
          <div className={cn(
            isMobile ? "border-t border-border max-h-[50vh] overflow-y-auto" : ""
          )}>
            <SettingsSidebar
              onExportPdf={handleExportPdf}
              onSave={handleSave}
              onClear={handleClear}
              onToggleTemplatePin={handleToggleTemplatePin}
              onDeleteTemplate={handleDeleteTemplate}
              onDeleteDocument={handleDeleteDocument}
              letterheadUrl={letterheadUrl}
              onLetterheadUpload={setLetterheadUrl}
              onLetterheadRemove={() => setLetterheadUrl(null)}
              documentTitle={documentTitle}
              onDocumentTitleChange={setDocumentTitle}
              isExporting={isExporting}
              isTemplateMode={savingAsTemplate}
              isTemplatePinned={isTemplatePinned}
              canManageTemplate={Boolean(currentDocId)}
              canDeleteDocument={Boolean(currentDocId) && !savingAsTemplate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
