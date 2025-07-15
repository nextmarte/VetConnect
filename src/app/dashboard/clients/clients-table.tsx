
"use client"

import { MoreHorizontal } from "lucide-react"

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
import { ClientDetailsDialog } from "./client-details-dialog"
import type { Client, Pet } from "@/types"
import { EditClientDialog } from "./edit-client-dialog"
import { DeleteClientAlert } from "./delete-client-alert"

interface ClientsTableProps {
  clients: (Client & { pets: Pet[] })[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead className="hidden md:table-cell">E-mail</TableHead>
          <TableHead className="hidden md:table-cell">Telefone</TableHead>
          <TableHead>
            <span className="sr-only">Ações</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <ClientDetailsDialog key={client.id} client={client}>
            <TableRow className="cursor-pointer">
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">{client.email}</TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">{client.phone}</TableCell>
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
                    <EditClientDialog client={client}>
                       <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Editar
                        </DropdownMenuItem>
                    </EditClientDialog>
                    <DeleteClientAlert clientId={client.id}>
                      <DropdownMenuItem
                          className="text-destructive"
                          onSelect={(e) => e.preventDefault()}
                      >
                          Excluir
                      </DropdownMenuItem>
                    </DeleteClientAlert>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </ClientDetailsDialog>
        ))}
      </TableBody>
    </Table>
  )
}
