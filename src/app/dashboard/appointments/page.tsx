import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getAppointments, getClientsWithPets } from "@/lib/firebase/firestore"
import { AddAppointmentDialog } from "./add-appointment-dialog"
import { AppointmentsTable } from "./appointments-table"
import { AIAssistant } from "./ai-assistant"

export default async function AppointmentsPage() {
    const appointments = await getAppointments();
    const clientsWithPets = await getClientsWithPets();

    return (
      <div className="space-y-4">
        <AIAssistant />
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
            <AppointmentsTable appointments={appointments} clients={clientsWithPets} />
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Mostrando <strong>1-{appointments.length}</strong> de <strong>{appointments.length}</strong>{" "}
              agendamentos
            </div>
          </CardFooter>
        </Card>
      </div>
    )
}
