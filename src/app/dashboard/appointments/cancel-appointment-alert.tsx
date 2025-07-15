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
import { cancelAppointmentAction } from "./actions"

interface CancelAppointmentAlertProps {
  appointmentId: string
  disabled?: boolean
  children: React.ReactNode
}

export function CancelAppointmentAlert({ appointmentId, disabled, children }: CancelAppointmentAlertProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  async function handleCancel() {
    setIsSubmitting(true)
    const result = await cancelAppointmentAction(appointmentId)
    setIsSubmitting(false)

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Agendamento cancelado com sucesso.",
      })
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: result.message || "Ocorreu um erro ao cancelar o agendamento.",
      })
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={disabled}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso irá marcar o agendamento como
            cancelado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Manter Agendamento</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel} disabled={isSubmitting}>
            {isSubmitting ? "Cancelando..." : "Confirmar Cancelamento"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
