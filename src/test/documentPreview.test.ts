import { describe, expect, it } from "vitest";
import { getDocumentPreviewText, stripHtmlToText } from "@/lib/documentPreview";

describe("documentPreview", () => {
  it("remove tags and normalize spaces", () => {
    const html = "<h1>Titulo</h1><p>Texto&nbsp;<strong>forte</strong></p>";
    expect(stripHtmlToText(html)).toBe("Titulo Texto forte");
  });

  it("truncate preview with ellipsis", () => {
    const html = "<p>abcdefghijklmnopqrstuvwxyz</p>";
    expect(getDocumentPreviewText(html, 10)).toBe("abcdefghij...");
  });
});
