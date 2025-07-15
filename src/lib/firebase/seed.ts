// @ts-nocheck
import admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { Pet, Client, MedicalRecord } from '@/types';
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

const medicalRecordsData = [
    { petId: 'pet1', clientId: 'client1', date: new Date(2023, 9, 26), symptoms: 'Apatia e falta de apetite.', diagnosis: 'Virose comum.', treatment: 'Repouso e hidratação.' },
    { petId: 'pet2', clientId: 'client2', date: new Date(2023, 10, 15), symptoms: 'Espirros frequentes.', diagnosis: 'Rinite alérgica.', treatment: 'Anti-histamínico.' },
    { petId: 'pet3', clientId: 'client3', date: new Date(2024, 0, 5), symptoms: 'Check-up anual.', diagnosis: 'Saudável.', treatment: 'Vacinação de rotina.' },
    { petId: 'pet4', clientId: 'client4', date: new Date(2024, 1, 20), symptoms: 'Pata machucada.', diagnosis: 'Lesão leve.', treatment: 'Limpeza e curativo.' },
    { petId: 'pet5', clientId: 'client5', date: new Date(2024, 2, 10), symptoms: 'Roda não para de girar.', diagnosis: 'Excesso de energia.', treatment: 'Mais brinquedos.' },
];


async function seedCollection(collectionName, data, idField = 'id') {
  console.log(`Seeding ${collectionName}...`);
  const collectionRef = db.collection(collectionName);
  const batch = db.batch();

  for (const item of data) {
    const docRef = collectionRef.doc(item[idField]);
    const docData = { ...item };
    delete docData[idField]; // remove o id do corpo do documento

    // Converte campos de data
    Object.keys(docData).forEach(key => {
        if (docData[key] instanceof Date) {
            docData[key] = Timestamp.fromDate(docData[key]);
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
        const docRef = collectionRef.doc(); // Gera ID automático
        batch.set(docRef, {
            ...record,
            appointmentId: `appoint_${Math.random().toString(36).substring(2, 9)}`, // mock appointment id
            vetId: `vet_${Math.random().toString(36).substring(2, 9)}`, // mock vet id
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
    await seedMedicalRecords();
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();
