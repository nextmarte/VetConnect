"use client"

import { MoreHorizontal } from "lucide-react"

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
import type { InventoryItem } from "@/types"
import { EditItemDialog } from "./edit-item-dialog"
import { DeleteItemAlert } from "./delete-item-alert"

interface InventoryTableProps {
  inventoryItems: InventoryItem[];
}

export function InventoryTable({ inventoryItems }: InventoryTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead className="hidden md:table-cell">Quantidade</TableHead>
          <TableHead className="hidden md:table-cell">Estoque Mínimo</TableHead>
          <TableHead>Preço (R$)</TableHead>
          <TableHead>
            <span className="sr-only">Ações</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inventoryItems.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell className="hidden md:table-cell text-muted-foreground">
              <Badge variant={item.quantity <= item.minStockLevel ? 'destructive' : 'outline'}>
                {item.quantity}
              </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell text-muted-foreground">{item.minStockLevel}</TableCell>
            <TableCell>{formatCurrency(item.price)}</TableCell>
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
                  <EditItemDialog item={item}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Editar
                    </DropdownMenuItem>
                  </EditItemDialog>
                  <DeleteItemAlert itemId={item.id}>
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      Excluir
                    </DropdownMenuItem>
                  </DeleteItemAlert>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
