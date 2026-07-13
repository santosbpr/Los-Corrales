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

      // 2. Total de Peças Vendidas (quantidade vive em sale_items)
      const { data: saleItems, error: salesError } = await supabase
        .from('sale_items')
        .select('quantity');

      if (salesError) throw salesError;

      const totalItemsSold = (saleItems || []).reduce((acc, item) => acc + (item.quantity || 0), 0);

      // 3. Alerta de Estoque Baixo (< 3 unidades)
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('name, variants');

      if (productsError) throw productsError;

      let lowStockAlerts = [];
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

      return res.status(200).json({
        totalRevenue,
        totalItemsSold,
        lowStockItems: lowStockAlerts
      });

    } catch (err) {
      console.error("Erro ao gerar dados do Dashboard:", err);
      return res.status(500).json({ message: 'Erro ao processar a inteligência do negócio.' });
    }
  },

  // Agregados para os gráficos de pizza do dashboard.
  // Cada bloco é isolado: se uma consulta falhar (ex.: coluna `source` ainda não
  // existe), as demais pizzas continuam funcionando em vez de derrubar tudo.
  async charts(req, res) {
    const result = {
      financeiro: { entradas: 0, saidas: 0 },
      mercadoria: { movimentada: 0, parada: 0 },
      tipoVenda: { presencial: 0, ecommerce: 0 }
    };

    // 1) Financeiro: entradas x saídas (R$)
    try {
      const { data: fin, error } = await supabase
        .from('financial_transactions').select('type, amount');
      if (error) throw error;
      (fin || []).forEach(t => {
        const a = Number(t.amount) || 0;
        if (String(t.type).toUpperCase() === 'ENTRADA') result.financeiro.entradas += a;
        else result.financeiro.saidas += a;
      });
    } catch (e) {
      console.error('charts.financeiro:', e.message);
    }

    // 2) Mercadoria: movimentada (vendida) x parada (em estoque)
    try {
      const { data: itens, error: e2 } = await supabase.from('sale_items').select('quantity');
      if (e2) throw e2;
      result.mercadoria.movimentada = (itens || []).reduce((s, i) => s + (Number(i.quantity) || 0), 0);

      const { data: products, error: e3 } = await supabase.from('products').select('variants');
      if (e3) throw e3;
      (products || []).forEach(p => {
        if (Array.isArray(p.variants)) p.variants.forEach(v => { result.mercadoria.parada += (Number(v.stock) || 0); });
      });
    } catch (e) {
      console.error('charts.mercadoria:', e.message);
    }

    // 3) Tipo de venda: presencial x e-commerce (contagem)
    //    A coluna `source` só existe após rodar o fase_tipo_venda.sql.
    try {
      const { data: vendas, error } = await supabase.from('sales').select('source');
      if (error) throw error;
      (vendas || []).forEach(v => {
        if (String(v.source).toUpperCase() === 'ECOMMERCE') result.tipoVenda.ecommerce++;
        else result.tipoVenda.presencial++;
      });
    } catch (e) {
      console.error('charts.tipoVenda (a coluna "source" existe? rode fase_tipo_venda.sql):', e.message);
      // Fallback: conta todas as vendas como presencial p/ a pizza ainda aparecer
      try {
        const { data: vendas } = await supabase.from('sales').select('id');
        result.tipoVenda.presencial = (vendas || []).length;
      } catch (_) { /* ignore */ }
    }

    return res.status(200).json(result);
  }
};

module.exports = DashboardController;