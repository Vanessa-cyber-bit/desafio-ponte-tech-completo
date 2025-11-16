const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  console.log('Iniciando o seeding...');
  const hashedPassword = await bcrypt.hash('Teste@123', 10);
  // 2. Criar Usuários
  const user1 = await prisma.usuario.create({ data: { nome: 'Admin Teste', email: 'admin@teste.com', senha: hashedPassword } });
  const user2 = await prisma.usuario.create({ data: { nome: 'João Silva', email: 'joao@teste.com', senha: hashedPassword } });
  const user3 = await prisma.usuario.create({ data: { nome: 'Maria Santos', email: 'maria@teste.com', senha: hashedPassword } });
  console.log('Usuários criados:', user1.nome, user2.nome, user3.nome);
  // 3. Criar Tarefas
  await prisma.tarefa.createMany({
    data: [
      { titulo: 'Configurar projeto', descricao: 'Criar estrutura inicial do projeto', status: 'Concluida', prioridade: 'Alta', criador_id: user1.id },
      { titulo: 'Implementar autenticação', descricao: 'Criar sistema de login e registro', status: 'Em_Progresso', prioridade: 'Alta', criador_id: user1.id },
      { titulo: 'Criar dashboard', descricao: 'Página principal com lista de tarefas', status: 'Pendente', prioridade: 'Media', criador_id: user1.id }, // <-- CORRIGIDO
      { titulo: 'Adicionar filtros', descricao: 'Filtrar tarefas por status e prioridade', status: 'Pendente', prioridade: 'Baixa', criador_id: user2.id },
      { titulo: 'Escrever testes', descricao: 'Testes unitários do backend', status: 'Pendente', prioridade: 'Alta', criador_id: user2.id },
      { titulo: 'Dockerizar aplicação', descricao: 'Criar Docker Compose', status: 'Pendente', prioridade: 'Media', criador_id: user2.id }, // <-- CORRIGIDO
      { titulo: 'Documentar API', descricao: 'Escrever README completo', status: 'Pendente', prioridade: 'Alta', criador_id: user3.id },
      { titulo: 'Corrigir bugs', descricao: 'Revisar e corrigir problemas encontrados', status: 'Pendente', prioridade: 'Baixa', criador_id: user3.id },
    ],
  });
  console.log('Tarefas de teste criadas com sucesso!');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });