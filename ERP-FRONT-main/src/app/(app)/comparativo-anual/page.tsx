// Caminho: ERP-FRONT-main/src/app/(app)/comparativo-anual/page.tsx

'use client';

import withAuth from "@/components/auth/withAuth";
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Interface para os dados que esperamos da API
interface ComparativoVendas {
  mes: string;
  "Ano Atual": number;
  "Ano Anterior": number;
}

function ComparativoAnualPage() {

  // Busca os dados da nossa nova rota
  const { data: comparativo, isLoading: isLoadingComparativo } = useQuery<ComparativoVendas[]>({
    queryKey: ['comparativoVendasAnual'],
    queryFn: async () => api.get('/relatorios/comparativo-vendas-anual').then(res => res.data),
  });

  // Função para formatar os valores do eixo Y (vertical) e do Tooltip
  const valueFormatter = (number: number) => `R$ ${new Intl.NumberFormat('pt-BR').format(number).toString()}`;

  if (isLoadingComparativo) { 
    return <div className="p-8 text-gray-800">A carregar dados do comparativo...</div> 
  }

  return (
    <div className="p-4 md:p-8">
      <header className="mb-10">
        <h1 className="text-3xl text-blue-300">Comparativo Anual de Vendas</h1>
        <p className="text-gray-800/50 mt-1">Veja o desempenho de vendas mês a mês, comparando o ano atual com o anterior.</p>
      </header>
      
      <main>
        <Card className="border-blue-300/20 text-gray-800/50">
          <CardHeader>
            <CardTitle className="text-blue-300">Vendas Mensais (Ano Atual vs. Ano Anterior)</CardTitle>
            <CardDescription>
              Comparação do faturamento de vendas concluídas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* O ResponsiveContainer faz o gráfico se adaptar ao tamanho do Card */}
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <BarChart data={comparativo || []} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="mes" stroke="#5e5e5e" fontSize={12} />
                  <YAxis tickFormatter={valueFormatter} stroke="#5e5e5e" fontSize={12} width={100} />
                  <Tooltip 
                    formatter={(value: number) => valueFormatter(value)} 
                    cursor={{fill: '#ffffff10'}} 
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #3B82F680', color: '#FFF' }} 
                  />
                  <Legend wrapperStyle={{ color: '#FFF' }} />
                  {/* Define as duas barras que queremos exibir */}
                  <Bar dataKey="Ano Anterior" fill="#64748b" />
                  <Bar dataKey="Ano Atual" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Protegemos a rota com autenticação
export default withAuth(ComparativoAnualPage);