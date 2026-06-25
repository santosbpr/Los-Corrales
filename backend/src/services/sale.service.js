const supabase = require('../config/supabase');
const AuditService = require('../services/audit.service');

/**
 * Grava uma venda completa: cabeçalho (sales) + linhas (sale_items) e lança o total
 * no financeiro. NÃO mexe em estoque — o controller decrementa o estoque antes de chamar.
 *
 * @param {Object} p
 * @param {number|string|null} p.customer_id
 * @param {string|null} p.operator_email
 * @param {string} p.payment_method  DINHEIRO | PIX | CARTAO
 * @param {string} p.source          rótulo p/ a descrição financeira (ex.: 'PDV', 'IoT')
 * @param {Array}  p.items           [{ product_id, variant_id, product_name, variant_info, quantity, unit_price, unit_cost }]
 * @returns {Promise<{ saleId:number, total:number }>}
 */
async function recordSale({ customer_id = null, operator_email = null, payment_method = 'DINHEIRO', source = 'PDV', items = [] }) {
  const cleanItems = (items || []).map(it => {
    const quantity = Number(it.quantity) || 0;
    const unit_price = Number(it.unit_price) || 0;
    const unit_cost = Number(it.unit_cost) || 0;
    return {
      product_id: it.product_id ?? null,
      variant_id: it.variant_id ?? null,
      product_name: it.product_name ?? null,
      variant_info: it.variant_info ?? null,
      quantity,
      unit_price,
      unit_cost,
      line_total: unit_price * quantity
    };
  });

  const subtotal = cleanItems.reduce((s, i) => s + i.line_total, 0);
  const total = subtotal; // desconto entra na Fase 1C (carrinho)

  // 1) Cabeçalho
  const { data: sale, error: saleErr } = await supabase
    .from('sales')
    .insert([{ customer_id, operator_email, payment_method, subtotal, discount: 0, total, status: 'PAGA' }])
    .select('id')
    .single();
  if (saleErr) throw saleErr;

  // 2) Itens
  const itemsToInsert = cleanItems.map(i => ({ ...i, sale_id: sale.id }));
  if (itemsToInsert.length > 0) {
    const { error: itemsErr } = await supabase.from('sale_items').insert(itemsToInsert);
    if (itemsErr) throw itemsErr;
  }

  // 3) Financeiro (entrada com o total da venda)
  if (total > 0) {
    const { error: finErr } = await supabase.from('financial_transactions').insert([{
      type: 'ENTRADA',
      amount: total,
      description: `Venda #${sale.id} (${source})`
    }]);
    if (finErr) console.error('Aviso: venda gravada, mas erro ao lançar no financeiro:', finErr);
  }

  // Auditoria: registra a venda (alimenta o relatório de usuários)
  await AuditService.log(
    operator_email,
    'VENDA',
    `Venda #${sale.id} • ${cleanItems.length} item(ns) • total ${total} • ${payment_method}`
  );

  return { saleId: sale.id, total };
}

module.exports = { recordSale };