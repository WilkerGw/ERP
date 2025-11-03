// Caminho: ERP-FRONT-main/src/components/caixa/TransacaoForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TransacaoCaixaSchema, TTransacaoCaixaSchema } from '@/lib/validators/caixaValidator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface TransacaoFormProps {
  onSuccess: () => void;
}

export default function TransacaoForm({ onSuccess }: TransacaoFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<TTransacaoCaixaSchema>({
    resolver: zodResolver(TransacaoCaixaSchema),
    defaultValues: {
      tipo: undefined,
      valor: 0,
      descricao: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TTransacaoCaixaSchema) => api.post('/caixa', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caixa'] });
      toast.success('Transação registrada com sucesso!');
      onSuccess();
      form.reset();
    },
    onError: (error: unknown) => {
      let errorMessage = 'Ocorreu um erro ao registrar a transação.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-4">
        
        <FormField 
          control={form.control} 
          name="tipo" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Transação</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione entrada ou saída..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} 
        />

        <FormField 
          control={form.control} 
          name="valor" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />

        <FormField 
          control={form.control} 
          name="descricao" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Ex: Pagamento de conta de luz, Sangria, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        
        <div className="flex justify-end">
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto text-gray-800/50">
                {isPending ? 'A registar...' : 'Registar Transação'}
            </Button>
        </div>
      </form>
    </Form>
  );
}