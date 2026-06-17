const supabase = require('../config/supabase');

const HardwareController = {
  // Rota acionada pelo microcontrolador/leitor de código de barras
  async processScan(req, res) {
    try {
      // O Arduino ou Leitor vai mandar o código lido no formato JSON: { "tag_id": "SKU-1234" }
      const { tag_id } = req.body; 

      if (!tag_id) {
        return res.status(400).json({ message: 'ID da etiqueta não recebido pelo servidor.' });
      }

      // 1. Busca todos os produtos para encontrarmos a quem pertence esse SKU
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) throw productsError;

      let targetProduct = null;
      let targetVariantIndex = -1;

      // 2. Varre os produtos e suas variantes para achar o código exato
      for (let p of products) {
        if (p.variants && Array.isArray(p.variants)) {
          const vIndex = p.variants.findIndex(v => v.sku === tag_id || v.id === tag_id);
          if (vIndex !== -1) {
            targetProduct = p;
            targetVariantIndex = vIndex;
            break;
          }
        }
      }

      if (!targetProduct) {
        return res.status(404).json({ message: 'Produto não cadastrado para esta etiqueta.' });
      }

      // 3. Aplica a Regra de Negócio de Estoque
      let updatedVariants = [...targetProduct.variants];
      let currentStock = updatedVariants[targetVariantIndex].stock || 0;

      if (currentStock < 1) {
        return res.status(400).json({ message: 'Estoque insuficiente no sistema para esta peça física!' });
      }

      updatedVariants[targetVariantIndex].stock = currentStock - 1;

      // Atualiza o estoque no banco
      const { error: updateError } = await supabase
        .from('products')
        .update({ variants: updatedVariants })
        .eq('id', targetProduct.id);

      if (updateError) throw updateError;

      // 4. Registra no Histórico de Vendas
      const variantDetails = `Cor: ${updatedVariants[targetVariantIndex].color} | Tam: ${updatedVariants[targetVariantIndex].size} | 🤖 Lida via Hardware`;
      
      await supabase.from('sales').insert([{
        product_id: targetProduct.id,
        product_name: targetProduct.name,
        variant_info: variantDetails,
        quantity: 1
      }]);

      // 5. Automatiza o Lançamento Financeiro
      if (targetProduct.price && targetProduct.price > 0) {
        await supabase.from('financial_transactions').insert([{
          type: 'ENTRADA',
          amount: targetProduct.price,
          description: `Venda via IoT (SKU: ${tag_id}) - ${targetProduct.name}`
        }]);
      }

      // 6. Responde para o Arduino piscar o LED verde de sucesso
      return res.status(200).json({
        message: 'Leitura confirmada com sucesso!',
        product_name: targetProduct.name,
        stock_remaining: updatedVariants[targetVariantIndex].stock
      });

    } catch (err) {
      console.error("Erro no processamento do hardware:", err);
      return res.status(500).json({ message: 'Erro interno no servidor de integração.' });
    }
  }
};

module.exports = HardwareController;