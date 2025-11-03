// Caminho: src/app/(app)/vendas/nova/page.tsx

"use client";

import { VendaForm } from '@/components/vendas/VendaForm';

const NovaVendaPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl text-blue-300">Nova Venda</h1>
      <VendaForm />
    </div>
  );
};

export default NovaVendaPage;