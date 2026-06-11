const supabase = require('../config/supabase');

const authorize = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // Para testes e simplicidade antes do login visual, passaremos o email do usuário no Header da requisição
      const userEmail = req.headers['user-email'];

      if (!userEmail) {
        return res.status(401).json({ message: 'Acesso negado. Usuário não identificado.' });
      }

      // Busca o perfil do usuário no banco de dados
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', userEmail)
        .single();

      if (error || !profile) {
        return res.status(403).json({ message: 'Perfil de usuário não encontrado ou não autorizado.' });
      }

      // Verifica se a role do usuário está entre as roles permitidas para a rota
      if (!allowedRoles.includes(profile.role)) {
        return res.status(403).json({ message: 'Acesso proibido. Nível de permissão insuficiente.' });
      }

      // Injeta o email do usuário na requisição para uso posterior (ex: logs de auditoria)
      req.currentUserEmail = userEmail;
      
      next();
    } catch (err) {
      console.error("Erro no middleware de autorização:", err);
      return res.status(500).json({ message: 'Erro interno na verificação de permissões.' });
    }
  };
};

module.exports = authorize;