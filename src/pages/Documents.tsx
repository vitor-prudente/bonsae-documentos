import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import logoImg from "@/assets/logo-bonsae.png";
import bonsaiImg from "@/assets/bonsai-empty.png";

const STORAGE_PREFIX = "legal-doc-";
const STORAGE_LIST_KEY = "legal-doc-list";

export interface SavedDocument {
  id: string;
  title: string;
  html: string;
  letterheadUrl: string | null;
  updatedAt: string;
}

export function getDocumentList(): SavedDocument[] {
  const raw = localStorage.getItem(STORAGE_LIST_KEY);
  if (!raw) {
    // Migrate old single document
    const oldDoc = localStorage.getItem("legal-doc-editor");
    if (oldDoc) {
      try {
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
      } catch {
        return [];
      }
    }
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDocumentList(docs: SavedDocument[]) {
  localStorage.setItem(STORAGE_LIST_KEY, JSON.stringify(docs));
}

const Documents = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setDocuments(getDocumentList());
  }, []);

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNew = () => {
    navigate("/editor");
  };

  const handleOpenDocument = (doc: SavedDocument) => {
    navigate(`/editor?id=${doc.id}`);
  };

  const handleDeleteDocument = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    const updated = documents.filter((d) => d.id !== docId);
    saveDocumentList(updated);
    setDocuments(updated);
    toast.success("Documento excluído.");
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Bonsae" className="h-7 cursor-pointer" onClick={() => navigate("/")} />
        </div>
      </header>

      {/* Toolbar */}
      <div className="px-6 py-4 flex items-center gap-4 flex-wrap">
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Criar Novo Documento
        </Button>

        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 pb-2">
        <span className="text-sm text-muted-foreground">
          Documentos{" "}
          <span className="text-primary font-semibold">{documents.length}</span>
        </span>
      </div>

      {/* Document Grid */}
      <div className="flex-1 px-6 pb-6">
        {filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <img src={bonsaiImg} alt="Bonsai" className="h-60 mb-6 mix-blend-multiply" />
            <p className="text-lg font-medium">Nenhum documento encontrado</p>
            <p className="text-sm mt-1">
              Clique em "Criar Novo Documento" para começar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleOpenDocument(doc)}
                className="group cursor-pointer rounded-lg border border-border bg-card overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all"
              >
                {/* Preview area */}
                <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden relative">
                  {doc.letterheadUrl ? (
                    <img
                      src={doc.letterheadUrl}
                      alt=""
                      className="w-full h-full object-cover opacity-60"
                    />
                  ) : (
                    <FileText className="h-12 w-12 text-muted-foreground/30" />
                  )}
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteDocument(e, doc.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 text-muted-foreground hover:text-destructive hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Excluir documento"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {/* Title */}
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground truncate">
                    {doc.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(doc.updatedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
