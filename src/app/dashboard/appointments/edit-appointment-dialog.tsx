"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { updateAppointmentAction } from "./actions"
import type { Appointment, Client, Pet } from "@/types"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

const appointmentEditFormSchema = z.object({
  id: z.string(),
  clientId: z.string({ required_error: "Selecione um cliente." }),
  petId: z.string({ required_error: "Selecione um pet." }),
  date: z.date({ required_error: "A data do agendamento é obrigatória." }),
  type: z.enum(['Consulta', 'Vacinação', 'Cirurgia', 'Exame'], { required_error: "Selecione o tipo de agendamento." }),
  notes: z.string().optional(),
})

type AppointmentFormValues = z.infer<typeof appointmentEditFormSchema>

interface EditAppointmentDialogProps {
  appointment: Appointment;
  clients: (Client & { pets: Pet[] })[];
  disabled?: boolean;
  children: React.ReactNode;
}

export function EditAppointmentDialog({ appointment, clients, disabled, children }: EditAppointmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentEditFormSchema),
    defaultValues: {
      id: appointment.id,
      clientId: appointment.clientId,
      petId: appointment.petId,
      date: new Date(appointment.date as string),
      type: appointment.type,
      notes: appointment.notes || "",
    }
  })
  
  const [selectedClientId, setSelectedClientId] = useState<string | null>(appointment.clientId)

  async function onSubmit(values: AppointmentFormValues) {
    setIsSubmitting(true)
    const result = await updateAppointmentAction(values)
    setIsSubmitting(false)

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Agendamento atualizado com sucesso.",
      })
      setOpen(false)
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: result.message || "Ocorreu um erro ao atualizar o agendamento.",
      })
    }
  }
  
  const selectedClientPets = clients.find(c => c.id === selectedClientId)?.pets || []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={disabled}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
          <DialogDescription>
            Atualize os dados do agendamento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tutor</FormLabel>
                  <Select onValueChange={(value) => {
                      field.onChange(value)
                      setSelectedClientId(value)
                      form.resetField("petId")
                    }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tutor do pet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="petId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pet</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedClientId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={!selectedClientId ? "Selecione um tutor primeiro" : "Selecione o pet"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedClientPets.map(pet => (
                        <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data do Agendamento</FormLabel>
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
                            format(field.value, "PPP 'às' HH:mm")
                          ) : (
                            <span>Escolha uma data e hora</span>
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
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                        initialFocus
                      />
                      <div className="p-2 border-t">
                        <input type="time" className="w-full border-input p-1" defaultValue={field.value ? format(field.value, "HH:mm") : ''} onChange={(e) => {
                            if (!field.value) return;
                            const [hours, minutes] = e.target.value.split(':');
                            const newDate = new Date(field.value);
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            field.onChange(newDate);
                        }} />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tipo de Agendamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Consulta">Consulta</SelectItem>
                            <SelectItem value="Vacinação">Vacinação</SelectItem>
                            <SelectItem value="Cirurgia">Cirurgia</SelectItem>
                            <SelectItem value="Exame">Exame</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observações sobre o agendamento (opcional)" {...field} />
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
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
