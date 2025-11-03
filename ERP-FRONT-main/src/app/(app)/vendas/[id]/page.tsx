// Caminho: src/app/(app)/vendas/[id]/page.tsx

"use client";

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/formatters';
import { ArrowLeft, Edit, Trash2, CheckCircle } from 'lucide-react';
import { IVendaPopulada } from '@/types/models'; // Importamos a nossa nova interface

// Função para buscar uma única venda
const fetchVendaById = async (id: string): Promise<IVendaPopulada> => {
  const { data } = await api.get(`/vendas/${id}`);
  return data;
};

const DetalhesVendaPage = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data: venda, isLoading, error } = useQuery<IVendaPopulada>({
    queryKey: ['venda', id],
    queryFn: () => fetchVendaById(id),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ vendaId, status }: { vendaId: string, status: string }) => {
      return api.patch(`/vendas/${vendaId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      queryClient.invalidateQueries({ queryKey: ['venda', id] });
      alert('Status da venda atualizado com sucesso!');
    },
    onError: () => {
      alert('Erro ao atualizar o status da venda.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (vendaId: string) => api.delete(`/vendas/${vendaId}`),
    onSuccess: () => {
      alert('Venda deletada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      router.push('/vendas');
    },
    onError: () => {
      alert('Erro ao deletar a venda.');
    },
  });

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja deletar esta venda? Esta ação não pode ser desfeita e o estoque será restaurado.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleMarcarConcluido = () => {
    updateStatusMutation.mutate({ vendaId: id, status: 'Concluído' });
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return <div className="p-10">Carregando detalhes da venda...</div>;
  }

  if (error || !venda) {
    return <div className="p-10 text-red-500">Erro ao carregar os detalhes da venda.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button className='opacity-50' variant="outline" size="sm" asChild>
            <Link href="/vendas">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Vendas
            </Link>
          </Button>
          <h1 className="text-3xl text-blue-300">Detalhes da Venda</h1>
          <p className="text-muted-foreground opacity-50">ID da Venda: {venda._id}</p>
        </div>
        <div className="flex flex-wrap gap-2 opacity-50">
           {venda.status === 'Pendente' && (
             <Button className='text-gray-800/50' 
                onClick={handleMarcarConcluido} 
                disabled={updateStatusMutation.isPending}
                variant="default"
             >
               <CheckCircle className="mr-2 h-4 w-4" />
               {updateStatusMutation.isPending ? 'Marcando...' : 'Marcar como Concluído'}
             </Button>
           )}
           <Button variant="outline" asChild>
             <Link href={`/vendas/${id}/editar`}>
               <Edit className="mr-2 h-4 w-4" />
               Editar Venda
             </Link>
           </Button>
           <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
             <Trash2 className="mr-2 h-4 w-4" />
             {deleteMutation.isPending ? 'Excluindo...' : 'Excluir Venda'}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle className='text-gray-800/50'>Cliente</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl text-blue-300">{venda.cliente.fullName}</p>
              <p className="text-muted-foreground">{venda.cliente.email}</p>
              <p className="text-muted-foreground">{venda.cliente.phone}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className='text-gray-800/50'>Resumo do Pagamento</CardTitle></CardHeader>
            <CardContent className="space-y-2 opacity-80">
                <div className="flex justify-between"><span>Valor Total:</span> <strong>{formatCurrency(venda.valorTotal)}</strong></div>
                <div className="flex justify-between"><span>Entrada:</span> <span>{formatCurrency(venda.pagamento.valorEntrada)}</span></div>
                <div className="flex justify-between text-red-600"><div>Valor Restante:</div> <strong>{formatCurrency(venda.pagamento.valorRestante)}</strong></div>
                <hr className="my-2"/>
                <div className="flex justify-between text-sm text-muted-foreground"><span>Condição:</span> <span>{venda.pagamento.condicaoPagamento}</span></div>
                <div className="flex justify-between text-sm text-muted-foreground"><span>Método:</span> <span>{venda.pagamento.metodoPagamento}</span></div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className='text-gray-800/50'>Itens da Venda ({venda.produtos.length})</CardTitle>
               <Badge variant={venda.status === 'Concluído' ? 'default' : 'secondary'}>{venda.status}</Badge>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Qtd.</TableHead>
                    <TableHead className="text-right">Valor Unitário</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {venda.produtos.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className='text-gray-800/50'>{item.produto?.nome || 'Produto não encontrado'}</TableCell>
                      <TableCell className="text-center text-gray-800/50">{item.quantidade}</TableCell>
                      <TableCell className="text-right text-gray-800/50">{formatCurrency(item.valorUnitario)}</TableCell>
                      <TableCell className="text-right text-gray-800/50">{formatCurrency(item.quantidade * item.valorUnitario)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
             <CardFooter className="flex justify-end bg-gray-50 p-4 font-bold text-xl opacity-80">
                <span>Total: {formatCurrency(venda.valorTotal)}</span>
             </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DetalhesVendaPage;