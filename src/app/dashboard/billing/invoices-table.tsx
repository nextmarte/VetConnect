
"use client"

import { MoreHorizontal, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import type { Invoice, Client } from "@/types"
import { format } from "date-fns"
import { InvoiceDetailsDialog } from "./invoice-details-dialog"
import { UpdateInvoiceStatusAlert } from "./update-invoice-status-alert"
import { useEffect, useState } from "react"

interface InvoicesTableProps {
  invoices: (Invoice & { client: Client })[];
}

function FormattedDate({ date }: { date: string | Date }) {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    setFormattedDate(format(new Date(date), "dd/MM/yyyy"));
  }, [date]);

  return <>{formattedDate || 'Carregando...'}</>;
}


export function InvoicesTable({ invoices }: InvoicesTableProps) {
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

  const isActionDisabled = (status: string) => status === 'Pago' || status === 'Cancelado';

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fatura / Cliente</TableHead>
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
          <InvoiceDetailsDialog key={invoice.id} invoice={invoice}>
            <TableRow className="cursor-pointer">
              <TableCell className="font-medium">
                <div className="font-semibold">#{invoice.id.substring(0, 6).toUpperCase()}</div>
                <div className="text-sm text-muted-foreground">{invoice.client.name}</div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                  <FormattedDate date={invoice.issueDate as string} />
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                  <FormattedDate date={invoice.dueDate as string} />
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(invoice.total)}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
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
                    <DropdownMenuSeparator />
                    <UpdateInvoiceStatusAlert
                      invoiceId={invoice.id}
                      newStatus="Pago"
                      disabled={isActionDisabled(invoice.status)}
                      triggerText="Marcar como Paga"
                      alertTitle="Marcar fatura como paga?"
                      alertDescription="Esta ação não pode ser desfeita e irá confirmar o recebimento do valor total da fatura."
                      confirmText="Sim, marcar como paga"
                    >
                       <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          disabled={isActionDisabled(invoice.status)}
                          className="flex items-center gap-2"
                        >
                         <CheckCircle className="h-4 w-4" /> Marcar como Paga
                        </DropdownMenuItem>
                    </UpdateInvoiceStatusAlert>
                    <UpdateInvoiceStatusAlert
                      invoiceId={invoice.id}
                      newStatus="Cancelado"
                      disabled={isActionDisabled(invoice.status)}
                      triggerText="Cancelar Fatura"
                      alertTitle="Cancelar esta fatura?"
                      alertDescription="Esta ação não pode ser desfeita. A fatura será marcada como cancelada e não será mais válida para pagamento. Essa ação não reverte o estoque."
                      confirmText="Sim, cancelar fatura"
                    >
                      <DropdownMenuItem
                        className="text-destructive flex items-center gap-2"
                        onSelect={(e) => e.preventDefault()}
                        disabled={isActionDisabled(invoice.status)}
                      >
                        <XCircle className="h-4 w-4" /> Cancelar
                      </DropdownMenuItem>
                    </UpdateInvoiceStatusAlert>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </InvoiceDetailsDialog>
        ))}
      </TableBody>
    </Table>
  )
}
