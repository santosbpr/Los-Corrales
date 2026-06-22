const supabase = require('../config/supabase');

const DashboardController = {
  async getSummary(req, res) {
    try {
      // 1. Calcular o Faturamento Total (Soma de todas as ENTRADAS)
      const { data: finances, error: financeError } = await supabase
        .from('financial_transactions')
        .select('amount')
        .eq('type', 'ENTRADA');
      
      if (financeError) throw financeError;
      
      const totalRevenue = finances.reduce((acumulador, transacao) => acumulador + transacao.amount, 0);

      // 2. Calcular o Total de Peças Vendidas (quantidade agora vive em sale_items)
      const { data: saleItems, error: salesError } = await supabase
        .from('sale_items')
        .select('quantity');

      if (salesError) throw salesError;

      const totalItemsSold = (saleItems || []).reduce((acc, item) => acc + (item.quantity || 0), 0);

      // 3. Gerar Alerta de Estoque Baixo (Peças com menos de 3 unidades)
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('name, variants');
        
      if (productsError) throw productsError;

      let lowStockAlerts = [];
      
      // Varre todos os produtos e todas as variantes (cores/tamanhos) de cada um
      products.forEach(product => {
        if (product.variants && Array.isArray(product.variants)) {
          product.variants.forEach(variant => {
            if (variant.stock < 3) {
              lowStockAlerts.push({
                productName: product.name,
                color: variant.color,
                size: variant.size,
                currentStock: variant.stock
              });
            }
          });
        }
      });

      // 4. Devolve o "Pacote Completo" para o Angular desenhar na tela
      return res.status(200).json({
        totalRevenue: totalRevenue,
        totalItemsSold: totalItemsSold,
        lowStockItems: lowStockAlerts
      });

    } catch (err) {
      console.error("Erro ao gerar dados do Dashboard:", err);
      return res.status(500).json({ message: 'Erro ao processar a inteligência do negócio.' });
    }
  }
};

module.exports = DashboardController;