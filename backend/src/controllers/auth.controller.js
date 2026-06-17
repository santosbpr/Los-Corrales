const supabase = require('../config/supabase');

// Traduz/explica os erros mais comuns do Supabase no login
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
      // Devolve 'message' (que o frontend já lê), o motivo traduzido e o detalhe técnico.
      return res.status(401).json({
        message: explicarErroLogin(error),
        code: error.code || error.status || null,
        detail: error.message || null
      });
    }

    // Papel lido de profiles (default seguro: CAIXA)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', data.user.email)
      .single();

    const role = String(profile?.role || 'CAIXA').toUpperCase();

    return res.status(200).json({
      message: 'Login bem-sucedido',
      token: data.session.access_token,
      user: { id: data.user.id, email: data.user.email, role }
    });
  },

  async register(req, res) {
    const { email, password, role } = req.body;

    // Cria o usuário JÁ CONFIRMADO via Admin API (exige a SERVICE_ROLE_KEY).
    // Assim o funcionário consegue logar de imediato, sem depender de e-mail de confirmação.
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: role || 'CAIXA' } // o gatilho do banco copia para profiles
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(201).json({
      message: 'Utilizador criado com sucesso',
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'CAIXA'
      }
    });
  }
};

module.exports = {
  login: AuthController.login,
  register: AuthController.register
};