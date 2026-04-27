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
  variableValues?: Record<string, string>;
}

export interface DocumentEditorRef {
  getHTML: () => string;
  setContent: (html: string) => void;
  getEditorElement: () => HTMLElement | null;
}

export const DocumentEditor = forwardRef<DocumentEditorRef, DocumentEditorProps>(
  ({ letterheadUrl, onContentChange, initialContent, variableValues = {} }, ref) => {
    const getResolvedValue = useCallback(
      (key: string) => variableValues[key]?.trim() || null,
      [variableValues]
    );

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
      onUpdate: ({ editor, transaction }) => {
        if (transaction.getMeta("skipDirty")) return;
        onContentChange?.(editor.getHTML());
      },
    });

    useImperativeHandle(
      ref,
      () => ({
        getHTML: () => editor?.getHTML() || "",
        setContent: (html: string) => editor?.commands.setContent(html, false),
        getEditorElement: () => document.getElementById("editor-print-area"),
      }),
      [editor]
    );

    useEffect(() => {
      if (!editor || initialContent === undefined) return;
      const incomingContent = initialContent || "";
      const currentContent = editor.getHTML();
      if (incomingContent !== currentContent) {
        editor.commands.setContent(incomingContent);
      }
    }, [editor, initialContent]);

    useEffect(() => {
      if (!editor) return;
      const tr = editor.state.tr;
      let changed = false;

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name !== "variable") return;
        const resolvedValue = getResolvedValue(node.attrs.key);
        if ((node.attrs.resolvedValue || null) !== resolvedValue) {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            resolvedValue,
          });
          changed = true;
        }
      });

      if (changed) {
        tr.setMeta("skipDirty", true);
        tr.setMeta("addToHistory", false);
        editor.view.dispatch(tr);
      }
    }, [editor, getResolvedValue]);

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
              attrs: { key: variable, label: label || variable, resolvedValue: getResolvedValue(variable) },
            })
            .insertContent(" ")
            .run();
        }
      },
      [editor, getResolvedValue]
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
              resolvedValue: getResolvedValue(customEvent.detail.key),
            },
          })
          .insertContent(" ")
          .run();
      };

      window.addEventListener("insert-variable", handleInsertVariable);
      return () => window.removeEventListener("insert-variable", handleInsertVariable);
    }, [editor, getResolvedValue]);

    return (
      <div className="flex-1 min-h-0 flex flex-col min-w-0">
        <EditorToolbar editor={editor} />
        <div className="flex-1 min-h-0 overflow-y-auto bg-editor-bg p-2 pb-10 sm:p-8 sm:pb-16">
          <div
            id="editor-print-area"
            className="relative max-w-[800px] aspect-[210/297] min-h-[720px] mx-auto bg-card rounded-lg shadow-sm border border-border overflow-hidden"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {letterheadUrl && (
              <img
                src={letterheadUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-fill pointer-events-none select-none"
              />
            )}
            <div className="relative z-10 p-4 sm:p-10">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DocumentEditor.displayName = "DocumentEditor";
