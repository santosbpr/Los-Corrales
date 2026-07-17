const supabase = require('../config/supabase');

function explicarErroLogin(error) {
  const raw = error?.message || '';
  if (/invalid login credentials/i.test(raw)) return 'E-mail ou senha inválidos.';
  if (/email not confirmed/i.test(raw))       return 'E-mail ainda não confirmado. Peça ao administrador para liberar o acesso (ou redefinir sua senha).';
  if (/email logins are disabled/i.test(raw)) return 'Login por e-mail está desativado no projeto.';
  if (/rate limit/i.test(raw))                return 'Muitas tentativas. Aguarde um instante e tente novamente.';
  return raw || 'Não foi possível autenticar.';
}

const AuthController = {
  async login(req, res) {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({
        message: explicarErroLogin(error),
        code: error.code || error.status || null,
        detail: error.message || null
      });
    }

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('email', data.user.email).single();

    const role = String(profile?.role || 'CAIXA').toUpperCase();

    return res.status(200).json({
      message: 'Login bem-sucedido',
      token: data.session.access_token,
      user: { id: data.user.id, email: data.user.email, role }
    });
  },

  async register(req, res) {
    const { email, password, role } = req.body;
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: role || 'CAIXA' }
    });

    if (error) return res.status(400).json({ message: error.message });

    return res.status(201).json({
      message: 'Utilizador criado com sucesso',
      user: { id: data.user.id, email: data.user.email, role: data.user.user_metadata?.role || 'CAIXA' }
    });
  },

  // "Esqueci a senha": registra uma solicitação para o admin resolver. Rota pública.
  async forgotPassword(req, res) {
    try {
      const email = String(req.body.email || '').trim().toLowerCase();
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return res.status(400).json({ message: 'Informe um e-mail válido.' });
      }

      // Não duplica pedidos pendentes do mesmo e-mail
      const { data: existente } = await supabase
        .from('password_reset_requests')
        .select('id').eq('email', email).eq('status', 'PENDENTE').limit(1);

      if (!existente || existente.length === 0) {
        const { error } = await supabase
          .from('password_reset_requests')
          .insert([{ email, status: 'PENDENTE' }]);
        if (error) throw error;
      }

      // Resposta neutra (não revela se o e-mail existe no sistema)
      return res.status(200).json({ message: 'Solicitação registrada. O administrador irá redefinir sua senha.' });
    } catch (err) {
      console.error('Erro em forgotPassword:', err);
      return res.status(500).json({ message: 'Não foi possível registrar a solicitação.' });
    }
  }
};

module.exports = {
  login: AuthController.login,
  register: AuthController.register,
  forgotPassword: AuthController.forgotPassword
};