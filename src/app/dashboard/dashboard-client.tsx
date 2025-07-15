
"use client"

import { useState, useEffect } from "react"
import { format, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import Image from "next/image"
import Link from "next/link"
import { Box, Calendar as CalendarIcon, CreditCard, Users, Activity, Clock } from "lucide-react"

import type { Appointment, Client, Pet } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface DashboardClientProps {
  stats: {
    totalRevenue: number
    clientsCount: number
    appointmentsTodayCount: number
    lowStockItemsCount: number
  }
  appointments: (Appointment & { pet: Pet; client: Client })[]
}

// Componente para formatar a hora do lado do cliente e evitar erro de hidratação
function ClientFormattedTime({ date }: { date: string | Date }) {
    const [formattedTime, setFormattedTime] = useState('');

    useEffect(() => {
        setFormattedTime(format(new Date(date), "HH:mm", { locale: ptBR }));
    }, [date]);

    if (!formattedTime) {
        return <span className="text-muted-foreground">--:--</span>;
    }

    return <>{formattedTime}h</>;
}


export function DashboardClient({ stats, appointments }: DashboardClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const appointmentsOnSelectedDate = appointments.filter(appt =>
    isSameDay(new Date(appt.date as string), selectedDate)
  ).sort((a,b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime())

  const appointmentDays = appointments.map(appt => new Date(appt.date as string))

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento (Pago)</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            <p className="text-xs text-muted-foreground">Total de faturas pagas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.clientsCount}</div>
            <p className="text-xs text-muted-foreground">Total de clientes cadastrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointmentsTodayCount}</div>
            <p className="text-xs text-muted-foreground">Agendamentos para hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockItemsCount}</div>
            <p className="text-xs text-muted-foreground">Itens precisando de reposição</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>Calendário de Agendamentos</CardTitle>
                <CardDescription>Selecione um dia para ver os detalhes.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date || new Date())}
                    className="p-0"
                    locale={ptBR}
                    modifiers={{
                        hasAppointment: appointmentDays,
                    }}
                    modifiersStyles={{
                        hasAppointment: {
                            border: '2px solid hsl(var(--primary))',
                            borderRadius: 'var(--radius)',
                        },
                    }}
                    disabled={(date) => date < new Date('2020-01-01')}
                />
            </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>
                        Agenda para {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </CardTitle>
                    <CardDescription>
                       {appointmentsOnSelectedDate.length} agendamento(s) encontrado(s).
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
                {appointmentsOnSelectedDate.length > 0 ? (
                    <div className="space-y-4">
                        {appointmentsOnSelectedDate.map(appt => (
                            <div key={appt.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
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
                                    <p className="text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3"/>
                                        <ClientFormattedTime date={appt.date as string} />
                                    </p>
                                </div>
                                <Badge variant="outline">{appt.type}</Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum agendamento</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Não há agendamentos para a data selecionada.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </>
  )
}
