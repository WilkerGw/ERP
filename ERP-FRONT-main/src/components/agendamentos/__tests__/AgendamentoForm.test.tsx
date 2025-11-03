

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgendamentoForm from '../AgendamentoForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Importa as ferramentas de mock
import { rest } from 'msw';
import { server } from '../../../__mocks__/server';

const queryClient = new QueryClient({
  // Desativa as tentativas automáticas durante os testes para um resultado mais rápido
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('Componente AgendamentoForm', () => {
  
  it('deve exibir mensagens de erro ao submeter com campos obrigatórios vazios', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();
    renderWithProvider(<AgendamentoForm onSuccess={mockOnSuccess} initialData={null} />);

    const submitButton = screen.getByRole('button', { name: /salvar agendamento/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/O nome deve ter no mínimo 3 caracteres./i)).toBeInTheDocument();
    });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('deve chamar a função onSuccess com dados válidos', async () => {
    // Configura uma resposta de sucesso para a nossa API de mock
    server.use(
      rest.post('http://localhost:3001/api/agendamentos', (req, res, ctx) => {
        return res(ctx.status(201), ctx.json({ message: 'Success' }));
      })
    );

    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();
    renderWithProvider(<AgendamentoForm onSuccess={mockOnSuccess} initialData={null} />);
    
    await user.type(screen.getByLabelText(/nome completo/i), 'Cliente de Teste Válido');
    await user.type(screen.getByLabelText(/telefone \/ WhatsApp/i), '11912345678');
    await user.type(screen.getByLabelText(/data/i), '2025-10-10');
    await user.type(screen.getByLabelText(/hora/i), '15:00');

    const submitButton = screen.getByRole('button', { name: /salvar agendamento/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

});