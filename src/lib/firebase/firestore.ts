import { collection, getDocs, addDoc, Timestamp, doc, getDoc, where, query, updateDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from './config';
import type { Client, Pet, MedicalRecord, Appointment, InventoryItem, Invoice, InvoiceItem, ExamResult } from '@/types';

// Helper function to serialize Firestore Timestamps
function serializeTimestamps(data: any): any {
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }
  if (Array.isArray(data)) {
    return data.map(serializeTimestamps);
  }
  const serializedData: { [key: string]: any } = {};
  for (const key in data) {
    serializedData[key] = serializeTimestamps(data[key]);
  }
  return serializedData;
}


export async function getClients(): Promise<Client[]> {
  const clientsCol = collection(db, 'clients');
  const clientSnapshot = await getDocs(clientsCol);
  const clientList = clientSnapshot.docs.map(doc => {
    const data = doc.data();
    const serializedData = serializeTimestamps({ id: doc.id, ...data });
    return serializedData as Client;
  });
  return clientList;
}

export async function getClientsWithPets(): Promise<(Client & { pets: Pet[] })[]> {
  const clients = await getClients();
  const clientsWithPets = [];

  for (const client of clients) {
    const petsQuery = query(collection(db, 'pets'), where('clientId', '==', client.id));
    const petsSnapshot = await getDocs(petsQuery);
    const pets = petsSnapshot.docs.map(doc => serializeTimestamps({ id: doc.id, ...doc.data() }) as Pet);
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

export async function updateClient(clientId: string, clientData: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const clientRef = doc(db, 'clients', clientId);
    const dataToUpdate: any = { ...clientData };
    dataToUpdate.updatedAt = Timestamp.now();
    await updateDoc(clientRef, dataToUpdate);
}

export async function deleteClient(clientId: string): Promise<void> {
    const clientRef = doc(db, 'clients', clientId);
    const batch = writeBatch(db);

    // Find and delete pets associated with the client
    const petsQuery = query(collection(db, 'pets'), where('clientId', '==', clientId));
    const petsSnapshot = await getDocs(petsQuery);
    petsSnapshot.forEach(petDoc => {
        batch.delete(petDoc.ref);
    });

    // Delete the client
    batch.delete(clientRef);

    await batch.commit();
}

export async function addPet(petData: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id: string }> {
    const petsCol = collection(db, 'pets');
    const newPet = {
        ...petData,
        birthDate: Timestamp.fromDate(new Date(petData.birthDate as string | Date)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(petsCol, newPet);
    return { id: docRef.id };
}


export async function addRecord(recordData: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'status'>): Promise<{ id: string }> {
    const recordsCol = collection(db, 'medical_records');
    const newRecord = {
      ...recordData,
      date: Timestamp.fromDate(new Date(recordData.date as string | Date)),
      status: 'Ativo',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(recordsCol, newRecord);
    return { id: docRef.id };
}

export async function updateRecord(recordId: string, recordData: Partial<Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const recordRef = doc(db, 'medical_records', recordId);
  const dataToUpdate: any = { ...recordData };
  if (recordData.date) {
    dataToUpdate.date = Timestamp.fromDate(new Date(recordData.date as string | Date));
  }
  dataToUpdate.updatedAt = Timestamp.now();
  await updateDoc(recordRef, dataToUpdate);
}

export async function archiveRecord(recordId: string): Promise<void> {
  const recordRef = doc(db, 'medical_records', recordId);
  await updateDoc(recordRef, {
    status: 'Arquivado',
    updatedAt: Timestamp.now(),
  });
}

export async function getRecords(): Promise<(MedicalRecord & { pet: Pet, client: Client })[]> {
    const recordsCol = collection(db, 'medical_records');
    const recordSnapshot = await getDocs(recordsCol);
    const recordList = [];

    for (const recordDoc of recordSnapshot.docs) {
        const recordData = recordDoc.data();

        if (!recordData.petId || !recordData.clientId) continue;

        const petDocRef = doc(db, 'pets', recordData.petId);
        const petDocSnap = await getDoc(petDocRef);
        
        if (!petDocSnap.exists()) {
            console.warn(`Pet with id ${recordData.petId} not found for record ${recordDoc.id}`);
            continue;
        }
        const petData = { ...petDocSnap.data(), id: petDocSnap.id } as Pet;

        const clientDocRef = doc(db, 'clients', recordData.clientId);
        const clientDocSnap = await getDoc(clientDocRef);

        if (!clientDocSnap.exists()) {
            console.warn(`Client with id ${recordData.clientId} not found for record ${recordDoc.id}`);
            continue;
        }
        const clientData = { ...clientDocSnap.data(), id: clientDocSnap.id } as Client;

        recordList.push(serializeTimestamps({ ...recordData, id: recordDoc.id, pet: petData, client: clientData }));
    }

    recordList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return recordList as (MedicalRecord & { pet: Pet, client: Client })[];
}

export async function addAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<{ id: string }> {
    const appointmentsCol = collection(db, 'appointments');
    const newAppointment = {
        ...appointmentData,
        date: Timestamp.fromDate(new Date(appointmentData.date as string | Date)),
        status: 'Agendado',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(appointmentsCol, newAppointment);
    return { id: docRef.id };
}

export async function updateAppointment(appointmentId: string, appointmentData: Partial<Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const appointmentRef = doc(db, 'appointments', appointmentId);
  const dataToUpdate: any = { ...appointmentData };
  if (appointmentData.date) {
    dataToUpdate.date = Timestamp.fromDate(new Date(appointmentData.date as string | Date));
  }
  dataToUpdate.updatedAt = Timestamp.now();
  await updateDoc(appointmentRef, dataToUpdate);
}

export async function cancelAppointment(appointmentId: string): Promise<void> {
  const appointmentRef = doc(db, 'appointments', appointmentId);
  await updateDoc(appointmentRef, {
    status: 'Cancelado',
    updatedAt: Timestamp.now(),
  });
}


export async function getAppointments(): Promise<(Appointment & { pet: Pet, client: Client })[]> {
    const appointmentsCol = collection(db, 'appointments');
    const appointmentSnapshot = await getDocs(appointmentsCol);
    const appointmentList = [];

    for (const apptDoc of appointmentSnapshot.docs) {
        const apptData = apptDoc.data();

        if (!apptData.petId || !apptData.clientId) continue;

        const petDocRef = doc(db, 'pets', apptData.petId);
        const petDocSnap = await getDoc(petDocRef);
        if (!petDocSnap.exists()) continue;
        const petData = { ...petDocSnap.data(), id: petDocSnap.id } as Pet;

        const clientDocRef = doc(db, 'clients', apptData.clientId);
        const clientDocSnap = await getDoc(clientDocRef);
        if (!clientDocSnap.exists()) continue;
        const clientData = { ...clientDocSnap.data(), id: clientDocSnap.id } as Client;

        appointmentList.push(serializeTimestamps({ ...apptData, id: apptDoc.id, pet: petData, client: clientData }));
    }
    appointmentList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return appointmentList as (Appointment & { pet: Pet, client: Client })[];
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

export async function updateInventoryItem(itemId: string, itemData: Partial<Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const itemRef = doc(db, 'inventory', itemId);
    const dataToUpdate: any = { ...itemData };
    dataToUpdate.updatedAt = Timestamp.now();
    await updateDoc(itemRef, dataToUpdate);
}

export async function deleteInventoryItem(itemId: string): Promise<void> {
    const itemRef = doc(db, 'inventory', itemId);
    await deleteDoc(itemRef);
}


export async function getInventoryItems(): Promise<InventoryItem[]> {
    const inventoryCol = collection(db, 'inventory');
    const inventorySnapshot = await getDocs(inventoryCol);
    return inventorySnapshot.docs.map(doc => serializeTimestamps({ ...doc.data(), id: doc.id }) as InventoryItem);
}

export async function addInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'subtotal' | 'total'>): Promise<{ id: string }> {
    const invoicesCol = collection(db, 'invoices');
    const batch = writeBatch(db);
    
    const subtotal = invoiceData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const total = subtotal - (invoiceData.discount || 0);

    const itemsToStore = invoiceData.items.map(item => ({
        itemId: item.itemId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice
    }));

    const newInvoiceRef = doc(collection(db, 'invoices'));
    const newInvoiceData = {
      ...invoiceData,
      items: itemsToStore,
      issueDate: Timestamp.fromDate(new Date(invoiceData.issueDate as string | Date)),
      dueDate: Timestamp.fromDate(new Date(invoiceData.dueDate as string | Date)),
      subtotal,
      total,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    batch.set(newInvoiceRef, newInvoiceData);

    // Update stock levels
    for (const item of invoiceData.items) {
      const itemRef = doc(db, "inventory", item.itemId);
      const itemSnap = await getDoc(itemRef);
      if (itemSnap.exists()) {
        const currentQuantity = itemSnap.data().quantity;
        batch.update(itemRef, { quantity: currentQuantity - item.quantity });
      }
    }

    await batch.commit();
    return { id: newInvoiceRef.id };
}

export async function updateInvoiceStatus(invoiceId: string, status: 'Pago' | 'Cancelado'): Promise<void> {
    const invoiceRef = doc(db, 'invoices', invoiceId);
    await updateDoc(invoiceRef, {
        status: status,
        updatedAt: Timestamp.now(),
    });
}


export async function getInvoices(): Promise<(Invoice & { client: Client })[]> {
    const invoicesCol = collection(db, 'invoices');
    const invoiceSnapshot = await getDocs(invoicesCol);
    const invoiceList = [];

    for (const invoiceDoc of invoiceSnapshot.docs) {
        const invoiceData = invoiceDoc.data();

        if (!invoiceData.clientId) continue;

        const clientDocRef = doc(db, 'clients', invoiceData.clientId);
        const clientDocSnap = await getDoc(clientDocRef);
        if (!clientDocSnap.exists()) continue;
        const clientData = { ...clientDocSnap.data(), id: clientDocSnap.id } as Client;

        invoiceList.push(serializeTimestamps({ ...invoiceData, id: invoiceDoc.id, client: clientData }));
    }
    invoiceList.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    return invoiceList as (Invoice & { client: Client })[];
}

export async function addExamResult(examData: Omit<ExamResult, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id: string }> {
    const examResultsCol = collection(db, 'exam_results');
    const newResult = {
        ...examData,
        resultDate: Timestamp.fromDate(new Date(examData.resultDate as string | Date)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(examResultsCol, newResult);
    
    // Mark appointment as having a result
    const appointmentRef = doc(db, 'appointments', examData.appointmentId);
    await updateDoc(appointmentRef, { hasResult: true });

    return { id: docRef.id };
}

export async function getExamResults(): Promise<(ExamResult & { pet: Pet, client: Client })[]> {
    const resultsCol = collection(db, 'exam_results');
    const resultSnapshot = await getDocs(resultsCol);
    const resultList = [];

    for (const resultDoc of resultSnapshot.docs) {
        const resultData = resultDoc.data();

        if (!resultData.petId || !resultData.clientId) continue;

        const petDocRef = doc(db, 'pets', resultData.petId);
        const petDocSnap = await getDoc(petDocRef);
        if (!petDocSnap.exists()) continue;
        const petData = { ...petDocSnap.data(), id: petDocSnap.id } as Pet;

        const clientDocRef = doc(db, 'clients', resultData.clientId);
        const clientDocSnap = await getDoc(clientDocRef);
        if (!clientDocSnap.exists()) continue;
        const clientData = { ...clientDocSnap.data(), id: clientDocSnap.id } as Client;

        resultList.push(serializeTimestamps({ ...resultData, id: resultDoc.id, pet: petData, client: clientData }));
    }
    resultList.sort((a, b) => new Date(b.resultDate).getTime() - new Date(a.resultDate).getTime());
    return resultList as (ExamResult & { pet: Pet, client: Client })[];
}
