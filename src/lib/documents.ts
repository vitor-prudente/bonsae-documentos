import {
  ApiError,
  createDocumento,
  deleteDocumento,
  getDocumento,
  getDocumentos,
  updateDocumento,
  type BackendDocumento,
  type DocumentoPayload,
  type DocumentoResponse,
  type DocumentosResponse,
} from "@/lib/api";
import type { SavedClient } from "@/lib/clients";
import type { SavedTemplate } from "@/lib/templates";
import { getDraftTitleBase, makeUniqueTitle } from "@/lib/titles";

export interface SavedDocument {
  id: string;
  title: string;
  html: string;
  letterheadUrl: string | null;
  letterheadName?: string | null;
  updatedAt: string;
  clientId?: string | null;
  templateId?: string | null;
  status?: string | null;
}

const fallbackDate = () => new Date().toISOString();

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function normalizeBackendId(id: number | string | null | undefined) {
  if (id === null || id === undefined || id === "") return null;
  const numericId = Number(id);
  return Number.isFinite(numericId) ? numericId : String(id);
}

function getRequiredBackendId(id: number | string | null | undefined, field: string) {
  const normalized = normalizeBackendId(id);
  if (normalized === null) {
    throw new ApiError(`Informe ${field} antes de salvar o documento.`, 422);
  }
  return normalized;
}

function responseData(response: DocumentoResponse | BackendDocumento) {
  return isRecord(response) && isRecord(response.data) ? response.data : response;
}

function unwrapDocumentList(response: DocumentosResponse) {
  if (Array.isArray(response)) return response;
  if ("documentos" in response) return response.documentos || [];
  return response.data || [];
}

function unwrapDocumentResponse(response: DocumentoResponse): BackendDocumento {
  const data = responseData(response);
  if (isRecord(data) && isRecord(data.documento)) return data.documento as BackendDocumento;
  return data as BackendDocumento;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeHtml(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function mapBackendDocumento(documento: BackendDocumento): SavedDocument {
  const data = responseData(documento);
  const raw = isRecord(data) && isRecord(data.documento) ? data.documento : isRecord(data) ? data : {};
  const id = raw.id ?? documento.id ?? "";
  const relatedTemplate = isRecord(raw.template) ? raw.template : null;
  const letterheadUrl =
    getNullableString(raw.background_image) ||
    getNullableString(raw.letterhead_url) ||
    getNullableString(relatedTemplate?.background_image) ||
    null;
  const content =
    getString(raw.conteudo_final) ||
    getString(raw.conteudo) ||
    getString(raw.html) ||
    getString(raw.content) ||
    (typeof raw.documento === "string" ? raw.documento : "");

  return {
    id: String(id),
    title:
      getNullableString(raw.titulo) ||
      getNullableString(raw.title) ||
      `Documento ${id}`,
    html: normalizeHtml(content),
    letterheadUrl,
    letterheadName: getNullableString(raw.letterhead_name) || letterheadUrl,
    updatedAt:
      getNullableString(raw.updated_at) ||
      getNullableString(raw.updatedAt) ||
      getNullableString(raw.created_at) ||
      getNullableString(raw.createdAt) ||
      fallbackDate(),
    clientId: raw.cliente_id !== undefined || raw.client_id !== undefined
      ? String(raw.cliente_id ?? raw.client_id ?? "")
      : null,
    templateId: raw.template_id !== undefined ? String(raw.template_id ?? "") : null,
    status: getNullableString(raw.status),
  };
}

export function mapSavedDocumentPayload(
  document: Omit<SavedDocument, "id" | "updatedAt">
): DocumentoPayload {
  return {
    titulo: document.title.trim() || "Documento sem titulo",
    conteudo_final: document.html || "",
    cliente_id: getRequiredBackendId(document.clientId, "um cliente"),
    template_id: getRequiredBackendId(document.templateId, "um template"),
    status: document.status || "rascunho",
  };
}

export function applyClientValuesToTemplateHtml(html: string, values: Record<string, string>) {
  if (!html || typeof document === "undefined") return html;

  const template = document.createElement("template");
  template.innerHTML = html;
  template.content.querySelectorAll<HTMLElement>("span[data-variable]").forEach((node) => {
    const key = node.dataset.variable;
    const value = key ? values[key]?.trim() : "";
    if (value) {
      node.replaceWith(document.createTextNode(value));
    }
  });

  let output = template.innerHTML;
  Object.entries(values).forEach(([key, value]) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    output = output.replaceAll(`{{${key}}}`, escapeHtml(trimmed));
  });

  return output;
}

export async function getDocumentList() {
  const documentos = await getDocumentos();
  return unwrapDocumentList(documentos).map(mapBackendDocumento);
}

export async function getSavedDocument(id: string) {
  const documento = await getDocumento(id);
  return mapBackendDocumento(unwrapDocumentResponse(documento));
}

export async function createSavedDocument(
  document: Omit<SavedDocument, "id" | "updatedAt">
) {
  const created = await createDocumento(mapSavedDocumentPayload(document));
  return mapBackendDocumento(unwrapDocumentResponse(created));
}

export async function updateSavedDocument(document: SavedDocument) {
  const updated = await updateDocumento(document.id, mapSavedDocumentPayload(document));
  return mapBackendDocumento(unwrapDocumentResponse(updated));
}

export async function deleteSavedDocument(id: string) {
  await deleteDocumento(id);
}

export async function createDocumentFromTemplate(
  template: SavedTemplate,
  client: SavedClient | null,
  existingTitles: string[]
) {
  if (!client) {
    throw new ApiError("Selecione um cliente para criar o documento.", 422);
  }

  const titleBase = getDraftTitleBase("document", client?.name);
  const title = makeUniqueTitle(titleBase, existingTitles);
  const baseDocument = {
    title,
    html: applyClientValuesToTemplateHtml(template.html, client.values),
    letterheadUrl: template.letterheadUrl,
    letterheadName: template.letterheadName || null,
    clientId: client.id,
    templateId: template.id,
    status: "rascunho",
  };

  return createSavedDocument(baseDocument);
}
