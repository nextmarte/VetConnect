import { collection, getDocs, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from './config';
import type { Client, Pet, MedicalRecord } from '@/types';

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
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as Client;
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

export async function getRecords(): Promise<(MedicalRecord & { pet: Pet, client: Client })[]> {
    const recordsCol = collection(db, 'medical_records');
    const recordSnapshot = await getDocs(recordsCol);
    const recordList = [];

    for (const recordDoc of recordSnapshot.docs) {
        const recordData = recordDoc.data() as MedicalRecord;
        recordData.id = recordDoc.id;

        // Buscar dados do Pet
        const petDocRef = doc(db, 'pets', recordData.petId);
        const petDocSnap = await getDoc(petDocRef);
        
        if (!petDocSnap.exists()) {
            console.warn(`Pet with id ${recordData.petId} not found for record ${recordData.id}`);
            continue;
        }
        const petData = { ...petDocSnap.data(), id: petDocSnap.id } as Pet;

        // Buscar dados do Cliente
        const clientDocRef = doc(db, 'clients', recordData.clientId);
        const clientDocSnap = await getDoc(clientDocRef);

        if (!clientDocSnap.exists()) {
            console.warn(`Client with id ${recordData.clientId} not found for record ${recordData.id}`);
            continue;
        }
        const clientData = { ...clientDocSnap.data(), id: clientDocSnap.id } as Client;

        recordList.push({ ...recordData, pet: petData, client: clientData });
    }

    return recordList;
}
