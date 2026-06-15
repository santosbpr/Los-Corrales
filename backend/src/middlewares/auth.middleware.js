const supabase = require('../config/supabase');

const authorize = (allowedRoles = []) => {
  // Normaliza os papéis permitidos uma única vez (tudo em maiúsculas).
  const normalizedAllowed = allowedRoles.map(r => String(r).toUpperCase());

  return async (req, res, next) => {
    try {
      // O usuário é identificado pelo header 'user-email'.
      const userEmail = req.headers['user-email'];

      if (!userEmail) {
        return res.status(401).json({ message: 'Acesso negado. Usuário não identificado.' });
      }

      // Busca o perfil do usuário no banco de dados.
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', userEmail)
        .single();

      if (error || !profile) {
        return res.status(403).json({ message: 'Perfil de usuário não encontrado ou não autorizado.' });
      }

      // Comparação tolerante a maiúsculas/minúsculas e a espaços extras.
      const userRole = String(profile.role || '').trim().toUpperCase();

      if (!normalizedAllowed.includes(userRole)) {
        return res.status(403).json({ message: 'Acesso proibido. Nível de permissão insuficiente.' });
      }

      // Disponibiliza dados do usuário para uso posterior (ex.: logs de auditoria).
      req.currentUserEmail = userEmail;
      req.currentUserRole = userRole;

      next();
    } catch (err) {
      console.error('Erro no middleware de autorização:', err);
      return res.status(500).json({ message: 'Erro interno na verificação de permissões.' });
    }
  };
};

module.exports = authorize;