"use client"

import {
  MoreHorizontal,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { AppointmentDetailsDialog } from "./appointment-details-dialog"
import type { Appointment, Client, Pet } from "@/types"
import { useEffect, useState } from "react"
import { EditAppointmentDialog } from "./edit-appointment-dialog"
import { CancelAppointmentAlert } from "./cancel-appointment-alert"

interface AppointmentsTableProps {
  appointments: (Appointment & { pet: Pet; client: Client })[];
  clients: (Client & { pets: Pet[] })[];
}

function FormattedDate({ date }: { date: string | Date }) {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    setFormattedDate(format(new Date(date), "dd/MM/yyyy 'às' HH:mm"));
  }, [date]);

  return <>{formattedDate || 'Carregando...'}</>;
}

export function AppointmentsTable({ appointments, clients }: AppointmentsTableProps) {
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
  const isActionDisabled = (status: string) => status === 'Cancelado' || status === 'Concluído';


  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pet</TableHead>
          <TableHead className="hidden md:table-cell">Tutor</TableHead>
          <TableHead className="hidden md:table-cell">Data</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <span className="sr-only">Ações</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment) => (
          <TableRow key={appointment.id}>
            <TableCell className="font-medium">{appointment.pet.name}</TableCell>
            <TableCell className="hidden md:table-cell text-muted-foreground">{appointment.client.name}</TableCell>
            <TableCell className="hidden md:table-cell text-muted-foreground">
              <FormattedDate date={appointment.date as string} />
            </TableCell>
            <TableCell>{appointment.type}</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(appointment.status)}>{appointment.status}</Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-haspopup="true"
                    size="icon"
                    variant="ghost"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <AppointmentDetailsDialog appointment={appointment}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Ver Detalhes
                    </DropdownMenuItem>
                  </AppointmentDetailsDialog>
                  <EditAppointmentDialog
                    appointment={appointment}
                    clients={clients}
                    disabled={isActionDisabled(appointment.status)}
                  >
                     <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        disabled={isActionDisabled(appointment.status)}
                      >
                        Editar
                      </DropdownMenuItem>
                  </EditAppointmentDialog>
                  <CancelAppointmentAlert
                    appointmentId={appointment.id}
                    disabled={isActionDisabled(appointment.status)}
                  >
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={(e) => e.preventDefault()}
                      disabled={isActionDisabled(appointment.status)}
                    >
                      Cancelar
                    </DropdownMenuItem>
                  </CancelAppointmentAlert>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
