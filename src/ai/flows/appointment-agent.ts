'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache';

// Helper to find client and pet
async function findClientAndPet(petName: string) {
  const petsQuery = query(collection(db, 'pets'), where('name', '==', petName));
  const petsSnapshot = await getDocs(petsQuery);

  if (petsSnapshot.empty) {
    throw new Error(`Pet com o nome '${petName}' não encontrado.`);
  }

  // Assuming unique pet names for simplicity. In a real-world scenario, you might need to ask for more details.
  const pet = petsSnapshot.docs[0].data();
  return { petId: petsSnapshot.docs[0].id, clientId: pet.clientId };
}

const scheduleAppointmentTool = ai.defineTool(
  {
    name: 'scheduleAppointment',
    description: 'Use esta ferramenta para agendar uma nova consulta, vacinação, cirurgia ou exame para um pet. Você deve fornecer o nome do pet, a data e a hora do agendamento.',
    inputSchema: z.object({
      petName: z.string().describe('O nome do pet.'),
      dateTime: z.string().describe('A data e hora do agendamento no formato ISO 8601.'),
      type: z.enum(['Consulta', 'Vacinação', 'Cirurgia', 'Exame']).describe('O tipo de agendamento.'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      const { petId, clientId } = await findClientAndPet(input.petName);
      const appointmentDate = new Date(input.dateTime);
      
      // Basic validation for working hours
      const hour = appointmentDate.getHours();
      const day = appointmentDate.getDay(); // Sunday = 0, Saturday = 6

      if (day === 0) {
        return 'Não é possível agendar aos domingos, a clínica está fechada.';
      }
      if (hour < 9 || hour >= 18) {
         return `Não é possível agendar às ${hour}h. O horário de funcionamento é das 9h às 18h.`;
      }
      
      await addDoc(collection(db, 'appointments'), {
        petId,
        clientId,
        date: Timestamp.fromDate(appointmentDate),
        type: input.type,
        status: 'Agendado',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      revalidatePath('/dashboard/appointments');
      return `Agendamento do tipo '${input.type}' para '${input.petName}' marcado para ${appointmentDate.toLocaleString('pt-BR')} com sucesso.`;
    } catch (e: any) {
      return e.message;
    }
  }
);

const listAvailableSlotsTool = ai.defineTool(
  {
    name: 'listAvailableSlots',
    description: 'Use esta ferramenta para verificar os horários disponíveis em uma data específica. Os horários de funcionamento são das 9h às 18h, de segunda a sábado. Cada consulta dura 1 hora.',
    inputSchema: z.object({
      date: z.string().describe('A data para verificar a disponibilidade no formato ISO 8601 (apenas a parte da data é relevante).'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    const checkDate = new Date(input.date);
    checkDate.setHours(0, 0, 0, 0);

    // Check if it's Sunday
    if (checkDate.getDay() === 0) {
      return 'A clínica está fechada aos domingos.';
    }

    const startOfDay = new Date(checkDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(checkDate);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, 'appointments'),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay))
    );

    const querySnapshot = await getDocs(q);
    const bookedTimes = querySnapshot.docs
      .map(doc => (doc.data().date as Timestamp).toDate().getHours());

    const businessHours = [9, 10, 11, 12, 13, 14, 15, 16, 17]; // 9am to 5pm (last appointment starts at 17h)
    const availableSlots = businessHours.filter(hour => !bookedTimes.includes(hour));

    if (availableSlots.length === 0) {
      return `Não há horários disponíveis para ${checkDate.toLocaleDateString('pt-BR')}.`;
    }

    return `Os horários disponíveis para ${checkDate.toLocaleDateString('pt-BR')} são: ${availableSlots.map(h => `${h}:00`).join(', ')}.`;
  }
);


const appointmentAgentFlow = ai.defineFlow(
  {
    name: 'appointmentAgentFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt) => {
    
    const llmResponse = await ai.generate({
      prompt: `A data e hora atual é ${new Date().toISOString()}. ${prompt}`,
      tools: [scheduleAppointmentTool, listAvailableSlotsTool],
      toolChoice: 'auto',
    });

    const toolRequest = llmResponse.toolRequest;
    if (toolRequest) {
      const toolResponse = await toolRequest.run();
      
      const finalResponse = await ai.generate({
        prompt: `A data e hora atual é ${new Date().toISOString()}. ${prompt}`,
        tools: [scheduleAppointmentTool, listAvailableSlotsTool],
        history: [
            llmResponse.request,
            llmResponse.response,
            {role: 'tool', content: [toolResponse]}
        ]
      });

      return finalResponse.text;
    }

    return llmResponse.text;
  }
);

export async function appointmentAgent(prompt: string): Promise<string> {
  return appointmentAgentFlow(prompt);
}
