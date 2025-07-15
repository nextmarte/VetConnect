import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { getInventoryItems } from "@/lib/firebase/firestore"
import { AddItemDialog } from "./add-item-dialog"
import { InventoryTable } from "./inventory-table"
  
  export default async function InventoryPage() {
      const inventoryItems = await getInventoryItems();
  
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Estoque</CardTitle>
                <CardDescription>
                  Gerencie os itens do seu estoque.
                </CardDescription>
              </div>
              <AddItemDialog />
            </div>
          </CardHeader>
          <CardContent>
            <InventoryTable inventoryItems={inventoryItems} />
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Mostrando <strong>1-{inventoryItems.length}</strong> de <strong>{inventoryItems.length}</strong>{" "}
              itens
            </div>
          </CardFooter>
        </Card>
      )
  }
