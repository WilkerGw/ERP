
export const formatCPF = (value: string): string => {
  if (!value) return '';
  const numericValue = value.replace(/\D/g, '');

  return numericValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
};