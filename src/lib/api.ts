const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000/api";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  DEFAULT_API_BASE_URL
).replace(/\/$/, "");

const AUTH_TOKEN_KEY = "bonsae-auth-token";
const AUTH_USER_KEY = "bonsae-auth-user";

export interface BackendUser {
  id: number | string;
  name: string;
  email: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AuthResponse {
  user: BackendUser;
  token: string;
  token_type: "Bearer" | string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export interface BackendCliente {
  id: number;
  nome: string;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ClientePayload {
  nome: string;
  cpf?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
}

export interface BackendTemplate {
  id: number;
  titulo: string;
  conteudo: string;
  background_image: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TemplatePayload {
  titulo: string;
  conteudo: string;
  background_image?: string | null;
}

export interface BackendDocumento {
  id: number | string;
  titulo?: string | null;
  title?: string | null;
  conteudo?: string | null;
  conteudo_final?: string | null;
  content?: string | null;
  html?: string | null;
  documento?: string | BackendDocumento | null;
  background_image?: string | null;
  letterhead_url?: string | null;
  letterhead_name?: string | null;
  cliente_id?: number | string | null;
  client_id?: number | string | null;
  template_id?: number | string | null;
  status?: string | null;
  cliente?: BackendCliente | null;
  template?: BackendTemplate | null;
  created_at?: string | null;
  updated_at?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface DocumentoPayload {
  titulo: string;
  conteudo_final: string;
  cliente_id: number | string;
  template_id: number | string;
  status?: string | null;
}

export type DocumentosResponse =
  | BackendDocumento[]
  | { data: BackendDocumento[] }
  | { documentos: BackendDocumento[] };
export type DocumentoResponse =
  | BackendDocumento
  | { data: BackendDocumento }
  | { documento: BackendDocumento };
export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function emitAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("bonsae-auth-changed"));
  }
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): BackendUser | null {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!getAuthToken();
}

export function setAuthSession(auth: AuthResponse) {
  localStorage.setItem(AUTH_TOKEN_KEY, auth.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(auth.user));
  emitAuthChanged();
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  emitAuthChanged();
}

function getValidationMessage(errors: unknown) {
  if (!errors || typeof errors !== "object") return null;
  const messages = Object.values(errors as Record<string, unknown>)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string => typeof value === "string");

  return messages[0] || null;
}

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  const token = getAuthToken();

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(
      `Não foi possível conectar ao back-end Laravel. URL usada: ${API_BASE_URL}.`,
      0
    );
  }

  const text = await response.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }

    const message =
      getValidationMessage(data?.errors) ||
      data?.message ||
      `Erro na API Laravel (${response.status}).`;
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Erro inesperado ao comunicar com a API.";
}

export async function register(payload: RegisterPayload) {
  const auth = await requestJson<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setAuthSession(auth);
  return auth;
}

export async function login(payload: LoginPayload) {
  const auth = await requestJson<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setAuthSession(auth);
  return auth;
}

export function getCurrentUser() {
  return requestJson<BackendUser>("/auth/me");
}

export async function logout() {
  try {
    await requestJson<{ message: string }>("/auth/logout", {
      method: "POST",
    });
  } finally {
    clearAuthSession();
  }
}

export function getClientes() {
  return requestJson<BackendCliente[]>("/clientes");
}

export function getCliente(id: string | number) {
  return requestJson<BackendCliente>(`/clientes/${id}`);
}

export function createCliente(cliente: ClientePayload) {
  return requestJson<BackendCliente>("/clientes", {
    method: "POST",
    body: JSON.stringify(cliente),
  });
}

export function updateCliente(id: string | number, cliente: Partial<ClientePayload>) {
  return requestJson<BackendCliente>(`/clientes/${id}`, {
    method: "PUT",
    body: JSON.stringify(cliente),
  });
}

export function deleteCliente(id: string | number) {
  return requestJson<{ message: string }>(`/clientes/${id}`, {
    method: "DELETE",
  });
}

export function getTemplates() {
  return requestJson<BackendTemplate[]>("/templates");
}

export function getTemplate(id: string | number) {
  return requestJson<BackendTemplate>(`/templates/${id}`);
}

export function createTemplate(template: TemplatePayload) {
  return requestJson<BackendTemplate>("/templates", {
    method: "POST",
    body: JSON.stringify(template),
  });
}

export function updateTemplate(id: string | number, template: Partial<TemplatePayload>) {
  return requestJson<BackendTemplate>(`/templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(template),
  });
}

export function deleteTemplate(id: string | number) {
  return requestJson<{ message: string }>(`/templates/${id}`, {
    method: "DELETE",
  });
}

export function getDocumentos() {
  return requestJson<DocumentosResponse>("/documentos");
}

export function getDocumento(id: string | number) {
  return requestJson<DocumentoResponse>(`/documentos/${id}`);
}

export function createDocumento(documento: DocumentoPayload) {
  return requestJson<DocumentoResponse>("/documentos", {
    method: "POST",
    body: JSON.stringify(documento),
  });
}

export function updateDocumento(id: string | number, documento: Partial<DocumentoPayload>) {
  return requestJson<DocumentoResponse>(`/documentos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(documento),
  });
}

export function deleteDocumento(id: string | number) {
  return requestJson<{ message: string }>(`/documentos/${id}`, {
    method: "DELETE",
  });
}
