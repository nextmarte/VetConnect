import {
    MoreHorizontal,
  } from "lucide-react"
  
  import { Badge } from "@/components/ui/badge"
  import { Button } from "@/components/ui/button"
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
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
  import { getAppointments, getClientsWithPets } from "@/lib/firebase/firestore"
  import { format } from "date-fns"
  import { AddAppointmentDialog } from "./add-appointment-dialog"
  import { AppointmentDetailsDialog } from "./appointment-details-dialog"
  
  export default async function AppointmentsPage() {
      const appointments = await getAppointments();
      const clientsWithPets = await getClientsWithPets();

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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Agendamentos</CardTitle>
                <CardDescription>
                  Gerencie os agendamentos de consultas e procedimentos.
                </CardDescription>
              </div>
              <AddAppointmentDialog clients={clientsWithPets} />
            </div>
          </CardHeader>
          <CardContent>
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
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Mostrando <strong>1-{appointments.length}</strong> de <strong>{appointments.length}</strong>{" "}
              agendamentos
            </div>
          </CardFooter>
        </Card>
      )
  }
