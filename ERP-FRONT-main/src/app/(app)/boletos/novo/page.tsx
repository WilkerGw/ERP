'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import withAuth from "@/components/auth/withAuth";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import api from '@/services/api';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Cliente { _id: string; fullName: string; }

type FormValues = {
  cliente: Cliente | null;
  valorTotal: number;
  valorEntrada: number;
  numParcelas: number;
  dataPrimeiroVencimento: string;
};

function GerarParcelamentoPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [clienteSearch, setClienteSearch] = useState('');
  const [clientePopoverOpen, setClientePopoverOpen] = useState(false);
  const [previa, setPrevia] = useState<{ valor: number; data: string }[]>([]);

  const { data: clientes } = useQuery<Cliente[]>({
    queryKey: ['clientes', clienteSearch],
    queryFn: () => api.get(`/clientes?search=${clienteSearch}`).then(res => res.data),
    enabled: clienteSearch.length >= 1,
  });

  const { control, handleSubmit, watch, setValue, register } = useForm<FormValues>({
    defaultValues: { cliente: null, valorTotal: 0, valorEntrada: 0, numParcelas: 1, dataPrimeiroVencimento: '' },
  });

  const valorTotal = watch('valorTotal');
  const valorEntrada = watch('valorEntrada');
  const numParcelas = watch('numParcelas');
  const dataPrimeiroVencimento = watch('dataPrimeiroVencimento');

  useEffect(() => {
    if (numParcelas > 0 && valorTotal > valorEntrada && dataPrimeiroVencimento) {
      const valorAParcelar = valorTotal - valorEntrada;
      const valorParcela = valorAParcelar / numParcelas;
      const novasParcelas = [];
      
      // --- CORREÇÃO AQUI ---
      // Trocamos 'let' por 'const' para resolver o erro do build.
      // Apesar de o objeto 'dataVencimento' ser modificado, a variável em si
      // não é reatribuída, então 'const' é o correto.
      const dataVencimento = new Date(dataPrimeiroVencimento + 'T12:00:00Z');

      for (let i = 0; i < numParcelas; i++) {
        novasParcelas.push({
          valor: valorParcela,
          data: dataVencimento.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        });
        dataVencimento.setMonth(dataVencimento.getMonth() + 1);
      }
      setPrevia(novasParcelas);
    } else {
      setPrevia([]);
    }
  }, [valorTotal, valorEntrada, numParcelas, dataPrimeiroVencimento]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) => {
      const payload = {
        clienteId: data.cliente?._id,
        valorTotal: Number(data.valorTotal),
        valorEntrada: Number(data.valorEntrada),
        numParcelas: Number(data.numParcelas),
        dataPrimeiroVencimento: data.dataPrimeiroVencimento,
      };
      return api.post('/boletos/parcelamento', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boletos'] });
      alert('Parcelamento gerado com sucesso!');
      router.push('/boletos');
    },
    onError: (error: unknown) => {
      let errorMessage = 'Erro ao gerar parcelamento.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      alert(errorMessage);
    },
  });

  const valorParcelaCalculado = numParcelas > 0 ? (valorTotal - valorEntrada) / numParcelas : 0;

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="col-span-1 lg:col-span-2 space-y-6">
        <Card>
          <CardHeader><CardTitle>Dados da Venda e Cliente</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            <div className="col-span-1 md:col-span-3">
              <Label>Cliente</Label>
              <Controller
                name="cliente"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Popover open={clientePopoverOpen} onOpenChange={setClientePopoverOpen}>
                    <PopoverTrigger asChild><Button variant="outline" role="combobox" className="w-full justify-between mt-2 bg-white/20 rounded-sm text-white/50">{field.value?.fullName || "Busque por nome ou CPF..."}<ChevronsUpDown className="h-4 w-4" /></Button></PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command><CommandInput onValueChange={setClienteSearch} placeholder="Buscar cliente..." /><CommandList><CommandEmpty>Nenhum cliente encontrado.</CommandEmpty><CommandGroup>
                        {clientes?.map(c => <CommandItem key={c._id} value={c.fullName} onSelect={() => { setValue('cliente', c); setClientePopoverOpen(false); }}>{c.fullName}</CommandItem>)}
                      </CommandGroup></CommandList></Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
            <div><Label htmlFor="valorTotal">Valor Total da Venda (R$)</Label><Input id="valorTotal" type="number" step="0.01" {...register('valorTotal')} /></div>
            <div><Label htmlFor="valorEntrada">Valor da Entrada (R$)</Label><Input id="valorEntrada" type="number" step="0.01" {...register('valorEntrada')} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Configuração do Parcelamento</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            <div><Label htmlFor="numParcelas">Nº de Parcelas</Label><Input id="numParcelas" type="number" {...register('numParcelas')} /></div>
            <div><Label htmlFor="dataPrimeiroVencimento">Data do 1º Vencimento</Label><Input id="dataPrimeiroVencimento" type="date" {...register('dataPrimeiroVencimento')} /></div>
            <div><Label>Valor por Parcela (Calculado)</Label><Input value={valorParcelaCalculado > 0 ? valorParcelaCalculado.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) : 'R$ 0,00'} disabled /></div>
          </CardContent>
        </Card>
      </div>
      <div className="col-span-1">
        <Card>
          <CardHeader><CardTitle>Prévia das Parcelas</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {previa.length > 0 ? previa.map((p, i) => (
              <div key={i} className="flex justify-between p-2 bg-gray-50 rounded-md text-sm">
                <span>Parcela {i + 1}</span>
                <span className='font-mono'>{p.data}</span>
                <span className="font-semibold">{p.valor.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
              </div>
            )) : <p className="text-sm text-gray-500">Preencha os dados para ver a prévia.</p>}
          </CardContent>
        </Card>
      </div>
      <div className="col-span-1 lg:col-span-3 text-right">
        <Button size="lg" type="submit" disabled={isPending} className="w-40 ">
          {isPending ? <div className="loader"></div> : 'Gerar Boletos'}
        </Button>
      </div>
    </form>
  );
}

export default withAuth(GerarParcelamentoPage);