
"use client"

import { useState } from "react"
import type { Client, Pet } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, Home, Dog, Cat, Bird, PlusCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { format } from "date-fns"
import { AddPetDialog } from "../pets/add-pet-dialog"

interface ClientDetailsDialogProps {
  client: Client & { pets: Pet[] };
  children: React.ReactNode;
}

export function ClientDetailsDialog({ client, children }: ClientDetailsDialogProps) {
  const [open, setOpen] = useState(false)

  const getPetIcon = (species: string) => {
    switch (species) {
      case 'Cachorro': return <Dog className="h-5 w-5 text-muted-foreground" />;
      case 'Gato': return <Cat className="h-5 w-5 text-muted-foreground" />;
      default: return <Bird className="h-5 w-5 text-muted-foreground" />;
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente</DialogTitle>
          <DialogDescription>
            Informações detalhadas sobre o cliente e seus pets.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2"><User className="h-4 w-4" /> Informações Pessoais</h3>
                <div className="text-sm text-muted-foreground">
                    <p><strong>Nome:</strong> {client.name}</p>
                    <p><strong>Email:</strong> {client.email}</p>
                    <p><strong>Telefone:</strong> {client.phone}</p>
                    <p><strong>Endereço:</strong> {client.address}</p>
                </div>
            </div>
          </div>
          <Separator />
          <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Pets Cadastrados ({client.pets.length})</h3>
                <AddPetDialog clientId={client.id}>
                    <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                        <PlusCircle className="h-4 w-4 mr-2"/>
                        Adicionar Pet
                    </Button>
                </AddPetDialog>
            </div>
            {client.pets.length > 0 ? (
              <div className="space-y-4">
                {client.pets.map(pet => (
                  <div key={pet.id} className="flex items-center gap-4 p-3 rounded-lg border">
                     <Image
                        alt={`Foto de ${pet.name}`}
                        className="aspect-square rounded-full object-cover"
                        height="64"
                        src={pet.photoUrl || 'https://placehold.co/64x64.png'}
                        width="64"
                        data-ai-hint={`${pet.breed} ${pet.species}`}
                      />
                    <div className="grid gap-1 text-sm flex-1">
                      <p className="font-semibold">{pet.name}</p>
                      <p className="text-muted-foreground">{pet.breed}</p>
                      <p className="text-muted-foreground">Nascimento: {format(new Date(pet.birthDate as string), 'dd/MM/yyyy')}</p>
                    </div>
                     <Badge variant="outline" className="flex items-center gap-1">
                        {getPetIcon(pet.species)}
                        {pet.species}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum pet cadastrado para este cliente.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
