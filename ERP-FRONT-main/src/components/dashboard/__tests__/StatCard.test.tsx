
import { render, screen } from '@testing-library/react';
import StatCard from '../StatCard'; // Importa o componente que vamos testar
import { BarChart } from 'lucide-react'; // Importa um ícone para o teste

// Descreve o conjunto de testes para o componente StatCard
describe('Componente StatCard', () => {
  
  // O caso de teste individual
  it('deve renderizar o título, valor e ícone corretamente', () => {
    // 1. Arrange (Preparação): Define as propriedades que o componente receberá.
    const title = "Vendas Totais";
    const value = "R$ 1.234,56";
    const icon = <BarChart data-testid="barchart-icon" />; // Adicionamos um test-id para encontrar o ícone

    // 2. Act (Ação): Renderiza o componente com as propriedades definidas.
    // A função render() da RTL cria um ambiente virtual para nosso componente.
    render(<StatCard title={title} value={value} icon={icon} />);

    // 3. Assert (Verificação): Verifica se o que foi renderizado está correto.
    // 'screen' representa a "tela" do nosso componente virtual.
    
    // Procuramos pelo texto do título na tela e esperamos que ele exista.
    const titleElement = screen.getByText("Vendas Totais");
    expect(titleElement).toBeInTheDocument();

    // Procuramos pelo texto do valor na tela e esperamos que ele exista.
    const valueElement = screen.getByText("R$ 1.234,56");
    expect(valueElement).toBeInTheDocument();

    // Procuramos pelo ícone usando o 'data-testid' que adicionamos.
    const iconElement = screen.getByTestId("barchart-icon");
    expect(iconElement).toBeInTheDocument();
  });

});