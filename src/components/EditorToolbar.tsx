import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const ToolButton = ({
    onClick,
    isActive,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-2 rounded-md transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-6 bg-border mx-1" />;

  return (
    <div className="flex items-center gap-0.5 px-3 py-2 bg-toolbar-bg border-b border-border flex-wrap">
      <ToolButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Negrito"
      >
        <Bold className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Itálico"
      >
        <Italic className="h-4 w-4" />
      </ToolButton>

      <Divider />

      <ToolButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Lista"
      >
        <List className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Lista Numerada"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolButton>

      <Divider />

      <ToolButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="Alinhar à Esquerda"
      >
        <AlignLeft className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="Centralizar"
      >
        <AlignCenter className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="Alinhar à Direita"
      >
        <AlignRight className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        isActive={editor.isActive({ textAlign: "justify" })}
        title="Justificar"
      >
        <AlignJustify className="h-4 w-4" />
      </ToolButton>

      <Divider />

      <ToolButton onClick={() => editor.chain().focus().undo().run()} title="Desfazer">
        <Undo className="h-4 w-4" />
      </ToolButton>
      <ToolButton onClick={() => editor.chain().focus().redo().run()} title="Refazer">
        <Redo className="h-4 w-4" />
      </ToolButton>
    </div>
  );
}
