
"use client"

import Image from "next/image"
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
import type { MedicalRecord, Client, Pet } from "@/types"
import { format } from "date-fns"
import { RecordDetailsDialog } from "./record-details-dialog"
import { EditRecordDialog } from "./edit-record-dialog"
import { ArchiveRecordAlert } from "./archive-record-alert"
import { useEffect, useState } from "react"
import { DialogTrigger } from "@/components/ui/dialog"

interface RecordsTableProps {
  records: (MedicalRecord & { pet: Pet; client: Client })[];
  clients: (Client & { pets: Pet[] })[];
}

function FormattedDate({ date }: { date: string | Date }) {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    setFormattedDate(format(new Date(date), "dd/MM/yyyy"));
  }, [date]);

  return <>{formattedDate || 'Carregando...'}</>;
}


export function RecordsTable({ records, clients }: RecordsTableProps) {
    const isActionDisabled = (status: string) => status === 'Arquivado';

    return (
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Imagem</span>
                </TableHead>
                <TableHead>Nome do Animal</TableHead>
                <TableHead>Espécie</TableHead>
                 <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">
                Tutor
                </TableHead>
                <TableHead className="hidden md:table-cell">
                Última Consulta
                </TableHead>
                <TableHead>
                <span className="sr-only">Ações</span>
                </TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {records.map((record) => (
              <RecordDetailsDialog key={record.id} record={record}>
                <TableRow className="cursor-pointer">
                  <TableCell className="hidden sm:table-cell">
                      <DialogTrigger asChild>
                         <span className="w-full h-full absolute inset-0" />
                      </DialogTrigger>
                      {record.pet.photoUrl && (
                      <Image
                          alt={`Foto de ${record.pet.name}`}
                          className="aspect-square rounded-md object-cover"
                          height="64"
                          src={record.pet.photoUrl}
                          width="64"
                          data-ai-hint={`${record.pet.breed} ${record.pet.species}`}
                      />
                      )}
                  </TableCell>
                  <TableCell className="font-medium">{record.pet.name}</TableCell>
                  <TableCell>
                      <Badge variant="outline">{record.pet.species}</Badge>
                  </TableCell>
                  <TableCell>
                      <Badge variant={record.status === 'Arquivado' ? 'destructive' : 'secondary'}>{record.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{record.client.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                      <FormattedDate date={record.date as string} />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()} className="relative z-10">
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
                          <EditRecordDialog
                              record={record}
                              clients={clients}
                              disabled={isActionDisabled(record.status)}
                          >
                              <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  disabled={isActionDisabled(record.status)}
                              >
                                  Editar
                              </DropdownMenuItem>
                          </EditRecordDialog>
                          <ArchiveRecordAlert recordId={record.id} disabled={isActionDisabled(record.status)}>
                               <DropdownMenuItem
                                  className="text-destructive"
                                  onSelect={(e) => e.preventDefault()}
                                  disabled={isActionDisabled(record.status)}
                              >
                                  Arquivar
                              </DropdownMenuItem>
                          </ArchiveRecordAlert>
                      </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>
                </TableRow>
              </RecordDetailsDialog>
            ))}
            </TableBody>
        </Table>
    )
}
