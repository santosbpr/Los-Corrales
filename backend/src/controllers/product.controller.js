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
  }
};

module.exports = ProductController;