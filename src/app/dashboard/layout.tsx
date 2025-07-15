
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Users,
  CalendarDays,
  ClipboardList,
  Boxes,
  CreditCard,
  Menu,
  Dog,
  FlaskConical,
  LogOut,
  User as UserIcon,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from '@/context/auth-context'
import { logout } from '@/lib/firebase/auth'
import { useToast } from '@/hooks/use-toast'

function NavLink({ href, icon: Icon, children, isCollapsed }: { href: string, icon: React.ElementType, children: React.ReactNode, isCollapsed: boolean }) {
  const pathname = usePathname()
  const isActive = href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  const linkContent = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && "bg-accent text-accent-foreground",
        isCollapsed && "justify-center"
      )}
    >
      <Icon className="h-4 w-4" />
      <span className={cn("transition-opacity duration-300", isCollapsed ? "w-0 opacity-0" : "opacity-100")}>{children}</span>
    </Link>
  )

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right">
            {children}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return linkContent;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Logout realizado com sucesso!',
    });
    router.push('/login');
  };


  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/appointments", label: "Agendamentos", icon: CalendarDays },
    { href: "/dashboard/clients", label: "Clientes", icon: Users },
    { href: "/dashboard/records", label: "Prontuários", icon: ClipboardList },
    { href: "/dashboard/exams", label: "Exames", icon: FlaskConical },
    { href: "/dashboard/inventory", label: "Estoque", icon: Boxes },
    { href: "/dashboard/billing", label: "Faturamento", icon: CreditCard },
  ];

  const SidebarNav = ({ isCollapsed }: { isCollapsed: boolean }) => (
    <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
      {navLinks.map(link => (
        <NavLink key={link.href} href={link.href} icon={link.icon} isCollapsed={isCollapsed}>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className={cn(
      "grid min-h-screen w-full transition-[grid-template-columns] duration-300 ease-in-out",
      isCollapsed ? "md:grid-cols-[80px_1fr]" : "md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]"
    )}>
      <div className="hidden border-r bg-background md:block">
        <div className="flex h-full max-h-screen flex-col">
          <div className={cn(
              "flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6",
            )}>
             <Button 
              variant="ghost" 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className={cn(
                "flex items-center gap-2 font-semibold text-primary p-2 w-full", 
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              <Dog className="h-6 w-6 shrink-0" />
              <span className={cn("transition-opacity whitespace-nowrap", isCollapsed && "opacity-0 w-0")}>VetConnect</span>
              <span className="sr-only">Recolher/Expandir menu</span>
            </Button>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <SidebarNav isCollapsed={isCollapsed} />
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
            <SheetContent side="left" className="flex flex-col p-0 w-[280px]">
                <div className="flex h-14 items-center border-b px-4">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
                      <Dog className="h-6 w-6" />
                      <span className="">VetConnect</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                  <SidebarNav isCollapsed={false} />
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
              <DropdownMenuLabel>{user?.displayName || 'Minha Conta'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>Suporte</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20 relative">
          {children}
        </main>
      </div>
    </div>
  )
}
