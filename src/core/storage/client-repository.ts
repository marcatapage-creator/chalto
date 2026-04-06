import { Client } from '../types';

let mockClients: Client[] = [
  {
    id: 'cli-1',
    name: 'Marc-Antoine Dupont',
    email: 'marc@example.com',
    incompleteProfile: false,
    createdAt: new Date().toISOString(),
  }
];

export class ClientRepository {
  async findByEmail(email: string): Promise<Client | null> {
    return mockClients.find(c => c.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async create(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
    const newClient: Client = {
      ...client,
      id: `cli-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    mockClients.push(newClient);
    return newClient;
  }

  async getAll(): Promise<Client[]> {
    return mockClients;
  }
}

export const clientRepository = new ClientRepository();
