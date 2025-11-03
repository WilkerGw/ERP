// Caminho: ERP-FRONT-main/src/app/(app)/caixa/page.tsx

'use client';

import { useState } from 'react';
import withAuth from '@/components/auth/withAuth';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Toaster } from 'sonner'; // Mantivemos o Toaster, mas removemos o 'toast'

// Componentes da UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import TransacaoForm from '@/components/caixa/TransacaoForm';

// Interfaces para os dados
interface ITransacao {
  _id: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  descricao: string;
  data: string;
}

interface ICaixaData {
  transacoes: ITransacao[];
  saldo: number;
}

function CaixaPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading, isError } = useQuery<ICaixaData>({
    queryKey: ['caixa'],
    queryFn: () => api.get('/caixa').then((res) => res.data),
  });

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 min-h-screen">
      <Toaster richColors position="top-right" />
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl text-blue-300">Gestão de Caixa</h1>
          <p className="text-muted-foreground">Administre as entradas e saídas de dinheiro.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="mt-4 sm:mt-0 text-gray-800/50">
          <PlusCircle className="mr-2 h-4 w-4 text-gray-800/50" />
          Nova Transação
        </Button>
      </header>

      <main className="grid gap-8 md:grid-cols-3">
        {/* Coluna do Saldo */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className='text-gray-800/50'>Saldo Atual</CardTitle>
              <CardDescription>Valor disponível no caixa.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>A carregar...</p>
              ) : isError ? (
                <p className="text-destructive">Erro ao carregar saldo.</p>
              ) : (
                <p className={`text-3xl font-bold ${data?.saldo ?? 0 >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(data?.saldo ?? 0)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna do Histórico */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className='text-gray-800/50'>Histórico de Transações</CardTitle>
              <CardDescription>Últimas movimentações registadas.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-gray-800/50">A carregar histórico...</TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-destructive ">Erro ao carregar os dados.</TableCell>
                    </TableRow>
                  ) : data?.transacoes && data.transacoes.length > 0 ? (
                    data.transacoes.map((transacao) => (
                      <TableRow key={transacao._id}>
                        <TableCell>
                          {transacao.tipo === 'entrada' ? (
                            <ArrowUpCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <ArrowDownCircle className="h-5 w-5 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-gray-800/50">{transacao.descricao}</TableCell>
                        <TableCell className='text-gray-800/50'>{new Date(transacao.data).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className={`text-right text-gray-800/50 font-semibold ${transacao.tipo === 'entrada' ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(transacao.valor)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-gray-800/50">Nenhuma transação encontrada.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal para nova transação */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registar Nova Transação</DialogTitle>
          </DialogHeader>
          <TransacaoForm onSuccess={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withAuth(CaixaPage);