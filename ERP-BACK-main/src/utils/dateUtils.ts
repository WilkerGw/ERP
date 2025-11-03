/**
 * Calcula vários intervalos de datas com base em uma data de referência.
 * @param dataReferencia A data a ser usada como "hoje" para os cálculos.
 * @returns Um objeto contendo os intervalos de data calculados.
 */
export const getDashboardDateRanges = (dataReferencia: Date) => {
  const hoje = new Date(dataReferencia);
  // Usamos setUTCHours para zerar o dia em UTC
  hoje.setUTCHours(0, 0, 0, 0);

  const amanha = new Date(hoje);
  // Usamos setUTCDate e getUTCDate para adicionar um dia em UTC
  amanha.setUTCDate(hoje.getUTCDate() + 1);

  // Criamos o início do mês diretamente em UTC
  const inicioMes = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), 1));
  
  // Usamos getUTCMonth para pegar o mês em UTC
  const mesAtual = hoje.getUTCMonth() + 1;

  const proximos7dias = new Date(hoje);
  // Adicionamos 7 dias em UTC
  proximos7dias.setUTCDate(hoje.getUTCDate() + 7);

  return {
    hoje,
    amanha,
    inicioMes,
    mesAtual,
    proximos7dias,
  };
};