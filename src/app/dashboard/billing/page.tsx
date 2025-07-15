import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getInvoices, getClients, getInventoryItems } from "@/lib/firebase/firestore"
import { AddInvoiceDialog } from "./add-invoice-dialog"
import { InvoicesTable } from "./invoices-table"

export default async function BillingPage() {
    const invoices = await getInvoices();
    const clients = await getClients();
    const inventoryItems = await getInventoryItems();

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Faturamento</CardTitle>
              <CardDescription>
                Gerencie as faturas e pagamentos.
              </CardDescription>
            </div>
            <AddInvoiceDialog clients={clients} inventoryItems={inventoryItems} />
          </div>
        </CardHeader>
        <CardContent>
          <InvoicesTable invoices={invoices} />
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Mostrando <strong>1-{invoices.length}</strong> de <strong>{invoices.length}</strong>{" "}
            faturas
          </div>
        </CardFooter>
      </Card>
    )
}
