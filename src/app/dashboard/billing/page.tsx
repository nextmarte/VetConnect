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
  import { getInvoices, getClients, getInventoryItems } from "@/lib/firebase/firestore"
  import { format } from "date-fns"
import { AddInvoiceDialog } from "./add-invoice-dialog"
  
  export default async function BillingPage() {
      const invoices = await getInvoices();
      const clients = await getClients();
      const inventoryItems = await getInventoryItems();
  
      const formatCurrency = (value: number) => {
          return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
      }
  
      const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
          switch (status) {
              case 'Pago':
                  return 'default';
              case 'Pendente':
                  return 'secondary';
              case 'Atrasado':
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
                <CardTitle>Faturamento</CardTitle>
                <CardDescription>
                  Gerencie as faturas e pagamentos.
                </CardDescription>
              </div>
              <AddInvoiceDialog clients={clients} inventoryItems={inventoryItems} />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Emissão</TableHead>
                  <TableHead className="hidden md:table-cell">Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.client.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                        {format(new Date(invoice.issueDate as string), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                        {format(new Date(invoice.dueDate as string), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.total)}</TableCell>
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
                          <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Marcar como Paga</DropdownMenuItem>
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
              Mostrando <strong>1-{invoices.length}</strong> de <strong>{invoices.length}</strong>{" "}
              faturas
            </div>
          </CardFooter>
        </Card>
      )
  }
