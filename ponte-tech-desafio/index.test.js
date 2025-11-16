// Este é o arquivo index.test.js

const request = require('supertest'); // Nosso "imitador" de requisições
const app = require('./index'); // Nosso servidor (do index.js)
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// --- Limpeza do Banco ---
// Isso é VITAL para os testes. Limpamos a tabela de usuários antes de cada teste.
beforeEach(async () => {
  // Limpa tarefas primeiro (por causa da chave estrangeira)
  await prisma.tarefa.deleteMany({}); 
  // Limpa usuários
  await prisma.usuario.deleteMany({}); 
});

// --- Grupo de Testes: Autenticação (/api/auth) ---
describe('Autenticação API - /api/auth', () => {

  // --- Testes de Cadastro (Register) ---
  describe('POST /api/auth/register', () => {

    it('deve cadastrar um novo usuário com sucesso', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Usuário Teste',
          email: 'teste@email.com',
          senha: 'Senha@123',
        });

      expect(res.statusCode).toEqual(201); // 201 = Criado com Sucesso
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe('teste@email.com');
    });

    it('deve falhar ao cadastrar com email já existente', async () => {
      // 1. Cria um usuário primeiro
      await request(app).post('/api/auth/register').send({
        nome: 'Usuário Teste 1',
        email: 'teste@email.com',
        senha: 'Senha@123',
      });

      // 2. Tenta criar o mesmo usuário de novo
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Usuário Teste 2',
          email: 'teste@email.com',
          senha: 'Senha@456',
        });

      expect(res.statusCode).toEqual(400); // 400 = Requisição Ruim
      expect(res.body.error).toBe('Este email já está em uso.');
    });

    it('deve falhar se a senha for muito curta (menos de 8 caracteres)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Usuário Teste',
          email: 'teste@email.com',
          senha: '123', // Senha curta
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('mínimo 8 caracteres'); //
    });
  });

  // --- Testes de Login ---
  describe('POST /api/auth/login', () => {

    // Prepara o usuário no banco antes de tentar logar
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        nome: 'Usuário Login',
        email: 'login@teste.com',
        senha: 'SenhaCorreta123',
      });
    });

    it('deve fazer login com sucesso e retornar um token JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@teste.com',
          senha: 'SenhaCorreta123',
        });

      expect(res.statusCode).toEqual(200); // 200 = OK
      expect(res.body).toHaveProperty('token'); //
    });

    it('deve falhar ao fazer login com senha incorreta', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@teste.com',
          senha: 'SenhaErrada123', // Senha errada
        });

      expect(res.statusCode).toEqual(401); // 401 = Não Autorizado
      expect(res.body.error).toBe('Senha incorreta.');
    });

    it('deve falhar ao fazer login com usuário não existente', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'naoexiste@email.com',
          senha: 'Senha@123',
        });

      expect(res.statusCode).toEqual(404); // 404 = Não Encontrado
      expect(res.body.error).toBe('Usuário não encontrado.');
    });
  });
});
// --- Grupo de Testes: Tarefas (/api/tasks) ---
//
describe('Tarefas API - /api/tasks', () => {

  let token; // O token do nosso usuário de teste
  let usuarioId; // O ID do nosso usuário de teste

  // Antes de CADA teste de tarefa, fazemos um usuário e pegamos o token dele
  beforeEach(async () => {
    // 1. Cadastra um usuário
    const userRes = await request(app).post('/api/auth/register').send({
      nome: 'Usuário Tarefa Teste',
      email: 'tarefa@teste.com',
      senha: 'Senha@123',
    });
    usuarioId = userRes.body.id; // Salva o ID do usuário

    // 2. Faz login para pegar o token
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'tarefa@teste.com',
      senha: 'Senha@123',
    });
    token = loginRes.body.token; // Salva o token
  });

  // --- Testes de Segurança (Vigia/Middleware) ---
  it('deve falhar ao tentar listar tarefas sem token', async () => {
    const res = await request(app).get('/api/tasks'); // Sem token

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toBe('Acesso negado. Nenhum token fornecido.');
  });

  it('deve falhar ao tentar criar tarefa com token inválido', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', 'Bearer token_quebrado_123') // Token inválido
      .send({ titulo: 'Teste', descricao: 'Descricao teste' });

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toBe('Token inválido.');
  });

  // --- Testes de Funcionalidade (CRUD) ---
  it('deve criar uma nova tarefa com sucesso', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`) // Usa o token válido
      .send({
        titulo: 'Minha Primeira Tarefa',
        descricao: 'Esta é a descrição da tarefa.',
        prioridade: 'Alta',
      });

    expect(res.statusCode).toEqual(201); // 201 = Criado
    expect(res.body).toHaveProperty('id');
    expect(res.body.titulo).toBe('Minha Primeira Tarefa');
    expect(res.body.criador_id).toBe(usuarioId); // Verifica se o dono está correto
  });

  it('deve listar todas as tarefas do usuário logado', async () => {
    // 1. Cria uma tarefa
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Tarefa 1', descricao: 'Descricao 1' });

    // 2. Lista as tarefas
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`); // Usa o token válido

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1); // Espera 1 tarefa na lista
    expect(res.body[0].titulo).toBe('Tarefa 1');
  });

  it('deve atualizar o status de uma tarefa com sucesso', async () => {
    // 1. Cria a tarefa
    const tarefaRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Tarefa para atualizar', descricao: 'Descricao' });

    const tarefaId = tarefaRes.body.id;

    // 2. Atualiza a tarefa
    const res = await request(app)
      .put(`/api/tasks/${tarefaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Em_Progresso' }); //

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('Em_Progresso');
  });

  it('deve falhar ao tentar atualizar uma tarefa concluída', async () => {
    // 1. Cria e atualiza para Concluida
    const tarefaRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Tarefa Concluída', descricao: 'Descricao' });
    const tarefaId = tarefaRes.body.id;

    await request(app)
      .put(`/api/tasks/${tarefaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Concluida' });

    // 2. Tenta atualizar de novo (deve falhar)
    const res = await request(app)
      .put(`/api/tasks/${tarefaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Pendente' });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe('Tarefa concluída não pode ser alterada.'); //
  });

  it('deve deletar uma tarefa com sucesso', async () => {
    // 1. Cria a tarefa
    const tarefaRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Tarefa para deletar', descricao: 'Descricao' });
    const tarefaId = tarefaRes.body.id;

    // 2. Deleta a tarefa
    const res = await request(app)
      .delete(`/api/tasks/${tarefaId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(204); // 204 = Sucesso, sem conteúdo

    // 3. Tenta buscar (deve falhar)
    const resBusca = await request(app)
      .get(`/api/tasks/${tarefaId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(resBusca.statusCode).toEqual(404); // 404 = Não Encontrado
  });
});