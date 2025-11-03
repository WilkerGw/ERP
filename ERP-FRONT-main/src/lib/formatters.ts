// Caminho: ERP-FRONT-main/src/lib/formatters.ts

// Esta função formata um número para o padrão de moeda BRL: R$ 1.234,56
export const formatCurrency = (value?: number): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return "R$ 0,00"; 
  }
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

// Esta função formata uma string de data para o padrão brasileiro: 20/05/2024
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// Esta função formata uma string para o padrão de telefone: (99) 99999-9999
export const formatPhone = (value: string): string => {
  const numericValue = value.replace(/\D/g, '');
  if (numericValue.length > 10) {
    return numericValue
      .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      .slice(0, 15);
  } else {
    return numericValue
      .replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
      .slice(0, 14);
  }
};

// Esta função formata uma string para o padrão de CPF: 999.999.999-99
export const formatCPF = (value: string): string => {
  const numericValue = value.replace(/\D/g, '');
  return numericValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
};

// Esta função formata uma string para o padrão de CEP: 99999-999
export const formatCEP = (value: string): string => {
  const numericValue = value.replace(/\D/g, '');
  return numericValue
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
};

// Prepara o número de telefone para ser usado em um link do WhatsApp
export const formatPhoneForWhatsApp = (phone: string): string => {
  const numericValue = phone.replace(/\D/g, '');
  if (numericValue.startsWith('55')) {
    return numericValue;
  }
  return `55${numericValue}`;
};