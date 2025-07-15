import {
  Activity,
  Box,
  Calendar,
  CreditCard,
  Syringe,
  Users,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getClients, getRecords } from "@/lib/firebase/firestore"
import { format } from "date-fns"

export default async function Dashboard() {
  const clients = await getClients()
  const records = await getRecords()

  // TODO: Replace with actual data fetching for billing, appointments and inventory
  const totalRevenue = "R$45.231,89"
  const revenueGrowth = "+20.1%"
  const appointmentsToday = "+12"
  const appointmentsGrowth = "+19%"
  const lowStockItems = "8"

  const recentActivity = records.slice(0, 5);
  // Assuming upcoming appointments would be fetched and filtered here
  const upcomingAppointments = [];


  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              {revenueGrowth} em relação ao mês passado
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
            <div className="text-2xl font-bold">{appointmentsToday}</div>
            <p className="text-xs text-muted-foreground">
              {appointmentsGrowth} em relação a ontem
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
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
          </CardHeader>
          <CardContent>
             {upcomingAppointments.length > 0 ? (
                <p>Lista de agendamentos aqui.</p>
             ) : (
                <p className="text-sm text-muted-foreground">Nenhum agendamento próximo.</p>
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
                                {record.diagnosis} - {format(record.date.toDate(), "dd/MM/yyyy")}
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
