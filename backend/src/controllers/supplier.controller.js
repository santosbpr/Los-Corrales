const supabase = require('../config/supabase');
const AuditService = require('../services/audit.service');

const SupplierController = {
  async getSuppliers(req, res) {
    try {
      const { data, error } = await supabase.from('suppliers').select('*').order('name');
      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (err) {
      console.error('Erro ao buscar fornecedores:', err);
      return res.status(500).json({ message: 'Erro ao buscar fornecedores.' });
    }
  },

  async createSupplier(req, res) {
    try {
      const { name, cnpj, phone, email, contact_name, category, notes } = req.body;
      if (!name) return res.status(400).json({ message: 'O nome do fornecedor é obrigatório.' });

      const { data, error } = await supabase
        .from('suppliers')
        .insert([{ name, cnpj, phone, email, contact_name, category, notes }])
        .select();
      if (error) throw error;

      await AuditService.log(
        req.currentUserEmail,
        'CADASTRO_FORNECEDOR',
        `Fornecedor "${name}" (CNPJ: ${cnpj || 'não informado'}) cadastrado.`
      );
      return res.status(201).json({ message: 'Fornecedor cadastrado com sucesso!', supplier: data[0] });
    } catch (err) {
      console.error('Erro ao cadastrar fornecedor:', err);
      return res.status(500).json({ message: 'Erro ao salvar o fornecedor.' });
    }
  },

  async updateSupplier(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const { data: oldData } = await supabase.from('suppliers').select('*').eq('id', id).single();

      const { data, error } = await supabase.from('suppliers').update(updates).eq('id', id).select();
      if (error) throw error;

      // Audita cada campo que mudou
      const alteracoes = [];
      if (oldData) {
        for (const campo of Object.keys(updates)) {
          if (String(oldData[campo] ?? '') !== String(updates[campo] ?? '')) {
            alteracoes.push({ campo, de: oldData[campo] ?? '(vazio)', para: updates[campo] ?? '(vazio)' });
          }
        }
      }
      if (alteracoes.length > 0) {
        await AuditService.log(req.currentUserEmail, 'ATUALIZAÇÃO_FORNECEDOR', {
          message: `Fornecedor "${oldData?.name || id}" editado: ${alteracoes.length} campo(s).`,
          alteracoes
        });
      }
      return res.status(200).json({ message: 'Fornecedor atualizado com sucesso!', supplier: data[0] });
    } catch (err) {
      console.error('Erro ao atualizar fornecedor:', err);
      return res.status(500).json({ message: 'Erro ao atualizar o fornecedor.' });
    }
  },

  async deleteSupplier(req, res) {
    try {
      const { id } = req.params;
      const { data: sup } = await supabase.from('suppliers').select('name').eq('id', id).single();

      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) throw error;

      await AuditService.log(
        req.currentUserEmail,
        'EXCLUSÃO_FORNECEDOR',
        `Fornecedor "${sup?.name || 'ID: ' + id}" removido do sistema.`
      );
      return res.status(200).json({ message: 'Fornecedor removido.' });
    } catch (err) {
      console.error('Erro ao excluir fornecedor:', err);
      return res.status(500).json({ message: 'Erro ao excluir o fornecedor.' });
    }
  }
};

module.exports = SupplierController;