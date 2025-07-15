'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { addInventoryItem } from '@/lib/firebase/firestore'

const itemFormSchema = z.object({
  name: z.string().min(2, { message: "O nome do item deve ter pelo menos 2 caracteres." }),
  description: z.string().min(5, { message: "A descrição deve ter pelo menos 5 caracteres." }),
  quantity: z.coerce.number().int().positive({ message: "A quantidade deve ser um número positivo." }),
  minStockLevel: z.coerce.number().int().positive({ message: "O estoque mínimo deve ser um número positivo." }),
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
