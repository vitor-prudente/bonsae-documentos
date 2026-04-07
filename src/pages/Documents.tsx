import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Trash2, Search, Pin, PinOff, Variable, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import bonsaiImg from "@/assets/bonsai-empty.png";
import { getPinnedTemplates, togglePinTemplate, type PinnedTemplate } from "@/components/AppSidebar";

const STORAGE_LIST_KEY = "legal-doc-list";
const TEMPLATE_LIST_KEY = "bonsae-template-list";
const VARIABLE_LIST_KEY = "bonsae-variable-list";

export interface SavedDocument {
  id: string;
  title: string;
  html: string;
  letterheadUrl: string | null;
  updatedAt: string;
}

export interface SavedTemplate {
  id: string;
  title: string;
  html: string;
  letterheadUrl: string | null;
  updatedAt: string;
}

export interface CustomVariable {
  id: string;
  key: string;
  label: string;
  icon: string;
}

export function getDocumentList(): SavedDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_LIST_KEY);
    if (!raw) {
      const oldDoc = localStorage.getItem("legal-doc-editor");
      if (oldDoc) {
        const data = JSON.parse(oldDoc);
        const doc: SavedDocument = {
          id: crypto.randomUUID(),
          title: data.documentTitle || "Documento sem título",
          html: data.html || "",
          letterheadUrl: data.letterheadUrl || null,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_LIST_KEY, JSON.stringify([doc]));
        localStorage.removeItem("legal-doc-editor");
        return [doc];
      }
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDocumentList(docs: SavedDocument[]) {
  localStorage.setItem(STORAGE_LIST_KEY, JSON.stringify(docs));
}

export function getTemplateList(): SavedTemplate[] {
  try {
    return JSON.parse(localStorage.getItem(TEMPLATE_LIST_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveTemplateList(templates: SavedTemplate[]) {
  localStorage.setItem(TEMPLATE_LIST_KEY, JSON.stringify(templates));
}

export function getCustomVariables(): CustomVariable[] {
  try {
    return JSON.parse(localStorage.getItem(VARIABLE_LIST_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCustomVariables(vars: CustomVariable[]) {
  localStorage.setItem(VARIABLE_LIST_KEY, JSON.stringify(vars));
}

// Default variables
const defaultVariables: CustomVariable[] = [
  { id: "1", key: "nome_cliente", label: "Nome do Cliente", icon: "user" },
  { id: "2", key: "cpf_cnpj", label: "CPF/CNPJ", icon: "id-card" },
  { id: "3", key: "endereco", label: "Endereço", icon: "map-pin" },
  { id: "4", key: "valor_causa", label: "Valor da Causa", icon: "dollar-sign" },
  { id: "5", key: "data_atual", label: "Data Atual", icon: "calendar" },
  { id: "6", key: "numero_processo", label: "Nº do Processo", icon: "file-text" },
  { id: "7", key: "nome_advogado", label: "Nome do Advogado", icon: "briefcase" },
  { id: "8", key: "oab", label: "Número OAB", icon: "badge-check" },
  { id: "9", key: "comarca", label: "Comarca", icon: "building" },
  { id: "10", key: "vara", label: "Vara", icon: "gavel" },
];

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

// ==== Tab Components ====

function DocumentsTab() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setDocuments(getDocumentList());
  }, []);

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    const updated = documents.filter((d) => d.id !== docId);
    saveDocumentList(updated);
    setDocuments(updated);
    toast.success("Documento excluído.");
  };

  const templates = getTemplateList();

  const handleNewFromTemplate = (t: SavedTemplate) => {
    const newDoc: SavedDocument = {
      id: crypto.randomUUID(),
      title: `${t.title} - Documento`,
      html: t.html,
      letterheadUrl: t.letterheadUrl,
      updatedAt: new Date().toISOString(),
    };
    const docs = getDocumentList();
    docs.unshift(newDoc);
    saveDocumentList(docs);
    navigate(`/editor?id=${newDoc.id}`);
    toast.success("Documento criado a partir do template.");
  };

  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>
        <Button onClick={() => setShowTemplatePicker(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Documento
        </Button>
      </div>

      {/* Template picker modal */}
      {showTemplatePicker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowTemplatePicker(false)}>
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground mb-1">Escolha um Template</h3>
            <p className="text-sm text-muted-foreground mb-4">Selecione o template base para criar seu documento.</p>
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <LayoutTemplate className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum template disponível.</p>
                <Button onClick={() => { setShowTemplatePicker(false); navigate("/?tab=templates"); }} variant="outline" size="sm" className="mt-3 gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Template
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleNewFromTemplate(t)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:border-primary/40 hover:bg-accent/50 transition-all text-left"
                  >
                    <LayoutTemplate className="h-5 w-5 text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(t.updatedAt)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {filteredDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <img src={bonsaiImg} alt="Bonsai" className="h-60 mb-6 mix-blend-multiply" />
          <p className="text-lg font-medium">Nenhum documento encontrado</p>
          <p className="text-sm mt-1">Crie um documento a partir de um template existente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => navigate(`/editor?id=${doc.id}`)}
              className="group cursor-pointer rounded-xl border border-border bg-card overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all hover:shadow-md"
            >
              <div className="aspect-[4/3] bg-white flex items-start overflow-hidden relative">
                {doc.html ? (
                  <div
                    className="w-full h-full origin-top-left pointer-events-none document-preview-mini"
                    dangerouslySetInnerHTML={{ __html: doc.html }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/50">
                    <FileText className="h-12 w-12 text-muted-foreground/20" />
                  </div>
                )}
                <button
                  onClick={(e) => handleDelete(e, doc.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 text-muted-foreground hover:text-destructive hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Excluir"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(doc.updatedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function TemplatesTab() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pinned, setPinned] = useState<PinnedTemplate[]>([]);

  useEffect(() => {
    setTemplates(getTemplateList());
    setPinned(getPinnedTemplates());
  }, []);

  const filteredTemplates = templates.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = templates.filter((t) => t.id !== id);
    saveTemplateList(updated);
    setTemplates(updated);
    toast.success("Template excluído.");
  };

  const handlePin = (e: React.MouseEvent, t: SavedTemplate) => {
    e.stopPropagation();
    togglePinTemplate({ id: t.id, title: t.title });
    setPinned(getPinnedTemplates());
    window.dispatchEvent(new Event("pinned-updated"));
    toast.success("Fixados atualizados.");
  };

  const isPinned = (id: string) => pinned.some((p) => p.id === id);

  const handleCreateTemplate = () => {
    navigate("/editor?type=template");
  };

  const handleUseTemplate = (t: SavedTemplate) => {
    // Create a new document from this template
    const newDoc: SavedDocument = {
      id: crypto.randomUUID(),
      title: `${t.title} - Cópia`,
      html: t.html,
      letterheadUrl: t.letterheadUrl,
      updatedAt: new Date().toISOString(),
    };
    const docs = getDocumentList();
    docs.unshift(newDoc);
    saveDocumentList(docs);
    navigate(`/editor?id=${newDoc.id}`);
    toast.success("Documento criado a partir do template.");
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>
        <Button onClick={handleCreateTemplate} variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Template
        </Button>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <LayoutTemplate className="h-16 w-16 mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium">Nenhum template criado</p>
          <p className="text-sm mt-1">Templates são bases reutilizáveis para seus documentos.</p>
          <Button onClick={handleCreateTemplate} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Criar Primeiro Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map((t) => (
            <div
              key={t.id}
              onClick={() => handleUseTemplate(t)}
              className="group cursor-pointer rounded-xl border border-border bg-card overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all hover:shadow-md"
            >
              <div className="aspect-[4/3] bg-white flex items-start overflow-hidden relative">
                {t.html ? (
                  <div
                    className="w-full h-full origin-top-left pointer-events-none document-preview-mini"
                    dangerouslySetInnerHTML={{ __html: t.html }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/50">
                    <LayoutTemplate className="h-12 w-12 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handlePin(e, t)}
                    className="p-1.5 rounded-md bg-background/80 text-muted-foreground hover:text-primary hover:bg-background transition-colors"
                    title={isPinned(t.id) ? "Desafixar" : "Fixar"}
                  >
                    {isPinned(t.id) ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, t.id)}
                    className="p-1.5 rounded-md bg-background/80 text-muted-foreground hover:text-destructive hover:bg-background transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1.5">
                  <LayoutTemplate className="h-3.5 w-3.5 text-primary" />
                  <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(t.updatedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function VariablesTab() {
  const [variables, setVariables] = useState<CustomVariable[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newKey, setNewKey] = useState("");

  useEffect(() => {
    const custom = getCustomVariables();
    if (custom.length === 0) {
      // Initialize with defaults
      saveCustomVariables(defaultVariables);
      setVariables(defaultVariables);
    } else {
      setVariables(custom);
    }
  }, []);

  const handleAdd = () => {
    if (!newLabel.trim() || !newKey.trim()) {
      toast.error("Preencha o nome e a chave da variável.");
      return;
    }
    if (variables.some((v) => v.key === newKey.trim())) {
      toast.error("Já existe uma variável com essa chave.");
      return;
    }
    const newVar: CustomVariable = {
      id: crypto.randomUUID(),
      key: newKey.trim().toLowerCase().replace(/\s+/g, "_"),
      label: newLabel.trim(),
      icon: "file-text",
    };
    const updated = [...variables, newVar];
    saveCustomVariables(updated);
    setVariables(updated);
    setNewLabel("");
    setNewKey("");
    toast.success("Variável criada!");
  };

  const handleDelete = (id: string) => {
    const updated = variables.filter((v) => v.id !== id);
    saveCustomVariables(updated);
    setVariables(updated);
    toast.success("Variável removida.");
  };

  return (
    <>
      {/* Create new */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Nova Variável</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="Nome (ex: Nome do Réu)"
            value={newLabel}
            onChange={(e) => {
              setNewLabel(e.target.value);
              setNewKey(e.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""));
            }}
            className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          />
          <input
            type="text"
            placeholder="Chave (ex: nome_reu)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground font-mono"
          />
        </div>
        <Button onClick={handleAdd} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Variável
        </Button>
      </div>

      {/* Variable list */}
      <div className="space-y-2">
        {variables.map((v) => (
          <div
            key={v.id}
            className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Variable className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{v.label}</p>
              <p className="text-xs text-muted-foreground font-mono">{`{{${v.key}}}`}</p>
            </div>
            <button
              onClick={() => handleDelete(v.id)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition-colors"
              title="Remover"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

// ==== Main Page ====

const Documents = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "templates";

  const titles: Record<string, string> = {
    documents: "Documentos",
    templates: "Templates",
    variables: "Variáveis",
  };

  const descriptions: Record<string, string> = {
    documents: "Documentos preenchidos com dados reais.",
    templates: "Modelos base reutilizáveis para criar documentos.",
    variables: "Gerencie as variáveis disponíveis nos templates.",
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Page header */}
      <div className="px-8 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-foreground">{titles[tab]}</h1>
        <p className="text-sm text-muted-foreground mt-1">{descriptions[tab]}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {tab === "documents" && <DocumentsTab />}
        {tab === "templates" && <TemplatesTab />}
        {tab === "variables" && <VariablesTab />}
      </div>
    </div>
  );
};

export default Documents;
