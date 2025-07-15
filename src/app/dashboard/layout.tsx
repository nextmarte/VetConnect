'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  Home,
  Users,
  CalendarDays,
  ClipboardList,
  Boxes,
  CreditCard,
  Menu,
  Dog,
  FlaskConical,
} from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

function NavLink({ href, icon: Icon, children }: { href: string, icon: React.ElementType, children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && "bg-accent text-accent-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/appointments", label: "Agendamentos", icon: CalendarDays },
    { href: "/dashboard/clients", label: "Clientes", icon: Users },
    { href: "/dashboard/records", label: "Prontuários", icon: ClipboardList },
    { href: "/dashboard/exams", label: "Exames", icon: FlaskConical },
    { href: "/dashboard/inventory", label: "Estoque", icon: Boxes },
    { href: "/dashboard/billing", label: "Faturamento", icon: CreditCard },
  ];

  const SidebarNav = () => (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navLinks.map(link => (
        <NavLink key={link.href} href={link.href} icon={link.icon}>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-background md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
              <Dog className="h-6 w-6" />
              <span className="">VetConnect</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <SidebarNav />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu de navegação</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
                <div className="flex h-14 items-center border-b px-4">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
                      <Dog className="h-6 w-6" />
                      <span className="">VetConnect</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                  <SidebarNav />
                </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Header Content can go here */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                 <Image
                  src={`https://placehold.co/36x36.png`}
                  width={36}
                  height={36}
                  alt="Avatar do usuário"
                  className="rounded-full"
                  data-ai-hint="user avatar"
                />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuItem>Suporte</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20">
            <div className="flex-1">
                {children}
            </div>
        </main>
      </div>
    </div>
  )
}
