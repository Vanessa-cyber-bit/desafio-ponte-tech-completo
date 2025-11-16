// --- Importando nossas ferramentas ---
const cors = require('cors');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/authMiddleware'); // Nosso "Vigia"

// --- Inicializando as ferramentas ---
const app = express(); // Nosso servidor
const prisma = new PrismaClient(); // Nosso conector do banco

// --- Configurações do Servidor ---
app.use(express.json()); // Permite que o servidor entenda JSON
app.use(cors());
// --- Ponto de Teste (para ver se está funcionando) ---
app.get('/', (req, res) => {
  res.send('API da PonteTech está no ar!');
});

// --- ENDPOINTS DE AUTENTICAÇÃO (Nosso Foco) ---
//

// 1. Endpoint de Cadastro (Register)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // --- Validações (Obrigatório pelo desafio) ---
    //
    if (!nome || nome.length < 3) {
      return res.status(400).json({ error: 'Nome é obrigatório e precisa de no mínimo 3 caracteres.' });
    }
    if (!email || !email.includes('@')) { // Validação simples de email
      return res.status(400).json({ error: 'Email é obrigatório e precisa ser válido.' });
    }
    if (!senha || senha.length < 8) {
      return res.status(400).json({ error: 'Senha é obrigatória e precisa de no mínimo 8 caracteres.' });
    }

    // Verificar se o email já existe (Email único)
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: email },
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'Este email já está em uso.' });
    }

    // Criptografar a senha (Obrigatório)
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Salvar no banco
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: nome,
        email: email,
        senha: hashedPassword,
      },
    });

    // Não retornar a senha!
    res.status(201).json({
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
    });

  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao tentar cadastrar usuário.' });
  }
});

// 2. Endpoint de Login (Login)
//
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validação básica
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    // 1. Encontrar o usuário no banco
    const usuario = await prisma.usuario.findUnique({
      where: { email: email },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // 2. Comparar a senha (Obrigatório)
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    // 3. Gerar o Token JWT (Obrigatório)
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
      },
      process.env.JWT_SECRET, // Nossa senha secreta do .env
      {
        expiresIn: '7d', // O desafio pede 7 dias
      }
    );

    // 4. Enviar o token para o cliente
    res.status(200).json({
      message: 'Login bem-sucedido!',
      token: token,
    });

  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao tentar fazer login.' });
  }
});


// --- ENDPOINTS DE TAREFAS (Protegidos) ---
//

// 1. Listar TODAS as tarefas do usuário logado
app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    
    // 1. Pega os filtros da URL (query parameters)
    const { status, prioridade } = req.query;

    // 2. Monta o filtro (where) do Prisma
    const whereClause = {
      criador_id: req.usuarioId, // Sempre filtra pelo usuário logado
    };

    // 3. Adiciona os filtros SÓ SE eles existirem
    if (status) {
      whereClause.status = status; // Ex: status: 'Pendente'
    }
    if (prioridade) {
      whereClause.prioridade = prioridade; // Ex: prioridade: 'Alta'
    }

    const tarefas = await prisma.tarefa.findMany({
      where: whereClause, // Usa o filtro dinâmico que montamos
      orderBy: {
        created_at: 'desc', // O desafio sugere ordenar por data
      },
    });

    res.status(200).json(tarefas);
  } catch (error) {
    console.error(error); // Bom para ver erros no terminal
    res.status(500).json({ error: 'Erro interno ao listar tarefas.' });
  }
});

// 2. Criar uma nova tarefa
app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const { titulo, descricao, prioridade } = req.body;
    
    // --- Validações (Obrigatório pelo desafio) ---
    //
    if (!titulo || titulo.length < 3 || titulo.length > 100) {
      return res.status(400).json({ error: 'Título deve ter entre 3 e 100 caracteres.' });
    }
    if (!descricao || descricao.length < 3 || descricao.length > 500) {
      return res.status(400).json({ error: 'Descrição deve ter entre 3 e 500 caracteres.' });
    }
    if (prioridade && !['Baixa', 'Media', 'Alta'].includes(prioridade)) {
      return res.status(400).json({ error: 'Prioridade inválida. Use: Baixa, Media, Alta.' });
    }

    const novaTarefa = await prisma.tarefa.create({
      data: {
        titulo: titulo,
        descricao: descricao,
        prioridade: prioridade, 
        criador_id: req.usuarioId, 
      },
    });

    res.status(201).json(novaTarefa);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno ao criar tarefa.' });
  }
});

