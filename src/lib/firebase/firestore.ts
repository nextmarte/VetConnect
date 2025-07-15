import { collection, getDocs, addDoc, Timestamp, doc, getDoc, where, query } from 'firebase/firestore';
import { db } from './config';
import type { Client, Pet, MedicalRecord, Appointment, InventoryItem, Invoice, InvoiceItem } from '@/types';

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

export async function getClientsWithPets(): Promise<(Client & { pets: Pet[] })[]> {
  const clients = await getClients();
  const clientsWithPets = [];

  for (const client of clients) {
    const petsQuery = query(collection(db, 'pets'), where('clientId', '==', client.id));
    const petsSnapshot = await getDocs(petsQuery);
    const pets = petsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pet));
    clientsWithPets.push({ ...client, pets });
  }

  return clientsWithPets;
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

export async function addRecord(recordData: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt' | 'attachments'>): Promise<{ id: string }> {
    const recordsCol = collection(db, 'medical_records');
    const newRecord = {
      ...recordData,
      date: Timestamp.fromDate(recordData.date as Date),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(recordsCol, newRecord);
    return { id: docRef.id };
}

export async function getRecords(): Promise<(MedicalRecord & { pet: Pet, client: Client })[]> {
    const recordsCol = collection(db, 'medical_records');
    const recordSnapshot = await getDocs(recordsCol);
    const recordList = [];

    for (const recordDoc of recordSnapshot.docs) {
        const recordData = recordDoc.data() as MedicalRecord;
        recordData.id = recordDoc.id;

        if (!recordData.petId || !recordData.clientId) continue;

        const petDocRef = doc(db, 'pets', recordData.petId);
        const petDocSnap = await getDoc(petDocRef);
        
        if (!petDocSnap.exists()) {
            console.warn(`Pet with id ${recordData.petId} not found for record ${recordData.id}`);
            continue;
        }
        const petData = { ...petDocSnap.data(), id: petDocSnap.id } as Pet;

        const clientDocRef = doc(db, 'clients', recordData.clientId);
        const clientDocSnap = await getDoc(clientDocRef);

        if (!clientDocSnap.exists()) {
            console.warn(`Client with id ${recordData.clientId} not found for record ${recordData.id}`);
            continue;
        }
        const clientData = { ...clientDocSnap.data(), id: clientDocSnap.id } as Client;

        recordList.push({ ...recordData, pet: petData, client: clientData });
    }

    return recordList.sort((a, b) => b.date.toMillis() - a.date.toMillis());
}

export async function addAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<{ id: string }> {
    const appointmentsCol = collection(db, 'appointments');
    const newAppointment = {
        ...appointmentData,
        date: Timestamp.fromDate(appointmentData.date as Date),
        status: 'Agendado',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(appointmentsCol, newAppointment);
    return { id: docRef.id };
}

export async function getAppointments(): Promise<(Appointment & { pet: Pet, client: Client })[]> {
    const appointmentsCol = collection(db, 'appointments');
    const appointmentSnapshot = await getDocs(appointmentsCol);
    const appointmentList = [];

    for (const apptDoc of appointmentSnapshot.docs) {
        const apptData = apptDoc.data() as Appointment;
        apptData.id = apptDoc.id;

        if (!apptData.petId || !apptData.clientId) continue;

        const petDocRef = doc(db, 'pets', apptData.petId);
        const petDocSnap = await getDoc(petDocRef);
        if (!petDocSnap.exists()) continue;
        const petData = { ...petDocSnap.data(), id: petDocSnap.id } as Pet;

        const clientDocRef = doc(db, 'clients', apptData.clientId);
        const clientDocSnap = await getDoc(clientDocRef);
        if (!clientDocSnap.exists()) continue;
        const clientData = { ...clientDocSnap.data(), id: clientDocSnap.id } as Client;

        appointmentList.push({ ...apptData, pet: petData, client: clientData });
    }
    return appointmentList.sort((a, b) => b.date.toMillis() - a.date.toMillis());
}

export async function addInventoryItem(itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id: string }> {
    const inventoryCol = collection(db, 'inventory');
    const newItem = {
        ...itemData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(inventoryCol, newItem);
    return { id: docRef.id };
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
    const inventoryCol = collection(db, 'inventory');
    const inventorySnapshot = await getDocs(inventoryCol);
    return inventorySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as InventoryItem));
}

export async function addInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'subtotal' | 'total'>): Promise<{ id: string }> {
    const invoicesCol = collection(db, 'invoices');
    
    const subtotal = invoiceData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const total = subtotal - (invoiceData.discount || 0);

    const newInvoice = {
      ...invoiceData,
      issueDate: Timestamp.fromDate(invoiceData.issueDate as Date),
      dueDate: Timestamp.fromDate(invoiceData.dueDate as Date),
      subtotal,
      total,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(invoicesCol, newInvoice);
    return { id: docRef.id };
}


export async function getInvoices(): Promise<(Invoice & { client: Client })[]> {
    const invoicesCol = collection(db, 'invoices');
    const invoiceSnapshot = await getDocs(invoicesCol);
    const invoiceList = [];

    for (const invoiceDoc of invoiceSnapshot.docs) {
        const invoiceData = invoiceDoc.data() as Invoice;
        invoiceData.id = invoiceDoc.id;

        if (!invoiceData.clientId) continue;

        const clientDocRef = doc(db, 'clients', invoiceData.clientId);
        const clientDocSnap = await getDoc(clientDocRef);
        if (!clientDocSnap.exists()) continue;
        const clientData = { ...clientDocSnap.data(), id: clientDocSnap.id } as Client;

        invoiceList.push({ ...invoiceData, client: clientData });
    }
    return invoiceList.sort((a, b) => b.issueDate.toMillis() - a.issueDate.toMillis());
}