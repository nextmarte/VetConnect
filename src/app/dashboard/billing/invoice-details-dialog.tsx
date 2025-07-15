
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
import { User, Calendar, CreditCard, Percent, FileText, FileDown } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

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

  const generatePdf = () => {
    const doc = new jsPDF();
  
    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("VetConnect", 14, 22);
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text(`Fatura #${invoice.id.substring(0, 6).toUpperCase()}`, 14, 32);

    // Vet Clinic Info
    doc.setFontSize(10);
    doc.text("Rua da Clínica, 123", 14, 40)
    doc.text("clinicavet@vetconnect.com", 14, 45)
    doc.text("+55 (11) 5555-4444", 14, 50)


    // Client Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Cliente:", 120, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(invoice.client.name, 120, 45);
    doc.text(invoice.client.email, 120, 50);
    doc.text(invoice.client.address, 120, 55);

    // Invoice Dates and Status
    doc.setFontSize(10);
    doc.text(`Data de Emissão: ${format(new Date(invoice.issueDate as string), "dd/MM/yyyy", { locale: ptBR })}`, 14, 65);
    doc.text(`Data de Vencimento: ${format(new Date(invoice.dueDate as string), "dd/MM/yyyy", { locale: ptBR })}`, 14, 70);
    doc.text(`Status: ${invoice.status}`, 14, 75);
    
  
    // Items table
    autoTable(doc, {
      startY: 85,
      head: [['Descrição', 'Qtd.', 'Preço Unit.', 'Total']],
      body: invoice.items.map(item => [
        item.description,
        item.quantity,
        formatCurrency(item.unitPrice),
        formatCurrency(item.total),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [38, 86, 136] }, // VetConnect primary color
      didDrawPage: (data) => {
        // Footer
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(`Página ${data.pageNumber} de ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });
  
    // Totals
    const finalY = (doc as any).lastAutoTable.finalY;
    const rightAlignX = doc.internal.pageSize.width - 14;
    doc.setFontSize(10);

    doc.text("Subtotal:", 150, finalY + 10, { align: "right" });
    doc.text(formatCurrency(invoice.subtotal), rightAlignX, finalY + 10, { align: "right" });

    doc.text("Desconto:", 150, finalY + 15, { align: "right" });
    doc.setTextColor(220, 53, 69); // Destructive color
    doc.text(`- ${formatCurrency(invoice.discount)}`, rightAlignX, finalY + 15, { align: "right" });
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Total:", 150, finalY + 25, { align: "right" });
    doc.text(formatCurrency(invoice.total), rightAlignX, finalY + 25, { align: "right" });
  
    doc.save(`fatura-${invoice.id.substring(0, 6)}.pdf`);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Fatura #{invoice.id.substring(0, 6).toUpperCase()}</DialogTitle>
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
            <Button type="button" variant="outline" onClick={generatePdf}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar PDF
            </Button>
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
