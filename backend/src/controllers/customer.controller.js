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

  // 4. Atualizar dados do cliente (auditando CADA campo alterado, com dados sensíveis mascarados)
  async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const operatorEmail = req.currentUserEmail;

      // Busca o registro antigo COMPLETO para comparar campo a campo
      const { data: oldData } = await supabase.from('customers').select('*').eq('id', id).single();

      const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select();
      if (error) throw error;

      // Mascara valores sensíveis (cpf/email/telefone) no log de auditoria
      const sensiveis = ['cpf', 'email', 'phone'];
      const mascarar = (campo, valor) => {
        if (valor === null || valor === undefined || valor === '') return '(vazio)';
        const s = String(valor);
        if (!sensiveis.includes(campo)) return s;
        if (campo === 'email') {
          const [u, dom] = s.split('@');
          return dom ? `${u ? u[0] : ''}***@${dom}` : '***';
        }
        const d = s.replace(/\D/g, '');
        const visiveis = campo === 'cpf' ? 2 : 4;
        return d.length > visiveis ? `***${d.slice(-visiveis)}` : '***';
      };

      // Monta o diff: somente os campos que realmente mudaram
      const alteracoes = [];
      if (oldData) {
        for (const campo of Object.keys(updates)) {
          const antes = oldData[campo];
          const depois = updates[campo];
          if (String(antes ?? '') !== String(depois ?? '')) {
            alteracoes.push({ campo, de: mascarar(campo, antes), para: mascarar(campo, depois) });
          }
        }
      }

      // Só registra auditoria se algo de fato mudou
      if (alteracoes.length > 0) {
        await AuditService.log(operatorEmail, 'ATUALIZAÇÃO_CLIENTE', {
          message: `Cliente "${oldData?.name || id}" editado: ${alteracoes.length} campo(s) alterado(s).`,
          alteracoes
        });
      }

      return res.status(200).json({ message: 'Cliente atualizado com sucesso!', customer: data[0] });
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