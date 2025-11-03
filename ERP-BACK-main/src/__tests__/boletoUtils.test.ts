import { calcularParcelas } from '../utils/boletoUtils';

describe('Utilidades de Boleto - calcularParcelas', () => {
  
  it('deve calcular as parcelas corretamente sem valor de entrada', () => {
    const resultado = calcularParcelas({
      valorTotal: 1200,
      numParcelas: 12,
      dataPrimeiroVencimento: '2025-08-05',
    });

    expect(resultado.length).toBe(12);
    expect(resultado[0].valor).toBe(100);
    expect(resultado[0].dataVencimento.getUTCMonth()).toBe(7); // Mês 7 = Agosto
    expect(resultado[11].dataVencimento.getUTCMonth()).toBe(6); // Mês 6 = Julho (do ano seguinte)
    expect(resultado[11].dataVencimento.getUTCFullYear()).toBe(2026);
  });

  it('deve calcular as parcelas corretamente COM valor de entrada', () => {
    const resultado = calcularParcelas({
      valorTotal: 1200,
      valorEntrada: 200,
      numParcelas: 10,
      dataPrimeiroVencimento: '2025-09-10',
    });

    expect(resultado.length).toBe(10);
    expect(resultado[0].valor).toBe(100);
    expect(resultado[0].dataVencimento.getUTCDate()).toBe(10);
    expect(resultado[0].dataVencimento.getUTCMonth()).toBe(8); // Mês 8 = Setembro
  });

  it('deve lidar com valores que geram dízimas (ex: R$ 1000 em 3x)', () => {
    const resultado = calcularParcelas({
      valorTotal: 1000,
      numParcelas: 3,
      dataPrimeiroVencimento: '2025-01-01',
    });

    expect(resultado.length).toBe(3);
    expect(resultado[0].valor).toBe(333.33);
  });

  it('deve retornar uma única parcela com o valor total se numParcelas for 1', () => {
    const resultado = calcularParcelas({
      valorTotal: 500,
      numParcelas: 1,
      dataPrimeiroVencimento: '2025-02-15',
    });

    expect(resultado.length).toBe(1);
    expect(resultado[0].valor).toBe(500);
  });

  it('deve lançar um erro se o número de parcelas for zero ou negativo', () => {
    expect(() => {
      calcularParcelas({ valorTotal: 100, numParcelas: 0, dataPrimeiroVencimento: '2025-01-01' });
    }).toThrow('O número de parcelas deve ser maior que zero.');
  });
});