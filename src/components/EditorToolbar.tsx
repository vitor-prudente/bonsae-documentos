import { Editor } from "@tiptap/react";
import { useState, useRef, useEffect } from "react";
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

const COLOR_PALETTE = [
  { label: "Básicas", colors: ["#000000", "#434343", "#666666", "#999999", "#cccccc", "#ffffff"] },
  { label: "Cores vivas", colors: ["#e03131", "#f76707", "#f59f00", "#2f9e44", "#1c7ed6", "#7048e8", "#e64980"] },
  { label: "Tons suaves", colors: ["#ffc9c9", "#ffe8cc", "#fff3bf", "#c3fae8", "#c5f6fa", "#d0bfff", "#fcc2d7"] },
  { label: "Tons médios", colors: ["#ff6b6b", "#ff922b", "#ffd43b", "#51cf66", "#339af0", "#845ef7", "#f06595"] },
  { label: "Tons escuros", colors: ["#a61c00", "#b45f06", "#7f6011", "#38761d", "#0b5394", "#351c75", "#741b47"] },
];

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    };
    if (showColorPicker) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColorPicker]);

  if (!editor) return null;

  const currentColor = editor.getAttributes("textStyle").color || "#000000";

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

      {/* Color picker */}
      <div className="relative" ref={colorPickerRef}>
        <button
          type="button"
          onClick={() => setShowColorPicker(!showColorPicker)}
          title="Cor do Texto"
          className={cn(
            "p-2 rounded-md transition-colors flex flex-col items-center gap-0.5",
            showColorPicker
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <span className="text-sm font-bold leading-none" style={{ fontFamily: 'serif' }}>A</span>
          <div className="w-4 h-1 rounded-full" style={{ backgroundColor: currentColor }} />
        </button>

        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 p-3 bg-card border border-border rounded-lg shadow-lg z-50" style={{ width: "240px" }}>
            {COLOR_PALETTE.map((group) => (
              <div key={group.label} className="mb-2 last:mb-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">{group.label}</p>
                <div className="flex gap-1.5 flex-wrap">
                  {group.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setShowColorPicker(false);
                      }}
                      className={cn(
                        "w-6 h-6 rounded-md border border-border/40 hover:scale-110 transition-all hover:shadow-md",
                        currentColor === color && "ring-2 ring-primary ring-offset-1"
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="border-t border-border mt-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
                className="w-full text-xs text-muted-foreground hover:text-foreground py-1 rounded hover:bg-accent transition-colors"
              >
                Remover cor
              </button>
            </div>
          </div>
        )}
      </div>

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
