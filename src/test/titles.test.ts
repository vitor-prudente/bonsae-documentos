import { describe, expect, it } from "vitest";
import { getDraftTitleBase, makeUniqueTitle } from "@/lib/titles";

describe("draft titles", () => {
  it("uses document wording for documents", () => {
    expect(getDraftTitleBase("document")).toBe("Novo documento");
    expect(getDraftTitleBase("document", "Ana Santos")).toBe("Novo documento Ana Santos");
  });

  it("uses template wording for templates", () => {
    expect(getDraftTitleBase("template")).toBe("Novo template");
    expect(getDraftTitleBase("template", "Ana Santos")).toBe("Novo template Ana Santos");
  });

  it("increments duplicate titles", () => {
    expect(
      makeUniqueTitle("Novo documento Ana Santos", [
        "Novo documento Ana Santos",
        "Novo documento Ana Santos (1)",
      ])
    ).toBe("Novo documento Ana Santos (2)");
  });
});
