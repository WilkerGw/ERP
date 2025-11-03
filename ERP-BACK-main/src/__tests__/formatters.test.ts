import { formatCPF } from '../utils/formatters';

// Grupo de testes para as funções de formatação
describe('Formatadores de Utilidades', () => {

  // Sub-grupo de testes especificamente para a função formatCPF
  describe('formatCPF', () => {

    it('deve formatar uma string de 11 dígitos em um CPF válido', () => {
      const entrada = '12345678900';
      const saidaEsperada = '123.456.789-00';
      
      // A asserção: esperamos que o resultado da função seja o valor esperado
      expect(formatCPF(entrada)).toBe(saidaEsperada);
    });

    it('deve formatar uma string parcial corretamente', () => {
      expect(formatCPF('12345')).toBe('123.45');
      expect(formatCPF('12345678')).toBe('123.456.78');
    });

    it('deve ignorar caracteres não numéricos e formatar corretamente', () => {
      expect(formatCPF('123.abc.456-78')).toBe('123.456.78');
    });

    it('deve retornar uma string vazia se a entrada for vazia', () => {
      expect(formatCPF('')).toBe('');
    });
    
  });

});