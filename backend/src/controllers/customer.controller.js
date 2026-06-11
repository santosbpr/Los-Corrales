const supabase = require('../config/supabase');
const AuditService = require('../services/audit.service'); // <-- Importa o serviço de auditoria

const CustomerController = {
  // 1. Listar todos os clientes
  async getCustomers(req, res) {
    try {
      const { data, error } = await supabase.from('customers').select('*').order('name');
      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
      return res.status(500).json({ message: 'Erro ao buscar clientes no banco.' });
    }
  },

  // 2. Buscar um cliente específico pelo ID
  async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      console.error("Erro ao buscar cliente:", err);
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
  },

  // 3. Cadastrar novo cliente
  async createCustomer(req, res) {
    try {
      const { name, cpf, phone, email } = req.body;
      const operatorEmail = req.currentUserEmail;

      const { data, error } = await supabase.from('customers').insert([{ name, cpf, phone, email }]).select();
      if (error) throw error;

      // REGISTRO DE AUDITORIA
      await AuditService.log(
        operatorEmail,
        'CADASTRO_CLIENTE',
        `Cliente "${name}" (CPF: ${cpf || 'Não informado'}) foi registrado no sistema.`
      );

      return res.status(201).json({ message: 'Cliente cadastrado com sucesso!', customer: data[0] });
    } catch (err) {
      console.error("Erro ao cadastrar cliente:", err);
      return res.status(500).json({ message: 'Erro interno ao salvar cliente.' });
    }
  },

  // 4. Atualizar dados do cliente
  async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const operatorEmail = req.currentUserEmail;

      // Busca os dados antigos para deixar o log rico em detalhes
      const { data: oldData } = await supabase.from('customers').select('name').eq('id', id).single();

      const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select();
      if (error) throw error;

      // REGISTRO DE AUDITORIA
      await AuditService.log(
        operatorEmail,
        'ATUALIZAÇÃO_CLIENTE',
        {
          message: `Dados do cliente "${oldData?.name}" foram modificados.`,
          alteracoes: updates // Salva o objeto com o que mudou diretamente no campo de detalhes
        }
      );

      return res.status(200).json({ message: 'Dados updated!', customer: data[0] });
    } catch (err) {
      console.error("Erro ao atualizar cliente:", err);
      return res.status(500).json({ message: 'Erro ao atualizar dados do cliente.' });
    }
  },

  // 5. Excluir cliente
  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;
      const operatorEmail = req.currentUserEmail;

      // Busca o nome do cliente antes de apagar
      const { data: customer } = await supabase.from('customers').select('name').eq('id', id).single();

      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;

      // REGISTRO DE AUDITORIA
      await AuditService.log(
        operatorEmail,
        'EXCLUSÃO_CLIENTE',
        `O cliente "${customer?.name || 'ID: ' + id}" foi removido definitivamente do sistema.`
      );

      return res.status(200).json({ message: 'Cliente removido do sistema.' });
    } catch (err) {
      console.error("Erro ao deletar cliente:", err);
      return res.status(500).json({ message: 'Erro ao excluir cliente.' });
    }
  }
};

module.exports = CustomerController;