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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { createRecordAction } from "./actions"
import type { Client, Pet } from "@/types"
import { cn } from "@/lib/utils"

const recordFormSchema = z.object({
  clientId: z.string({ required_error: "Selecione um cliente." }),
  petId: z.string({ required_error: "Selecione um pet." }),
  date: z.date({ required_error: "A data da consulta é obrigatória." }),
  symptoms: z.string().min(5, { message: "Descreva os sintomas com pelo menos 5 caracteres." }),
  diagnosis: z.string().min(5, { message: "Descreva o diagnóstico com pelo menos 5 caracteres." }),
  treatment: z.string().min(5, { message: "Descreva o tratamento com pelo menos 5 caracteres." }),
  notes: z.string().optional(),
})

type RecordFormValues = z.infer<typeof recordFormSchema>

interface AddRecordDialogProps {
  clients: (Client & { pets: Pet[] })[];
}

export function AddRecordDialog({ clients }: AddRecordDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<RecordFormValues>({
    resolver: zodResolver(recordFormSchema),
  })

  async function onSubmit(values: RecordFormValues) {
    setIsSubmitting(true)
    const result = await createRecordAction(values)
    setIsSubmitting(false)

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Prontuário adicionado com sucesso.",
      })
      setOpen(false)
      form.reset()
      setSelectedClientId(null)
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: result.message || "Ocorreu um erro ao adicionar o prontuário.",
      })
    }
  }
  
  const selectedClientPets = clients.find(c => c.id === selectedClientId)?.pets || []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Novo Prontuário
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Prontuário</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para criar um novo prontuário.
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
                  <FormLabel>Data da Consulta</FormLabel>
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
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
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
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sintomas</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Apatia, febre, falta de apetite..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnóstico</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Virose, intoxicação alimentar..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="treatment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tratamento</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Medicação X, repouso, dieta Y..." {...field} />
                  </FormControl>
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
                    <Textarea placeholder="Observações adicionais (opcional)" {...field} />
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
                {isSubmitting ? "Salvando..." : "Salvar Prontuário"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
