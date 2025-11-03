import { getDashboardDateRanges } from '../utils/dateUtils';

describe('Utilidades de Data - getDashboardDateRanges', () => {

  // Usamos uma data fixa para todos os testes neste grupo
  const dataDeReferencia = new Date('2025-08-15T14:30:00.000Z');

  it('deve calcular corretamente o início do dia de referência', () => {
    const { hoje } = getDashboardDateRanges(dataDeReferencia);
    // toISOString() converte para UTC, garantindo que o teste não dependa do fuso horário
    expect(hoje.toISOString()).toBe('2025-08-15T00:00:00.000Z');
  });

  it('deve calcular corretamente o início do dia seguinte', () => {
    const { amanha } = getDashboardDateRanges(dataDeReferencia);
    expect(amanha.toISOString()).toBe('2025-08-16T00:00:00.000Z');
  });

  it('deve calcular corretamente o início do mês', () => {
    const { inicioMes } = getDashboardDateRanges(dataDeReferencia);
    expect(inicioMes.toISOString()).toBe('2025-08-01T00:00:00.000Z');
  });

  it('deve retornar o número do mês correto (1-12)', () => {
    const { mesAtual } = getDashboardDateRanges(dataDeReferencia);
    // Agosto é o mês 8
    expect(mesAtual).toBe(8);
  });

  it('deve calcular corretamente a data de 7 dias no futuro', () => {
    const { proximos7dias } = getDashboardDateRanges(dataDeReferencia);
    // 15 + 7 = 22
    expect(proximos7dias.toISOString()).toBe('2025-08-22T00:00:00.000Z');
  });

});