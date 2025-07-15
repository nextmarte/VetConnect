'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { addRecord } from '@/lib/firebase/firestore'

const recordFormSchema = z.object({
  clientId: z.string({ required_error: "Selecione um cliente." }),
  petId: z.string({ required_error: "Selecione um pet." }),
  date: z.date({ required_error: "A data da consulta é obrigatória." }).or(z.string().min(1, { message: "A data da consulta é obrigatória."})),
  symptoms: z.string().min(5, { message: "Descreva os sintomas com pelo menos 5 caracteres." }),
  diagnosis: z.string().min(5, { message: "Descreva o diagnóstico com pelo menos 5 caracteres." }),
  treatment: z.string().min(5, { message: "Descreva o tratamento com pelo menos 5 caracteres." }),
  notes: z.string().optional(),
})

export async function createRecordAction(values: z.infer<typeof recordFormSchema>) {
  const validatedFields = recordFormSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Dados inválidos. Por favor, verifique os campos.',
    }
  }

  // Mocking vetId and appointmentId for now
  const recordData = {
      ...validatedFields.data,
      vetId: 'vet_mock_id',
      appointmentId: `appoint_mock_${Date.now()}`
  }
  
  try {
    await addRecord(recordData)
    revalidatePath('/dashboard/records')
    return {
      success: true,
      message: 'Prontuário adicionado com sucesso.',
    }
  } catch (error) {
    console.error('Error adding record:', error)
    return {
      success: false,
      message: 'Não foi possível adicionar o prontuário. Tente novamente.',
    }
  }
}
