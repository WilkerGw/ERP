'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AgendamentoSchema, TAgendamentoSchema } from '@/lib/validators/agendamentoValidator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Agendamento = TAgendamentoSchema & { _id: string; date: string; };
interface AgendamentoFormProps { onSuccess: () => void; initialData?: Agendamento | null; }

export default function AgendamentoForm({ onSuccess, initialData }: AgendamentoFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<TAgendamentoSchema>({
    resolver: zodResolver(AgendamentoSchema),
    defaultValues: { status: 'Aberto', ...initialData },
  });

  useEffect(() => {
    const defaultVals = {
      name: '', telephone: '', date: '', hour: '', observation: '', status: 'Aberto' as const, ...initialData,
    };
    if (initialData?.date) {
      defaultVals.date = new Date(initialData.date).toISOString().split('T')[0];
    }
    form.reset(defaultVals);
  }, [initialData, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TAgendamentoSchema) => initialData?._id ? api.put(`/agendamentos/${initialData._id}`, data) : api.post('/agendamentos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      alert(initialData?._id ? 'Agendamento atualizado!' : 'Agendamento salvo!');
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
        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="telephone" render={({ field }) => (<FormItem><FormLabel>Telefone / WhatsApp</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="hour" render={({ field }) => (<FormItem><FormLabel>Hora</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        {initialData && (
          <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Aberto">Aberto</SelectItem><SelectItem value="Compareceu">Compareceu</SelectItem><SelectItem value="Faltou">Faltou</SelectItem><SelectItem value="Cancelado">Cancelado</SelectItem></SelectContent></Select><FormMessage/></FormItem>)}/>
        )}
        <FormField control={form.control} name="observation" render={({ field }) => (<FormItem><FormLabel>Observação</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" disabled={isPending} className="w-44 text-gray-800/50 cursor-pointer">
          {isPending ? <div className="loader"></div> : 'Salvar Agendamento'}
        </Button>
      </form>
    </Form>
  );
}