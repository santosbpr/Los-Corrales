const supabase = require('../config/supabase');

const SettingsController = {
  // ==============================
  // GESTÃO DE CORES
  // ==============================
  async getColors(req, res) {
    try {
      const { data, error } = await supabase.from('colors').select('*').order('name');
      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (err) {
      console.error("Erro no getColors:", err);
      return res.status(500).json({ message: 'Erro ao buscar cores.' });
    }
  },

  async addColor(req, res) {
    try {
      const { name } = req.body;
      const { data, error } = await supabase.from('colors').insert([{ name }]).select();
      if (error) throw error;
      // O "? data[0] : { name }" garante que não vai quebrar se o Supabase não retornar o objeto na mesma hora
      return res.status(201).json(data ? data[0] : { name });
    } catch (err) {
      console.error("Erro no addColor:", err);
      return res.status(500).json({ message: 'Erro ao adicionar cor.' });
    }
  },

  async deleteColor(req, res) {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('colors').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ message: 'Cor removida com sucesso!' });
    } catch (err) {
      console.error("Erro no deleteColor:", err);
      return res.status(500).json({ message: 'Erro ao deletar cor.' });
    }
  },

  // ==============================
  // GESTÃO DE TAMANHOS
  // ==============================
  async getSizes(req, res) {
    try {
      const { data, error } = await supabase.from('sizes').select('*').order('name');
      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (err) {
      console.error("Erro no getSizes:", err);
      return res.status(500).json({ message: 'Erro ao buscar tamanhos.' });
    }
  },

  async addSize(req, res) {
    try {
      const { name } = req.body;
      const { data, error } = await supabase.from('sizes').insert([{ name }]).select();
      if (error) throw error;
      return res.status(201).json(data ? data[0] : { name });
    } catch (err) {
      console.error("Erro no addSize:", err);
      return res.status(500).json({ message: 'Erro ao adicionar tamanho.' });
    }
  },

  async deleteSize(req, res) {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('sizes').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ message: 'Tamanho removido com sucesso!' });
    } catch (err) {
      console.error("Erro no deleteSize:", err);
      return res.status(500).json({ message: 'Erro ao deletar tamanho.' });
    }
  },

  // ==============================
  // GESTÃO DE CATEGORIAS
  // ==============================
    async getCategories(req, res) {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (err) {
      console.error("Erro no getCategories:", err);
      return res.status(500).json({ message: 'Erro ao buscar categorias.' });
    }
  },

  async addCategory(req, res) {
    try {
      const { name } = req.body;
      const { data, error } = await supabase.from('categories').insert([{ name }]).select();
      if (error) throw error;
      return res.status(201).json(data ? data[0] : { name });
    } catch (err) {
      console.error("Erro no addCategory:", err);
      return res.status(500).json({ message: 'Erro ao adicionar categoria.' });
    }
  },

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ message: 'Categoria removida com sucesso!' });
    } catch (err) {
      console.error("Erro no deleteCategory:", err);
      return res.status(500).json({ message: 'Erro ao deletar categoria.' });
    }
  }

};


module.exports = SettingsController;