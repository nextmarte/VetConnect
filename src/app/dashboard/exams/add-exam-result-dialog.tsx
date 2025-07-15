"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, PlusCircle } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { createExamResultAction } from "./actions"
import type { Appointment, Client, Pet } from "@/types"
import { cn } from "@/lib/utils"

const examResultFormSchema = z.object({
  appointmentId: z.string(),
  petId: z.string(),
  clientId: z.string(),
  examName: z.string().min(3, { message: "O nome do exame é obrigatório." }),
  resultDate: z.date({ required_error: "A data do resultado é obrigatória." }),
  resultSummary: z.string().min(10, { message: "O resumo do resultado é obrigatório." }),
  attachmentUrl: z.string().url({ message: "URL do anexo inválida." }).optional().or(z.literal('')),
})

type ExamResultFormValues = z.infer<typeof examResultFormSchema>

interface AddExamResultDialogProps {
  appointment: Appointment & { pet: Pet, client: Client };
  children: React.ReactNode;
}

export function AddExamResultDialog({ appointment, children }: AddExamResultDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<ExamResultFormValues>({
    resolver: zodResolver(examResultFormSchema),
    defaultValues: {
      appointmentId: appointment.id,
      petId: appointment.petId,
      clientId: appointment.clientId,
      examName: '',
      resultSummary: '',
      attachmentUrl: '',
    },
  })

  async function onSubmit(values: ExamResultFormValues) {
    setIsSubmitting(true)
    const result = await createExamResultAction(values)
    setIsSubmitting(false)

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Resultado do exame adicionado.",
      })
      setOpen(false)
      form.reset()
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: result.message || "Ocorreu um erro ao adicionar o resultado.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Adicionar Resultado de Exame</DialogTitle>
          <DialogDescription>
            Para o pet {appointment.pet.name} (Tutor: {appointment.client.name}).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="examName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Exame</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Hemograma Completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="resultDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data do Resultado</FormLabel>
                   <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resultSummary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resumo do Resultado</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva os principais pontos do resultado do exame." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="attachmentUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link para o Anexo (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://exemplo.com/resultado.pdf" {...field} />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar Resultado"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
