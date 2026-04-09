---
name: document-variables-workflow
description: Handles document variable insertion and rendering patterns. Use when implementing or updating variable sidebars, variable nodes, token replacement, or data binding between editor content and variable definitions.
---

# Document Variables Workflow

## Goal

Keep variable behavior consistent from insertion to render/export.

## Standard Flow

1. Source variable definitions from a single normalized shape.
2. Insert variable tokens through one command path.
3. Render tokens with a stable visual representation.
4. Resolve/fill variables at preview/export time.

## Implementation Rules

- Use a stable identifier (`id` or `key`) for each variable.
- Do not couple display label to storage identifier.
- Keep fallback behavior explicit when variable value is missing.
- Reject duplicate identifiers during creation/import.

## Editor Integration

- Insert variables via dedicated commands, not raw string concatenation.
- If custom TipTap node exists, keep parse/render symmetric.
- Prevent accidental deletion edge cases for atomic nodes.

## UI/UX Rules

- Sidebar must show variable type and current/default value state.
- Search/filter in sidebar should match key and label.
- Visual token style in editor should be distinct from plain text.

## Validation Checklist

- Variable can be inserted from sidebar.
- Saved document restores variable tokens correctly.
- Missing variables show fallback without crashing.
- Export/preview replaces variables with expected values.

