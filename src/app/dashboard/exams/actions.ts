'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { addExamResult } from '@/lib/firebase/firestore'

const examResultFormSchema = z.object({
  appointmentId: z.string().min(1),
  petId: z.string().min(1),
  clientId: z.string().min(1),
  examName: z.string().min(3, { message: "O nome do exame é obrigatório." }),
  resultDate: z.date({ required_error: "A data do resultado é obrigatória." }),
  resultSummary: z.string().min(10, { message: "O resumo do resultado é obrigatório." }),
  attachmentUrl: z.string().url({ message: "URL do anexo inválida." }).optional().or(z.literal('')),
})

export async function createExamResultAction(values: z.infer<typeof examResultFormSchema>) {
  const validatedFields = examResultFormSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Dados inválidos. Por favor, verifique os campos.',
    }
  }

  try {
    await addExamResult(validatedFields.data)
    revalidatePath('/dashboard/exams')
    revalidatePath('/dashboard/appointments')
    return {
      success: true,
      message: 'Resultado de exame adicionado com sucesso.',
    }
  } catch (error) {
    console.error('Error adding exam result:', error)
    return {
      success: false,
      message: 'Não foi possível adicionar o resultado. Tente novamente.',
    }
  }
}
