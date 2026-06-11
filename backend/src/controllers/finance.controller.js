const supabase = require('../config/supabase');
const AuditService = require('../services/audit.service');

const FinanceController = {
  // 1. Listar todas as transações (Extrato)
  async getTransactions(req, res) {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('created_at', { ascending: false }); // Traz as mais recentes primeiro
        
      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (err) {
      console.error("Erro no extrato financeiro:", err);
      return res.status(500).json({ message: 'Erro ao buscar transações.' });
    }
  },

  // 2. Registrar uma transação manual (Despesas da loja, pagamentos)
  async addTransaction(req, res) {
    try {
      const { type, amount, description } = req.body;
      
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert([{ type, amount, description }])
        .select();
        
      if (error) throw error;
      // Registra a ação na tabela de auditoria
      await AuditService.log(
        operatorEmail,
        `FINANCEIRO_${type}`, // Cria a tag dinamicamente: FINANCEIRO_ENTRADA ou FINANCEIRO_SAÍDA
        `Lançamento manual de R$ ${amount} registrado com a descrição: "${description}"`
      );
      
      return res.status(201).json({ message: 'Lançamento financeiro registrado!', transaction: data[0] });
    } catch (err) {
      console.error("Erro ao registrar finanças:", err);
      return res.status(500).json({ message: 'Erro interno ao salvar transação.' });
    }
  }
};

module.exports = FinanceController;