'use client';

import { useState } from 'react';
import withAuth from "@/components/auth/withAuth";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {PlusCircle } from 'lucide-react';


interface Boleto {
  _id: string;
  clienteInfo: { fullName: string };
  parcelValue: number;
  dueDate: string;
  description: string;
  status: string;
}

interface MesAgrupado {
  _id: { ano: number, mes: number };
  boletos: Boleto[];
  valorTotalMes: number;
  pagosNoMes: number;
}

const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function BoletosPage() {
  const [filtro, setFiltro] = useState('Abertos');
  const queryClient = useQueryClient();

  const { data: grupos, isLoading } = useQuery<MesAgrupado[]>({
    queryKey: ['boletos', filtro],
    queryFn: async () => api.get('/boletos', { params: { status: filtro } }).then(res => res.data),
  });

  const { mutate: marcarComoPago, isPending } = useMutation({
    mutationFn: (boletoId: string) => api.patch(`/boletos/${boletoId}/status`, { status: 'pago' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boletos'] });
    },
  });

  return (
    <div className="p-4 md:p-8">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
        <h1 className="text-3xl text-blue-300">Boletos</h1>
        <Button asChild className="w-full md:w-auto text-gray-800/50">
          <Link href="/boletos/novo">
          <PlusCircle className="mr-2 h-4 w-4" />
          Gerar Parcelamento</Link>
        </Button>
      </header>
      
      <Tabs value={filtro} onValueChange={setFiltro} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-4 bg-blue-950/20">
          <TabsTrigger className='text-gray-800/50' value="Todos">Todos</TabsTrigger>
          <TabsTrigger className='text-gray-800/50' value="Abertos">Abertos</TabsTrigger>
          <TabsTrigger className='text-gray-800/50' value="Pagos">Pagos</TabsTrigger>
          <TabsTrigger className='text-gray-800/50' value="Atrasados">Atrasados</TabsTrigger>
        </TabsList>

        <main className="mt-6 space-y-6">
          {isLoading && <p>Carregando boletos...</p>}
          {grupos?.map((grupo) => {
            const totalBoletos = grupo.boletos.length;
            const progresso = totalBoletos > 0 ? (grupo.pagosNoMes / totalBoletos) * 100 : 0;
            return (
              <Card key={`${grupo._id.ano}-${grupo._id.mes}`}>
                <CardHeader>
                  <CardTitle className='text-blue-300'>{meses[grupo._id.mes - 1]} de {grupo._id.ano}</CardTitle>
                  <CardDescription className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className='text-gray-800/50'>Total a Receber: {grupo.valorTotalMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    <span className='text-gray-800/50'>{grupo.pagosNoMes}/{totalBoletos} pagos</span>
                  </CardDescription>
                  <Progress value={progresso} className="w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {grupo.boletos.map(boleto => {
                      const hoje = new Date();
                      hoje.setHours(0,0,0,0);
                      const isAtrasado = new Date(boleto.dueDate) < hoje && boleto.status === 'aberto';
                      return (
                        // --- CORREÇÃO AQUI ---
                        // Aplicamos um fundo sutil e borda aos itens da lista para melhor contraste
                        <div key={boleto._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-3 rounded-md border bg-background/30 border-border">
                          <div className="flex flex-col text-center sm:text-left">
                            <span className="font-semibold text-gray-800/70">{boleto.clienteInfo.fullName}</span>
                            <span className="text-sm text-gray-800/70">{boleto.description}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-center sm:text-right">
                            <div className="text-sm text-gray-800">Venc.: {new Date(boleto.dueDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</div>
                            <div>
                              <span className={`font-bold text-blue-300 text-lg ${isAtrasado ? 'text-destructive' : ''}`}>
                                {boleto.parcelValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </span>
                            </div>
                            <div>
                              <Button
                              className='text-gray-800/50'
                                size="sm"
                                disabled={boleto.status === 'pago' || isPending}
                                onClick={() => marcarComoPago(boleto._id)}
                              >
                                {boleto.status === 'pago' ? 'Pago' : 'Marcar como Pago'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </main>
      </Tabs>
    </div>
  );
}

export default withAuth(BoletosPage);