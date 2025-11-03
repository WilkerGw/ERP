interface ParcelamentoInput {
  valorTotal: number;
  valorEntrada?: number;
  numParcelas: number;
  dataPrimeiroVencimento: string | Date;
}

interface Parcela {
  valor: number;
  dataVencimento: Date;
}

export const calcularParcelas = ({
  valorTotal,
  valorEntrada = 0,
  numParcelas,
  dataPrimeiroVencimento,
}: ParcelamentoInput): Parcela[] => {
  if (numParcelas <= 0) {
    throw new Error('O número de parcelas deve ser maior que zero.');
  }

  const valorAParcelar = valorTotal - valorEntrada;
  if (valorAParcelar < 0) {
    throw new Error('O valor de entrada não pode ser maior que o valor total.');
  }

  // Usamos toFixed(2) para lidar com problemas de precisão de ponto flutuante
  const valorParcela = parseFloat((valorAParcelar / numParcelas).toFixed(2));

  const parcelas: Parcela[] = [];
  // Usamos new Date() para garantir que não estamos modificando a data original
  let dataVencimento = new Date(dataPrimeiroVencimento);
  // Adicionamos 'Z' para tratar a data como UTC e evitar problemas de fuso horário
  if (typeof dataPrimeiroVencimento === 'string' && !dataPrimeiroVencimento.endsWith('Z')) {
    dataVencimento = new Date(dataPrimeiroVencimento + 'T12:00:00Z');
  }


  for (let i = 0; i < numParcelas; i++) {
    parcelas.push({
      valor: valorParcela,
      dataVencimento: new Date(dataVencimento),
    });
    // Incrementa o mês para a próxima parcela
    dataVencimento.setMonth(dataVencimento.getMonth() + 1);
  }

  return parcelas;
};
