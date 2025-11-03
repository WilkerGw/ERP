'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Este componente irá conter todos os provedores de contexto do lado do cliente.
export default function Providers({ children }: { children: React.ReactNode }) {
  // Criamos uma instância do QueryClient.
  // Usamos useState para garantir que a instância não seja recriada a cada renderização.
  const [queryClient] = useState(() => new QueryClient());

  return (
    // Envolvemos os 'children' (nossa aplicação) com o QueryClientProvider.
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}