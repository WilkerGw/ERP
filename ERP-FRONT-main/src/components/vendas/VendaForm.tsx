// Caminho: src/components/vendas/VendaForm.tsx

"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Trash2, PlusCircle } from 'lucide-react';
import api from '@/services/api';
import { vendaFormValidator, TVendaFormValidator } from '@/lib/validators/vendaValidator';
import { formatCurrency, formatCPF } from '@/lib/formatters';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import AddClientForm from '@/components/clientes/AddClientForm';
import { Toaster, toast } from 'sonner';

// Interfaces
interface ICliente {
  _id: string;
  fullName: string;
  cpf?: string;
  phone?: string;
}

interface IProduto {
  _id: string;
  nome: string;
  precoVenda: number; // Adicionado para preenchimento automático
}

interface VendaFormProps {
  // --- ALTERAÇÃO AQUI ---
  // Garantimos que o initialData possa ter o campo dataVenda
  initialData?: Partial<TVendaFormValidator & { cliente?: ICliente; dataVenda?: string }>;
  vendaId?: string;
}

// --- FUNÇÃO AUXILIAR PARA FORMATAR A DATA ---
// Converte a data para o formato YYYY-MM-DD esperado pelo <input type="date">
const formatDateForInput = (dateString?: string | Date): string => {
  if (!dateString) {
    return new Date().toISOString().split('T')[0];
  }
  return new Date(dateString).toISOString().split('T')[0];
};


