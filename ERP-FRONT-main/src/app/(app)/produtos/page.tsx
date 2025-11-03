'use client';

import { useState, useEffect } from 'react';
import withAuth from "@/components/auth/withAuth";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProdutoSchema, TProdutoSchema } from '@/lib/validators/produtoValidator';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal } from "lucide-react";
import {PlusCircle } from 'lucide-react';


type Produto = TProdutoSchema & { _id: string };

function ProdutoForm({ onSuccess, initialData }: { onSuccess: () => void, initialData?: Produto | null }) {
  const queryClient = useQueryClient();
  const form = useForm<TProdutoSchema>({
    resolver: zodResolver(ProdutoSchema),
    defaultValues: initialData || {
      codigo: '',
      nome: '',
      precoCusto: 0,
      precoVenda: 0,
      estoque: 0,
      tipo: undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        codigo: '',
        nome: '',
        precoCusto: 0,
        precoVenda: 0,
        estoque: 0,
        tipo: undefined,
      });
    }
  }, [initialData, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TProdutoSchema) => initialData?._id ? api.put(`/produtos/${initialData._id}`, data) : api.post('/produtos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      alert(initialData?._id ? 'Produto atualizado!' : 'Produto cadastrado!');
      onSuccess();
    },
    onError: (error: unknown) => {
      let errorMessage = 'Ocorreu um erro.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      alert(errorMessage);
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-4">
        <FormField control={form.control} name="codigo" render={({ field }) => (<FormItem><FormLabel>Código</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="nome" render={({ field }) => (<FormItem><FormLabel>Nome do Produto</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="tipo" render={({ field }) => (<FormItem><FormLabel>Tipo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Óculos de Sol">Óculos de Sol</SelectItem><SelectItem value="Óculos de Grau">Óculos de Grau</SelectItem><SelectItem value="Lente de Contato">Lente de Contato</SelectItem><SelectItem value="Serviço/Conserto">Serviço/Conserto</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField control={form.control} name="precoCusto" render={({ field }) => (<FormItem><FormLabel>Preço de Custo</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="precoVenda" render={({ field }) => (<FormItem><FormLabel>Preço de Venda</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="estoque" render={({ field }) => (<FormItem><FormLabel>Estoque</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <Button type="submit" disabled={isPending}>{isPending ? 'Salvando...' : 'Salvar'}</Button>
      </form>
    </Form>
  );
}

function ProdutosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: produtos, isLoading } = useQuery<Produto[]>({
    queryKey: ['produtos', searchTerm],
    queryFn: async () => api.get('/produtos', { params: { search: searchTerm } }).then(res => res.data),
  });

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setIsModalOpen(true);
  };
  const handleCreate = () => {
    setEditingProduto(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
        <h1 className="text-3xl text-blue-300">Produtos</h1>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
          <Input placeholder="Buscar por nome ou código..." className="w-full md:w-80 placeholder:text-gray-800/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <Button onClick={handleCreate} className='text-gray-800/50'>
          <PlusCircle className="mr-2 h-4 w-4" />
          Cadastrar Novo Produto</Button>
        </div>
      </header>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduto ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            <DialogDescription>{editingProduto ? 'Altere os dados do produto.' : 'Preencha os dados do novo produto.'}</DialogDescription>
          </DialogHeader>
          <ProdutoForm onSuccess={() => setIsModalOpen(false)} initialData={editingProduto} />
        </DialogContent>
      </Dialog>
      
      {/* --- CORREÇÃO AQUI --- */}
      <main className="bg-card backdrop-blur-lg border border-border p-6 rounded-xl shadow-xl">
        <div className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow><TableHead>Código</TableHead><TableHead>Nome</TableHead><TableHead>Tipo</TableHead><TableHead>Preço Venda</TableHead><TableHead>Estoque</TableHead><TableHead className="text-right">Ações</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (<TableRow><TableCell colSpan={6}>Carregando...</TableCell></TableRow>) : 
              produtos?.map((produto) => (
                <TableRow key={produto._id}>
                  <TableCell className="font-mono text-gray-800/70">{produto.codigo}</TableCell>
                  <TableCell className="font-medium text-gray-800/70">{produto.nome}</TableCell>
                  <TableCell className='text-gray-800/70'>{produto.tipo}</TableCell>
                  <TableCell className='text-gray-800/70'>{produto.precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                  <TableCell className='text-gray-800/70'>{produto.estoque}</TableCell>
                  <TableCell className="text-right text-blue-500">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(produto)} className="cursor-pointer">Editar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}

export default withAuth(ProdutosPage);