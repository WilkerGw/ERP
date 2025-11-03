// Define a estrutura do objeto que a função espera
interface AgendamentoStatusBooleans {
  compareceu?: boolean;
  faltou?: boolean;
}

// Converte os booleans do DB para a string que o frontend usa
export const getStatusFromBooleans = (agendamento: AgendamentoStatusBooleans): string => {
  if (agendamento.compareceu) return 'Compareceu';
  if (agendamento.faltou) return 'Faltou';
  return 'Aberto';
};

// Converte a string do frontend para os booleans que o DB armazena
export const getBooleansFromStatus = (status: string) => {
  const booleans: AgendamentoStatusBooleans = {};
  switch (status) {
    case 'Compareceu':
      booleans.compareceu = true;
      booleans.faltou = false;
      break;
    case 'Faltou':
      booleans.compareceu = false;
      booleans.faltou = true;
      break;
    case 'Aberto':
    case 'Cancelado': // Cancelado também zera os status de presença
      booleans.compareceu = false;
      booleans.faltou = false;
      break;
  }
  return booleans;
};