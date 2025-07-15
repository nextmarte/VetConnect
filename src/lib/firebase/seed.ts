// @ts-nocheck
import admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { Pet, Client, MedicalRecord, Appointment, InventoryItem, Invoice } from '@/types';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });
} catch (error) {
  if (!/already exists/u.test(error.message)) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

const db = getFirestore();

const clientsData = [
  { id: 'client1', name: "João Silva", email: "joao.silva@example.com", phone: "11999991111", address: "Rua das Flores, 123" },
  { id: 'client2', name: "Maria Oliveira", email: "maria.oliveira@example.com", phone: "21988882222", address: "Avenida Central, 456" },
  { id: 'client3', name: "Carlos Pereira", email: "carlos.pereira@example.com", phone: "31977773333", address: "Praça da Matriz, 789" },
  { id: 'client4', name: "Ana Costa", email: "ana.costa@example.com", phone: "41966664444", address: "Travessa dos Peixes, 10" },
  { id: 'client5', name: "Lucas Souza", email: "lucas.souza@example.com", phone: "51955555555", address: "Alameda dos Pássaros, 20" },
];

const petsData = [
  { id: 'pet1', name: "Rex", species: "Cachorro", breed: "Golden Retriever", birthDate: new Date(2021, 5, 15), photoUrl: "https://placehold.co/64x64.png", clientId: "client1" },
  { id: 'pet2', name: "Mimi", species: "Gato", breed: "Siamês", birthDate: new Date(2022, 1, 10), photoUrl: "https://placehold.co/64x64.png", clientId: "client2" },
  { id: 'pet3', name: "Pingo", species: "Cachorro", breed: "Poodle", birthDate: new Date(2020, 8, 20), photoUrl: "https://placehold.co/64x64.png", clientId: "client3" },
  { id: 'pet4', name: "Frajola", species: "Gato", breed: "Vira-lata", birthDate: new Date(2022, 11, 1), photoUrl: "https://placehold.co/64x64.png", clientId: "client4" },
  { id: 'pet5', name: "Bolinha", species: "Hamster", breed: "Sírio", birthDate: new Date(2023, 2, 5), photoUrl: "https://placehold.co/64x64.png", clientId: "client5" },
];

const appointmentsData = [
    { id: 'appt1', petId: 'pet1', clientId: 'client1', date: new Date(2023, 9, 26), type: 'Consulta', status: 'Concluído' },
    { id: 'appt2', petId: 'pet2', clientId: 'client2', date: new Date(2023, 10, 15), type: 'Consulta', status: 'Concluído' },
    { id: 'appt3', petId: 'pet3', clientId: 'client3', date: new Date(2024, 0, 5), type: 'Vacinação', status: 'Concluído' },
    { id: 'appt4', petId: 'pet4', clientId: 'client4', date: new Date(2024, 1, 20), type: 'Consulta', status: 'Concluído' },
    { id: 'appt5', petId: 'pet5', clientId: 'client5', date: new Date(2024, 2, 10), type: 'Consulta', status: 'Concluído' },
];

const medicalRecordsData = [
    { appointmentId: 'appt1', petId: 'pet1', clientId: 'client1', date: new Date(2023, 9, 26), symptoms: 'Apatia e falta de apetite.', diagnosis: 'Virose comum.', treatment: 'Repouso e hidratação.' },
    { appointmentId: 'appt2', petId: 'pet2', clientId: 'client2', date: new Date(2023, 10, 15), symptoms: 'Espirros frequentes.', diagnosis: 'Rinite alérgica.', treatment: 'Anti-histamínico.' },
    { appointmentId: 'appt3', petId: 'pet3', clientId: 'client3', date: new Date(2024, 0, 5), symptoms: 'Check-up anual.', diagnosis: 'Saudável.', treatment: 'Vacinação de rotina.' },
    { appointmentId: 'appt4', petId: 'pet4', clientId: 'client4', date: new Date(2024, 1, 20), symptoms: 'Pata machucada.', diagnosis: 'Lesão leve.', treatment: 'Limpeza e curativo.' },
    { appointmentId: 'appt5', petId: 'pet5', clientId: 'client5', date: new Date(2024, 2, 10), symptoms: 'Roda não para de girar.', diagnosis: 'Excesso de energia.', treatment: 'Mais brinquedos.' },
];

const inventoryData = [
    { id: 'inv1', name: 'Vacina Polivalente V10', description: 'Vacina importada para cães.', quantity: 50, minStockLevel: 10, supplier: 'PetMed', price: 75.50 },
    { id: 'inv2', name: 'Antipulgas e Carrapatos', description: 'Para cães de 10-25kg.', quantity: 100, minStockLevel: 20, supplier: 'VetSupplies', price: 55.00 },
    { id: 'inv3', name: 'Ração Terapêutica Renal', description: 'Pacote de 2kg para gatos.', quantity: 15, minStockLevel: 5, supplier: 'NutriPet', price: 120.00 },
    { id: 'inv4', name: 'Seringa Descartável 3ml', description: 'Caixa com 100 unidades.', quantity: 5, minStockLevel: 2, supplier: 'MedicalFast', price: 35.00 },
    { id: 'inv5', name: 'Shampoo Hipoalergênico', description: 'Frasco de 500ml.', quantity: 30, minStockLevel: 10, supplier: 'PetCare', price: 45.00 },
];

const invoicesData = [
    { id: 'invc1', clientId: 'client1', appointmentId: 'appt1', issueDate: new Date(2023, 9, 26), dueDate: new Date(2023, 10, 26), items: [{ description: 'Consulta Rex', quantity: 1, unitPrice: 150, total: 150 }], subtotal: 150, discount: 0, total: 150, status: 'Pago' },
    { id: 'invc2', clientId: 'client2', appointmentId: 'appt2', issueDate: new Date(2023, 10, 15), dueDate: new Date(2023, 11, 15), items: [{ description: 'Consulta Mimi', quantity: 1, unitPrice: 150, total: 150 }], subtotal: 150, discount: 0, total: 150, status: 'Pago' },
    { id: 'invc3', clientId: 'client3', appointmentId: 'appt3', issueDate: new Date(2024, 0, 5), dueDate: new Date(2024, 1, 5), items: [{ description: 'Vacinação Pingo', quantity: 1, unitPrice: 80, total: 80 }], subtotal: 80, discount: 0, total: 80, status: 'Pendente' },
    { id: 'invc4', clientId: 'client4', appointmentId: 'appt4', issueDate: new Date(2024, 1, 20), dueDate: new Date(2024, 2, 20), items: [{ description: 'Consulta e Curativo Frajola', quantity: 1, unitPrice: 180, total: 180 }], subtotal: 180, discount: 10, total: 170, status: 'Atrasado' },
    { id: 'invc5', clientId: 'client5', issueDate: new Date(2024, 2, 11), dueDate: new Date(2024, 3, 11), items: [{ description: 'Ração Especial', quantity: 2, unitPrice: 90, total: 180 }], subtotal: 180, discount: 0, total: 180, status: 'Pendente' },
];


async function seedCollection(collectionName, data, idField = 'id') {
  console.log(`Seeding ${collectionName}...`);
  const collectionRef = db.collection(collectionName);
  const batch = db.batch();

  for (const item of data) {
    const docRef = collectionRef.doc(item[idField]);
    const docData = { ...item };
    delete docData[idField];

    Object.keys(docData).forEach(key => {
        if (docData[key] instanceof Date) {
            docData[key] = Timestamp.fromDate(docData[key]);
        } else if (Array.isArray(docData[key])) {
            docData[key] = docData[key].map(arrItem => {
                if (typeof arrItem === 'object' && arrItem !== null) {
                    const newItem = { ...arrItem };
                    Object.keys(newItem).forEach(subKey => {
                        if (newItem[subKey] instanceof Date) {
                            newItem[subKey] = Timestamp.fromDate(newItem[subKey]);
                        }
                    });
                    return newItem;
                }
                return arrItem;
            });
        }
    });

    batch.set(docRef, { 
        ...docData, 
        createdAt: Timestamp.now(), 
        updatedAt: Timestamp.now()
    });
  }
  await batch.commit();
  console.log(`${collectionName} seeded.`);
}

async function seedMedicalRecords() {
    console.log('Seeding medical_records...');
    const collectionRef = db.collection('medical_records');
    const batch = db.batch();

    for(const record of medicalRecordsData) {
        const docRef = collectionRef.doc();
        batch.set(docRef, {
            ...record,
            vetId: `vet_mock_${Math.random().toString(36).substring(2, 9)}`,
            notes: 'Nenhuma observação adicional.',
            date: Timestamp.fromDate(record.date),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
    }
    await batch.commit();
    console.log('medical_records seeded.');
}


async function main() {
  try {
    console.log('Starting database seed...');
    await seedCollection('clients', clientsData, 'id');
    await seedCollection('pets', petsData, 'id');
    await seedCollection('appointments', appointmentsData, 'id');
    await seedMedicalRecords();
    await seedCollection('inventory', inventoryData, 'id');
    await seedCollection('invoices', invoicesData, 'id');
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();
