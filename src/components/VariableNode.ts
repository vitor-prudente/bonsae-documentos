import { Node, mergeAttributes } from "@tiptap/core";
import { variableIconMap, variableSvgMap } from "./variableIcons";

export const VariableNode = Node.create({
  name: "variable",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      key: { default: null },
      label: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-variable]',
        getAttrs: (dom) => {
          const el = dom as HTMLElement;
          return {
            key: el.getAttribute("data-variable"),
            label: el.getAttribute("data-label"),
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const iconName = variableIconMap[node.attrs.key] || "user";
    const svg = variableSvgMap[iconName] || "";
    const encodedSvg = `data:image/svg+xml,${encodeURIComponent(svg)}`;

    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-variable": node.attrs.key,
        "data-label": node.attrs.label,
        class: "variable-badge",
        contenteditable: "false",
        style: `--var-icon: url("${encodedSvg}")`,
      }),
      node.attrs.label || node.attrs.key,
    ];
  },
});
