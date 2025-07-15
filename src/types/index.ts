import type { Timestamp } from "firebase/firestore";

// When data is passed from Server to Client Components, Timestamps are serialized to strings.
type SerializableTimestamp = Timestamp | string;

export interface Pet {
  id: string;
  clientId: string;
  name: string;
  species: 'Cachorro' | 'Gato' | 'Hamster' | 'Outro';
  breed: string;
  birthDate: SerializableTimestamp;
  photoUrl: string;
  createdAt: SerializableTimestamp;
  updatedAt: SerializableTimestamp;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  pets?: Pet[];
  createdAt: SerializableTimestamp;
  updatedAt: SerializableTimestamp;
}

export interface Appointment {
  id: string;
  clientId: string;
  petId: string;
  vetId?: string;
  date: SerializableTimestamp | Date;
  type: 'Consulta' | 'Vacinação' | 'Cirurgia' | 'Exame';
  notes?: string;
  status: 'Agendado' | 'Confirmado' | 'Cancelado' | 'Concluído';
  hasResult?: boolean;
  createdAt: SerializableTimestamp;
  updatedAt: SerializableTimestamp;
  // Populated fields
  pet?: Pet;
  client?: Client;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  clientId: string;
  appointmentId: string;
  date: SerializableTimestamp | Date;
  vetId: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  attachments?: string[]; 
  status: 'Ativo' | 'Arquivado';
  createdAt: SerializableTimestamp;
  updatedAt: SerializableTimestamp;
  // Populated fields
  pet?: Pet;
  client?: Client;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  minStockLevel: number;
  supplier: string;
  price: number;
  lastReorderDate?: SerializableTimestamp;
  createdAt: SerializableTimestamp;
  updatedAt: SerializableTimestamp;
}

export interface InvoiceItem {
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id:string;
  clientId: string;
  appointmentId?: string;
  issueDate: SerializableTimestamp;
  dueDate: SerializableTimestamp;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'Pendente' | 'Pago' | 'Atrasado' | 'Cancelado';
  createdAt: SerializableTimestamp;
  updatedAt: SerializableTimestamp;
  // Populated field
  client?: Client;
}

export interface ExamResult {
  id: string;
  appointmentId: string;
  petId: string;
  clientId: string;
  examName: string;
  resultDate: SerializableTimestamp;
  resultSummary: string;
  attachmentUrl?: string;
  createdAt: SerializableTimestamp;
  updatedAt: SerializableTimestamp;
  // Populated fields
  pet?: Pet;
  client?: Client;
}
