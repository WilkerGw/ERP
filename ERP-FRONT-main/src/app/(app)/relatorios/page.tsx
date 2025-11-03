'use client';

import withAuth from "@/components/auth/withAuth";
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FaturamentoMensal { mes: string; "Faturamento": number; }
interface VendasPorMetodo { name: string; value: number; }
interface TopCliente { name: string; "Total Gasto": number; }
interface EficienciaAgendamento { name: 'Compareceu' | 'Faltou' | 'Aberto'; value: number; }
interface FluxoCaixa { mes: string; "Valor a Receber": number; }

const COLORS = {
  default: ["#3b82f6", "#22c55e", "#f97316", "#ef4444", "#8b5cf6"],
  status: { 'Compareceu': '#22c55e', 'Faltou': '#ef4444', 'Aberto': '#64748b' } as Record<string, string>
};

function RelatoriosPage() {
  const { data: faturamento, isLoading: isLoadingFaturamento } = useQuery<FaturamentoMensal[]>({
    queryKey: ['faturamentoMensal'],
    queryFn: async () => api.get('/relatorios/faturamento-mensal').then(res => res.data),
  });
  const { data: vendasMetodo, isLoading: isLoadingMetodo } = useQuery<VendasPorMetodo[]>({
    queryKey: ['vendasPorMetodo'],
    queryFn: async () => api.get('/relatorios/vendas-por-metodo').then(res => res.data),
  });
  const { data: topClientes, isLoading: isLoadingTopClientes } = useQuery<TopCliente[]>({
    queryKey: ['topClientes'],
    queryFn: async () => api.get('/relatorios/top-clientes').then(res => res.data),
  });
  const { data: eficienciaAgendamentos, isLoading: isLoadingAgendamentos } = useQuery<EficienciaAgendamento[]>({
    queryKey: ['eficienciaAgendamentos'],
    queryFn: async () => api.get('/relatorios/eficiencia-agendamentos').then(res => res.data),
  });
  const { data: fluxoCaixa, isLoading: isLoadingFluxoCaixa } = useQuery<FluxoCaixa[]>({
    queryKey: ['fluxoCaixaFuturo'],
    queryFn: async () => api.get('/relatorios/fluxo-caixa-futuro').then(res => res.data),
  });

  const isLoading = isLoadingFaturamento || isLoadingMetodo || isLoadingTopClientes || isLoadingAgendamentos || isLoadingFluxoCaixa;
  const valueFormatter = (number: number) => `R$ ${new Intl.NumberFormat('pt-BR').format(number).toString()}`;

  if (isLoading) { return <div className="p-8 text-gray-800">Carregando relatórios...</div> }

  return (
    <div className="p-4 md:p-8">
      <header className="mb-10">
        <h1 className="text-3xl text-blue-300">Relatórios Gerenciais</h1>
        <p className="text-gray-800/50 mt-1">Análise de performance da sua ótica.</p>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2 bg-white/5 border-blue-300/20 text-gray-800/50">
          <CardHeader><CardTitle className="text-blue-300">Fluxo de Caixa Futuro (Próximos 12 Meses)</CardTitle></CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={fluxoCaixa || []} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="mes" stroke="#5e5e5e" fontSize={12} />
                  <YAxis tickFormatter={valueFormatter} stroke="#5e5e5e" fontSize={12} width={100} />
                  <Tooltip formatter={(value: number) => valueFormatter(value)} cursor={{fill: '#ffffff10'}} contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #3B82F680', color: '#FFF' }} />
                  <Legend wrapperStyle={{ color: '#FFF' }} />
                  <Bar dataKey="Valor a Receber" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-blue-300/20 text-white">
          <CardHeader><CardTitle className="text-blue-300">Faturamento Mensal</CardTitle></CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={faturamento || []} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#9e9e9e" />
                  <XAxis dataKey="mes" stroke="#5e5e5e" fontSize={12} />
                  <YAxis tickFormatter={valueFormatter} stroke="#5e5e5e" fontSize={12} width={100} />
                  <Tooltip formatter={(value: number) => valueFormatter(value)} cursor={{fill: '#5e5e5e'}} contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #3B82F680', color: '#FFF' }} />
                  <Legend wrapperStyle={{ color: '#5e5e5e' }} />
                  <Bar dataKey="Faturamento" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-blue-300/20 text-white">
          <CardHeader><CardTitle className="text-blue-300">Vendas por Método de Pagamento</CardTitle></CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={vendasMetodo || []} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {vendasMetodo?.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS.default[index % COLORS.default.length]} />))}
                  </Pie>
                  <Tooltip formatter={(value: number) => valueFormatter(value)} contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #3B82F680', color: '#FFF' }} />
                  <Legend wrapperStyle={{ color: '#FFF', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-blue-300/20 text-white">
          <CardHeader><CardTitle className="text-blue-300">Top 5 Clientes (Valor Total Gasto)</CardTitle></CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={topClientes || []} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#5e5e5e" />
                  <XAxis type="number" tickFormatter={valueFormatter} stroke="#5e5e5e" fontSize={12} />
                  <YAxis type="category" dataKey="name" width={120} interval={0} stroke="#5e5e5e" fontSize={12} />
                  <Tooltip formatter={(value: number) => valueFormatter(value)} cursor={{fill: '#5e5e5e'}} contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #3B82F680', color: '#FFF' }} />
                  <Legend wrapperStyle={{ color: '#5e5e5e' }} />
                  <Bar dataKey="Total Gasto" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-blue-300/20 text-white">
          <CardHeader><CardTitle className="text-blue-300">Eficiência dos Agendamentos</CardTitle></CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                  <PieChart>
                    <Pie data={eficienciaAgendamentos || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {eficienciaAgendamentos?.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS.status[entry.name] || COLORS.default[index % COLORS.default.length]} />))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value} agendamento(s)`} contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #3B82F680', color: '#FFF' }} />
                    <Legend wrapperStyle={{ color: '#FFF', fontSize: '12px' }}/>
                  </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default withAuth(RelatoriosPage);