// Caminho: ERP-BACK-main/src/__tests__/boletos.integration.test.ts

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import Boleto from '../models/Boleto';
import Cliente, { ICliente } from '../models/Cliente';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';

describe('Testes de Integração para Boletos', () => {
  let token: string;
  let testClienteId: string;
  let testUserId: string;

  beforeAll(async () => {
    const mongoUriTest = process.env.MONGO_URI_TEST as string;
    await mongoose.connect(mongoUriTest);

    await User.deleteMany({});
    await Cliente.deleteMany({});
    
    const user: IUser = await User.create({ nome: 'Test User', email: 'boletotest@example.com', senha: 'password123' });
    testUserId = user._id.toString();

    const cliente: ICliente = await Cliente.create({ 
        fullName: 'Cliente dos Boletos', 
        cpf: '987.654.321-00', 
        phone: '1111', 
        birthDate: new Date(), 
        user: testUserId 
    });
    
    testClienteId = cliente._id.toString();
    token = jwt.sign({ id: testUserId }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Boleto.deleteMany({});
  });

  it('Deve criar um parcelamento com múltiplos boletos via POST /api/boletos/parcelamento', async () => {
    const dadosParcelamento = {
      clienteId: testClienteId,
      valorTotal: 1000,
      valorEntrada: 100,
      numParcelas: 3,
      dataPrimeiroVencimento: '2025-10-01',
    };

    const response = await request(app)
      .post('/api/boletos/parcelamento')
      .set('Authorization', `Bearer ${token}`)
      .send(dadosParcelamento);

    expect(response.status).toBe(201);
    
    const boletosNoDB = await Boleto.find({ client: testClienteId });
    
    expect(boletosNoDB.length).toBe(3);
    expect(boletosNoDB[0].parcelValue).toBe(300);
    expect(boletosNoDB[0].description).toBe('Parcela 1/3');
    expect(boletosNoDB[2].dueDate.getUTCMonth()).toBe(11);
  });

  it('Deve listar os boletos agrupados por mês via GET /api/boletos', async () => {
    await request(app)
      .post('/api/boletos/parcelamento')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clienteId: testClienteId,
        valorTotal: 500,
        numParcelas: 2,
        dataPrimeiroVencimento: '2025-11-15',
      });

    const response = await request(app)
      .get('/api/boletos?status=Todos')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0]._id.mes).toBe(12);
    expect(response.body[0].boletos[0].parcelValue).toBe(250);
  });

  it('Deve marcar um boleto como pago via PATCH /api/boletos/:id/status', async () => {
    const boleto = await Boleto.create({
      client: testClienteId,
      parcelValue: 100,
      dueDate: new Date(),
      description: '1/1',
      status: 'aberto',
      valorTotalVenda: 100,
    });

    const response = await request(app)
      .patch(`/api/boletos/${boleto._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'pago' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('pago');

    const boletoNoDB = await Boleto.findById(boleto._id);
    expect(boletoNoDB?.status).toBe('pago');
  });
});