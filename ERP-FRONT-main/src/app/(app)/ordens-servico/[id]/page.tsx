// Caminho: ERP-FRONT-main/src/app/(app)/ordens-servico/[id]/page.tsx

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import withAuth from '@/components/auth/withAuth';
import Link from 'next/link';
import { IOrdemServicoPopulada, StatusOrdemServico } from '@/types/models';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckCircle, Package, User, Clipboard, Receipt } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const statusOptions: StatusOrdemServico[] = [
    'Aguardando Laboratório',
    'Em Produção',
    'Em Montagem',
    'Disponível para Retirada',
    'Entregue',
    'Cancelada'
];

function DetalhesOrdemServicoPage() {
    const params = useParams();
    const id = params.id as string;
    const queryClient = useQueryClient();
    const [selectedStatus, setSelectedStatus] = useState<StatusOrdemServico | null>(null);

    const { data: os, isLoading, isError } = useQuery<IOrdemServicoPopulada>({
        queryKey: ['ordemServico', id],
        queryFn: async () => api.get(`/ordens-servico/${id}`).then(res => res.data),
        enabled: !!id,
        onSuccess: (data) => {
            setSelectedStatus(data.status);
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: (newStatus: StatusOrdemServico) => api.patch(`/ordens-servico/${id}/status`, { status: newStatus }),
        onSuccess: () => {
            toast.success('Status da O.S. atualizado com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['ordemServico', id] });
            queryClient.invalidateQueries({ queryKey: ['ordensServico'] });
        },
        onError: () => {
            toast.error('Erro ao atualizar o status da O.S.');
        }
    });

    const handleUpdateStatus = () => {
        if (selectedStatus && selectedStatus !== os?.status) {
            updateStatusMutation.mutate(selectedStatus);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '--';
        return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    const getStatusVariant = (status: StatusOrdemServico): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'Entregue': return "default";
            case 'Cancelada': return "destructive";
            case 'Disponível para Retirada': return "outline";
            default: return "secondary";
        }
    };

    if (isLoading) return <div className="p-8">Carregando detalhes da Ordem de Serviço...</div>;
    if (isError || !os) return <div className="p-8 text-destructive">Erro ao carregar os dados da Ordem de Serviço.</div>;

    return (
        <div className="p-6 md:p-8 lg:p-10 min-h-screen">
            <Toaster richColors position="top-right" />
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/ordens-servico"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
                    </Button>
                    <h1 className="text-3xl font-bold mt-2">OS<div className="text-3xl text-blue-300">#{os.numeroOS}</div></h1>
                    <p className="text-muted-foreground">Aberta em: {formatDate(os.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select value={selectedStatus || os.status} onValueChange={(value) => setSelectedStatus(value as StatusOrdemServico)}>
                        <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {statusOptions.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button className='text-blue-300' onClick={handleUpdateStatus} disabled={updateStatusMutation.isPending || selectedStatus === os.status}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {updateStatusMutation.isPending ? 'Salvando...' : 'Salvar Status'}
                    </Button>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2 text-blue-300"><Clipboard /> Resumo da O.S.</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Status Atual:</span>
                                <Badge variant={getStatusVariant(os.status)}>{os.status}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Previsão de Entrega:</span>
                                <span>{formatDate(os.previsaoEntrega)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Data de Entrega:</span>
                                <span className='opacity-80'>{os.dataEntrega ? formatDate(os.dataEntrega) : '--'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Venda Associada:</span>
                                <Link href={`/vendas/${os.venda._id}`} className="text-primary hover:underline text-sm opacity-80">Ver Venda</Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2 text-blue-300"><User /> Cliente</CardTitle></CardHeader>
                        <CardContent>
                            <p className="font-semibold text-lg text-gray-800/50">{os.cliente.fullName}</p>
                            <p className="text-muted-foreground">{os.cliente.email}</p>
                            <p className="text-gray-800/50 text-sm">{os.cliente.phone}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2 text-blue-300"><Receipt /> Dados da Receita</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <div className="font-bold col-span-2 sm:col-span-4 text-gray-800/50">Olho Direito (OD)</div>
                                <div><span className="text-muted-foreground">Esférico:</span> {os.receita.esfericoDireito || '--'}</div>
                                <div><span className="text-muted-foreground">Cilíndrico:</span> {os.receita.cilindricoDireito || '--'}</div>
                                <div><span className="text-muted-foreground">Eixo:</span> {os.receita.eixoDireito || '--'}</div>
                                <div className="font-bold col-span-2 sm:col-span-4 mt-2 text-gray-800/50">Olho Esquerdo (OE)</div>
                                <div><span className="text-muted-foreground">Esférico:</span> {os.receita.esfericoEsquerdo || '--'}</div>
                                <div><span className="text-muted-foreground">Cilíndrico:</span> {os.receita.cilindricoEsquerdo || '--'}</div>
                                <div><span className="text-muted-foreground">Eixo:</span> {os.receita.eixoEsquerdo || '--'}</div>
                                <div className="font-bold col-span-2 sm:col-span-4 mt-2 text-gray-800/50">Adicionais</div>
                                <div><span className="text-muted-foreground">Adição:</span> {os.receita.adicao || '--'}</div>
                                <div><span className="text-muted-foreground">Altura:</span> {os.receita.altura || '--'}</div>
                                <div><span className="text-muted-foreground">DP:</span> {os.receita.dp || '--'}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2 text-blue-300"><Package /> Produtos do Serviço</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {os.produtosServico.map(p => (
                                    <li key={p.produto} className='opacity-80'>
                                        <span className="text-foreground">{p.nome}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

export default withAuth(DetalhesOrdemServicoPage);