"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, User, CornerDownLeft, Loader2, Sparkles } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { appointmentAgent } from "@/ai/flows/appointment-agent"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])


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
    <div className="fixed bottom-6 right-6 z-50">
       <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
           <Button
            size="icon"
            className="rounded-full w-14 h-14 shadow-lg"
          >
            <Sparkles className="h-6 w-6" />
            <span className="sr-only">Abrir Assistente de IA</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-96 p-0 border-0" sideOffset={10}>
          <div className="flex flex-col h-[60vh] bg-card rounded-lg shadow-xl border">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Bot className="h-5 w-5"/> Assistente de Agendamento</h3>
              <p className="text-sm text-muted-foreground">
                Use linguagem natural para agendar ou verificar horários.
              </p>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                 {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
                    <Bot className="h-8 w-8 mb-2" />
                    <span>Como posso ajudar hoje?</span>
                    <span className="text-xs mt-2">Ex: "Verifique a agenda de amanhã" ou "Marque uma consulta para o Rex na sexta às 15h".</span>
                  </div>
                )}
                {messages.map((message, index) => (
                  <div key={index} className={cn("flex items-start gap-3 my-2 text-sm", message.role === "user" ? "justify-end" : "justify-start")}>
                    {message.role === "assistant" && <Bot className="h-5 w-5 text-primary flex-shrink-0" />}
                    <div className={cn("rounded-lg px-3 py-2 max-w-[85%]", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                      <p>{message.content}</p>
                    </div>
                    {message.role === "user" && <User className="h-5 w-5 flex-shrink-0" />}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3 my-2">
                    <Bot className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="rounded-lg px-3 py-2 bg-muted flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua solicitação..."
                  disabled={isLoading}
                  autoFocus
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  <CornerDownLeft className="h-4 w-4" />
                  <span className="sr-only">Enviar</span>
                </Button>
              </form>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
