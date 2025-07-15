"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react"
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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { createInvoiceAction } from "./actions"
import type { Client, InventoryItem } from "@/types"
import { cn } from "@/lib/utils"

const invoiceItemSchema = z.object({
    itemId: z.string().min(1, "Selecione um item."),
    description: z.string(),
    quantity: z.coerce.number().int().positive("A quantidade deve ser positiva."),
    unitPrice: z.coerce.number().positive("O preço unitário deve ser positivo."),
})

const invoiceFormSchema = z.object({
  clientId: z.string({ required_error: "Selecione um cliente." }),
  issueDate: z.date({ required_error: "A data de emissão é obrigatória." }),
  dueDate: z.date({ required_error: "A data de vencimento é obrigatória." }),
  items: z.array(invoiceItemSchema).min(1, "A fatura deve ter pelo menos um item."),
  status: z.enum(['Pendente', 'Pago', 'Atrasado', 'Cancelado']),
  discount: z.coerce.number().min(0, "O desconto não pode ser negativo.").optional().default(0),
})

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>

interface AddInvoiceDialogProps {
  clients: Client[];
  inventoryItems: InventoryItem[];
}

export function AddInvoiceDialog({ clients, inventoryItems }: AddInvoiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
        items: [],
        status: 'Pendente',
        discount: 0,
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  async function onSubmit(values: InvoiceFormValues) {
    setIsSubmitting(true)
    const result = await createInvoiceAction(values)
    setIsSubmitting(false)

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Fatura criada com sucesso.",
      })
      setOpen(false)
      form.reset({
        items: [],
        status: 'Pendente',
        discount: 0,
      })
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: result.message || "Ocorreu um erro ao criar a fatura.",
      })
    }
  }

  const handleItemSelect = (itemId: string, index: number) => {
      const selectedItem = inventoryItems.find(item => item.id === itemId);
      if (selectedItem) {
          form.setValue(`items.${index}.unitPrice`, selectedItem.price);
          form.setValue(`items.${index}.description`, selectedItem.name);
          form.setValue(`items.${index}.itemId`, selectedItem.id);
      }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Nova Fatura
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Gerar Nova Fatura</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para criar uma nova fatura.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                    <FormItem className="md:col-span-1">
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o cliente" />
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
                    name="issueDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Data de Emissão</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "PPP") : <span>Escolha uma data</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Data de Vencimento</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "PPP") : <span>Escolha uma data</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <div>
                <FormLabel>Itens da Fatura</FormLabel>
                <div className="space-y-2 mt-2">
                {fields.map((item, index) => (
                    <div key={item.id} className="flex items-end gap-2">
                        <FormField
                            control={form.control}
                            name={`items.${index}.itemId`}
                            render={({ field }) => (
                                <FormItem className="flex-grow">
                                    <Select onValueChange={(value) => handleItemSelect(value, index)} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um item do estoque"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {inventoryItems.map(invItem => (
                                                <SelectItem key={invItem.id} value={invItem.id}>{invItem.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl><Input type="number" placeholder="Qtd" className="w-20" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl><Input type="number" step="0.01" placeholder="Preço" className="w-24" {...field} readOnly /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                </div>
                 <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ itemId: "", description: "", quantity: 1, unitPrice: 0 })}>
                    Adicionar Item
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Desconto (R$)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Pendente">Pendente</SelectItem>
                                <SelectItem value="Pago">Pago</SelectItem>
                                <SelectItem value="Atrasado">Atrasado</SelectItem>
                                <SelectItem value="Cancelado">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Gerar Fatura"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
