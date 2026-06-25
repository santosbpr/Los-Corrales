const supabase = require('../config/supabase');
const AuditService = require('../services/audit.service');

const SalesController = {
  // Venda do carrinho: chama a função atômica no Postgres.
  async createSale(req, res) {
    try {
      const { customer_id = null, payment_method = 'DINHEIRO', items = [], discount = 0 } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'A venda não possui itens.' });
      }

      // Só enviamos o essencial; preço/custo são resolvidos no servidor.
      const p_items = items.map(i => ({
        product_id: i.product_id,
        variant_id: i.variant_id,
        quantity: Number(i.quantity) || 1
      }));

      const operator = req.currentUserEmail || req.headers['user-email'] || null;

      const { data, error } = await supabase.rpc('registrar_venda', {
        p_customer_id: customer_id,
        p_operator: operator,
        p_payment: payment_method,
        p_items,
        p_discount: Number(discount) || 0
      });

      if (error) {
        // Regras de negócio (ex.: estoque insuficiente) chegam como mensagem da função.
        console.error('Erro na venda (RPC):', error);
        return res.status(400).json({ message: error.message || 'Não foi possível concluir a venda.' });
      }

      const saleId = data; // a função retorna o id da venda
      await AuditService.log(operator, 'VENDA', `Venda #${saleId} (carrinho) • ${p_items.length} item(ns) • ${payment_method}`);

      return res.status(201).json({ message: 'Venda concluída com sucesso!', saleId });
    } catch (err) {
      console.error('Erro ao criar venda:', err);
      return res.status(500).json({ message: 'Erro interno ao registrar a venda.' });
    }
  },

  // Lista as compras de um cliente (com itens) — base para a troca por NF.
  async getCustomerSales(req, res) {
    try {
      const { customerId } = req.params;
      const { data, error } = await supabase
        .from('sales')
        .select('id, created_at, total, payment_method, status, sale_items(product_id, variant_id, product_name, variant_info, quantity, unit_price)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (err) {
      console.error('Erro ao listar compras do cliente:', err);
      return res.status(500).json({ message: 'Erro ao buscar as compras do cliente.' });
    }
  }
};

module.exports = SalesController;