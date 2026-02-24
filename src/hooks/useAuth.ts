/**
 * NO EDITAR - Solo referencia para el agente de IA
 * TIPO C - FORBIDDEN HOOK
 */

import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContext'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    // Return safe defaults instead of throwing to prevent crashes during HMR
    return {
      user: null,
      session: null,
      loading: true,
      signUpWithOtp: async () => ({ error: new Error('AuthProvider not available') }),
      verifyOtp: async () => ({ error: new Error('AuthProvider not available') }),
      signInWithPassword: async () => ({ error: new Error('AuthProvider not available') }),
      signOut: async () => {},
      resendOtp: async () => ({ error: new Error('AuthProvider not available') }),
    } as any
  }
  return context
}
