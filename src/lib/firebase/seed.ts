// @ts-nocheck
import admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { Pet, Client } from '@/types';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Use a try-catch block to handle the case where the app is already initialized
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
  { name: "João Silva", email: "joao.silva@example.com", phone: "11999991111", address: "Rua das Flores, 123" },
  { name: "Maria Oliveira", email: "maria.oliveira@example.com", phone: "21988882222", address: "Avenida Central, 456" },
  { name: "Carlos Pereira", email: "carlos.pereira@example.com", phone: "31977773333", address: "Praça da Matriz, 789" },
  { name: "Ana Costa", email: "ana.costa@example.com", phone: "41966664444", address: "Travessa dos Peixes, 10" },
  { name: "Lucas Souza", email: "lucas.souza@example.com", phone: "51955555555", address: "Alameda dos Pássaros, 20" },
];

const petsData = [
  { name: "Rex", species: "Cachorro", breed: "Golden Retriever", birthDate: new Date(2021, 5, 15), photoUrl: "https://placehold.co/64x64.png", ownerEmail: "joao.silva@example.com" },
  { name: "Mimi", species: "Gato", breed: "Siamês", birthDate: new Date(2022, 1, 10), photoUrl: "https://placehold.co/64x64.png", ownerEmail: "maria.oliveira@example.com" },
  { name: "Pingo", species: "Cachorro", breed: "Poodle", birthDate: new Date(2020, 8, 20), photoUrl: "https://placehold.co/64x64.png", ownerEmail: "carlos.pereira@example.com" },
  { name: "Frajola", species: "Gato", breed: "Vira-lata", birthDate: new Date(2022, 11, 1), photoUrl: "https://placehold.co/64x64.png", ownerEmail: "ana.costa@example.com" },
  { name: "Bolinha", species: "Hamster", breed: "Sírio", birthDate: new Date(2023, 2, 5), photoUrl: "https://placehold.co/64x64.png", ownerEmail: "lucas.souza@example.com" },
];

async function seedClients() {
  console.log('Seeding clients...');
  const clientsCollection = db.collection('clients');
  const batch = db.batch();

  for (const clientData of clientsData) {
    const docRef = clientsCollection.doc();
    const doc: Omit<Client, 'id' | 'pets'> = {
      ...clientData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    batch.set(docRef, doc);
  }
  await batch.commit();
  console.log('Clients seeded.');
}

async function seedPets() {
    console.log('Seeding pets...');
    const petsCollection = db.collection('pets');
    const clientsCollection = db.collection('clients');
    const batch = db.batch();

    for (const petData of petsData) {
        const { ownerEmail, ...pet } = petData;
        const q = clientsCollection.where("email", "==", ownerEmail);
        const querySnapshot = await q.get();
        
        if (!querySnapshot.empty) {
            const clientDoc = querySnapshot.docs[0];
            const clientId = clientDoc.id;
            
            const petDocRef = petsCollection.doc();
            const doc: Omit<Pet, 'id'> & { clientId: string } = {
                ...pet,
                clientId: clientId,
                birthDate: Timestamp.fromDate(pet.birthDate),
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };
            batch.set(petDocRef, doc);
        } else {
            console.warn(`Could not find client with email: ${ownerEmail} for pet ${pet.name}`);
        }
    }
    await batch.commit();
    console.log('Pets seeded.');
}

async function main() {
  try {
    console.log('Starting database seed...');
    await seedClients();
    await seedPets();
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();
