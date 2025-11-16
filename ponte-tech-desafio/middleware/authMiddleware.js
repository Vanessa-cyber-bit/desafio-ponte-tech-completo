const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  // 1. Pegar o token do cabeçalho "Authorization"
  const authHeader = req.headers.authorization;

  // Se não veio o cabeçalho ou não começa com "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' });
  }

  // 2. Pegar só o token (vem "Bearer [token]")
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verificar se o token é válido
    // Usamos o nosso segredo do .env
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Se for válido, anexamos o ID do usuário na requisição
    // O payload tem o id e email que colocamos no login
    req.usuarioId = payload.id;

    // 5. Deixa a requisição continuar para o próximo passo (a rota)
    next(); 
  } catch (error) {
    // Se o token for inválido, dá erro
    res.status(401).json({ error: 'Token inválido.' });
  }
};

module.exports = authMiddleware; // Exporta o vigia