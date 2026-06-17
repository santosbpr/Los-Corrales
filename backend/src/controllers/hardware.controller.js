const supabase = require('../config/supabase');
const { recordSale } = require('../services/sale.service');

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
      const v = updatedVariants[targetVariantIndex];
      const variantDetails = `Cor: ${v.color} | Tam: ${v.size} | 🤖 Lida via Hardware`;

      // Mesmo fluxo de venda (cabeçalho + item + financeiro) usado pelo PDV.
      await recordSale({
        operator_email: 'SISTEMA_IOT',
        payment_method: 'DINHEIRO',
        source: 'IoT',
        items: [{
          product_id: targetProduct.id,
          variant_id: v.id || null,
          product_name: targetProduct.name,
          variant_info: variantDetails,
          quantity: 1,
          unit_price: targetProduct.price || 0,
          unit_cost: targetProduct.cost || 0
        }]
      });

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