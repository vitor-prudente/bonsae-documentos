import {
  createCliente,
  deleteCliente,
  getClientes,
  updateCliente,
  type BackendCliente,
  type ClientePayload,
} from "@/lib/api";

export interface SavedClient {
  id: string;
  name: string;
  values: Record<string, string>;
  updatedAt: string;
}

export const CLIENT_VARIABLES = [
  { id: "nome_cliente", key: "nome_cliente", label: "Nome do Cliente", icon: "user" },
  { id: "cpf_cnpj", key: "cpf_cnpj", label: "CPF", icon: "id-card" },
  { id: "email", key: "email", label: "E-mail", icon: "mail" },
  { id: "telefone", key: "telefone", label: "Telefone", icon: "phone" },
  { id: "endereco", key: "endereco", label: "Endereco", icon: "map-pin" },
  { id: "cidade", key: "cidade", label: "Cidade", icon: "building" },
  { id: "estado", key: "estado", label: "Estado", icon: "map-pin" },
  { id: "cep", key: "cep", label: "CEP", icon: "map-pin" },
];

const nullable = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export function mapBackendCliente(cliente: BackendCliente): SavedClient {
  const name = cliente.nome || `Cliente ${cliente.id}`;

  return {
    id: String(cliente.id),
    name,
    updatedAt: cliente.updated_at || cliente.created_at || new Date().toISOString(),
    values: {
      nome_cliente: cliente.nome || "",
      cpf_cnpj: cliente.cpf || "",
      email: cliente.email || "",
      telefone: cliente.telefone || "",
      endereco: cliente.endereco || "",
      cidade: cliente.cidade || "",
      estado: cliente.estado || "",
      cep: cliente.cep || "",
    },
  };
}

export function mapSavedClientPayload(client: Pick<SavedClient, "name" | "values">): ClientePayload {
  return {
    nome: nullable(client.values.nome_cliente) || client.name.trim() || "Cliente sem nome",
    cpf: nullable(client.values.cpf_cnpj),
    email: nullable(client.values.email),
    telefone: nullable(client.values.telefone),
    endereco: nullable(client.values.endereco),
    cidade: nullable(client.values.cidade),
    estado: nullable(client.values.estado),
    cep: nullable(client.values.cep),
  };
}

export async function getClientList(): Promise<SavedClient[]> {
  const clientes = await getClientes();
  return clientes.map(mapBackendCliente);
}

export async function createClient(client: Pick<SavedClient, "name" | "values">) {
  const created = await createCliente(mapSavedClientPayload(client));
  return mapBackendCliente(created);
}

export async function updateClient(client: SavedClient) {
  const updated = await updateCliente(client.id, mapSavedClientPayload(client));
  return mapBackendCliente(updated);
}

export async function deleteClient(id: string) {
  await deleteCliente(id);
}
