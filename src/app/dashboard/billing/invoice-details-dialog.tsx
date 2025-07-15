"use client"

import type { Invoice, Client } from "@/types"
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
import { User, Calendar, Hash, CreditCard, Percent, FileText } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface InvoiceDetailsDialogProps {
  invoice: Invoice & { client: Client };
  children: React.ReactNode;
}

export function InvoiceDetailsDialog({ invoice, children }: InvoiceDetailsDialogProps) {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Pago': return 'default';
        case 'Pendente': return 'secondary';
        case 'Atrasado': return 'destructive';
        default: return 'outline';
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Fatura #{invoice.id.substring(0, 6)}</DialogTitle>
          <DialogDescription>
            Detalhes completos da fatura para {invoice.client.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                    <h3 className="font-semibold flex items-center gap-2"><User className="h-4 w-4" /> Cliente</h3>
                    <p className="text-muted-foreground">{invoice.client.name}</p>
                    <p className="text-muted-foreground">{invoice.client.email}</p>
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" /> Datas</h3>
                    <p className="text-muted-foreground">Emissão: {format(new Date(invoice.issueDate as string), "dd/MM/yyyy", { locale: ptBR })}</p>
                    <p className="text-muted-foreground">Vencimento: {format(new Date(invoice.dueDate as string), "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
                 <div className="space-y-1">
                    <h3 className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> Status</h3>
                    <Badge variant={getStatusVariant(invoice.status)} className="w-fit">{invoice.status}</Badge>
                </div>
            </div>
            <Separator />
            <div>
                <h3 className="font-semibold mb-2">Itens da Fatura</h3>
                <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-center">Qtd.</TableHead>
                        <TableHead className="text-right">Preço Unit.</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoice.items.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </div>
            </div>
             <div className="flex justify-end">
                <div className="w-full max-w-sm space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(invoice.subtotal)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Desconto</span>
                        <span className="text-destructive">- {formatCurrency(invoice.discount)}</span>
                    </div>
                     <Separator />
                     <div className="flex justify-between font-semibold text-base">
                        <span>Total</span>
                        <span>{formatCurrency(invoice.total)}</span>
                    </div>
                </div>
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
