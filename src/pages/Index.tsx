import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, useBlocker } from "react-router-dom";
import { VariablesSidebar } from "@/components/VariablesSidebar";
import { SettingsSidebar } from "@/components/SettingsSidebar";
import { DocumentEditor, DocumentEditorRef } from "@/components/DocumentEditor";
import { Settings, ArrowLeft, Braces, PanelRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getPinnedTemplates, togglePinTemplate } from "@/components/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { getApiErrorMessage } from "@/lib/api";
import { getClientList, type SavedClient } from "@/lib/clients";
import {
  createSavedDocument,
  deleteSavedDocument,
  getDocumentList,
  getSavedDocument,
  updateSavedDocument,
} from "@/lib/documents";
import {
  createSavedTemplate,
  deleteSavedTemplate,
  getSavedTemplate,
  getTemplateList,
  updateSavedTemplate,
} from "@/lib/templates";
import { getDraftTitleBase, makeUniqueTitle } from "@/lib/titles";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const docId = searchParams.get("id");
  const isTemplate = searchParams.get("type") === "template";
  const initialClientId = searchParams.get("clientId");
  const draftId = searchParams.get("draftId");

  const [letterheadUrl, setLetterheadUrl] = useState<string | null>(null);
  const [letterheadName, setLetterheadName] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState(
    isTemplate ? "Novo template" : "Novo documento"
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
  const [isDirty, setIsDirty] = useState(false);
  const [clients, setClients] = useState<SavedClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteDocumentDialog, setShowDeleteDocumentDialog] = useState(false);

  const blocker = useBlocker(isDirty);

  useEffect(() => {
    let ignore = false;
    async function loadClients() {
      try {
        const loadedClients = await getClientList();
        if (!ignore) setClients(loadedClients);
      } catch (error) {
        toast.error(getApiErrorMessage(error));
      }
    }

    void loadClients();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (docId) return;

    let ignore = false;
    async function prepareDraft() {
      try {
        const loadedClients = await getClientList();
        const selectedClient = !isTemplate
          ? loadedClients.find((client) => client.id === initialClientId)
          : null;
        const existingTitles = isTemplate
          ? (await getTemplateList()).map((template) => template.title)
          : (await getDocumentList()).map((document) => document.title);
        const titleBase = getDraftTitleBase(isTemplate ? "template" : "document", selectedClient?.name);

        if (ignore) return;
        setClients(loadedClients);
        setDocumentTitle(makeUniqueTitle(titleBase, existingTitles));
        setLetterheadUrl(null);
        setLetterheadName(null);
        setInitialContent("");
        setCurrentDocId(null);
        setSavingAsTemplate(isTemplate);
        setSelectedClientId(!isTemplate ? initialClientId : null);
        setSelectedTemplateId(null);
        setIsTemplatePinned(false);
        editorRef.current?.setContent("");
        setIsDirty(false);
      } catch (error) {
        toast.error(getApiErrorMessage(error));
      }
    }

    void prepareDraft();
    return () => {
      ignore = true;
    };
  }, [docId, draftId, initialClientId, isTemplate]);

  // Load existing document or template
  useEffect(() => {
    if (!docId) return;

    let ignore = false;
    async function loadFile() {
      try {
        const file = isTemplate ? await getSavedTemplate(docId) : await getSavedDocument(docId);
        if (ignore) return;
        setDocumentTitle(file.title);
        setLetterheadUrl(file.letterheadUrl);
        setLetterheadName(file.letterheadName || null);
        setInitialContent(file.html);
        setCurrentDocId(file.id);
        setSavingAsTemplate(isTemplate);
        setSelectedClientId(null);
        setSelectedTemplateId(null);

        if (!isTemplate && "clientId" in file) {
          setSelectedClientId(file.clientId || null);
          setSelectedTemplateId(file.templateId || null);
        }
        setIsDirty(false);
      } catch (error) {
        toast.error(getApiErrorMessage(error));
      }
    }

    void loadFile();
    return () => {
      ignore = true;
    };
  }, [docId, isTemplate]);

  const selectedClientValues = useMemo(
    () =>
      selectedClientId
        ? clients.find((client) => client.id === selectedClientId)?.values || {}
        : {},
    [clients, selectedClientId]
  );

  useEffect(() => {
    if (!savingAsTemplate || !currentDocId) {
      setIsTemplatePinned(false);
      return;
    }
    const pinned = getPinnedTemplates();
    setIsTemplatePinned(pinned.some((p) => p.id === currentDocId));
  }, [savingAsTemplate, currentDocId]);

  // Warn before closing the browser tab with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleContentChange = useCallback(() => {
    setIsDirty(true);
  }, []);

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
          margin: [3, 3, 3, 3],
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

  const handleSave = useCallback(async () => {
    const html = editorRef.current?.getHTML() || "";

    if (savingAsTemplate) {
      try {
        const savedTemplate = currentDocId
          ? await updateSavedTemplate({
              id: currentDocId,
              title: documentTitle,
              html,
              letterheadUrl,
              letterheadName,
              updatedAt: new Date().toISOString(),
            })
          : await createSavedTemplate({
              title: documentTitle,
              html,
              letterheadUrl,
              letterheadName,
            });

        setCurrentDocId(savedTemplate.id);
        setDocumentTitle(savedTemplate.title);
        setLetterheadUrl(savedTemplate.letterheadUrl);
        setLetterheadName(savedTemplate.letterheadName || null);
        setIsDirty(false);
        toast.success("Template salvo!");
      } catch (error) {
        toast.error(getApiErrorMessage(error));
      }
      return;
    }

    try {
      const savedDocument = currentDocId
        ? await updateSavedDocument({
            id: currentDocId,
            title: documentTitle,
            html,
            letterheadUrl,
            letterheadName,
            updatedAt: new Date().toISOString(),
            clientId: selectedClientId,
            templateId: selectedTemplateId,
          })
        : await createSavedDocument({
            title: documentTitle,
            html,
            letterheadUrl,
            letterheadName,
            clientId: selectedClientId,
            templateId: selectedTemplateId,
          });

      setCurrentDocId(savedDocument.id);
      setDocumentTitle(savedDocument.title);
      setLetterheadUrl(savedDocument.letterheadUrl);
      setLetterheadName(savedDocument.letterheadName || null);
      setSelectedClientId(savedDocument.clientId || null);
      setSelectedTemplateId(savedDocument.templateId || null);
      setIsDirty(false);
      toast.success("Documento salvo!");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }, [letterheadUrl, letterheadName, documentTitle, currentDocId, savingAsTemplate, selectedClientId, selectedTemplateId]);

  // Ctrl+S / Cmd+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        void handleSave();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const handleClear = useCallback(() => {
    setShowClearDialog(true);
  }, []);

  const confirmClear = useCallback(() => {
    setLetterheadUrl(null);
    setLetterheadName(null);
    setDocumentTitle(savingAsTemplate ? "Novo template" : "Novo documento");
    setInitialContent("");
    setCurrentDocId(null);
    setSelectedClientId(null);
    setSelectedTemplateId(null);
    setIsTemplatePinned(false);
    editorRef.current?.setContent("");
    setIsDirty(false);
    setShowClearDialog(false);
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
    if (savingAsTemplate) return;
    if (!currentDocId) {
      setIsDirty(false);
      navigate("/?tab=documents");
      toast.success("Documento descartado.");
      return;
    }
    setShowDeleteDocumentDialog(true);
  }, [savingAsTemplate, currentDocId, navigate]);

  const confirmDeleteDocument = useCallback(async () => {
    if (!currentDocId) return;
    try {
      await deleteSavedDocument(currentDocId);
      setIsDirty(false);
      toast.success("Documento excluído.");
      navigate("/?tab=documents");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }, [currentDocId, navigate]);

  const handleDeleteTemplate = useCallback(() => {
    if (!savingAsTemplate) return;
    if (!currentDocId) {
      setIsDirty(false);
      navigate("/?tab=templates");
      toast.success("Template descartado.");
      return;
    }
    setShowDeleteDialog(true);
  }, [savingAsTemplate, currentDocId, navigate]);

  const confirmDeleteTemplate = useCallback(async () => {
    if (!savingAsTemplate || !currentDocId) return;

    try {
      await deleteSavedTemplate(currentDocId);

      const pinned = getPinnedTemplates();
      if (pinned.some((pin) => pin.id === currentDocId)) {
        togglePinTemplate({ id: currentDocId, title: documentTitle });
        window.dispatchEvent(new Event("pinned-updated"));
      }

      setIsDirty(false);
      toast.success("Template excluido.");
      navigate("/?tab=templates");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }, [savingAsTemplate, currentDocId, documentTitle, navigate]);

  const handleDocumentTitleChange = useCallback((title: string) => {
    setDocumentTitle(title);
    setIsDirty(true);
  }, []);

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
          {isDirty && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 animate-fade-in">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80 animate-pulse" />
              Não salvo
            </span>
          )}
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
          <VariablesSidebar variableValues={selectedClientValues} />
        </div>
      )}

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {!isMobile && <VariablesSidebar variableValues={selectedClientValues} />}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <DocumentEditor
            ref={editorRef}
            letterheadUrl={letterheadUrl}
            initialContent={initialContent}
            variableValues={selectedClientValues}
            onContentChange={handleContentChange}
          />
        </div>
        {/* Settings sidebar — slides in/out on desktop; shown inline on mobile */}
        {isMobile ? (
          showSettings && (
            <div className="border-t border-border max-h-[45vh] overflow-y-auto shrink-0">
              <SettingsSidebar
                onExportPdf={handleExportPdf}
                onSave={handleSave}
                onClear={handleClear}
                onToggleTemplatePin={handleToggleTemplatePin}
                onDeleteTemplate={handleDeleteTemplate}
                onDeleteDocument={handleDeleteDocument}
                letterheadUrl={letterheadUrl}
                letterheadName={letterheadName}
                onLetterheadUpload={(url, fileName) => { setLetterheadUrl(url); setLetterheadName(fileName); setIsDirty(true); }}
                onLetterheadRemove={() => { setLetterheadUrl(null); setLetterheadName(null); setIsDirty(true); }}
                documentTitle={documentTitle}
                onDocumentTitleChange={handleDocumentTitleChange}
                isExporting={isExporting}
                isTemplateMode={savingAsTemplate}
                isTemplatePinned={isTemplatePinned}
                canManageTemplate={savingAsTemplate}
                canDeleteDocument={!savingAsTemplate}
              />
            </div>
          )
        ) : (
          <div
            className={cn(
              "overflow-hidden shrink-0",
              "transition-[width,opacity] duration-[220ms]",
              "[transition-timing-function:cubic-bezier(0.25,1,0.5,1)]",
              showSettings ? "w-72 opacity-100" : "w-0 opacity-0"
            )}
          >
            <SettingsSidebar
              onExportPdf={handleExportPdf}
              onSave={handleSave}
              onClear={handleClear}
              onToggleTemplatePin={handleToggleTemplatePin}
              onDeleteTemplate={handleDeleteTemplate}
              onDeleteDocument={handleDeleteDocument}
              letterheadUrl={letterheadUrl}
              letterheadName={letterheadName}
              onLetterheadUpload={(url, fileName) => { setLetterheadUrl(url); setLetterheadName(fileName); setIsDirty(true); }}
              onLetterheadRemove={() => { setLetterheadUrl(null); setLetterheadName(null); setIsDirty(true); }}
              documentTitle={documentTitle}
              onDocumentTitleChange={handleDocumentTitleChange}
              isExporting={isExporting}
              isTemplateMode={savingAsTemplate}
              isTemplatePinned={isTemplatePinned}
              canManageTemplate={savingAsTemplate}
              canDeleteDocument={!savingAsTemplate}
            />
          </div>
        )}
      </div>

      {/* Unsaved changes — navigation blocker */}
      <AlertDialog
        open={blocker.state === "blocked"}
        onOpenChange={(open) => { if (!open) blocker.reset?.(); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterações não salvas</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Se sair agora, elas serão perdidas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>
              Continuar editando
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => blocker.proceed?.()}>
              Sair sem salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear confirmation */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar conteúdo</AlertDialogTitle>
            <AlertDialogDescription>
              Todo o conteúdo será apagado. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClear}>Limpar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete document confirmation */}
      <AlertDialog open={showDeleteDocumentDialog} onOpenChange={setShowDeleteDocumentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento</AlertDialogTitle>
            <AlertDialogDescription>
              O documento será excluído permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDocument}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete template confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir template</AlertDialogTitle>
            <AlertDialogDescription>
              O template será excluído permanentemente e removido dos fixados. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTemplate}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
