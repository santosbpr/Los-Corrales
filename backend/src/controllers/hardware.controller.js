const supabase = require('../config/supabase');

const HardwareController = {
  // Rota acionada pelo microcontrolador/leitor de código de barras
  async processScan(req, res) {
    try {
      const { tag_id } = req.body;
      if (!tag_id) {
        return res.status(400).json({ message: 'ID da etiqueta não recebido pelo servidor.' });
      }

      // 1. Localiza o produto/variação dona da etiqueta (por SKU ou id da variação)
      const { data: products, error: productsError } = await supabase.from('products').select('*');
      if (productsError) throw productsError;

      let targetProduct = null;
      let targetVariant = null;
      for (const p of products) {
        if (Array.isArray(p.variants)) {
          const v = p.variants.find(x => x.sku === tag_id || x.id === tag_id);
          if (v) { targetProduct = p; targetVariant = v; break; }
        }
      }

      if (!targetProduct || !targetVariant) {
        return res.status(404).json({ message: 'Produto não cadastrado para esta etiqueta.' });
      }

      // 2. Venda ATÔMICA via função do banco (mesmo caminho do PDV).
      //    A função valida estoque, baixa, grava venda+item e lança o financeiro.
      const { error: rpcError } = await supabase.rpc('registrar_venda', {
        p_customer_id: null,
        p_operator: 'SISTEMA_IOT',
        p_payment: 'DINHEIRO',
        p_items: [{ product_id: targetProduct.id, variant_id: targetVariant.id, quantity: 1 }],
        p_discount: 0
      });

      if (rpcError) {
        // Regra de negócio (ex.: estoque insuficiente) vem na mensagem da função
        return res.status(400).json({ message: rpcError.message || 'Não foi possível registrar a venda.' });
      }

      // 3. Re-lê o estoque restante dessa variação para devolver ao dispositivo
      const { data: updated } = await supabase
        .from('products').select('variants').eq('id', targetProduct.id).single();
      const variacaoAtual = (updated?.variants || []).find(x => x.id === targetVariant.id);
      const stockRemaining = variacaoAtual ? (Number(variacaoAtual.stock) || 0) : null;

      // 4. Responde para o Arduino piscar o LED verde de sucesso
      return res.status(200).json({
        message: 'Leitura confirmada com sucesso!',
        product_name: targetProduct.name,
        stock_remaining: stockRemaining
      });

    } catch (err) {
      console.error('Erro no processamento do hardware:', err);
      return res.status(500).json({ message: 'Erro interno no servidor de integração.' });
    }
  }
};

module.exports = HardwareController;