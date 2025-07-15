'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { addInvoice, updateInvoiceStatus } from '@/lib/firebase/firestore'

const invoiceItemSchema = z.object({
    itemId: z.string().min(1, "O ID do item é obrigatório."),
    description: z.string().min(1, "A descrição do item é obrigatória."),
    quantity: z.coerce.number().int().positive("A quantidade deve ser positiva."),
    unitPrice: z.coerce.number().positive("O preço unitário deve ser positivo."),
})

const invoiceFormSchema = z.object({
  clientId: z.string({ required_error: "Selecione um cliente." }),
  issueDate: z.date({ required_error: "A data de emissão é obrigatória." }).or(z.string().min(1, { message: "A data de emissão é obrigatória."})),
  dueDate: z.date({ required_error: "A data de vencimento é obrigatória." }).or(z.string().min(1, { message: "A data de vencimento é obrigatória."})),
  items: z.array(invoiceItemSchema).min(1, "A fatura deve ter pelo menos um item."),
  status: z.enum(['Pendente', 'Pago', 'Atrasado', 'Cancelado']),
  discount: z.coerce.number().min(0, "O desconto não pode ser negativo.").optional().default(0),
})

export async function createInvoiceAction(values: z.infer<typeof invoiceFormSchema>) {
  const validatedFields = invoiceFormSchema.safeParse(values)

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      message: 'Dados inválidos. Por favor, verifique os campos.',
    }
  }

  try {
    await addInvoice(validatedFields.data)
    revalidatePath('/dashboard/billing')
    return {
      success: true,
      message: 'Fatura criada com sucesso.',
    }
  } catch (error) {
    console.error('Error adding invoice:', error)
    return {
      success: false,
      message: 'Não foi possível criar a fatura. Tente novamente.',
    }
  }
}

const statusUpdateSchema = z.object({
  invoiceId: z.string().min(1),
  newStatus: z.enum(['Pago', 'Cancelado']),
})

export async function updateInvoiceStatusAction(values: z.infer<typeof statusUpdateSchema>) {
  const validatedFields = statusUpdateSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Dados inválidos para atualização de status.',
    }
  }
  
  try {
    await updateInvoiceStatus(validatedFields.data.invoiceId, validatedFields.data.newStatus)
    revalidatePath('/dashboard/billing')
    return {
      success: true,
      message: `Fatura marcada como ${validatedFields.data.newStatus.toLowerCase()} com sucesso.`,
    }
  } catch (error) {
    console.error('Error updating invoice status:', error)
    return {
      success: false,
      message: 'Não foi possível atualizar o status da fatura. Tente novamente.',
    }
  }
}
