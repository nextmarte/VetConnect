import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getClientsWithPets } from "@/lib/firebase/firestore"
import { AddClientDialog } from "./add-client-dialog"
import { ClientsTable } from "./clients-table"

export default async function ClientsPage() {
    const clients = await getClientsWithPets();

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Clientes</CardTitle>
              <CardDescription>
                Gerencie seus clientes e visualize seus perfis.
              </CardDescription>
            </div>
            <AddClientDialog />
          </div>
        </CardHeader>
        <CardContent>
          <ClientsTable clients={clients} />
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Mostrando <strong>1-{clients.length}</strong> de <strong>{clients.length}</strong>{" "}
            clientes
          </div>
        </CardFooter>
      </Card>
    )
}
