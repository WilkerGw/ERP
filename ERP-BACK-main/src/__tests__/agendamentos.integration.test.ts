import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import Agendamento from '../models/Agendamento';
import User from '../models/User';
import jwt from 'jsonwebtoken';

describe('Testes de Integração para Agendamentos', () => {
  let token: string;

  beforeAll(async () => {
    const mongoUriTest = process.env.MONGO_URI_TEST as string;
    await mongoose.connect(mongoUriTest);

    await User.deleteMany({});
    const user = await User.create({
      nome: 'Test User Agendamento',
      email: 'agendamentotest@example.com',
      senha: 'password123',
    });
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Agendamento.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Agendamento.deleteMany({});
  });

  it('Deve criar um novo agendamento via POST /api/agendamentos', async () => {
    const novoAgendamento = {
      name: 'Cliente Agendado Teste',
      telephone: '11987654321',
      date: '2025-10-20',
      hour: '14:30',
      observation: 'Teste de observação',
      status: 'Aberto',
    };

    const response = await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send(novoAgendamento);

    expect(response.status).toBe(201);
    expect(response.body.name).toBe(novoAgendamento.name);

    // Verifica se os status booleanos foram salvos corretamente
    const agendamentoNoDB = await Agendamento.findById(response.body._id);
    expect(agendamentoNoDB?.compareceu).toBe(false);
    expect(agendamentoNoDB?.faltou).toBe(false);
  });

  it('Deve listar os agendamentos via GET /api/agendamentos', async () => {
    await Agendamento.create([
      { name: 'Primeiro Agendamento', telephone: '111', date: new Date('2025-11-01'), hour: '10:00' },
      { name: 'Segundo Agendamento', telephone: '222', date: new Date('2025-11-02'), hour: '11:00' },
    ]);

    const response = await request(app)
      .get('/api/agendamentos')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    // Verifica se a tradução de status para o frontend está funcionando
    expect(response.body[0].status).toBe('Aberto');
  });

  it('Deve atualizar um agendamento, incluindo o status, via PUT /api/agendamentos/:id', async () => {
    const agendamento = await Agendamento.create({ name: 'Cliente para Atualizar', telephone: '333', date: new Date(), hour: '15:00' });
    const dadosAtualizados = {
      hour: '16:00',
      status: 'Compareceu', // O frontend envia a string
    };

    const response = await request(app)
      .put(`/api/agendamentos/${agendamento._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(dadosAtualizados);

    expect(response.status).toBe(200);
    expect(response.body.hour).toBe('16:00');

    // Verifica se a tradução foi salva corretamente no banco
    const agendamentoNoDB = await Agendamento.findById(agendamento._id);
    expect(agendamentoNoDB?.compareceu).toBe(true);
    expect(agendamentoNoDB?.faltou).toBe(false);
  });

  it('Deve excluir um agendamento via DELETE /api/agendamentos/:id', async () => {
    const agendamento = await Agendamento.create({ name: 'Cliente a Deletar', telephone: '444', date: new Date(), hour: '17:00' });

    const response = await request(app)
      .delete(`/api/agendamentos/${agendamento._id}`)
      .set('Authorization', `Bearer ${token}`);
      
    expect(response.status).toBe(200);

    const agendamentoNoDB = await Agendamento.findById(agendamento._id);
    expect(agendamentoNoDB).toBeNull();
  });
});