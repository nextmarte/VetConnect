'use client'

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  type User,
} from 'firebase/auth'
import { app } from './config'

const auth = getAuth(app)

export const signup = async (email: string, password: string, displayName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  await firebaseUpdateProfile(userCredential.user, { displayName })
  return userCredential.user
}

export const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export const logout = async () => {
  await signOut(auth)
}

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

export const getCurrentUser = (): User | null => {
  return auth.currentUser
}

export const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    const user = getCurrentUser();
    if (user) {
        await firebaseUpdateProfile(user, data);
        return user;
    }
    throw new Error("Nenhum usuário logado para atualizar o perfil.");
}