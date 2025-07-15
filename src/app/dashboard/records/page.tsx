import Image from "next/image"
import {
  File,
  ListFilter,
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
  DropdownMenuCheckboxItem,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { getRecords, getClientsWithPets } from "@/lib/firebase/firestore"
import { format } from "date-fns"
import { AddRecordDialog } from "./add-record-dialog"

export default async function RecordsPage() {
    const records = await getRecords();
    const clientsWithPets = await getClientsWithPets();
    const recordsCount = records.length;

    return (
      <main className="grid flex-1 items-start gap-4 sm:py-0 md:gap-8">
        <Tabs defaultValue="all">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="dog">Cães</TabsTrigger>
              <TabsTrigger value="cat">Gatos</TabsTrigger>
              <TabsTrigger value="other" className="hidden sm:flex">
                Outros
              </TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Filtro
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>
                    Ativo
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Arquivado</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Exportar
                </span>
              </Button>
              <AddRecordDialog clients={clientsWithPets} />
            </div>
          </div>
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Prontuários Eletrônicos</CardTitle>
                <CardDescription>
                  Gerencie os prontuários eletrônicos de seus pacientes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden w-[100px] sm:table-cell">
                        <span className="sr-only">Imagem</span>
                      </TableHead>
                      <TableHead>Nome do Animal</TableHead>
                      <TableHead>Espécie</TableHead>
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
                      <TableRow key={record.id}>
                        <TableCell className="hidden sm:table-cell">
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
                        <TableCell className="hidden md:table-cell">{record.client.name}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {format(record.date.toDate(), "dd/MM/yyyy")}
                        </TableCell>
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
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Arquivar
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
                  Mostrando <strong>1-{recordsCount}</strong> de <strong>{recordsCount}</strong>{" "}
                  prontuários
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    )
}
