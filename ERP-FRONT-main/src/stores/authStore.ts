// src/stores/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define a estrutura das informações do usuário que queremos guardar
interface User {
  id: string;
  nome: string;
  email: string;
}

// Define a estrutura do nosso "armazém" (store)
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setToken: (token: string, user: User) => void;
  logout: () => void;
}

// Cria a store com persistência
// Documentação: O `persist` é um middleware do Zustand.
// Ele salva o estado da store no `localStorage` automaticamente.
// Assim, mesmo que o usuário atualize a página, ele continua logado.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      // Ação para definir o token e o usuário quando o login é bem-sucedido
      setToken: (token: string, user: User) => {
        set({ token, user, isAuthenticated: true });
      },
      // Ação para limpar o estado ao fazer logout
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', // Nome do item no localStorage
      storage: createJSONStorage(() => localStorage), // Usa o localStorage para persistência
    }
  )
);