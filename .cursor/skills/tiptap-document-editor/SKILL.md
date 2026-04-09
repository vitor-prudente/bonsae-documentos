---
name: tiptap-document-editor
description: Implements and updates TipTap editor behavior for document workflows in React. Use when changing extensions, toolbar actions, serialization, placeholder behavior, custom nodes, or editor integration in document screens.
---

# TipTap Document Editor

## Quick Start

1. Confirm where editor state is created and persisted.
2. Identify active extensions and custom nodes before changing behavior.
3. Keep output format stable (HTML or JSON) unless migration is requested.
4. Verify cursor behavior, undo/redo, and selection-sensitive actions.

## Workflow

### 1) Map current editor contract

- Find editor entrypoint and props in `src/components/DocumentEditor.tsx`.
- Check toolbar bindings in `src/components/EditorToolbar.tsx`.
- Check custom nodes and node views before changing schema.
- Preserve existing content compatibility.

### 2) Make safe extension changes

- Add or update one extension at a time.
- Prefer explicit configuration over defaults when behavior matters.
- If adding marks/nodes, verify parsing and rendering both ways.
- Avoid changing document schema globally without migration notes.

### 3) Keep interactions predictable

- Disable toolbar actions when command is unavailable.
- Keep keyboard shortcuts aligned with visible actions.
- Ensure focus is restored to editor after toolbar interactions.

### 4) Validate after changes

- Type text, apply formatting, undo/redo.
- Insert and edit custom nodes/variables.
- Reload persisted content and confirm no data loss.

## Project-specific checks

- Preserve integration with sidebars and variable insertion flows.
- Keep class names compatible with existing Tailwind styling.
- Avoid introducing editor plugins that break SSR/tests in jsdom.

