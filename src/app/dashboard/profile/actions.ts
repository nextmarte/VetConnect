'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { updateUserProfile } from '@/lib/firebase/auth'
import { getAuth } from 'firebase-admin/auth'
import { adminApp } from '@/lib/firebase/config-admin'

const updateProfileSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
})

export async function updateUserProfileAction(values: z.infer<typeof updateProfileSchema>) {
  const validatedFields = updateProfileSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Dados inválidos.',
    }
  }

  try {
    await updateUserProfile({ displayName: validatedFields.data.name })
    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard') // Revalidate layout to update user name in dropdown
    return {
      success: true,
      message: 'Perfil atualizado com sucesso.',
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    return {
      success: false,
      message: 'Não foi possível atualizar o perfil. Tente novamente.',
    }
  }
}