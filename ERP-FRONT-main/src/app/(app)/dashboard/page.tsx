// Caminho: ERP-FRONT-main/src/app/(app)/dashboard/page.tsx

'use client';

import withAuth from "@/components/auth/withAuth";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import StatCard from "@/components/dashboard/StatCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Cake,
  AlertTriangle,
  Sparkles,
  LogOut,
  Landmark,
  DollarSign,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Interfaces (sem alteração)
interface Insight {
  _id: string;
  titulo: string;
  conteudo: string;
  dataGeracao: string;
}

interface DashboardStats {
  totalVendasDia: number;
  totalVendasMes: number;
  boletosVencidos: number;
  boletosProximos: number;
  agendamentosProximos: number;
  aniversariantesMes: {
    nome: string;
    dia: number;
  }[];
}

interface CaixaData {
    saldo: number;
}

function HomePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const {
    data: stats,
    isLoading: isLoadingStats,
  } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => api.get("/dashboard").then((res) => res.data),
  });

  const {
    data: insight,
    isLoading: isLoadingInsight,
  } = useQuery<Insight>({
    queryKey: ["latestInsight"],
    queryFn: async () => api.get("/insights/latest").then((res) => res.data),
  });
  
  const { data: caixaData, isLoading: isLoadingCaixa } = useQuery<CaixaData>({
    queryKey: ['caixa'],
    queryFn: () => api.get('/caixa').then((res) => res.data),
  });

  const handleLogout = () => {
    logout();
    router.push("/"); // Atualizado para a nova rota de login
  };

  const isLoading = isLoadingStats || isLoadingInsight || isLoadingCaixa;

  const formatCurrency = (value: number | undefined) => {
    if (typeof value !== "number") return "R$ 0,00";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo(a),{" "}
            <span className="font-bold text-blue-500">
              {user?.nome || "Usuário"}
            </span>
            ! Veja um resumo do seu negócio.
          </p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="mt-4 sm:mt-0 cursor-pointer p-2 border border-white/10 backdrop-blur-[10px] rounded-4xl"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </header>
      
      {/* --- ESTRUTURA DO LAYOUT ATUALIZADA --- */}
      <main className="space-y-6">
        {/* Nova seção para a primeira linha de cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
                title="Vendas do Dia"
                value={formatCurrency(stats?.totalVendasDia)}
                icon={<DollarSign className="text-green-500" />}
            />
            <StatCard
                title="Vendas do Mês"
                value={formatCurrency(stats?.totalVendasMes)}
                icon={<Wallet className="text-green-500" />}
            />
            <StatCard
                title="Saldo em Caixa"
                value={formatCurrency(caixaData?.saldo)}
                icon={<Landmark className="text-blue-500" />}
            />
        </div>
        
        {/* Nova seção para a segunda linha de cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Boletos Vencidos"
              value={stats?.boletosVencidos || 0}
              icon={<AlertTriangle className="text-red-500" />}
              content={
                <button
                  onClick={() => router.push("/boletos")}
                  className="text-xs text-blue-500 hover:underline mt-1"
                >
                  Ver boletos
                </button>
              }
            />
            <StatCard
              title="Boletos a Vencer (7d)"
              value={stats?.boletosProximos || 0}
              icon={<Calendar className="text-yellow-500" />}
            />
            <StatCard
              title="Agendamentos Próximos"
              value={stats?.agendamentosProximos || 0}
              icon={<Calendar className="text-indigo-500" />}
            />
        </div>

        {/* Seção para os cards maiores, agora separados */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card de Análise da IA */}
            {insight && (
                <div className="lg:col-span-3"> {/* Ocupa toda a largura */}
                    <Card className='flex flex-col min-h-[24rem]'> {/* Altura mínima para consistência */}
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                            <Sparkles className="text-purple-500" />
                            {insight.titulo}
                            </CardTitle>
                            <CardDescription>
                            Análise gerada via IA em{" "}
                            {new Date(insight.dataGeracao).toLocaleString("pt-BR")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-0 overflow-y-auto pr-4">
                            <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                            {insight.conteudo}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
            
            {/* Card de Aniversariantes (pode ocupar a largura toda ou parcial) */}
            <div className="lg:col-span-3"> {/* Ocupa toda a largura */}
                <StatCard
                title="Aniversariantes do Mês"
                value={stats?.aniversariantesMes.length || 0}
                icon={<Cake className="text-pink-500" />}
                content={
                    <ul className="space-y-1 text-xs mt-2 max-h-48 overflow-y-auto pr-2">
                    {stats?.aniversariantesMes &&
                    stats.aniversariantesMes.length > 0 ? (
                        stats.aniversariantesMes.map((aniversariante, index) => (
                        <li key={index} className="truncate text-muted-foreground">
                            <span className="font-semibold text-foreground">
                            Dia {aniversariante.dia}
                            </span>{" "}
                            - {aniversariante.nome}
                        </li>
                        ))
                    ) : (
                        <li className="text-muted-foreground">
                        Nenhum aniversariante este mês
                        </li>
                    )}
                    </ul>
                }
                />
            </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(HomePage);