import { getStatusFromBooleans, getBooleansFromStatus } from '../utils/agendamentoUtils';

describe('Utilidades de Agendamento', () => {

  describe('getStatusFromBooleans', () => {
    it('deve retornar "Compareceu" se compareceu for true', () => {
      expect(getStatusFromBooleans({ compareceu: true, faltou: false })).toBe('Compareceu');
    });

    it('deve retornar "Faltou" se faltou for true', () => {
      expect(getStatusFromBooleans({ compareceu: false, faltou: true })).toBe('Faltou');
    });

    it('deve retornar "Aberto" se ambos forem false', () => {
      expect(getStatusFromBooleans({ compareceu: false, faltou: false })).toBe('Aberto');
    });

    it('deve retornar "Compareceu" mesmo se faltou for true (presença tem prioridade)', () => {
      expect(getStatusFromBooleans({ compareceu: true, faltou: true })).toBe('Compareceu');
    });
  });

  describe('getBooleansFromStatus', () => {
    it('deve retornar o objeto correto para o status "Compareceu"', () => {
      const esperado = { compareceu: true, faltou: false };
      expect(getBooleansFromStatus('Compareceu')).toEqual(esperado);
    });

    it('deve retornar o objeto correto para o status "Faltou"', () => {
      const esperado = { compareceu: false, faltou: true };
      expect(getBooleansFromStatus('Faltou')).toEqual(esperado);
    });

    it('deve retornar o objeto correto para o status "Aberto"', () => {
      const esperado = { compareceu: false, faltou: false };
      expect(getBooleansFromStatus('Aberto')).toEqual(esperado);
    });

    it('deve retornar o objeto correto para o status "Cancelado"', () => {
      const esperado = { compareceu: false, faltou: false };
      expect(getBooleansFromStatus('Cancelado')).toEqual(esperado);
    });
  });

});