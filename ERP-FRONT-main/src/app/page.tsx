// Caminho: src/app/page.tsx

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import api from '@/services/api';
import axios from 'axios';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        senha,
      });
      
      const { token, user } = response.data;
      setToken(token, user);
      
      // --- ALTERAÇÃO AQUI ---
      // Redireciona para /dashboard em vez de /
      router.push('/dashboard');

    } catch (err: unknown) {
      console.error('Erro no login:', err);
      let errorMessage = 'Não foi possível conectar ao servidor. Tente novamente mais tarde.';
      if (axios.isAxiosError(err) && err.response) {
        // Usa a mensagem de erro do backend se disponível, caso contrário, uma mensagem padrão.
        errorMessage = err.response.data?.error || 'Usuário ou senha inválidos.';
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 bg-card backdrop-blur-lg border border-border rounded-xl shadow-xl w-full max-w-md text-card-foreground">
        <Image src="/images/logo-mind.png" alt="Logo" width={200} height={200} className='mx-auto' priority />
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-gray-900" htmlFor="email">Email</label>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-input backdrop-blur-sm border-border" required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-gray-900" htmlFor="senha">Senha</label>
            <input
              id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-input backdrop-blur-sm border-border" required
            />
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <button 
            type="submit" 
            className="w-full py-2 flex justify-center items-center h-10 bg-blue-300/10 text-gray-900 rounded-lg hover:bg-blue-300/20 transition-colors backdrop-blur-sm border border-blue-300/90"
            disabled={isLoading}
          >
            {isLoading ? <div className="loader"></div> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}