import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import Produto from '../models/Produto';
import User from '../models/User';
import jwt from 'jsonwebtoken';

describe('Testes de Integração para Produtos', () => {
  let token: string;

  beforeAll(async () => {
    const mongoUriTest = process.env.MONGO_URI_TEST as string;
    await mongoose.connect(mongoUriTest);

    await User.deleteMany({});
    const user = await User.create({
      nome: 'Test User',
      email: 'test@example.com',
      senha: 'password123',
    });
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await Produto.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Produto.deleteMany({});
  });

  // Teste GET que já tínhamos
  it('Deve retornar uma lista de produtos ao fazer GET em /api/produtos', async () => {
    await Produto.create([
      { codigo: 'SOL001', nome: 'Óculos de Sol Aviador', tipo: 'Óculos de Sol', precoCusto: 50, precoVenda: 150, estoque: 10 },
      { codigo: 'GRAU002', nome: 'Armação de Grau Redonda', tipo: 'Óculos de Grau', precoCusto: 80, precoVenda: 250, estoque: 5 },
    ]);
    const response = await request(app).get('/api/produtos').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  // --- NOVO TESTE DE CRIAÇÃO (POST) ---
  it('Deve criar um novo produto ao fazer POST em /api/produtos', async () => {
    const novoProduto = {
      codigo: 'TEST001',
      nome: 'Produto de Teste POST',
      tipo: 'Serviço/Conserto' as const,
      precoCusto: 10,
      precoVenda: 20,
      estoque: 100,
    };

    const response = await request(app)
      .post('/api/produtos')
      .set('Authorization', `Bearer ${token}`)
      .send(novoProduto);

    // Verifica a resposta da API
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.nome).toBe(novoProduto.nome);

    // Verifica se foi realmente salvo no banco de dados
    const produtoNoDB = await Produto.findById(response.body._id);
    expect(produtoNoDB).not.toBeNull();
    expect(produtoNoDB?.codigo).toBe(novoProduto.codigo);
  });

  // --- NOVO TESTE DE ATUALIZAÇÃO (PUT) ---
  it('Deve atualizar um produto existente ao fazer PUT em /api/produtos/:id', async () => {
    const produtoInicial = await Produto.create({
      codigo: 'UPD001', nome: 'Produto Original', tipo: 'Óculos de Sol', precoCusto: 50, precoVenda: 100, estoque: 10
    });
    const dadosAtualizados = { nome: 'Produto Atualizado', precoVenda: 125 };

    const response = await request(app)
      .put(`/api/produtos/${produtoInicial._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(dadosAtualizados);

    expect(response.status).toBe(200);
    expect(response.body.nome).toBe(dadosAtualizados.nome);
    expect(response.body.precoVenda).toBe(dadosAtualizados.precoVenda);
  });

  // --- NOVO TESTE DE EXCLUSÃO (DELETE) ---
  it('Deve excluir um produto ao fazer DELETE em /api/produtos/:id', async () => {
    const produto = await Produto.create({
      codigo: 'DEL001', nome: 'Produto a Deletar', tipo: 'Lente de Contato', precoCusto: 20, precoVenda: 50, estoque: 30
    });

    const response = await request(app)
      .delete(`/api/produtos/${produto._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Produto deletado com sucesso');

    // Verifica se foi realmente removido do banco de dados
    const produtoNoDB = await Produto.findById(produto._id);
    expect(produtoNoDB).toBeNull();
  });
  
  // Teste de autenticação que já tínhamos
  it('Deve retornar 401 Unauthorized se nenhum token for fornecido', async () => {
    const response = await request(app).get('/api/produtos');
    expect(response.status).toBe(401);
  });
});