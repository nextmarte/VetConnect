'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { addClient, updateClient, deleteClient } from '@/lib/firebase/firestore'

const clientFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  phone: z.string().min(10, { message: "O telefone deve ter pelo menos 10 dígitos." }),
  address: z.string().min(5, { message: "O endereço deve ter pelo menos 5 caracteres." }),
})

export async function createClientAction(values: z.infer<typeof clientFormSchema>) {
  const validatedFields = clientFormSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Dados inválidos. Por favor, verifique os campos.',
    }
  }
  
  try {
    await addClient(validatedFields.data)
    revalidatePath('/dashboard/clients')
    return {
      success: true,
      message: 'Cliente adicionado com sucesso.',
    }
  } catch (error) {
    console.error('Error adding client:', error)
    return {
      success: false,
      message: 'Não foi possível adicionar o cliente. Tente novamente.',
    }
  }
}

const clientEditFormSchema = clientFormSchema.extend({
    id: z.string().min(1, "ID do cliente é obrigatório."),
})

export async function updateClientAction(values: z.infer<typeof clientEditFormSchema>) {
    const validatedFields = clientEditFormSchema.safeParse(values)

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Dados inválidos para atualização. Por favor, verifique os campos.',
        }
    }

    try {
        await updateClient(validatedFields.data.id, validatedFields.data)
        revalidatePath('/dashboard/clients')
        return {
            success: true,
            message: 'Cliente atualizado com sucesso.',
        }
    } catch (error) {
        console.error('Error updating client:', error)
        return {
            success: false,
            message: 'Não foi possível atualizar o cliente. Tente novamente.',
        }
    }
}

export async function deleteClientAction(clientId: string) {
    if (!clientId) {
        return { success: false, message: 'ID do cliente é obrigatório.' }
    }

    try {
        await deleteClient(clientId)
        revalidatePath('/dashboard/clients')
        return {
            success: true,
            message: 'Cliente excluído com sucesso.',
        }
    } catch (error) {
        console.error('Error deleting client:', error)
        return {
            success: false,
            message: 'Não foi possível excluir o cliente. Tente novamente.',
        }
    }
}
