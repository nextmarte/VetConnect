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
import { archiveRecordAction } from "./actions"
import { Button } from "@/components/ui/button"

interface ArchiveRecordAlertProps {
  recordId: string
  disabled?: boolean
  children: React.ReactNode
}

export function ArchiveRecordAlert({ recordId, disabled, children }: ArchiveRecordAlertProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  async function handleArchive() {
    setIsSubmitting(true)
    const result = await archiveRecordAction(recordId)
    setIsSubmitting(false)

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Prontuário arquivado com sucesso.",
      })
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: result.message || "Ocorreu um erro ao arquivar o prontuário.",
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
            Esta ação irá marcar o prontuário como arquivado. Ele não poderá mais ser editado,
            mas poderá ser consultado na aba "Arquivados".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive} disabled={isSubmitting} asChild>
            <Button variant="destructive" disabled={isSubmitting}>
                {isSubmitting ? "Arquivando..." : "Confirmar"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
