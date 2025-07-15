"use client"

import type { MedicalRecord, Client, Pet } from "@/types"
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
import { User, Dog, Calendar, Stethoscope, Pill, Microscope, FileText } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface RecordDetailsDialogProps {
  record: MedicalRecord & { pet: Pet; client: Client };
  children: React.ReactNode;
}

export function RecordDetailsDialog({ record, children }: RecordDetailsDialogProps) {

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Prontuário</DialogTitle>
          <DialogDescription>
            Prontuário de {record.pet.name}, tutor(a) {record.client.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2"><Dog className="h-4 w-4" /> Pet</h3>
                    <p className="text-sm text-muted-foreground"><strong>Nome:</strong> {record.pet.name}</p>
                    <p className="text-sm text-muted-foreground"><strong>Espécie:</strong> {record.pet.species}</p>
                    <p className="text-sm text-muted-foreground"><strong>Raça:</strong> {record.pet.breed}</p>
                 </div>
                 <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2"><User className="h-4 w-4" /> Tutor</h3>
                    <p className="text-sm text-muted-foreground"><strong>Nome:</strong> {record.client.name}</p>
                    <p className="text-sm text-muted-foreground"><strong>Contato:</strong> {record.client.phone}</p>
                 </div>
            </div>
            <Separator />
             <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2"><Calendar className="h-4 w-4" /> Informações da Consulta</h3>
                <p className="text-sm text-muted-foreground"><strong>Data:</strong> {format(new Date(record.date as string), "dd/MM/yyyy", { locale: ptBR })}</p>
                <p className="text-sm text-muted-foreground"><strong>Veterinário(a):</strong> Dr. House</p>
             </div>
             <Separator />
             <div className="grid gap-4">
                <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2"><Stethoscope className="h-4 w-4" /> Sintomas</h4>
                    <p className="text-sm text-muted-foreground bg-accent/30 p-3 rounded-md">{record.symptoms}</p>
                </div>
                 <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2"><Microscope className="h-4 w-4" /> Diagnóstico</h4>
                    <p className="text-sm text-muted-foreground bg-accent/30 p-3 rounded-md">{record.diagnosis}</p>
                </div>
                 <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2"><Pill className="h-4 w-4" /> Tratamento</h4>
                    <p className="text-sm text-muted-foreground bg-accent/30 p-3 rounded-md">{record.treatment}</p>
                </div>
                {record.notes && (
                    <div>
                        <h4 className="font-medium flex items-center gap-2 mb-2"><FileText className="h-4 w-4" /> Observações</h4>
                        <p className="text-sm text-muted-foreground bg-accent/30 p-3 rounded-md">{record.notes}</p>
                    </div>
                )}
             </div>
        </div>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button type="button" variant="secondary">
              Fechar
            </Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
