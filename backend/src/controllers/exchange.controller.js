const supabase = require('../config/supabase');
const AuditService = require('../services/audit.service');

// Ajusta o estoque de uma variação (delta pode ser + ou -). Lança erro se faltar estoque.
async function ajustarEstoqueVariacao(productId, variantId, delta) {
  if (!productId || !variantId || !delta) return;

  const { data: product, error } = await supabase
    .from('products').select('variants').eq('id', productId).single();
  if (error || !product) throw new Error('Produto da troca não encontrado.');

  const variants = Array.isArray(product.variants) ? [...product.variants] : [];
  const idx = variants.findIndex(v => v.id === variantId);
  if (idx === -1) throw new Error('Variação da troca não encontrada.');

  const atual = Number(variants[idx].stock) || 0;
  const novo = atual + delta;
  if (novo < 0) throw new Error(`Estoque insuficiente para "${variants[idx].color}/${variants[idx].size}".`);

  variants[idx].stock = novo;
  const { error: updErr } = await supabase.from('products').update({ variants }).eq('id', productId);
  if (updErr) throw updErr;
}

const ExchangeController = {
  // Solicitar troca (PDV) — nasce PENDENTE, sem efeito em estoque/financeiro.
  async create(req, res) {
    try {
      const { customer_id = null, reason = '', returned, delivered = null } = req.body;

      if (!returned || !returned.product_id || !returned.variant_id) {
        return res.status(400).json({ message: 'Informe o item devolvido (produto e variação).' });
      }

      const rQty = Number(returned.qty) || 1;
      const rPrice = Number(returned.unit_price) || 0;
      const dQty = delivered ? (Number(delivered.qty) || 1) : 0;
      const dPrice = delivered ? (Number(delivered.unit_price) || 0) : 0;
      const difference = (dPrice * dQty) - (rPrice * rQty);

      const { data, error } = await supabase.from('exchanges').insert([{
        customer_id,
        requested_by: req.currentUserEmail || req.headers['user-email'] || null,
        status: 'PENDENTE',
        reason,
        returned_product_id: returned.product_id,
        returned_variant_id: returned.variant_id,
        returned_name: returned.name || null,
        returned_info: returned.info || null,
        returned_qty: rQty,
        returned_unit_price: rPrice,
        delivered_product_id: delivered?.product_id || null,
        delivered_variant_id: delivered?.variant_id || null,
        delivered_name: delivered?.name || null,
        delivered_info: delivered?.info || null,
        delivered_qty: dQty,
        delivered_unit_price: dPrice,
        difference
      }]).select().single();
      if (error) throw error;

      await AuditService.log(req.currentUserEmail, 'TROCA_SOLICITADA', `Troca #${data.id} solicitada (aguardando aprovação).`);
      return res.status(201).json({ message: 'Troca registrada e enviada para aprovação.', exchange: data });
    } catch (err) {
      console.error('Erro ao solicitar troca:', err);
      return res.status(500).json({ message: 'Erro ao registrar a troca.' });
    }
  },

  // Listar trocas (por padrão as pendentes; ?status=TODAS para todas).
  async list(req, res) {
    try {
      let q = supabase.from('exchanges').select('*').order('created_at', { ascending: false });
      const status = (req.query.status || 'PENDENTE').toUpperCase();
      if (status !== 'TODAS') q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (err) {
      console.error('Erro ao listar trocas:', err);
      return res.status(500).json({ message: 'Erro ao buscar trocas.' });
    }
  },

  // Aprovar (ADMIN) — efetiva estoque e financeiro.
  async approve(req, res) {
    try {
      const { id } = req.params;
      const { data: tr, error } = await supabase.from('exchanges').select('*').eq('id', id).single();
      if (error || !tr) return res.status(404).json({ message: 'Troca não encontrada.' });
      if (tr.status !== 'PENDENTE') return res.status(400).json({ message: 'Esta troca já foi processada.' });

      // 1) Item devolvido volta ao estoque (+)
      await ajustarEstoqueVariacao(tr.returned_product_id, tr.returned_variant_id, Number(tr.returned_qty) || 1);

      // 2) Item entregue sai do estoque (-), se houver
      if (tr.delivered_product_id && tr.delivered_variant_id) {
        await ajustarEstoqueVariacao(tr.delivered_product_id, tr.delivered_variant_id, -(Number(tr.delivered_qty) || 1));
      }

      // 3) Financeiro: diferença de valor
      const diff = Number(tr.difference) || 0;
      if (diff !== 0) {
        await supabase.from('financial_transactions').insert([{
          type: diff > 0 ? 'ENTRADA' : 'SAÍDA',
          amount: Math.abs(diff),
          description: `Troca #${tr.id} aprovada (${tr.delivered_name ? 'troca de item' : 'devolução'})`
        }]);
      }

      // 4) Marca como aprovada
      const { error: updErr } = await supabase.from('exchanges').update({
        status: 'APROVADA',
        approved_by: req.currentUserEmail || null,
        approved_at: new Date().toISOString()
      }).eq('id', id);
      if (updErr) throw updErr;

      await AuditService.log(req.currentUserEmail, 'TROCA_APROVADA', `Troca #${tr.id} aprovada. Diferença: ${diff}.`);
      return res.status(200).json({ message: 'Troca aprovada: estoque e financeiro atualizados.' });
    } catch (err) {
      console.error('Erro ao aprovar troca:', err);
      return res.status(500).json({ message: err.message || 'Erro ao aprovar a troca.' });
    }
  },

  // Rejeitar (ADMIN) — não mexe em estoque/financeiro.
  async reject(req, res) {
    try {
      const { id } = req.params;
      const { data: tr } = await supabase.from('exchanges').select('status, id').eq('id', id).single();
      if (!tr) return res.status(404).json({ message: 'Troca não encontrada.' });
      if (tr.status !== 'PENDENTE') return res.status(400).json({ message: 'Esta troca já foi processada.' });

      const { error } = await supabase.from('exchanges').update({
        status: 'REJEITADA',
        approved_by: req.currentUserEmail || null,
        approved_at: new Date().toISOString()
      }).eq('id', id);
      if (error) throw error;

      await AuditService.log(req.currentUserEmail, 'TROCA_REJEITADA', `Troca #${id} rejeitada.`);
      return res.status(200).json({ message: 'Troca rejeitada.' });
    } catch (err) {
      console.error('Erro ao rejeitar troca:', err);
      return res.status(500).json({ message: 'Erro ao rejeitar a troca.' });
    }
  }
};

module.exports = ExchangeController;