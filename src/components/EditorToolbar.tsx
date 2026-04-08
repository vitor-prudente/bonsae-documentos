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
  ChevronDown,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLOR_PALETTE = [
  { label: "Básicas", colors: ["#000000", "#434343", "#666666", "#999999", "#cccccc", "#ffffff"] },
  { label: "Cores vivas", colors: ["#e03131", "#f76707", "#f59f00", "#2f9e44", "#1c7ed6", "#7048e8", "#e64980"] },
  { label: "Tons suaves", colors: ["#ffc9c9", "#ffe8cc", "#fff3bf", "#c3fae8", "#c5f6fa", "#d0bfff", "#fcc2d7"] },
  { label: "Tons médios", colors: ["#ff6b6b", "#ff922b", "#ffd43b", "#51cf66", "#339af0", "#845ef7", "#f06595"] },
  { label: "Tons escuros", colors: ["#a61c00", "#b45f06", "#7f6011", "#38761d", "#0b5394", "#351c75", "#741b47"] },
];

const FONT_FAMILIES = [
  { label: "Arial", value: "Arial" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Georgia", value: "Georgia" },
  { label: "Verdana", value: "Verdana" },
  { label: "Courier New", value: "Courier New" },
  { label: "Trebuchet MS", value: "Trebuchet MS" },
  { label: "Garamond", value: "Garamond" },
  { label: "Palatino", value: "Palatino" },
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const fontPickerRef = useRef<HTMLDivElement>(null);
  const sizePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) setShowColorPicker(false);
      if (fontPickerRef.current && !fontPickerRef.current.contains(e.target as Node)) setShowFontPicker(false);
      if (sizePickerRef.current && !sizePickerRef.current.contains(e.target as Node)) setShowSizePicker(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!editor) return null;

  const currentColor = editor.getAttributes("textStyle").color || "#000000";
  const currentFont = editor.getAttributes("textStyle").fontFamily || "Arial";
  const currentSizeRaw = editor.getAttributes("textStyle").fontSize;
  const currentSize = currentSizeRaw ? parseInt(currentSizeRaw) : 12;

  const setFontSize = (size: number) => {
    editor.chain().focus().setFontSize(`${size}px`).run();
  };

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
      {/* Font family picker */}
      <div className="relative" ref={fontPickerRef}>
        <button
          type="button"
          onClick={() => { setShowFontPicker(!showFontPicker); setShowSizePicker(false); setShowColorPicker(false); }}
          className="flex items-center gap-1 px-2 py-1.5 rounded-md text-sm text-foreground hover:bg-accent transition-colors min-w-[120px]"
          title="Fonte"
        >
          <span className="truncate" style={{ fontFamily: currentFont }}>{currentFont}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
        </button>
        {showFontPicker && (
          <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 py-1 w-[180px] max-h-[280px] overflow-y-auto">
            {FONT_FAMILIES.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => { editor.chain().focus().setFontFamily(f.value).run(); setShowFontPicker(false); }}
                className={cn(
                  "w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors",
                  currentFont === f.value && "bg-primary/10 text-primary font-medium"
                )}
                style={{ fontFamily: f.value }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <Divider />

      {/* Font size */}
      <div className="relative flex items-center gap-0.5" ref={sizePickerRef}>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); setFontSize(Math.max(8, currentSize - 1)); }}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title="Diminuir"
        >
          <Minus className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => { setShowSizePicker(!showSizePicker); setShowFontPicker(false); setShowColorPicker(false); }}
          className="px-2 py-1 rounded-md text-sm text-foreground hover:bg-accent transition-colors min-w-[36px] text-center"
          title="Tamanho da fonte"
        >
          {currentSize}
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); setFontSize(Math.min(72, currentSize + 1)); }}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title="Aumentar"
        >
          <Plus className="h-3 w-3" />
        </button>
        {showSizePicker && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 py-1 w-[64px] max-h-[240px] overflow-y-auto">
            {FONT_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setFontSize(s); setShowSizePicker(false); }}
                className={cn(
                  "w-full text-center px-2 py-1 text-sm hover:bg-accent transition-colors",
                  currentSize === s && "bg-primary/10 text-primary font-medium"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <Divider />

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
          onClick={() => { setShowColorPicker(!showColorPicker); setShowFontPicker(false); setShowSizePicker(false); }}
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
          <div className="absolute top-full right-0 mt-1 p-3 bg-card border border-border rounded-lg shadow-lg z-50" style={{ width: "240px" }}>
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