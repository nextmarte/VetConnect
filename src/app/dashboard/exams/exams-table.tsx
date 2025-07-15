"use client"

import { MoreHorizontal, FileDown, Link as LinkIcon } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ExamResult, Pet, Client } from "@/types"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ExamsTableProps {
  examResults: (ExamResult & { pet: Pet; client: Client })[];
}

function FormattedDate({ date }: { date: string | Date }) {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    setFormattedDate(format(new Date(date), "dd/MM/yyyy"));
  }, [date]);

  return <>{formattedDate || 'Carregando...'}</>;
}


export function ExamsTable({ examResults }: ExamsTableProps) {
    return (
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Exame</TableHead>
                <TableHead>Pet</TableHead>
                <TableHead className="hidden md:table-cell">Tutor</TableHead>
                <TableHead className="hidden md:table-cell">Data do Resultado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {examResults.map((result) => (
                <TableRow key={result.id}>
                <TableCell className="font-medium">{result.examName}</TableCell>
                <TableCell className="text-muted-foreground">{result.pet.name}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{result.client.name}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                    <FormattedDate date={result.resultDate as string} />
                </TableCell>
                <TableCell className="text-right">
                    {result.attachmentUrl ? (
                        <Button asChild variant="outline" size="sm">
                           <Link href={result.attachmentUrl} target="_blank">
                                <LinkIcon className="h-3 w-3 mr-2" />
                                Ver Anexo
                           </Link>
                        </Button>
                    ) : (
                        <span className="text-xs text-muted-foreground">Sem anexo</span>
                    )}
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
    )
}
