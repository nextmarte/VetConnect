import { Button } from "@/components/ui/button";

export default function InventoryPage() {
  return (
    <div className="flex h-[calc(100vh-10rem)] w-full flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-2xl font-bold tracking-tight">
          Controle de Estoque
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Funcionalidade de estoque em desenvolvimento.
        </p>
        <Button>Adicionar Item</Button>
      </div>
    </div>
  );
}
