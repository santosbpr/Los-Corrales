const supabase = require('../config/supabase');
const AuditService = require('../services/audit.service');

const UserController = {
  // Lista os usuários do sistema (a partir de profiles): e-mail + cargo
  async listUsers(req, res) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, role, created_at')
        .order('role', { ascending: true })
        .order('email', { ascending: true });

      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (err) {
      console.error('Erro ao listar usuários:', err);
      return res.status(500).json({ message: 'Erro ao buscar usuários.' });
    }
  },

  // Reseta (define) a nova senha de um usuário — ADMIN ou CAIXA.
  // Usa a Admin API do Supabase, que EXIGE a SERVICE_ROLE_KEY no backend.
  async resetPassword(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password || String(password).length < 6) {
        return res.status(400).json({ message: 'Informe o e-mail e uma senha de no mínimo 6 caracteres.' });
      }

      const { data: list, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listError) throw listError;

      const target = list?.users?.find(
        u => String(u.email || '').toLowerCase() === String(email).toLowerCase()
      );
      if (!target) {
        return res.status(404).json({ message: 'Usuário não encontrado na autenticação.' });
      }

      const { error: updError } = await supabase.auth.admin.updateUserById(target.id, {
        password,
        email_confirm: true
      });
      if (updError) throw updError;

      await AuditService.log(req.currentUserEmail, 'RESET_SENHA', `Senha redefinida para o usuário "${email}".`);
      return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
    } catch (err) {
      console.error('Erro ao resetar senha:', err);
      const semPermissao = err?.status === 401 || err?.status === 403 ||
        /not allowed|service_role|admin/i.test(err?.message || '');
      return res.status(500).json({
        message: semPermissao
          ? 'Operação não autorizada: configure a SUPABASE_SERVICE_ROLE_KEY no backend.'
          : 'Erro ao redefinir a senha.'
      });
    }
  },

  // Exclui um usuário definitivamente (autenticação + perfil). Identificado pelo E-MAIL,
  // pois a lista vem de profiles (que não guarda o uuid do auth). Exige SERVICE_ROLE_KEY.
  async deleteUser(req, res) {
    try {
      const email = decodeURIComponent(req.params.email || '');
      if (!email) {
        return res.status(400).json({ message: 'E-mail do usuário não informado.' });
      }

      // Trava de segurança: ninguém apaga a própria conta (evita travar o acesso).
      if (req.currentUserEmail && email.toLowerCase() === String(req.currentUserEmail).toLowerCase()) {
        return res.status(400).json({ message: 'Você não pode excluir o seu próprio usuário.' });
      }

      // Localiza o uuid na autenticação pelo e-mail
      const { data: list, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listError) throw listError;

      const target = list?.users?.find(
        u => String(u.email || '').toLowerCase() === email.toLowerCase()
      );
      if (!target) {
        return res.status(404).json({ message: 'Usuário não encontrado na autenticação.' });
      }

      // Remove da autenticação e do perfil
      const { error: delAuthErr } = await supabase.auth.admin.deleteUser(target.id);
      if (delAuthErr) throw delAuthErr;

      await supabase.from('profiles').delete().eq('email', email);

      await AuditService.log(req.currentUserEmail, 'EXCLUSÃO_USUARIO', `Usuário "${email}" removido do sistema.`);
      return res.status(200).json({ message: 'Usuário removido com sucesso.' });
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      const semPermissao = err?.status === 401 || err?.status === 403 ||
        /not allowed|service_role|admin/i.test(err?.message || '');
      return res.status(500).json({
        message: semPermissao
          ? 'Operação não autorizada: configure a SUPABASE_SERVICE_ROLE_KEY no backend.'
          : 'Erro ao excluir usuário.'
      });
    }
  }
};

module.exports = UserController;