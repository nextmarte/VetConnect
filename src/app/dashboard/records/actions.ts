'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { addRecord } from '@/lib/firebase/firestore'

const recordFormSchema = z.object({
  clientId: z.string(),
  petId: z.string(),
  date: z.date(),
  symptoms: z.string().min(5),
  diagnosis: z.string().min(5),
  treatment: z.string().min(5),
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
