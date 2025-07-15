import {
  Activity,
  Box,
  Calendar,
  CreditCard,
  Users,
} from "lucide-react"
import Image from "next/image"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getClients, getRecords, getInvoices, getAppointments, getInventoryItems } from "@/lib/firebase/firestore"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function Dashboard() {
  const clients = await getClients()
  const records = await getRecords()
  const invoices = await getInvoices()
  const allAppointments = await getAppointments()
  const inventoryItems = await getInventoryItems()

  const totalRevenue = invoices
    .filter(inv => inv.status === 'Pago')
    .reduce((sum, inv) => sum + inv.total, 0)
    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const appointmentsToday = allAppointments.filter(appt => {
    const apptDate = new Date(appt.date as string);
    return apptDate >= today && apptDate <= endOfToday;
  });

  const lowStockItemsCount = inventoryItems.filter(
    item => item.quantity <= item.minStockLevel
  ).length;

  const recentActivity = records.slice(0, 5);
  
  const upcomingAppointments = allAppointments
    .filter(appt => new Date(appt.date as string) >= new Date() && appt.status === 'Agendado')
    .sort((a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime())
    .slice(0, 5);


  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento (Pago)</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              Total de faturas pagas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              Total de clientes cadastrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentsToday.length}</div>
             <p className="text-xs text-muted-foreground">
              Agendamentos para hoje
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItemsCount}</div>
            <p className="text-xs text-muted-foreground">
              Itens precisando de reposição
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Próximos Agendamentos</CardTitle>
              <CardDescription>
                Consultas e procedimentos agendados para os próximos dias.
              </CardDescription>
            </div>
             <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/appointments">
                Ver Todos
                <Activity className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
             {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map(appt => (
                    <div key={appt.id} className="flex items-center gap-4">
                       <Image
                        alt={`Foto de ${appt.pet.name}`}
                        className="aspect-square rounded-full object-cover"
                        height="48"
                        src={appt.pet.photoUrl || 'https://placehold.co/48x48.png'}
                        width="48"
                        data-ai-hint={`${appt.pet.breed} ${appt.pet.species}`}
                      />
                      <div className="grid gap-1 text-sm flex-1">
                        <p className="font-semibold">{appt.pet.name} <span className="font-normal text-muted-foreground">({appt.client.name})</span></p>
                        <p className="text-muted-foreground">{format(new Date(appt.date as string), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                      </div>
                      <Badge variant="outline">{appt.type}</Badge>
                    </div>
                  ))}
                </div>
             ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum agendamento próximo.</p>
             )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Novos prontuários e consultas realizadas.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {recentActivity.length > 0 ? (
                recentActivity.map(record => (
                    <div className="flex items-center gap-4" key={record.id}>
                        <div className="grid gap-1">
                            <p className="text-sm font-medium leading-none">
                                {record.pet.name} ({record.client.name})
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {record.diagnosis} - {format(new Date(record.date as string), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground">Nenhuma atividade recente.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
