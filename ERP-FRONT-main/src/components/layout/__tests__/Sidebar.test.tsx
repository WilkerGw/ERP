
import { render, screen } from '@testing-library/react';
import Sidebar from '../Sidebar';

// --- TÉCNICA NOVA: MOCKING ---
// Dizemos ao Jest: "quando qualquer componente tentar importar de 'next/navigation',
// em vez do pacote real, entregue este objeto simulado que criamos".
jest.mock('next/navigation', () => ({
  usePathname: () => '/', // Simulamos o hook para que ele sempre retorne a rota '/' (Dashboard)
}));

describe('Componente Sidebar', () => {

  it('deve renderizar todos os links de navegação', () => {
    // 1. Act: Renderiza o componente
    render(<Sidebar />);

    // 2. Assert: Verifica se cada link está visível na tela para o usuário
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.getByText('Produtos')).toBeInTheDocument();
    expect(screen.getByText('Vendas')).toBeInTheDocument();
    expect(screen.getByText('Boletos')).toBeInTheDocument();
    expect(screen.getByText('Agendamentos')).toBeInTheDocument();
  });

  it('deve aplicar o estilo de link ativo para a rota atual', () => {
    render(<Sidebar />);
    
    // O link do Dashboard deve ter o estilo de "ativo", pois mockamos o pathname para '/'
    // Acessamos o elemento pelo texto e verificamos se a classe de fundo ativo está presente
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-gray-700');

    // O link de Clientes não deve ter o estilo de ativo
    const clientesLink = screen.getByText('Clientes').closest('a');
    expect(clientesLink).not.toHaveClass('bg-gray-700');
  });

});