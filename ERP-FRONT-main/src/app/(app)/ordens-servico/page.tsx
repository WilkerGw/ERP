// Caminho: ERP-FRONT-main/src/app/(app)/ordens-servico/page.tsx

'use client';

import { useState } from 'react';
import withAuth from "@/components/auth/withAuth";
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IOrdemServicoPopulada, StatusOrdemServico } from '@/types/models';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const statusOptions: StatusOrdemServico[] = [
    'Aguardando Laboratório',
    'Em Produção',
    'Em Montagem',
    'Disponível para Retirada',
    'Entregue',
    'Cancelada'
];

function OrdensServicoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');

  const { data: ordens, isLoading, isError } = useQuery<IOrdemServicoPopulada[]>({
    queryKey: ['ordensServico', statusFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'Todos') {
        params.append('status', statusFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const response = await api.get(`/ordens-servico`, { params });
      return response.data;
    },
  });

  const getStatusVariant = (status: StatusOrdemServico): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Entregue':
        return "default"; // Verde
      case 'Cancelada':
        return "destructive"; // Vermelho
      case 'Disponível para Retirada':
        return "outline"; // Azul
      default:
        return "secondary"; // Cinza
    }
  };

  // Função para formatar a data. Ela já lida com datas nulas ou indefinidas.
  const formatDate = (dateString?: string) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl text-blue-300">Ordens de Serviço</h1>
          <p className="text-muted-foreground">Acompanhe o progresso dos serviços de montagem.</p>
        </div>
      </header>

      <main>
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-800/50">Lista de O.S.</CardTitle>
            <CardDescription>Filtre e busque para encontrar uma ordem específica.</CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Input
                placeholder="Buscar por Nº da O.S. ou nome do cliente..."
                className="w-full sm:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos os Status</SelectItem>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº O.S.</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data de Abertura</TableHead>
                  <TableHead>Previsão de Entrega</TableHead>
                  {/* NOVA COLUNA ADICIONADA AQUI */}
                  <TableHead>Data da Entrega</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* O colSpan foi atualizado para 7 para abranger a nova coluna */}
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center h-24">Carregando ordens...</TableCell></TableRow>
                ) : isError ? (
                  <TableRow><TableCell colSpan={7} className="text-center h-24 text-destructive">Erro ao carregar os dados.</TableCell></TableRow>
                ) : ordens && ordens.length > 0 ? (
                  ordens.map((os) => (
                    <TableRow key={os._id}>
                      <TableCell className="font-mono text-gray-800/50">#{os.numeroOS}</TableCell>
                      <TableCell className="font-medium text-gray-800/50">{os.cliente.fullName}</TableCell>
                      <TableCell className='text-gray-800/50'>{formatDate(os.createdAt)}</TableCell>
                      <TableCell className='text-gray-800/50'>{formatDate(os.previsaoEntrega)}</TableCell>
                      {/* CÉLULA COM O DADO DA NOVA COLUNA */}
                      <TableCell className='text-gray-800/50'>{formatDate(os.dataEntrega)}</TableCell>
                      <TableCell><Badge variant={getStatusVariant(os.status)}>{os.status}</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className='text-blue-500' aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/ordens-servico/${os._id}`}>Ver Detalhes</Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={7} className="text-center h-24">Nenhuma ordem de serviço encontrada.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default withAuth(OrdensServicoPage);