'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { addAppointment } from '@/lib/firebase/firestore'

const appointmentFormSchema = z.object({
  clientId: z.string({ required_error: "Selecione um cliente." }),
  petId: z.string({ required_error: "Selecione um pet." }),
  date: z.date({ required_error: "A data do agendamento é obrigatória." }),
  type: z.enum(['Consulta', 'Vacinação', 'Cirurgia', 'Exame'], { required_error: "Selecione o tipo de agendamento." }),
  notes: z.string().optional(),
})

export async function createAppointmentAction(values: z.infer<typeof appointmentFormSchema>) {
  const validatedFields = appointmentFormSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Dados inválidos. Por favor, verifique os campos.',
    }
  }

  try {
    await addAppointment(validatedFields.data)
    revalidatePath('/dashboard/appointments')
    return {
      success: true,
      message: 'Agendamento criado com sucesso.',
    }
  } catch (error) {
    console.error('Error adding appointment:', error)
    return {
      success: false,
      message: 'Não foi possível criar o agendamento. Tente novamente.',
    }
  }
}
