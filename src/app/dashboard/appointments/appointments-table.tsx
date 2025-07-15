
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

interface AppointmentsTableProps {
  appointments: (Appointment & { pet: Pet; client: Client })[];
}

export function AppointmentsTable({ appointments }: AppointmentsTableProps) {
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
              {format(new Date(appointment.date as string), "dd/MM/yyyy 'às' HH:mm")}
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
                  <DropdownMenuItem>Editar</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Cancelar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
