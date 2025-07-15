
"use client"

import type { Appointment, Client, Pet } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Dog, ClipboardList, Info } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface AppointmentDetailsDialogProps {
  appointment: Appointment & { pet: Pet; client: Client };
  children: React.ReactNode;
}

export function AppointmentDetailsDialog({ appointment, children }: AppointmentDetailsDialogProps) {
  
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Concluído':
            return 'default';
        case 'Agendado':
            return 'secondary';
        case 'Cancelado':
            return 'destructive';
        default:
            return 'outline';
    }
  }

  return (
    <Dialog>
      {children}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
          <DialogDescription>
            Informações detalhadas sobre o agendamento.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="text-sm text-muted-foreground col-span-1 flex items-center"><User className="h-4 w-4 mr-2" /> Tutor</p>
            <p className="col-span-3 font-medium">{appointment.client.name}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="text-sm text-muted-foreground col-span-1 flex items-center"><Dog className="h-4 w-4 mr-2" /> Pet</p>
            <p className="col-span-3 font-medium">{appointment.pet.name}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="text-sm text-muted-foreground col-span-1 flex items-center"><Calendar className="h-4 w-4 mr-2" /> Data</p>
            <p className="col-span-3 font-medium">{format(new Date(appointment.date as string), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="text-sm text-muted-foreground col-span-1 flex items-center"><ClipboardList className="h-4 w-4 mr-2" /> Tipo</p>
            <p className="col-span-3 font-medium">{appointment.type}</p>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <p className="text-sm text-muted-foreground col-span-1 flex items-center"><Info className="h-4 w-4 mr-2" /> Status</p>
            <div className="col-span-3">
                 <Badge variant={getStatusVariant(appointment.status)}>{appointment.status}</Badge>
            </div>
          </div>
          {appointment.notes && (
            <div className="grid grid-cols-4 items-start gap-4">
              <p className="text-sm text-muted-foreground col-span-1 flex items-center mt-1"><Info className="h-4 w-4 mr-2" /> Observações</p>
              <p className="col-span-3 text-sm">{appointment.notes}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          {/* O DialogTrigger agora está na tabela, não precisa de botão aqui, mas o DialogClose é útil */}
            <Button type="button" variant="secondary" onClick={() => (document.querySelector('[data-radix-dialog-open=true] [data-radix-dialog-close=true]') as HTMLElement)?.click()}>
              Fechar
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