export const VendaForm = ({ initialData, vendaId }: VendaFormProps) => {
  const router = useRouter();
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [produtos, setProdutos] = useState<IProduto[]>([]);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [buscaProduto, setBuscaProduto] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<ICliente | null>(initialData?.cliente || null);

  // Novos estados para o fluxo de cadastro de cliente
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clienteNaoEncontrado, setClienteNaoEncontrado] = useState(false);

  const isEditMode = !!vendaId;

  const form = useForm<TVendaFormValidator>({
    resolver: zodResolver(vendaFormValidator),
    defaultValues: initialData ? 
    {
      ...initialData,
      // --- ALTERAÇÃO AQUI ---
      // Garante que a data venha formatada corretamente para o input
      dataVenda: formatDateForInput(initialData.dataVenda),
    } : 
    {
      clienteId: '',
      produtos: [],
      // --- ALTERAÇÃO AQUI ---
      // Define a data de hoje como padrão para novas vendas
      dataVenda: formatDateForInput(),
      valorEntrada: 0,
      condicaoPagamento: 'À vista',
      metodoPagamento: 'Dinheiro',
      parcelas: 1,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "produtos",
  });

  // Efeito de busca de cliente atualizado
  useEffect(() => {
    const fetchClientes = async () => {
      // Começa a busca com 3 ou mais caracteres para nomes, ou quando for um CPF
      const isCpfSearch = buscaCliente.replace(/\D/g, '').length >= 11;
      if (buscaCliente.length < 3 && !isCpfSearch) {
        setClientes([]);
        setClienteNaoEncontrado(false);
        return;
      }
      try {
        const { data } = await api.get(`/clientes?search=${buscaCliente}`);
        setClientes(data);
        // Verifica se é um CPF e não encontrou resultados
        if (data.length === 0 && isCpfSearch) {
          setClienteNaoEncontrado(true);
        } else {
          setClienteNaoEncontrado(false);
        }
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        setClientes([]);
        setClienteNaoEncontrado(false);
      }
    };
    const debounce = setTimeout(fetchClientes, 300);
    return () => clearTimeout(debounce);
  }, [buscaCliente]);

  // Efeito de busca de produto (com preenchimento automático de preço)
  useEffect(() => {
    const fetchProdutos = async () => {
      if (buscaProduto.length >= 2) {
        try {
          const { data } = await api.get(`/produtos?search=${buscaProduto}`);
          setProdutos(data);
        } catch (error) { console.error("Erro ao buscar produtos:", error); }
      } else { setProdutos([]); }
    };
    const debounce = setTimeout(fetchProdutos, 300);
    return () => clearTimeout(debounce);
  }, [buscaProduto]);

  const selecionarCliente = (cliente: ICliente) => {
    form.setValue('clienteId', cliente._id);
    setClienteSelecionado(cliente);
    setBuscaCliente('');
    setClientes([]);
    setClienteNaoEncontrado(false);
  };

  const adicionarProduto = (produto: IProduto) => {
    append({
      produtoId: produto._id,
      nome: produto.nome,
      quantidade: 1,
      valorUnitario: produto.precoVenda || 0 // Preenche o preço de venda automaticamente
    });
    setBuscaProduto('');
    setProdutos([]);
  };

  // Handler para quando um novo cliente é cadastrado no modal
  const handleClienteCadastrado = (novoCliente: ICliente) => {
    setIsClientModalOpen(false);
    selecionarCliente(novoCliente);
    toast.success(`Cliente ${novoCliente.fullName} selecionado.`);
  };


  const produtosDaVenda = form.watch('produtos');
  const valorEntrada = form.watch('valorEntrada');
  const condicaoPagamento = form.watch('condicaoPagamento');
  
  const valorTotal = produtosDaVenda.reduce((acc, produto) => acc + (produto.quantidade * produto.valorUnitario), 0);
  const valorRestante = valorTotal - (valorEntrada || 0);
  const porcentagemEntradaCalculada = valorTotal > 0 ? ((valorEntrada || 0) / valorTotal) * 100 : 0;

  const onSubmit = async (data: TVendaFormValidator) => {
    try {
      const payload = {
        cliente: data.clienteId,
        // --- ADICIONADO AQUI ---
        // Passamos a data da venda para o backend
        dataVenda: data.dataVenda, 
        produtos: data.produtos.map(p => ({
            produto: p.produtoId,
            quantidade: p.quantidade,
            valorUnitario: p.valorUnitario
        })),
        pagamento: {
          valorEntrada: data.valorEntrada,
          valorRestante: valorRestante,
          metodoPagamento: data.metodoPagamento,
          condicaoPagamento: data.condicaoPagamento,
          parcelas: data.condicaoPagamento === 'A prazo' ? data.parcelas : undefined
        }
      };

      if (isEditMode) {
        await api.put(`/vendas/${vendaId}`, payload);
        toast.success('Venda atualizada com sucesso!');
        router.push(`/vendas/${vendaId}`);
      } else {
        await api.post('/vendas', payload);
        toast.success('Venda criada com sucesso!');
        form.reset();
        setClienteSelecionado(null);
        router.push('/vendas');
      }
    } catch (error) {
      console.error("Erro ao processar venda:", error);
      const errorMessage = error instanceof AxiosError && error.response?.data?.message
        ? `Falha: ${error.response.data.message}`
        : 'Falha ao processar a venda. Verifique os dados e tente novamente.';
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader><CardTitle className='text-white'>1. Cliente</CardTitle></CardHeader>
            <CardContent>
              {!isEditMode && !clienteSelecionado ? (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  {/* DOCUMENTAÇÃO:
                    - O `onChange` do Input foi modificado.
                    - Agora, ele verifica se o valor digitado contém apenas números (ignorando os caracteres de formatação).
                    - Se for um CPF, a função `formatCPF` é chamada para adicionar a máscara (pontos e hífen) automaticamente.
                    - Caso contrário, o valor é tratado como um nome normal.
                  */}
                  <Input
                    placeholder="Buscar cliente por nome ou CPF..."
                    value={buscaCliente}
                    onChange={(e) => {
                      const { value } = e.target;
                      // Remove caracteres não numéricos para verificar se é um CPF
                      const justNumbers = value.replace(/\D/g, '');
                      // Aplica a máscara de CPF se o usuário estiver digitando números
                      if (!isNaN(Number(justNumbers)) && justNumbers.length <= 11) {
                        setBuscaCliente(formatCPF(value));
                      } else {
                        setBuscaCliente(value);
                      }
                    }}
                    className="pl-10"
                  />
                  {/* Dropdown de resultados */}
                  {clientes.length > 0 && (
                    <ul className="absolute z-100 w-full border rounded-2xl mt-1 max-h-60 overflow-y-auto shadow-lg">
                      {clientes.map(cliente => (
                        <li key={cliente._id} onClick={() => selecionarCliente(cliente)} className="p-2 backdrop-blur-[4px] cursor-pointer text-white z-10">
                          {cliente.fullName}
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* Botão para cadastrar novo cliente */}
                  {clienteNaoEncontrado && (
                    <div className="text-center mt-2">
                        <Button type="button" variant="outline" onClick={() => setIsClientModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Cliente não encontrado. Cadastrar?
                        </Button>
                    </div>
                  )}
                </div>
              ) : null }
              {clienteSelecionado && (
                <div className="mt-4 p-3 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">Cliente Selecionado:</p>
                    <p className='text-white'>{clienteSelecionado.fullName}</p>
                  </div>
                  {!isEditMode && (
                    <Button variant="outline" size="sm" onClick={() => setClienteSelecionado(null)}>
                        Alterar
                    </Button>
                  )}
                </div>
              )}
              <FormField control={form.control} name="clienteId" render={({ field }) => (<FormItem><FormControl><Input type="hidden" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>

          <Card className="mt-[3rem]">
            <CardHeader><CardTitle className='text-white'>2. Produtos</CardTitle></CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar produto por nome..."
                  value={buscaProduto}
                  onChange={(e) => setBuscaProduto(e.target.value)}
                  className="pl-10"
                />
                {produtos.length > 0 && (
                  <ul className="absolute z-10 w-full border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {produtos.map(produto => (
                      <li key={produto._id} onClick={() => adicionarProduto(produto)} className="p-2 hover:bg-gray-100 cursor-pointer text-gray-800">
                        {produto.nome}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="w-24">Qtd.</TableHead>
                    <TableHead className="w-36">Valor Unitário</TableHead>
                    <TableHead className="w-36 text-right">Subtotal</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className='text-white'>{field.nome}</TableCell>
                      <TableCell>
                        <FormField control={form.control} name={`produtos.${index}.quantidade`} render={({ field }) => (<Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />)} />
                      </TableCell>
                      <TableCell>
                        <FormField control={form.control} name={`produtos.${index}.valorUnitario`} render={({ field }) => (<Input type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />)} />
                      </TableCell>
                      <TableCell className="text-right text-white">{formatCurrency(produtosDaVenda[index].quantidade * produtosDaVenda[index].valorUnitario)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {form.formState.errors.produtos && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.produtos.message}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>3. Pagamento e Data</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* --- CAMPO DE DATA ADICIONADO AQUI --- */}
              <FormField 
                control={form.control} 
                name="dataVenda" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Venda</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />

              <FormField control={form.control} name="valorEntrada" render={({ field }) => (<FormItem><FormLabel>Entrada (R$)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="Ex: 100,00" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="condicaoPagamento" render={({ field }) => (<FormItem><FormLabel>Condição</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione a condição" /></SelectTrigger></FormControl><SelectContent><SelectItem value="À vista">À vista</SelectItem><SelectItem value="A prazo">A prazo</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="metodoPagamento" render={({ field }) => (<FormItem><FormLabel>Forma de Pagamento</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione a forma" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Dinheiro">Dinheiro</SelectItem><SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem><SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem><SelectItem value="PIX">PIX</SelectItem><SelectItem value="Boleto">Boleto</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              {condicaoPagamento === 'A prazo' && (<FormField control={form.control} name="parcelas" render={({ field }) => (<FormItem><FormLabel>Parcelas</FormLabel><FormControl><Input type="number" placeholder="Ex: 3" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />)}
            </CardContent>
            <CardFooter className="flex justify-end p-4 rounded-b-md text-white">
              <div className='text-right'>
                <p>Valor de Entrada: <span className='font-bold'>{formatCurrency(valorEntrada)} ({porcentagemEntradaCalculada.toFixed(2)}%)</span></p>
                <p>Valor Restante: <span className='font-bold'>{formatCurrency(valorRestante)}</span></p>
                <p className='text-xl font-bold mt-2'>Total da Venda: {formatCurrency(valorTotal)}</p>
              </div>
            </CardFooter>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting} className='text-white cursor-pointer'>
              {form.formState.isSubmitting ? 'Salvando...' : (isEditMode ? 'Atualizar Venda' : 'Finalizar Venda')}
            </Button>
          </div>
        </form>
      </Form>

      {/* Modal de Cadastro de Cliente */}
      <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                <DialogDescription>
                    O cliente com o CPF informado não foi encontrado. Preencha os dados para cadastrá-lo.
                </DialogDescription>
            </DialogHeader>
            <AddClientForm
                onSuccess={handleClienteCadastrado}
                initialData={{ cpf: buscaCliente }}
            />
        </DialogContent>
      </Dialog>
    </>
  );
};