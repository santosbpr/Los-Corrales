const crypto = require('crypto');
const supabase = require('../config/supabase');
const AuditService = require('../services/audit.service');
const { recordSale } = require('../services/sale.service');

// SKU/barcode determinístico de uma variação: PRODUTO-COR-TAMANHO
function makeVariantSku(productSku, v) {
  const color = String(v.color || '').toUpperCase().replace(/\s+/g, '');
  const size  = String(v.size  || '').toUpperCase().replace(/\s+/g, '');
  return `${productSku || 'PRD'}-${color}-${size}`;
}

// Garante id estável e sku determinístico em cada variação.
// Preserva o id das variações existentes (casando por id, ou por cor+tamanho).
function normalizeVariants(productSku, incoming, existing = []) {
  const arr = Array.isArray(incoming) ? incoming : [];
  return arr.map(v => {
    let id = v.id;
    if (!id) {
      const match = (existing || []).find(e =>
        String(e.color).toUpperCase() === String(v.color).toUpperCase() &&
        String(e.size).toUpperCase()  === String(v.size).toUpperCase()
      );
      id = match?.id || crypto.randomUUID();
    }
    return { ...v, id, sku: makeVariantSku(productSku, v) };
  });
}

const ProductController = {
  // LISTAR TUDO
  async getAll(req, res) {
    const { data, error } = await supabase.from('products').select('*');
    if (error) return res.status(500).json(error);
    return res.status(200).json(data);
  },

  // CRIAR
  async create(req, res) {
    try {
      const { name, category } = req.body;

      const size = req.body.variants && req.body.variants.length > 0
        ? req.body.variants[0].size : req.body.size;

      // Prefixo do SKU do produto a partir da categoria
      let prefix = 'PRD';
      if (typeof category === 'string' && category.length >= 3) {
        prefix = category.substring(0, 3).toUpperCase();
      }

      // Sequencial baseado na contagem atual
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      if (countError) throw countError;

      const sequential = String((count || 0) + 1).padStart(4, '0');
      const sizeSuffix = size ? `-${String(size).toUpperCase()}` : '';
      const generatedSku = `${prefix}-${sequential}${sizeSuffix}`;

      // Normaliza as variações (id + sku determinístico) usando o SKU do produto
      const variants = normalizeVariants(generatedSku, req.body.variants);

      const { data, error } = await supabase
        .from('products')
        .insert([{ ...req.body, sku: generatedSku, variants }])
        .select();
      if (error) throw error;

      return res.status(201).json(data[0]);
    } catch (err) {
      console.error('Erro ao criar produto:', err);
      return res.status(500).json({ message: 'Erro interno ao criar produto.' });
    }
  },

  // ATUALIZAR
  async update(req, res) {
    try {
      const { id } = req.params;

      // Busca o produto atual para preservar o SKU do produto e os ids das variações
      const { data: existing, error: fetchError } = await supabase
        .from('products').select('sku, variants').eq('id', id).single();
      if (fetchError || !existing) return res.status(404).json({ message: 'Produto não encontrado.' });

      const payload = { ...req.body };
      // Nunca deixa o front sobrescrever o SKU do produto
      delete payload.sku;

      // Se vierem variações, normaliza preservando ids existentes
      if (req.body.variants !== undefined) {
        payload.variants = normalizeVariants(existing.sku, req.body.variants, existing.variants || []);
      }

      const { data, error } = await supabase
        .from('products').update(payload).eq('id', id).select();
      if (error) throw error;

      return res.status(200).json(data[0]);
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      return res.status(500).json({ message: 'Erro interno ao atualizar produto.' });
    }
  },

  // DELETAR
  async delete(req, res) {
    try {
      const { id } = req.params;
      const operatorEmail = req.currentUserEmail;

      const { data: product } = await supabase.from('products').select('name').eq('id', id).single();

      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;

      await AuditService.log(
        operatorEmail,
        'EXCLUSÃO_PRODUTO',
        `O produto "${product?.name || 'ID: ' + id}" foi removido definitivamente do inventário.`
      );

      return res.status(200).json({ message: 'Produto removido com sucesso!' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro ao excluir o produto.' });
    }
  },

  // REGISTRAR VENDA (mantido por índice; a Fase 1 migra para id da variação)
  async registerSale(req, res) {
    const { id } = req.params;
    const variantIndex = req.body.variantIndex || 0;
    const quantity = req.body.quantity || 1;
    const customerId = req.body.customer_id || null;

    try {
      const { data: product, error: fetchError } = await supabase
        .from('products').select('*').eq('id', id).single();
      if (fetchError || !product) return res.status(404).json({ message: 'Produto não encontrado.' });

      let updatedVariants = [...product.variants];
      let currentStock = updatedVariants[variantIndex].stock || 0;
      if (currentStock < quantity) return res.status(400).json({ message: 'Estoque insuficiente!' });

      updatedVariants[variantIndex].stock = currentStock - quantity;

      const { error: updateError } = await supabase
        .from('products').update({ variants: updatedVariants }).eq('id', id);
      if (updateError) return res.status(500).json({ message: 'Erro ao atualizar o estoque.' });

      const variant = updatedVariants[variantIndex];
      const variantDetails = `Cor: ${variant.color} | Tam: ${variant.size}`;

      // Venda como transação: cabeçalho + item, e lançamento financeiro pelo total.
      await recordSale({
        customer_id: customerId,
        operator_email: req.currentUserEmail || req.headers['user-email'] || null,
        payment_method: req.body.payment_method || 'DINHEIRO',
        source: 'PDV',
        items: [{
          product_id: id,
          variant_id: variant.id || null,
          product_name: product.name,
          variant_info: variantDetails,
          quantity: quantity,
          unit_price: product.price || 0,
          unit_cost: product.cost || 0
        }]
      });

      return res.status(200).json({ message: 'Venda registrada com sucesso e gravada no histórico!' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
  }
};

module.exports = ProductController;