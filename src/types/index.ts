import type { Timestamp } from "firebase/firestore";

export interface Pet {
  id: string;
  clientId: string;
  name: string;
  species: 'Cachorro' | 'Gato' | 'Hamster' | 'Outro';
  breed: string;
  birthDate: Timestamp;
  photoUrl: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  pets?: Pet[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Appointment {
  id: string;
  clientId: string;
  petId: string;
  vetId: string;
  date: Timestamp;
  type: 'Consulta' | 'Vacinação' | 'Cirurgia' | 'Exame';
  notes: string;
  status: 'Agendado' | 'Confirmado' | 'Cancelado' | 'Concluído';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  clientId: string;
  appointmentId: string;
  date: Timestamp | Date;
  vetId: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  attachments?: string[]; 
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  minStockLevel: number;
  supplier: string;
  price: number;
  lastReorderDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id:string;
  clientId: string;
  appointmentId?: string;
  issueDate: Timestamp;
  dueDate: Timestamp;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'Pendente' | 'Pago' | 'Atrasado' | 'Cancelado';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
