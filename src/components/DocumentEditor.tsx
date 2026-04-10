import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import FontSize from "@tiptap/extension-font-size";
import Placeholder from "@tiptap/extension-placeholder";
import { VariableNode } from "./VariableNode";
import { EditorToolbar } from "./EditorToolbar";
import { useCallback, useEffect, forwardRef, useImperativeHandle } from "react";

interface DocumentEditorProps {
  letterheadUrl: string | null;
  onContentChange?: (html: string) => void;
  initialContent?: string;
}

export interface DocumentEditorRef {
  getHTML: () => string;
  setContent: (html: string) => void;
  getEditorElement: () => HTMLElement | null;
}

export const DocumentEditor = forwardRef<DocumentEditorRef, DocumentEditorProps>(
  ({ letterheadUrl, onContentChange, initialContent }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        TextStyle,
        Color,
        FontFamily,
        FontSize,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Placeholder.configure({
          placeholder: "Comece a escrever seu documento jurídico aqui...",
        }),
        VariableNode,
      ],
      content: initialContent || "",
      onUpdate: ({ editor }) => {
        onContentChange?.(editor.getHTML());
      },
    });

    useImperativeHandle(
      ref,
      () => ({
        getHTML: () => editor?.getHTML() || "",
        setContent: (html: string) => editor?.commands.setContent(html),
        getEditorElement: () => document.getElementById("editor-print-area"),
      }),
      [editor]
    );

    useEffect(() => {
      if (!editor || initialContent === undefined) return;
      const incomingContent = initialContent || "";
      const currentContent = editor.getHTML();
      if (incomingContent !== currentContent) {
        editor.commands.setContent(incomingContent, false, { preserveWhitespace: "full" });
      }
    }, [editor, initialContent]);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        const variable = e.dataTransfer.getData("application/x-variable");
        const label = e.dataTransfer.getData("application/x-variable-label");
        if (variable && editor) {
          editor
            .chain()
            .focus()
            .insertContent({
              type: "variable",
              attrs: { key: variable, label: label || variable },
            })
            .insertContent(" ")
            .run();
        }
      },
      [editor]
    );

    const handleDragOver = (e: React.DragEvent) => {
      if (e.dataTransfer.types.includes("application/x-variable")) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }
    };

    useEffect(() => {
      const handleInsertVariable = (event: Event) => {
        const customEvent = event as CustomEvent<{ key: string; label: string }>;
        if (!editor || !customEvent.detail?.key) return;
        editor
          .chain()
          .focus()
          .insertContent({
            type: "variable",
            attrs: {
              key: customEvent.detail.key,
              label: customEvent.detail.label || customEvent.detail.key,
            },
          })
          .insertContent(" ")
          .run();
      };

      window.addEventListener("insert-variable", handleInsertVariable);
      return () => window.removeEventListener("insert-variable", handleInsertVariable);
    }, [editor]);

    return (
      <div className="flex-1 flex flex-col min-w-0">
        <EditorToolbar editor={editor} />
        <div className="flex-1 overflow-y-auto bg-editor-bg p-2 sm:p-8">
          <div
            id="editor-print-area"
            className="max-w-[800px] mx-auto bg-card rounded-lg shadow-sm border border-border"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {/* Letterhead */}
            {letterheadUrl && (
              <div className="border-b border-border">
                <img
                  src={letterheadUrl}
                  alt="Papel timbrado"
                  className="w-full h-auto"
                  style={{ maxHeight: "200px", objectFit: "contain" }}
                />
              </div>
            )}
            {/* Editor */}
            <div className="p-4 sm:p-10">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DocumentEditor.displayName = "DocumentEditor";
