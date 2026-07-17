const supabase = require('../config/supabase');
const AuditService = require('../services/audit.service');

const UserController = {
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

  async resetPassword(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password || String(password).length < 6) {
        return res.status(400).json({ message: 'Informe o e-mail e uma senha de no mínimo 6 caracteres.' });
      }

      const { data: list, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listError) throw listError;

      const target = list?.users?.find(u => String(u.email || '').toLowerCase() === String(email).toLowerCase());
      if (!target) return res.status(404).json({ message: 'Usuário não encontrado na autenticação.' });

      const { error: updError } = await supabase.auth.admin.updateUserById(target.id, {
        password,
        email_confirm: true
      });
      if (updError) throw updError;

      // Marca solicitações pendentes desse e-mail como resolvidas
      await supabase.from('password_reset_requests')
        .update({ status: 'RESOLVIDO', resolved_by: req.currentUserEmail, resolved_at: new Date().toISOString() })
        .eq('email', String(email).toLowerCase()).eq('status', 'PENDENTE');

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

  async deleteUser(req, res) {
    try {
      const email = decodeURIComponent(req.params.email || '');
      if (!email) return res.status(400).json({ message: 'E-mail do usuário não informado.' });

      if (req.currentUserEmail && email.toLowerCase() === String(req.currentUserEmail).toLowerCase()) {
        return res.status(400).json({ message: 'Você não pode excluir o seu próprio usuário.' });
      }

      const { data: list, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listError) throw listError;

      const target = list?.users?.find(u => String(u.email || '').toLowerCase() === email.toLowerCase());
      if (!target) return res.status(404).json({ message: 'Usuário não encontrado na autenticação.' });

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
  },

  // Lista solicitações de redefinição de senha pendentes (para o admin)
  async listResetRequests(req, res) {
    try {
      const { data, error } = await supabase
        .from('password_reset_requests')
        .select('*')
        .eq('status', 'PENDENTE')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (err) {
      console.error('Erro ao listar solicitações de senha:', err);
      return res.status(500).json({ message: 'Erro ao buscar solicitações.' });
    }
  },

  // Dispensa uma solicitação sem redefinir (ex.: pedido indevido)
  async dismissResetRequest(req, res) {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from('password_reset_requests')
        .update({ status: 'DISPENSADO', resolved_by: req.currentUserEmail, resolved_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      await AuditService.log(req.currentUserEmail, 'DISPENSA_SOLIC_SENHA', `Solicitação de senha #${id} dispensada.`);
      return res.status(200).json({ message: 'Solicitação dispensada.' });
    } catch (err) {
      console.error('Erro ao dispensar solicitação:', err);
      return res.status(500).json({ message: 'Erro ao dispensar solicitação.' });
    }
  }
};

module.exports = UserController;