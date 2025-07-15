"use client"

import { useState } from "react"
import { Bot, User, CornerDownLeft, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { appointmentAgent } from "@/ai/flows/appointment-agent"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await appointmentAgent(input)
      const assistantMessage: Message = { role: "assistant", content: response }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error calling AI agent:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "Desculpe, não consegui processar sua solicitação. Tente novamente.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assistente de Agendamento</CardTitle>
        <CardDescription>
          Use linguagem natural para agendar, reagendar ou verificar horários.
          Ex: "Agende uma consulta para o Rex amanhã às 15h".
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-48 overflow-y-auto p-4 border rounded-md bg-muted/50">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <Bot className="mr-2" />
                <span>Como posso ajudar hoje?</span>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 my-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && <Bot className="h-6 w-6 text-primary" />}
                <div className={`rounded-lg px-3 py-2 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="text-sm">{message.content}</p>
                </div>
                 {message.role === 'user' && <User className="h-6 w-6" />}
              </div>
            ))}
             {isLoading && (
              <div className="flex items-start gap-3 my-2">
                <Bot className="h-6 w-6 text-primary" />
                <div className="rounded-lg px-3 py-2 bg-muted flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua solicitação..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <CornerDownLeft className="h-4 w-4" />
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
