import {
  File,
  ListFilter,
} from "lucide-react"

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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { getRecords, getClientsWithPets } from "@/lib/firebase/firestore"
import { AddRecordDialog } from "./add-record-dialog"
import { RecordsTable } from "./records-table"

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
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="archived">Arquivados</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              <AddRecordDialog clients={clientsWithPets} />
            </div>
          </div>
          <TabsContent value="all">
             <Card>
              <CardHeader>
                <CardTitle>Todos os Prontuários</CardTitle>
                <CardDescription>
                  Visualize e gerencie todos os prontuários.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecordsTable records={records} clients={clientsWithPets} />
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Mostrando <strong>{records.length}</strong> de <strong>{recordsCount}</strong>{" "}
                  prontuários
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
           <TabsContent value="active">
             <Card>
              <CardHeader>
                <CardTitle>Prontuários Ativos</CardTitle>
                <CardDescription>
                  Visualize e gerencie prontuários ativos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecordsTable records={records.filter(r => r.status === 'Ativo')} clients={clientsWithPets} />
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Mostrando <strong>{records.filter(r => r.status === 'Ativo').length}</strong> de <strong>{recordsCount}</strong>{" "}
                  prontuários
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
           <TabsContent value="archived">
             <Card>
              <CardHeader>
                <CardTitle>Prontuários Arquivados</CardTitle>
                <CardDescription>
                  Visualize prontuários arquivados.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecordsTable records={records.filter(r => r.status === 'Arquivado')} clients={clientsWithPets} />
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Mostrando <strong>{records.filter(r => r.status === 'Arquivado').length}</strong> de <strong>{recordsCount}</strong>{" "}
                  prontuários
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    )
}
