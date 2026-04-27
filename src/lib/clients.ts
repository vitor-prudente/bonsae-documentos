const CLIENT_LIST_KEY = "bonsae-client-list";

export interface SavedClient {
  id: string;
  name: string;
  values: Record<string, string>;
  updatedAt: string;
}

const mockClients: SavedClient[] = [
  {
    id: "client-ana-souza",
    name: "Ana Souza",
    updatedAt: "2026-04-27T09:00:00.000Z",
    values: {
      nome_cliente: "Ana Souza",
      cpf_cnpj: "123.456.789-00",
      endereco: "Rua das Palmeiras, 120, Maceió/AL",
      valor_causa: "R$ 25.000,00",
      data_atual: "27/04/2026",
      numero_processo: "0801234-56.2026.8.02.0001",
      nome_advogado: "Vitor Prudente",
      oab: "OAB/AL 12.345",
      comarca: "Maceió",
      vara: "3ª Vara Cível",
    },
  },
  {
    id: "client-bruno-lima",
    name: "Bruno Lima ME",
    updatedAt: "2026-04-27T09:00:00.000Z",
    values: {
      nome_cliente: "Bruno Lima ME",
      cpf_cnpj: "12.345.678/0001-90",
      endereco: "Av. Fernandes Lima, 850, Maceió/AL",
      valor_causa: "R$ 48.500,00",
      data_atual: "27/04/2026",
      nome_advogado: "Vitor Prudente",
      oab: "OAB/AL 12.345",
      comarca: "Maceió",
    },
  },
  {
    id: "client-carolina-melo",
    name: "Carolina Melo",
    updatedAt: "2026-04-27T09:00:00.000Z",
    values: {
      nome_cliente: "Carolina Melo",
      cpf_cnpj: "987.654.321-00",
      endereco: "Rua São Pedro, 44, Arapiraca/AL",
      data_atual: "27/04/2026",
      nome_advogado: "Vitor Prudente",
      oab: "OAB/AL 12.345",
      comarca: "Arapiraca",
      vara: "1ª Vara Cível",
    },
  },
];

export function getClientList(): SavedClient[] {
  try {
    const raw = localStorage.getItem(CLIENT_LIST_KEY);
    if (!raw) {
      localStorage.setItem(CLIENT_LIST_KEY, JSON.stringify(mockClients));
      return mockClients;
    }
    const clients = JSON.parse(raw);
    return Array.isArray(clients) ? clients : [];
  } catch {
    return [];
  }
}

export function saveClientList(clients: SavedClient[]) {
  localStorage.setItem(CLIENT_LIST_KEY, JSON.stringify(clients));
}
