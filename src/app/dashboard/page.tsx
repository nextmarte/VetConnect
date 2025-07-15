import { getAppointments, getClients, getInvoices, getInventoryItems } from "@/lib/firebase/firestore"
import { DashboardClient } from "./dashboard-client"

export default async function Dashboard() {
  // Fetch all data required for the dashboard on the server
  const clients = await getClients()
  const allAppointments = await getAppointments()
  const invoices = await getInvoices()
  const inventoryItems = await getInventoryItems()

  // Calculate stats on the server
  const totalRevenue = invoices
    .filter(inv => inv.status === 'Pago')
    .reduce((sum, inv) => sum + inv.total, 0);

  const lowStockItemsCount = inventoryItems.filter(
    item => item.quantity <= item.minStockLevel
  ).length;

  const stats = {
    totalRevenue,
    clientsCount: clients.length,
    appointmentsTodayCount: allAppointments.filter(appt => {
        const today = new Date();
        const apptDate = new Date(appt.date as string);
        return apptDate.getDate() === today.getDate() &&
               apptDate.getMonth() === today.getMonth() &&
               apptDate.getFullYear() === today.getFullYear();
    }).length,
    lowStockItemsCount,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      {/* Pass fetched data to the client component */}
      <DashboardClient stats={stats} appointments={allAppointments} />
    </div>
  )
}
