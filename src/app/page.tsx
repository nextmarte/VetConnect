
'use client'
import { useAuth } from '@/context/auth-context';
import { redirect } from 'next/navigation';

export default function Home() {
    const { user, isLoading } = useAuth();
    
    if (isLoading) {
        return null; // or a loading spinner
    }

    if (user) {
        redirect('/dashboard');
    } else {
        redirect('/login');
    }

    return null;
}
