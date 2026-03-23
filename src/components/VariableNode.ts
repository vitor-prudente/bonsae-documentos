import { Node, mergeAttributes } from "@tiptap/core";

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
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-variable": node.attrs.key,
        "data-label": node.attrs.label,
        class: "variable-badge",
        contenteditable: "false",
      }),
      node.attrs.label || node.attrs.key,
    ];
  },
});
