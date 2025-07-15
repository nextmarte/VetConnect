import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getExamResults } from "@/lib/firebase/firestore"
import { ExamsTable } from "./exams-table"

export default async function ExamsPage() {
    const examResults = await getExamResults();

    return (
      <Card>
        <CardHeader>
          <CardTitle>Resultados de Exames</CardTitle>
          <CardDescription>
            Consulte todos os resultados de exames dos pets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExamsTable examResults={examResults} />
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Mostrando <strong>{examResults.length}</strong> de <strong>{examResults.length}</strong>{" "}
            resultados
          </div>
        </CardFooter>
      </Card>
    )
}
