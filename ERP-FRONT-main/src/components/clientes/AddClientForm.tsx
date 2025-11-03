// Caminho: ERP-FRONT-main/src/components/clientes/AddClientForm.tsx

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClienteSchema, TClienteSchema } from '@/lib/validators/clienteValidator';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { formatCPF, formatCEP, formatPhone } from '@/lib/formatters';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { toast } from 'sonner';

type ClienteData = TClienteSchema & { _id?: string };

// --- ALTERAÇÃO 1: A prop onSuccess agora pode receber o novo cliente ---
interface AddClientFormProps {
  onSuccess?: (newClient: ClienteData) => void;
  initialData?: Partial<ClienteData> | null;
}

export default function AddClientForm({ onSuccess, initialData }: AddClientFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<TClienteSchema>({
    resolver: zodResolver(ClienteSchema),
    defaultValues: {
      fullName: '', cpf: '', phone: '', birthDate: '', gender: undefined,
      address: '', cep: '', notes: '', esfericoDireito: '', cilindricoDireito: '',
      eixoDireito: '', esfericoEsquerdo: '', cilindricoEsquerdo: '',
      eixoEsquerdo: '', adicao: '', vencimentoReceita: '',
      ...initialData,
    },
  });

  useEffect(() => {
    if (initialData) {
      const formattedData = {
        ...initialData,
        cpf: initialData.cpf ? formatCPF(initialData.cpf) : '',
        cep: initialData.cep ? formatCEP(initialData.cep) : '',
        phone: initialData.phone ? formatPhone(initialData.phone) : '',
        birthDate: initialData.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : '',
        vencimentoReceita: initialData.vencimentoReceita ? new Date(initialData.vencimentoReceita).toISOString().split('T')[0] : '',
      };
      form.reset(formattedData);
    }
  }, [initialData, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: (clienteData: TClienteSchema) => {
      // Enviamos os dados com as máscaras, como o backend espera
      if (initialData?._id) {
        return api.put(`/clientes/${initialData._id}`, clienteData);
      } else {
        return api.post('/clientes', clienteData);
      }
    },
    // --- ALTERAÇÃO 2: Passamos o cliente retornado pela API para a função onSuccess ---
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success(initialData?._id ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
      if (onSuccess) {
        onSuccess(response.data); // Passa o objeto completo do novo cliente
      }
    },
    onError: (error: unknown) => {
      let errorMessage = 'Ocorreu um erro ao salvar o cliente.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    }
  });

  const isEditing = !!initialData?._id;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(mutate)} className="space-y-6 max-h-[80vh] md:max-h-[70vh] overflow-y-auto pr-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="cpf" render={({ field }) => (<FormItem><FormLabel>CPF</FormLabel><FormControl><Input {...field} onChange={(e) => field.onChange(formatCPF(e.target.value))} maxLength={14} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} onChange={(e) => field.onChange(formatPhone(e.target.value))} maxLength={15} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="birthDate" render={({ field }) => (<FormItem><FormLabel>Data de Nascimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gênero</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Masculino">Masculino</SelectItem><SelectItem value="Feminino">Feminino</SelectItem><SelectItem value="Outro">Outro</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField control={form.control} name="cep" render={({ field }) => (<FormItem><FormLabel>CEP</FormLabel><FormControl><Input {...field} onChange={(e) => field.onChange(formatCEP(e.target.value))} maxLength={9} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="address" render={({ field }) => (<FormItem className="md:col-span-3"><FormLabel>Endereço Completo</FormLabel><FormControl><Textarea placeholder="Rua, Número, Bairro, Cidade/SP" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <h3 className=" text-gray-400">Receita</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField control={form.control} name="esfericoDireito" render={({ field }) => (<FormItem><FormLabel>Esférico (OD)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="esfericoEsquerdo" render={({ field }) => (<FormItem><FormLabel>Esférico (OE)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="cilindricoDireito" render={({ field }) => (<FormItem><FormLabel>Cilíndrico (OD)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="cilindricoEsquerdo" render={({ field }) => (<FormItem><FormLabel>Cilíndrico (OE)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="eixoDireito" render={({ field }) => (<FormItem><FormLabel>Eixo (OD)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="eixoEsquerdo" render={({ field }) => (<FormItem><FormLabel>Eixo (OE)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="adicao" render={({ field }) => (<FormItem><FormLabel>Adição</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="vencimentoReceita" render={({ field }) => (<FormItem><FormLabel>Vencimento da Receita</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
        </div>
        <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Observações</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button className='text-gray-800/50 cursor-pointer' type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente')}
        </Button>
      </form>
    </Form>
  );
}