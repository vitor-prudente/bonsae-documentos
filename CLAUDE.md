# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (port 8080)
npm run build        # Production build
npm run build:dev    # Development build (includes debug info)
npm run lint         # ESLint
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
npm run preview      # Preview production build
```

## What This Is

A client-side document creation and template management system for Brazilian legal professionals. It supports rich text editing, variable substitution (e.g., `{{nome_cliente}}`), and PDF export. There is no backend — all data is persisted in `localStorage`.

## Architecture

**Routing:** Two main routes via React Router v6:
- `/` — `Documents.tsx`: tab-based page (Home, Documents, Templates, Variables)
- `/editor` — `Index.tsx`: the TipTap editor with sidebars

Query params carry context: `?tab=documents|templates|variables` on `/`, and `?id=<uuid>&type=template` on `/editor`.

**Editor stack:** TipTap 3 (built on ProseMirror) with extensions for font family, font size (8–72px), text color, alignment, and a custom `VariableNode` (inline node that renders interactive badges in `VariableNodeView.tsx`).

**Variable system:**
- Variables are styled inline badges (`{{key}}`) in the editor content
- Drag-and-drop from `VariablesSidebar` inserts them via custom MIME types (`application/x-variable`)
- Clicking a badge turns it into an input for inline value replacement
- 10 default legal variables + user-created custom variables (keys auto-sanitized to snake_case)

**Storage schema (all `localStorage`):**

| Key | Type | Content |
|-----|------|---------|
| `legal-doc-list` | `SavedDocument[]` | Documents (id, title, html, letterheadUrl, updatedAt) |
| `bonsae-template-list` | `SavedTemplate[]` | Templates (same shape) |
| `bonsae-variable-list` | `CustomVariable[]` | Custom variables (id, key, label, icon) |
| `bonsae-pinned-templates` | `PinnedTemplate[]` | Pinned template refs (id, title) |

Cross-tab sync uses `window` events (`pinned-updated`, `storage`). A legacy migration converts the old `legal-doc-editor` key to the new structure.

**PDF export:** Uses `html2pdf.js` — A4 portrait, 10mm margins, JPEG 0.98 quality, 1.5x canvas scale.

**UI layer:** shadcn/ui components (Radix UI + Tailwind). Theme uses HSL CSS variables with custom tokens (`--editor-bg`, `--toolbar-bg`, `--variable-badge`, `--sidebar`). Dark mode via `next-themes` (class strategy).

## TypeScript Config

TypeScript is configured leniently: `noImplicitAny: false`, `strictNullChecks: false`. This is intentional — don't tighten these without checking for widespread downstream type errors.

## Path Alias

`@/*` maps to `src/*`. Use this for all internal imports.
