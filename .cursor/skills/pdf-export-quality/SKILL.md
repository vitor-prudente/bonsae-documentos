---
name: pdf-export-quality
description: Improves PDF export reliability and layout quality for web documents. Use when changing html2pdf.js flow, print styles, page breaks, margins, scaling, headers/footers, or output fidelity issues.
---

# PDF Export Quality

## Objective

Generate predictable PDF output with minimal visual drift from the editor.

## Export Strategy

1. Prepare a dedicated export container when needed.
2. Apply print-safe styles before conversion.
3. Configure html2pdf options explicitly.
4. Validate output on long and short documents.

## Rules

- Do not export directly from interactive UI wrappers when avoidable.
- Stabilize width, spacing, and typography before rendering.
- Use explicit page-break classes for known block boundaries.
- Keep image/font loading deterministic before conversion starts.

## html2pdf.js baseline

- Set `margin`, `filename`, `image`, `html2canvas`, and `jsPDF` options explicitly.
- Prefer consistent scale over high scale by default to avoid memory issues.
- Handle async flow with clear loading and failure states.

## Print Styling

- Create or reuse print-focused classes for headings, paragraphs, tables, and lists.
- Avoid sticky/fixed UI elements in export DOM.
- Ensure contrast and spacing remain readable in grayscale.

## Validation Checklist

- Multi-page document keeps section boundaries readable.
- No clipped content on right/bottom edges.
- Variables/custom nodes render as final values when required.
- Export does not freeze UI or leave stale loading state.

