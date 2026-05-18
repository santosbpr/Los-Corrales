const supabase = require('../config/supabase');

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
    const { id } = req.params;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return res.status(500).json(error);
    return res.status(200).json({ message: 'Produto removido!' });
  },

  // REGISTRAR VENDA
  async registerSale(req, res) {
    const { id } = req.params;
    const { quantity } = req.body.quantity || 1; 
    const { variantIndex } = req.body.variantIndex || 0;

    try {
      // 1. Buscamos o produto atual no Supabase
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !product) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }

      // 2. Copiamos as variantes para podermos manipular a quantidade
      let updatedVariants = [...product.variants];
      
      // Proteção: Garante que trataremos o estoque como número, mesmo que esteja vazio
      let currentStock = updatedVariants[variantIndex].stock || 0;

      // 3. Verificamos se há estoque suficiente para a venda
      if (currentStock < quantity) {
        return res.status(400).json({ message: 'Estoque insuficiente para esta venda!' });
      }

      // 4. Subtraímos a quantidade vendida
      updatedVariants[variantIndex].stock = currentStock - quantity;

      // 5. Salvamos a atualização no banco de dados
      const { data, error: updateError } = await supabase
        .from('products')
        .update({ variants: updatedVariants })
        .eq('id', id)
        .select();

      if (updateError) {
        return res.status(500).json({ message: 'Erro ao atualizar o estoque.' });
      }

      return res.status(200).json({ 
        message: 'Venda registrada com sucesso!', 
        product: data[0] 
      });

    } catch (err) {
      return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
  }
};

module.exports = ProductController;