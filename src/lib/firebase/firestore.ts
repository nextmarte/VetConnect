import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './config';
import type { Client } from '@/types';

export async function getClients(): Promise<Client[]> {
  const clientsCol = collection(db, 'clients');
  const clientSnapshot = await getDocs(clientsCol);
  const clientList = clientSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      // Convertendo Timestamps para objetos Date e depois para string ISO
      createdAt: data.createdAt.toDate().toISOString(),
      updatedAt: data.updatedAt.toDate().toISOString(),
    } as unknown as Client; // Cast para evitar erros de tipo com Timestamps
  });
  return clientList;
}

export async function addClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'pets'>): Promise<{ id: string }> {
  const clientsCol = collection(db, 'clients');
  const newClient = {
    ...clientData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  const docRef = await addDoc(clientsCol, newClient);
  return { id: docRef.id };
}
