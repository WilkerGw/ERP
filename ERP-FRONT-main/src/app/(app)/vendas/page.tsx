// Caminho: src/app/(app)/vendas/page.tsx

"use client";

import { useState } from 'react'; // <--- 1. IMPORTAR useState
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input'; // <--- 2. IMPORTAR Input
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from '@/services/api';

// Interface atualizada para refletir os dados populados
interface IClientePopulado {
  _id: string;
  fullName: string;
}

interface IPagamento {
  valorEntrada: number;
  valorRestante: number;
  metodoPagamento: string;
  condicaoPagamento: string;
  parcelas?: number;
}

interface IVendaPopulada {
  _id: string;
  cliente: IClientePopulado;
  produtos: { produto: { nome: string } }[];
  valorTotal: number;
  status: 'Pendente' | 'Concluído' | 'Cancelado';
  dataVenda: string;
  pagamento?: IPagamento;
}

const fetchVendas = async (): Promise<IVendaPopulada[]> => {
  const { data } = await api.get('/vendas');
  return data;
};

const VendasPage = () => {
  const queryClient = useQueryClient();
  const [filtroCliente, setFiltroCliente] = useState(''); // <--- 3. CRIAR ESTADO PARA O FILTRO

  const { data: vendas, isLoading, error } = useQuery<IVendaPopulada[]>({
    queryKey: ['vendas'],
    queryFn: fetchVendas,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => {
      return api.patch(`/vendas/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
    },
  });

  const handleMarcarConcluido = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'Concluído' });
  };
  
  const formatCurrency = (value?: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return "R$ 0,00";
    }
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // --- 4. CRIAR A LÓGICA DE FILTRAGEM ---
  const vendasFiltradas = vendas
    ? vendas.filter(venda =>
        venda.cliente?.fullName
          .toLowerCase()
          .includes(filtroCliente.toLowerCase())
      )
    : [];

  if (isLoading) return <div className="p-10">Carregando vendas...</div>;
  if (error) return <div className="p-10 text-red-500">Erro ao carregar vendas.</div>;

  return (
    <div className="p-6 md:p-8 lg:p-10 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl text-blue-300">Vendas</h1>
        <Button asChild className='rounded-3xl'>
          <Link href="/vendas/nova">
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Venda
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className=''>Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          
          {/* --- 5. ADICIONAR O CAMPO DE INPUT (BUSCA) --- */}
          <div className="mb-4">
            <Input
              placeholder="Buscar por nome do cliente..."
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)}
              className="max-w-sm border-gray-800/20 "
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right">Valor Restante</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            
            {/* --- 6. ATUALIZAR O TABLEBODY --- */}
            <TableBody>
              {vendasFiltradas.length > 0 ? (
                vendasFiltradas.map((venda) => (
                  <TableRow key={venda._id}>
                    {/* --- CÉLULA DO CLIENTE AGORA É UM LINK --- */}
                    <TableCell className="font-medium ">
                      <Link href={`/vendas/${venda._id}`} className="hover:underline">
                        {venda.cliente?.fullName || 'Cliente não informado'}
                      </Link>
                    </TableCell>
                    <TableCell className=''>{formatDate(venda.dataVenda)}</TableCell>
                    <TableCell className="text-right ">{formatCurrency(venda.valorTotal)}</TableCell>
                    <TableCell className="text-right text-red-500">
                      {formatCurrency(venda.pagamento?.valorRestante)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={venda.status === 'Concluído' ? 'default' : 'secondary'}>
                        {venda.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-blue-500 cursor-pointer">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className='border-white/10 rounded-2xl backdrop-blur-md text-white'>
                           <DropdownMenuItem>
                             <Link href={`/vendas/${venda._id}`} className="w-full h-full">
                              Ver Detalhes
                             </Link>
                           </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleMarcarConcluido(venda._id)}>
                            Marcar como Concluído
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // --- MENSAGEM PARA QUANDO NÃO HÁ RESULTADOS ---
                <TableRow>
                  <TableCell colSpan={6} className="text-center ">
                    Nenhuma venda encontrada para este cliente.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendasPage;