import {
  createTemplate,
  deleteTemplate,
  getTemplate,
  getTemplates,
  updateTemplate,
  type BackendTemplate,
  type TemplatePayload,
} from "@/lib/api";

export interface SavedTemplate {
  id: string;
  title: string;
  html: string;
  letterheadUrl: string | null;
  letterheadName?: string | null;
  updatedAt: string;
}

const fallbackDate = () => new Date().toISOString();

export function mapBackendTemplate(template: BackendTemplate): SavedTemplate {
  return {
    id: String(template.id),
    title: template.titulo || `Template ${template.id}`,
    html: template.conteudo || "",
    letterheadUrl: template.background_image || null,
    letterheadName: template.background_image || null,
    updatedAt: template.updated_at || template.created_at || fallbackDate(),
  };
}

export function mapSavedTemplatePayload(template: Omit<SavedTemplate, "id" | "updatedAt">): TemplatePayload {
  return {
    titulo: template.title.trim() || "Template sem titulo",
    conteudo: template.html || "",
    background_image: template.letterheadUrl || null,
  };
}

export async function getTemplateList() {
  const templates = await getTemplates();
  return templates.map(mapBackendTemplate);
}

export async function getSavedTemplate(id: string) {
  const template = await getTemplate(id);
  return mapBackendTemplate(template);
}

export async function createSavedTemplate(template: Omit<SavedTemplate, "id" | "updatedAt">) {
  const created = await createTemplate(mapSavedTemplatePayload(template));
  return mapBackendTemplate(created);
}

export async function updateSavedTemplate(template: SavedTemplate) {
  const updated = await updateTemplate(template.id, mapSavedTemplatePayload(template));
  return mapBackendTemplate(updated);
}

export async function deleteSavedTemplate(id: string) {
  await deleteTemplate(id);
}
