"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { updateInvoiceStatusAction } from "./actions"

interface UpdateInvoiceStatusAlertProps {
  invoiceId: string
  newStatus: 'Pago' | 'Cancelado'
  disabled?: boolean
  children: React.ReactNode
  triggerText: string
  alertTitle: string
  alertDescription: string
  confirmText: string
}

export function UpdateInvoiceStatusAlert({
  invoiceId,
  newStatus,
  disabled,
  children,
  alertTitle,
  alertDescription,
  confirmText,
}: UpdateInvoiceStatusAlertProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  async function handleConfirm() {
    setIsSubmitting(true)
    const result = await updateInvoiceStatusAction({ invoiceId, newStatus })
    setIsSubmitting(false)

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      })
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: result.message || "Ocorreu um erro ao atualizar a fatura.",
      })
    }
  }

  const isDestructive = newStatus === 'Cancelado';

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={disabled}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {alertDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Voltar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            disabled={isSubmitting} 
            className={isDestructive ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {isSubmitting ? "Atualizando..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