// 3. Ver detalhes de UMA tarefa
app.get('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params; 

    const tarefa = await prisma.tarefa.findUnique({
      where: {
        id: parseInt(id), // Converte o ID da URL (string) para número
      },
    });

    if (!tarefa || tarefa.criador_id !== req.usuarioId) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    res.status(200).json(tarefa);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno ao buscar tarefa.' });
  }
});

// 4. Atualizar o status de uma tarefa
// (Este é o seu código novo e melhorado)
app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  try { 
    console.log("### ESTOU DENTRO DO CÓDIGO NOVO (APP.PUT) ###");
    const tarefaId = Number(req.params.id); // Usando Number() que é mais seguro
    const { status } = req.body;
    console.log('DEBUG PUT -> params:', req.params, 'tarefaId:', tarefaId, 'typeof:', typeof tarefaId, 'status:', status);

    // Validação do ID
    if (!tarefaId || isNaN(tarefaId)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }
    
    // Lista de status permitidos
    const statusPermitidos = ['Pendente', 'Em_Progresso', 'Concluida'];

    if (!status || !statusPermitidos.includes(status)) {
      return res.status(400).json({
        error: 'Status inválido. Use: Pendente, Em_Progresso, Concluida.',
      });
    }

    // Busca tarefa
    const tarefaAtual = await prisma.tarefa.findUnique({
      where: { id: tarefaId }, // Correção aplicada
    });

    if (!tarefaAtual) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    // Garantir que a tarefa pertence ao usuário logado
    if (tarefaAtual.criador_id !== req.usuarioId) {
      // 403 = Proibido (Forbidden), é melhor que 404
      return res.status(403).json({ error: 'Você não tem permissão para editar esta tarefa.' }); 
    }

    // Regras de status
    if (tarefaAtual.status === 'Concluida') {
      return res.status(400).json({ error: 'Tarefa concluída não pode ser alterada.' });
    }
    if (tarefaAtual.status === 'Em_Progresso' && status === 'Pendente') {
      return res.status(400).json({ error: 'Tarefa "Em Progresso" não pode voltar para "Pendente".' });
    }

    // Atualiza
    const tarefaAtualizada = await prisma.tarefa.update({
      where: { id: tarefaId },
      data: { status: status }, // Sintaxe curta para { status: status }
    });

    return res.status(200).json(tarefaAtualizada);

  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar tarefa.' });
  }
});

// 5. Deletar uma tarefa
// (Este é o código de delete, com a mesma lógica de correção)
app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const tarefaId = Number(req.params.id); // Usando Number()
    console.log('DEBUG DELETE -> params:', req.params, 'tarefaId:', tarefaId, 'typeof:', typeof tarefaId);

    // Validação do ID
    if (!tarefaId || isNaN(tarefaId)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    // 1. Achar a tarefa
    const tarefa = await prisma.tarefa.findUnique({
      where: { id: tarefaId }, // Correção aplicada
    });

    // 2. Checar se a tarefa existe e se é do usuário
    if (!tarefa) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }
    if (tarefa.criador_id !== req.usuarioId) {
      // 403 = Proibido (Forbidden)
      return res.status(403).json({ error: 'Você não tem permissão para deletar esta tarefa.' });
    }

    // 3. Deletar
    await prisma.tarefa.delete({
      where: { id: tarefaId },
    });

    res.status(204).send(); // 204 = Sucesso, sem conteúdo
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    res.status(500).json({ error: 'Erro interno ao deletar tarefa.' });
  }
});

// 6. Endpoint do Dashboard (Bônus)
app.get('/api/dashboard', authMiddleware, async (req, res) => {
  try {
    const contagemStatus = await prisma.tarefa.groupBy({
      by: ['status'],
      where: {
        criador_id: req.usuarioId,
      },
      _count: {
        status: true,
      },
    });

    const dashboardData = {
      Pendente: 0,
      Em_Progresso: 0,
      Concluida: 0,
    };
    
    for (const item of contagemStatus) {
      if (item.status === 'Pendente') dashboardData.Pendente = item._count.status;
      if (item.status === 'Em_Progresso') dashboardData.Em_Progresso = item._count.status;
      if (item.status === 'Concluida') dashboardData.Concluida = item._count.status;
    }

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno ao buscar dados do dashboard.' });
  }
});

// --- Iniciando o Servidor ---
const PORT = 3000;

// Só liga o servidor se NÃO estivermos no ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

// Exporta o app para que nossos testes possam usá-lo
module.exports = app;
