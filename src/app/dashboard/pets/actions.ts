'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { addPet } from '@/lib/firebase/firestore'

const petFormSchema = z.object({
  clientId: z.string().min(1, "ID do cliente é obrigatório."),
  name: z.string().min(2, { message: "O nome do pet deve ter pelo menos 2 caracteres." }),
  species: z.enum(['Cachorro', 'Gato', 'Hamster', 'Outro'], { required_error: "Selecione a espécie." }),
  breed: z.string().min(2, { message: "A raça deve ter pelo menos 2 caracteres." }),
  birthDate: z.date({ required_error: "A data de nascimento é obrigatória." }),
  photoUrl: z.string().url({ message: "Por favor, insira uma URL válida para a foto." }).optional().or(z.literal('')),
})

export async function createPetAction(values: z.infer<typeof petFormSchema>) {
  const validatedFields = petFormSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Dados inválidos. Por favor, verifique os campos.',
    }
  }

  try {
    await addPet(validatedFields.data)
    revalidatePath('/dashboard/clients')
    return {
      success: true,
      message: 'Pet adicionado com sucesso.',
    }
  } catch (error) {
    console.error('Error adding pet:', error)
    return {
      success: false,
      message: 'Não foi possível adicionar o pet. Tente novamente.',
    }
  }
}
