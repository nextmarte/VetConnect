'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { addInventoryItem, updateInventoryItem, deleteInventoryItem } from '@/lib/firebase/firestore'

const itemFormSchema = z.object({
  name: z.string().min(2, { message: "O nome do item deve ter pelo menos 2 caracteres." }),
  description: z.string().min(5, { message: "A descrição deve ter pelo menos 5 caracteres." }),
  quantity: z.coerce.number().int().min(0, { message: "A quantidade não pode ser negativa." }),
  minStockLevel: z.coerce.number().int().min(0, { message: "O estoque mínimo não pode ser negativo." }),
  supplier: z.string().min(2, { message: "O fornecedor deve ter pelo menos 2 caracteres." }),
  price: z.coerce.number().positive({ message: "O preço deve ser um número positivo." }),
})

export async function createItemAction(values: z.infer<typeof itemFormSchema>) {
  const validatedFields = itemFormSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Dados inválidos. Por favor, verifique os campos.',
    }
  }

  try {
    await addInventoryItem(validatedFields.data)
    revalidatePath('/dashboard/inventory')
    return {
      success: true,
      message: 'Item adicionado ao estoque com sucesso.',
    }
  } catch (error) {
    console.error('Error adding inventory item:', error)
    return {
      success: false,
      message: 'Não foi possível adicionar o item. Tente novamente.',
    }
  }
}

const itemEditFormSchema = itemFormSchema.extend({
    id: z.string().min(1, "ID do item é obrigatório."),
})

export async function updateItemAction(values: z.infer<typeof itemEditFormSchema>) {
    const validatedFields = itemEditFormSchema.safeParse(values)

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Dados inválidos para atualização. Por favor, verifique os campos.',
        }
    }

    try {
        await updateInventoryItem(validatedFields.data.id, validatedFields.data)
        revalidatePath('/dashboard/inventory')
        return {
            success: true,
            message: 'Item atualizado com sucesso.',
        }
    } catch (error) {
        console.error('Error updating inventory item:', error)
        return {
            success: false,
            message: 'Não foi possível atualizar o item. Tente novamente.',
        }
    }
}

export async function deleteItemAction(itemId: string) {
    if (!itemId) {
        return { success: false, message: 'ID do item é obrigatório.' }
    }

    try {
        await deleteInventoryItem(itemId)
        revalidatePath('/dashboard/inventory')
        return {
            success: true,
            message: 'Item excluído com sucesso.',
        }
    } catch (error) {
        console.error('Error deleting inventory item:', error)
        return {
            success: false,
            message: 'Não foi possível excluir o item. Tente novamente.',
        }
    }
}
