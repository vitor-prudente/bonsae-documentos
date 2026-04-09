import { useState, useRef, useEffect, useCallback } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { variableIconMap } from "./variableIcons";
import {
  User, CreditCard, MapPin, DollarSign, Calendar,
  FileText, Briefcase, BadgeCheck, Building, Gavel,
  type LucideIcon,
} from "lucide-react";

const iconComponents: Record<string, LucideIcon> = {
  user: User,
  "id-card": CreditCard,
  "map-pin": MapPin,
  "dollar-sign": DollarSign,
  calendar: Calendar,
  "file-text": FileText,
  briefcase: Briefcase,
  "badge-check": BadgeCheck,
  building: Building,
  gavel: Gavel,
};

export function VariableNodeView({ node, editor, getPos }: NodeViewProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const confirmedRef = useRef(false);

  const iconName = variableIconMap[node.attrs.key] || "user";
  const IconComponent = iconComponents[iconName] || User;

  useEffect(() => {
    if (editing && inputRef.current) {
      confirmedRef.current = false;
      inputRef.current.focus();
    }
  }, [editing]);

  const handleConfirm = useCallback(() => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;
    if (!editor || typeof getPos !== "function") return;
    const pos = getPos();
    const text = value.trim();
    if (text) {
      editor.chain().focus()
        .deleteRange({ from: pos, to: pos + node.nodeSize })
        .insertContentAt(pos, text)
        .run();
    } else {
      setEditing(false);
    }
  }, [editor, getPos, node.nodeSize, value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === "Escape") {
      setEditing(false);
      setValue("");
    }
  };

  if (editing) {
    return (
      <NodeViewWrapper as="span" className="variable-badge-wrapper">
        <span className="variable-input-container">
          <IconComponent className="variable-input-icon" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleConfirm}
            placeholder={node.attrs.label || node.attrs.key}
            className="variable-inline-input"
          />
        </span>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as="span" className="variable-badge-wrapper">
      <span
        className="variable-badge variable-badge-clickable"
        onClick={() => setEditing(true)}
        title="Clique para preencher"
      >
        <IconComponent className="variable-badge-icon" />
        {node.attrs.label || node.attrs.key}
      </span>
    </NodeViewWrapper>
  );
}
