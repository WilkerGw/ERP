"use client";

import { useState } from "react";
import withAuth from "@/components/auth/withAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import AgendamentoForm from "@/components/agendamentos/AgendamentoForm";
import { TAgendamentoSchema } from "@/lib/validators/agendamentoValidator";
import { formatPhoneForWhatsApp } from "@/lib/formatters";
import axios from "axios";
import {PlusCircle } from 'lucide-react';


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Trash2, MessageSquare } from "lucide-react";

type Agendamento = TAgendamentoSchema & { _id: string; date: string };

function AgendamentosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgendamento, setEditingAgendamento] =
    useState<Agendamento | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  // ... (lógica do componente permanece a mesma)
  const { data: agendamentos, isLoading } = useQuery<Agendamento[]>({
    queryKey: ["agendamentos", searchTerm],
    queryFn: async () =>
      api
        .get("/agendamentos", { params: { search: searchTerm } })
        .then((res) => res.data),
  });

  const { mutate: deleteAgendamento } = useMutation({
    mutationFn: (id: string) => api.delete(`/agendamentos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
      alert("Agendamento deletado!");
    },
    onError: (error: unknown) => {
      let errorMessage = "Erro ao excluir agendamento.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      alert(errorMessage);
    },
  });

  const handleEdit = (agendamento: Agendamento) => {
    setEditingAgendamento(agendamento);
    setIsModalOpen(true);
  };
  const handleCreate = () => {
    setEditingAgendamento(null);
    setIsModalOpen(true);
  };

  const getStatusVariant = (
    status: string
  ): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "Compareceu":
        return "default";
      case "Faltou":
        return "destructive";
      case "Cancelado":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="p-4 md:p-8">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
        <h1 className="text-3xl text-blue-300">Agendamentos</h1>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          <Input
            placeholder="Buscar por nome..."
            className="w-full md:w-80 placeholder:text-gray-800/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={handleCreate} className="text-gray-800/50 cursor-pointer">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </header>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAgendamento ? "Editar Agendamento" : "Novo Agendamento"}
            </DialogTitle>
            <DialogDescription>
              {editingAgendamento ? "Altere os dados." : "Preencha os dados."}
            </DialogDescription>
          </DialogHeader>
          <AgendamentoForm
            onSuccess={() => setIsModalOpen(false)}
            initialData={editingAgendamento}
          />
        </DialogContent>
      </Dialog>

      <main className="bg-card backdrop-blur-lg border border-border p-6 rounded-xl shadow-xl">
        <div className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>Carregando...</TableCell>
                </TableRow>
              ) : (
                agendamentos?.map((ag) => (
                  <TableRow key={ag._id}>
                    <TableCell className="text-gray-800/70">
                      {new Date(ag.date).toLocaleDateString("pt-BR", {
                        timeZone: "UTC",
                      })}
                    </TableCell>
                    <TableCell className="text-gray-800/70">
                      {ag.hour}
                    </TableCell>
                    <TableCell className="font-medium text-gray-800/70">
                      {ag.name}
                    </TableCell>
                    <TableCell className="text-gray-800/70">
                      {ag.telephone}
                    </TableCell>
                    <TableCell className="text-gray-800/70">
                      <Badge variant={getStatusVariant(ag.status)}>
                        {ag.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-blue-500 ">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <a
                              href={`https://wa.me/${formatPhoneForWhatsApp(ag.telephone)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center"
                            >
                              <MessageSquare className="mr-2 h-4 w-4 text-blue-300" />{" "}
                              Enviar WhatsApp
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(ag)}
                            className="cursor-pointer"
                          >
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {/* Documentação: Ícone de exclusão alterado para azul.
                          Por uma questão de usabilidade (UX), é recomendado usar a cor vermelha para ações destrutivas.
                          Se preferir reverter, troque 'text-blue-300' por 'text-red-500' na linha abaixo.
                        */}
                          <DropdownMenuItem
                            className="text-blue-300 hover:!text-blue-300 focus:!text-blue-300 cursor-pointer"
                            onClick={() => {
                              if (confirm("Tem certeza?"))
                                deleteAgendamento(ag._id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}

export default withAuth(AgendamentosPage);
