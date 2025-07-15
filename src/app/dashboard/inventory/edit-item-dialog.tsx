"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

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
import { useToast } from "@/hooks/use-toast"
import { updateItemAction } from "./actions"
import type { InventoryItem } from "@/types"

const itemEditFormSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: "O nome do item deve ter pelo menos 2 caracteres." }),
  description: z.string().min(5, { message: "A descrição deve ter pelo menos 5 caracteres." }),
  quantity: z.coerce.number().int().min(0, { message: "A quantidade não pode ser negativa." }),
  minStockLevel: z.coerce.number().int().min(0, { message: "O estoque mínimo não pode ser negativo." }),
  supplier: z.string().min(2, { message: "O fornecedor deve ter pelo menos 2 caracteres." }),
  price: z.coerce.number().positive({ message: "O preço deve ser um número positivo." }),
})

type ItemFormValues = z.infer<typeof itemEditFormSchema>

interface EditItemDialogProps {
  item: InventoryItem;
  children: React.ReactNode;
}

export function EditItemDialog({ item, children }: EditItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemEditFormSchema),
    defaultValues: {
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      minStockLevel: item.minStockLevel,
      supplier: item.supplier,
      price: item.price,
    },
  })

  async function onSubmit(values: ItemFormValues) {
    setIsSubmitting(true)
    const result = await updateItemAction(values)
    setIsSubmitting(false)

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Item atualizado com sucesso.",
      })
      setOpen(false)
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: result.message || "Ocorreu um erro ao atualizar o item.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Editar Item do Estoque</DialogTitle>
          <DialogDescription>
            Atualize os dados do item abaixo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Item</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Vacina V10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Vacina polivalente para cães" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="Ex: 50" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="minStockLevel"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Estoque Mínimo</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="Ex: 10" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" placeholder="Ex: 75.50" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: PetMed" {...field} />
                    </FormControl>
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
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
