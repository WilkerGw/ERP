'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    const router = useRouter();
    const isAuthenticated = useAuthStore.getState().isAuthenticated; // Pega o estado inicial diretamente
    const [hasMounted, setHasMounted] = useState(false);

    // Garante que a lógica só rode no cliente, após a montagem inicial
    useEffect(() => {
      setHasMounted(true);
    }, []);
    
    useEffect(() => {
      // Se já montou e o usuário não está autenticado, redireciona.
      if (hasMounted && !isAuthenticated) {
        // --- ALTERAÇÃO AQUI ---
        // Redireciona para a raiz (/) que agora é a página de login
        router.replace('/');
      }
    }, [hasMounted, isAuthenticated, router]);

    // Enquanto o componente não montou ou o usuário não está autenticado,
    // não renderiza nada para evitar o mismatch com o servidor.
    // Retornar null é seguro durante a hidratação.
    if (!hasMounted || !isAuthenticated) {
      return null;
    }

    // Se montou e está autenticado, mostra a página real.
    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;