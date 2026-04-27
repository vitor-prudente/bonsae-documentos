import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, FileText, Trash2, Search, Pin, PinOff, Variable, LayoutTemplate, ArrowRight, Users, UserRound, Save, Braces } from "lucide-react";
import { toast } from "sonner";
import bonsaiImg from "@/assets/bonsai-empty.png";
import { getPinnedTemplates, togglePinTemplate, type PinnedTemplate } from "@/components/AppSidebar";
import { getDocumentPreviewText } from "@/lib/documentPreview";
import { getClientList, saveClientList, type SavedClient } from "@/lib/clients";
import { getDraftTitleBase, makeUniqueTitle } from "@/lib/titles";

const STORAGE_LIST_KEY = "legal-doc-list";
const TEMPLATE_LIST_KEY = "bonsae-template-list";
const VARIABLE_LIST_KEY = "bonsae-variable-list";

export interface SavedDocument {
  id: string;
  title: string;
  html: string;
  letterheadUrl: string | null;
  letterheadName?: string | null;
  updatedAt: string;
  clientId?: string | null;
}

export interface SavedTemplate {
  id: string;
  title: string;
  html: string;
  letterheadUrl: string | null;
  letterheadName?: string | null;
  updatedAt: string;
  clientId?: string | null;
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

export function getAvailableVariables(): CustomVariable[] {
  const custom = getCustomVariables();
  if (custom.length > 0) return custom;
  saveCustomVariables(defaultVariables);
  return defaultVariables;
}

export function applyClientValuesToTemplateHtml(html: string, values: Record<string, string>) {
  if (!html || typeof document === "undefined") return html;

  const template = document.createElement("template");
  template.innerHTML = html;
  template.content.querySelectorAll<HTMLElement>("span[data-variable]").forEach((node) => {
    const key = node.dataset.variable;
    const value = key ? values[key]?.trim() : "";
    if (value) {
      node.replaceWith(document.createTextNode(value));
    }
  });

  return template.innerHTML;
}

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
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [clients, setClients] = useState<SavedClient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showTemplateClientPicker, setShowTemplateClientPicker] = useState(false);

  useEffect(() => {
    setDocuments(getDocumentList());
    setTemplates(getTemplateList());
    setClients(getClientList());
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

  const handleNewFromTemplate = (t: SavedTemplate) => {
    const client = clients.find((c) => c.id === t.clientId);
    const hydratedHtml = client
      ? applyClientValuesToTemplateHtml(t.html, client.values)
      : t.html;
    const docs = getDocumentList();
    const titleBase = getDraftTitleBase("document", client?.name);
    const newDoc: SavedDocument = {
      id: crypto.randomUUID(),
      title: makeUniqueTitle(titleBase, docs.map((doc) => doc.title)),
      html: hydratedHtml,
      letterheadUrl: t.letterheadUrl,
      letterheadName: t.letterheadName || null,
      updatedAt: new Date().toISOString(),
      clientId: client?.id || null,
    };
    docs.unshift(newDoc);
    saveDocumentList(docs);
    navigate(`/editor?id=${newDoc.id}`);
    toast.success("Documento criado a partir do template.");
  };

  const handleOpenTemplateClientPicker = () => {
    setShowTemplatePicker(false);
    setClients(getClientList());
    setShowTemplateClientPicker(true);
  };

  const handleCreateTemplateForClient = (client: SavedClient) => {
    setShowTemplateClientPicker(false);
    navigate(`/editor?type=template&clientId=${client.id}&draftId=${crypto.randomUUID()}`);
  };

  const handleCreateTemplateWithoutClient = () => {
    setShowTemplateClientPicker(false);
    navigate(`/editor?type=template&draftId=${crypto.randomUUID()}`);
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowTemplatePicker(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Documento
        </Button>
      </div>

      <Dialog open={showTemplatePicker} onOpenChange={setShowTemplatePicker}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Escolha um template</DialogTitle>
            <DialogDescription>Selecione o template base para criar seu documento.</DialogDescription>
          </DialogHeader>
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <LayoutTemplate className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum template disponível.</p>
                <Button onClick={handleOpenTemplateClientPicker} variant="outline" size="sm" className="mt-3 gap-2">
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
                      <p className="text-xs text-muted-foreground">
                        {clients.find((c) => c.id === t.clientId)?.name || "Sem cliente associado"} · {formatDate(t.updatedAt)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
        </DialogContent>
      </Dialog>

      <Dialog open={showTemplateClientPicker} onOpenChange={setShowTemplateClientPicker}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Escolha o cliente</DialogTitle>
            <DialogDescription>
              O template será criado exibindo as variáveis reais do cliente selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            <button
              onClick={handleCreateTemplateWithoutClient}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:border-primary/40 hover:bg-accent/50 transition-all text-left"
            >
              <Braces className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">Sem cliente</p>
                <p className="text-xs text-muted-foreground">
                  Usar variáveis sem dados preenchidos
                </p>
              </div>
            </button>
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => handleCreateTemplateForClient(client)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:border-primary/40 hover:bg-accent/50 transition-all text-left"
              >
                <Users className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{client.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {client.values.nome_cliente || "Cliente sem nome preenchido"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {filteredDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <img src={bonsaiImg} alt="Bonsai" className="h-60 mb-6 mix-blend-multiply animate-float" />
          <p className="text-lg font-medium">Nenhum documento encontrado</p>
          <p className="text-sm mt-1">Crie um documento a partir de um template existente.</p>
          <Button
            onClick={() => navigate("/?tab=templates")}
            variant="outline"
            className="mt-4 gap-2 bg-white text-foreground hover:bg-accent"
          >
            <LayoutTemplate className="h-4 w-4" />
            Ver templates
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocs.map((doc, i) => (
            <div
              key={doc.id}
              onClick={() => navigate(`/editor?id=${doc.id}`)}
              className="animate-fade-up group cursor-pointer rounded-xl border border-border bg-card overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{ animationDelay: `${Math.min(i, 7) * 45}ms` }}
            >
              <div className="aspect-[4/3] bg-white flex items-start overflow-hidden relative">
                {doc.html ? (
                  <div className="w-full h-full pointer-events-none document-preview-mini">
                    <p className="line-clamp-6 text-sm text-muted-foreground">
                      {getDocumentPreviewText(doc.html)}
                    </p>
                  </div>
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

function HomeTab() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);

  useEffect(() => {
    setDocuments(getDocumentList());
    setTemplates(getTemplateList());
  }, []);

  const recentDocuments = [...documents]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 4);
  const recentTemplates = [...templates]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {recentTemplates.length === 0 && recentDocuments.length === 0 && (
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Como usar o Bonsae Documentos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Siga este fluxo para criar documentos padronizados de forma mais rápida.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            <div className="rounded-lg border border-border p-4 bg-background/50">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Passo 1</p>
              <p className="text-sm font-medium mt-1">Crie um template</p>
              <p className="text-xs text-muted-foreground mt-1">
                Monte o modelo base no editor com o cabeçalho e a estrutura principal.
              </p>
            </div>
            <div className="rounded-lg border border-border p-4 bg-background/50">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Passo 2</p>
              <p className="text-sm font-medium mt-1">Use variáveis</p>
              <p className="text-xs text-muted-foreground mt-1">
                Insira variáveis como {`{{nome_cliente}}`} para reaproveitar o template em novos casos.
              </p>
            </div>
            <div className="rounded-lg border border-border p-4 bg-background/50">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Passo 3</p>
              <p className="text-sm font-medium mt-1">Gere documentos</p>
              <p className="text-xs text-muted-foreground mt-1">
                Crie documentos a partir dos templates, preencha os dados e exporte em PDF.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-5">
            <Button onClick={() => navigate("/?tab=templates")} className="gap-2">
              <LayoutTemplate className="h-4 w-4" />
              Ir para Templates
            </Button>
            <Button onClick={() => navigate("/?tab=documents")} variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Ver Documentos
            </Button>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Arquivos salvos</h3>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/?tab=templates")}>
            Gerenciar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {recentTemplates.length === 0 && recentDocuments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">Você ainda não tem templates ou documentos salvos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <LayoutTemplate className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Templates recentes</h4>
              </div>
              {recentTemplates.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhum template criado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {recentTemplates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => navigate(`/editor?id=${t.id}&type=template`)}
                      className="w-full text-left px-3 py-2 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/40 transition-colors"
                    >
                      <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(t.updatedAt)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Documentos recentes</h4>
              </div>
              {recentDocuments.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhum documento criado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {recentDocuments.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => navigate(`/editor?id=${doc.id}`)}
                      className="w-full text-left px-3 py-2 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/40 transition-colors"
                    >
                      <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(doc.updatedAt)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function TemplatesTab() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [clients, setClients] = useState<SavedClient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pinned, setPinned] = useState<PinnedTemplate[]>([]);
  const [showClientPicker, setShowClientPicker] = useState(false);

  useEffect(() => {
    setTemplates(getTemplateList());
    setClients(getClientList());
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
    setClients(getClientList());
    setShowClientPicker(true);
  };

  const handleCreateTemplateForClient = (client: SavedClient) => {
    setShowClientPicker(false);
    navigate(`/editor?type=template&clientId=${client.id}&draftId=${crypto.randomUUID()}`);
  };

  const handleCreateTemplateWithoutClient = () => {
    setShowClientPicker(false);
    navigate(`/editor?type=template&draftId=${crypto.randomUUID()}`);
  };

  const handleEditTemplate = (t: SavedTemplate) => {
    navigate(`/editor?id=${t.id}&type=template`);
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleCreateTemplate} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Template
        </Button>
      </div>

      <Dialog open={showClientPicker} onOpenChange={setShowClientPicker}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Escolha o cliente</DialogTitle>
            <DialogDescription>
              O template será criado exibindo as variáveis reais do cliente selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            <button
              onClick={handleCreateTemplateWithoutClient}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:border-primary/40 hover:bg-accent/50 transition-all text-left"
            >
              <Braces className="h-5 w-5 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">Sem cliente</p>
                <p className="text-xs text-muted-foreground">
                  Usar variáveis sem dados preenchidos
                </p>
              </div>
            </button>
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => handleCreateTemplateForClient(client)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:border-primary/40 hover:bg-accent/50 transition-all text-left"
              >
                <Users className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{client.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {client.values.nome_cliente || "Cliente sem nome preenchido"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <img src={bonsaiImg} alt="Bonsai" className="h-60 mb-6 mix-blend-multiply animate-float" />
          <p className="text-lg font-medium">Nenhum template criado</p>
          <p className="text-sm mt-1">Crie um template para começar a gerar documentos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map((t, i) => (
            <div
              key={t.id}
              onClick={() => handleEditTemplate(t)}
              className="animate-fade-up group cursor-pointer rounded-xl border border-border bg-card overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{ animationDelay: `${Math.min(i, 7) * 45}ms` }}
            >
              <div className="aspect-[4/3] bg-white flex items-start overflow-hidden relative">
                {t.html ? (
                  <div className="w-full h-full pointer-events-none document-preview-mini">
                    <p className="line-clamp-6 text-sm text-muted-foreground">
                      {getDocumentPreviewText(t.html)}
                    </p>
                  </div>
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

  useEffect(() => {
    setVariables(getAvailableVariables());
  }, []);

  return (
    <>
      {/* Variable list */}
      <div className="space-y-2 client-switch-motion">
        {variables.map((v, index) => (
          <div
            key={v.id}
            className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors client-field-motion"
            style={{ animationDelay: `${Math.min(index, 8) * 24}ms` }}
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Variable className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{v.label}</p>
              <p className="text-xs text-muted-foreground font-mono">{`{{${v.key}}}`}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ClientsTab() {
  const [clients, setClients] = useState<SavedClient[]>([]);
  const [variables, setVariables] = useState<CustomVariable[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadedClients = getClientList();
    setClients(loadedClients);
    setVariables(getAvailableVariables());
    if (loadedClients.length > 0) {
      setSelectedClientId(loadedClients[0].id);
      setDraftValues(loadedClients[0].values);
    }
  }, []);

  const selectedClient = clients.find((client) => client.id === selectedClientId) || null;

  const handleSelectClient = (client: SavedClient) => {
    if (client.id === selectedClientId) return;
    setSelectedClientId(client.id);
    setDraftValues({ ...client.values });
  };

  const handleSaveClient = () => {
    if (!selectedClient) return;
    const updatedClients = clients.map((client) =>
      client.id === selectedClient.id
        ? { ...client, values: draftValues, updatedAt: new Date().toISOString() }
        : client
    );
    setClients(updatedClients);
    saveClientList(updatedClients);
    toast.success("Dados do cliente salvos.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-5">
      <div className="space-y-2">
        {clients.map((client) => {
          const isSelected = client.id === selectedClientId;
          return (
            <button
              key={client.id}
              onClick={() => handleSelectClient(client)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-[background-color,border-color,box-shadow,transform] duration-[var(--duration-base)] [transition-timing-function:var(--ease-out-quart)] hover:-translate-y-0.5 active:scale-[0.99] ${
                isSelected
                  ? "border-primary/50 bg-primary/10 shadow-sm"
                  : "border-border bg-card hover:border-primary/30 hover:bg-accent/40"
              }`}
            >
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-[background-color,transform] duration-[var(--duration-base)] [transition-timing-function:var(--ease-out-quart)] ${
                  isSelected ? "bg-primary/15 scale-105" : "bg-primary/10"
                }`}
              >
                <UserRound className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{client.name}</p>
                <p className="text-xs text-muted-foreground">{formatDate(client.updatedAt)}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div key={`client-header-${selectedClient?.id || "empty"}`} className="min-w-0 client-switch-motion">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground truncate">
                {selectedClient?.name || "Selecione um cliente"}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Preencha os valores reais usados nos templates.
            </p>
          </div>
          <Button onClick={handleSaveClient} size="sm" className="gap-2" disabled={!selectedClient}>
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>

        <div
          key={`client-form-${selectedClient?.id || "empty"}`}
          className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 client-switch-motion"
        >
          {variables.map((variable, index) => (
            <div
              key={variable.key}
              className="space-y-1.5 client-field-motion"
              style={{ animationDelay: `${Math.min(index, 8) * 24}ms` }}
            >
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {variable.label}
              </label>
              <Input
                value={draftValues[variable.key] || ""}
                onChange={(event) =>
                  setDraftValues((current) => ({
                    ...current,
                    [variable.key]: event.target.value,
                  }))
                }
                placeholder={`Valor para {{${variable.key}}}`}
                disabled={!selectedClient}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==== Main Page ====

const Documents = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "home";

  const titles: Record<string, string> = {
    home: "Home",
    documents: "Documentos",
    templates: "Templates",
    variables: "Variáveis",
    clients: "Clientes",
  };

  const descriptions: Record<string, string> = {
    home: "Comece por aqui para entender o fluxo e acessar seus arquivos recentes.",
    documents: "Documentos preenchidos com dados reais.",
    templates: "Modelos base reutilizáveis para criar documentos.",
    variables: "Consulte as variáveis disponíveis nos templates.",
    clients: "Cadastre os valores reais das variáveis para cada cliente.",
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Page header */}
      <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{titles[tab]}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{descriptions[tab]}</p>
      </div>

      {/* Content — key forces remount + fade-up on every tab switch */}
      <div key={tab} className="flex-1 overflow-y-auto px-4 sm:px-8 pb-8 animate-fade-up">
        {tab === "home" && <HomeTab />}
        {tab === "documents" && <DocumentsTab />}
        {tab === "templates" && <TemplatesTab />}
        {tab === "variables" && <VariablesTab />}
        {tab === "clients" && <ClientsTab />}
      </div>
    </div>
  );
};

export default Documents;
