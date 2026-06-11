const supabase = require('../config/supabase');
const AuditService = require('../services/audit.service');

const ProductController = {
  // LISTAR TUDO
  async getAll(req, res) {
    const { data, error } = await supabase.from('products').select('*');
    if (error) return res.status(500).json(error);
    return res.status(200).json(data);
  },

  // CRIAR NOVO
  async create(req, res) {
    const { data, error } = await supabase.from('products').insert([req.body]).select();
    if (error) return res.status(500).json(error);
    return res.status(201).json(data[0]);
  },

  // ATUALIZAR
  async update(req, res) {
    const { id } = req.params;
    const { data, error } = await supabase.from('products').update(req.body).eq('id', id).select();
    if (error) return res.status(500).json(error);
    return res.status(200).json(data[0]);
  },

  // DELETAR
  async delete(req, res) {
  try {
    const { id } = req.params;
    const operatorEmail = req.currentUserEmail; // Capturado pelo middleware de autorização

    // Busca o nome do produto antes de deletar para colocar no histórico
    const { data: product } = await supabase.from('products').select('name').eq('id', id).single();

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;

    // Registra a ação na tabela de auditoria
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

  // REGISTRAR VENDA
  async registerSale(req, res) {
    const { id } = req.params;
    const variantIndex = req.body.variantIndex || 0; 
    const quantity = req.body.quantity || 1;

    try {
      // 1. Buscamos o produto atual
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !product) return res.status(404).json({ message: 'Produto não encontrado.' });

      let updatedVariants = [...product.variants];
      let currentStock = updatedVariants[variantIndex].stock || 0;

      if (currentStock < quantity) return res.status(400).json({ message: 'Estoque insuficiente!' });

      // 2. Subtraímos o estoque
      updatedVariants[variantIndex].stock = currentStock - quantity;

      // 3. Salvamos a atualização do produto
      const { error: updateError } = await supabase
        .from('products')
        .update({ variants: updatedVariants })
        .eq('id', id);

      if (updateError) return res.status(500).json({ message: 'Erro ao atualizar o estoque.' });

      // ==========================================
      // 4. NOVO: REGISTRAR NO HISTÓRICO DE VENDAS
      // ==========================================
      const variantDetails = `Cor: ${updatedVariants[variantIndex].color} | Tam: ${updatedVariants[variantIndex].size}`;
      
      const { error: saleError } = await supabase
        .from('sales')
        .insert([{
          product_id: id,
          product_name: product.name,
          variant_info: variantDetails,
          quantity: quantity,
          customer_id: customerId
        }]);

      if (saleError) console.error("Aviso: Venda feita, mas erro ao salvar histórico:", saleError);

      // ==========================================
      // 5. AUTOMAÇÃO FINANCEIRA
      // ==========================================
      // Verifica se o produto tem preço cadastrado. Se tiver, lança no caixa!
      if (product.price && product.price > 0) {
        const totalValue = product.price * quantity;
        
        const { error: financeError } = await supabase
          .from('financial_transactions')
          .insert([{
            type: 'ENTRADA',
            amount: totalValue,
            description: `Venda Automática: ${quantity}x ${product.name}`
          }]);
          
        if (financeError) console.error("Aviso: Erro ao lançar no financeiro:", financeError);
      }

      return res.status(200).json({ message: 'Venda registrada com sucesso e gravada no histórico!' });

    } catch (err) {
      return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
  }
};

module.exports = ProductController;