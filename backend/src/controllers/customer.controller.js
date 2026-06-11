const supabase = require('../config/supabase');

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
      const { data, error } = await supabase.from('customers').insert([{ name, cpf, phone, email }]).select();
      if (error) throw error;
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
      const updates = req.body; // Pega o que vier (nome, telefone, etc)
      const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select();
      if (error) throw error;
      return res.status(200).json({ message: 'Dados atualizados!', customer: data[0] });
    } catch (err) {
      console.error("Erro ao atualizar cliente:", err);
      return res.status(500).json({ message: 'Erro ao atualizar dados do cliente.' });
    }
  },

  // 5. Excluir cliente
  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ message: 'Cliente removido do sistema.' });
    } catch (err) {
      console.error("Erro ao deletar cliente:", err);
      return res.status(500).json({ message: 'Erro ao excluir cliente.' });
    }
  }
};

module.exports = CustomerController;