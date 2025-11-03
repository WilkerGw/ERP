import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import Cliente from '../models/Cliente';
import User from '../models/User';
import jwt from 'jsonwebtoken';

describe('Testes de Integração para Clientes', () => {
  let token: string;

  beforeAll(async () => {
    const mongoUriTest = process.env.MONGO_URI_TEST as string;
    await mongoose.connect(mongoUriTest);

    await User.deleteMany({});
    const user = await User.create({
      nome: 'Test User',
      email: 'clienttest@example.com',
      senha: 'password123',
    });
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Cliente.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Cliente.deleteMany({});
  });

  it('Deve criar um novo cliente via POST /api/clientes', async () => {
    const novoCliente = {
      fullName: 'João da Silva Teste',
      cpf: '111.222.333-44',
      phone: '(11) 99999-8888',
      birthDate: '1990-01-15',
      gender: 'Masculino',
      cep: '01001000',
      address: 'Praça da Sé, Sé, São Paulo/SP'
    };

    const response = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send(novoCliente);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.fullName).toBe(novoCliente.fullName);

    const clienteNoDB = await Cliente.findById(response.body._id);
    expect(clienteNoDB).not.toBeNull();
    expect(clienteNoDB?.cpf).toBe(novoCliente.cpf);
  });

  it('Deve listar todos os clientes via GET /api/clientes', async () => {
    await Cliente.create([
      { fullName: 'Ana Maria', cpf: '222.333.444-55', phone: '11988887777', birthDate: new Date('1985-05-20'), gender: 'Feminino', cep: '02002000', address: 'Rua B' },
      { fullName: 'Carlos Alberto', cpf: '333.444.555-66', phone: '11977776666', birthDate: new Date('1992-11-30'), gender: 'Masculino', cep: '03003000', address: 'Rua C' }
    ]);

    const response = await request(app)
      .get('/api/clientes')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].fullName).toBe('Ana Maria');
  });

  it('Deve buscar clientes pelo nome via GET /api/clientes?search=', async () => {
    await Cliente.create({ fullName: 'Cliente Para Buscar', cpf: '444.555.666-77', phone: '11966665555', birthDate: new Date('2000-01-01'), gender: 'Outro', cep: '04004000', address: 'Rua D' });
    await Cliente.create({ fullName: 'Outro Cliente', cpf: '999.888.777-66', phone: '11911112222', birthDate: new Date('2001-02-02'), gender: 'Outro', cep: '04004001', address: 'Rua E' });

    const response = await request(app)
      .get('/api/clientes?search=Para Buscar')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].cpf).toBe('444.555.666-77');
  });

  it('Deve atualizar um cliente via PUT /api/clientes/:id', async () => {
    const cliente = await Cliente.create({ fullName: 'Cliente Original', cpf: '555.666.777-88', phone: '11955554444', birthDate: new Date('1995-03-10'), gender: 'Feminino', cep: '05005000', address: 'Rua E' });
    const dadosAtualizados = { phone: '(11) 91234-5678', notes: 'Cliente atualizado via teste' };

    const response = await request(app)
      .put(`/api/clientes/${cliente._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(dadosAtualizados);

    expect(response.status).toBe(200);
    expect(response.body.phone).toBe(dadosAtualizados.phone);
    expect(response.body.notes).toBe(dadosAtualizados.notes);
  });
  
  it('Deve excluir um cliente via DELETE /api/clientes/:id', async () => {
    const cliente = await Cliente.create({ fullName: 'Cliente a Deletar', cpf: '666.777.888-99', phone: '11944443333', birthDate: new Date('1998-07-25'), gender: 'Masculino', cep: '06006000', address: 'Rua F' });

    const response = await request(app)
      .delete(`/api/clientes/${cliente._id}`)
      .set('Authorization', `Bearer ${token}`);
      
    expect(response.status).toBe(200);

    const clienteNoDB = await Cliente.findById(cliente._id);
    expect(clienteNoDB).toBeNull();
  });
});