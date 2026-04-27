export function makeUniqueTitle(baseTitle: string, existingTitles: string[]) {
  const existing = new Set(existingTitles.map((title) => title.trim()));
  if (!existing.has(baseTitle)) return baseTitle;

  let index = 1;
  let candidate = `${baseTitle} (${index})`;
  while (existing.has(candidate)) {
    index += 1;
    candidate = `${baseTitle} (${index})`;
  }

  return candidate;
}

export function getDraftTitleBase(kind: "template" | "document", clientName?: string | null) {
  const label = kind === "template" ? "Novo template" : "Novo documento";
  const name = clientName?.trim();
  return name ? `${label} ${name}` : label;
}
