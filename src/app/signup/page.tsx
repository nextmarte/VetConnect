
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dog } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { signup } from '@/lib/firebase/auth'

const signupSchema = z.object({
    name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
    email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
    password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
    })

    const onSubmit = async (data: SignupFormValues) => {
        setIsLoading(true);
        try {
            await signup(data.email, data.password, data.name);
            toast({
                title: 'Conta criada com sucesso!',
                description: 'Você será redirecionado para o dashboard.',
            });
            router.push('/dashboard');
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Erro ao criar conta',
                description: 'Este e-mail já pode estar em uso. Tente outro.',
            });
        } finally {
            setIsLoading(false);
        }
    };


  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Card className="mx-auto max-w-sm w-full">
            <CardHeader>
                <div className="flex items-center justify-center mb-4">
                    <Dog className="h-8 w-8 mr-2 text-primary" />
                    <CardTitle className="text-2xl">VetConnect</CardTitle>
                </div>
                <CardDescription>Crie sua conta para gerenciar sua clínica</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                     <div className="grid gap-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input id="name" placeholder="Seu Nome" {...register('name')} disabled={isLoading} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        {...register('email')}
                        disabled={isLoading}
                        />
                        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input id="password" type="password" {...register('password')} disabled={isLoading} />
                        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Criando conta...' : 'Criar uma conta'}
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Já tem uma conta?{' '}
                    <Link href="/login" className="underline">
                        Login
                    </Link>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
