const supabase = require('../config/supabase');

// Aplica filtro de período (YYYY-MM-DD) numa query, se informado.
function aplicarPeriodo(query, start, end, col = 'created_at') {
  if (start) query = query.gte(col, start);
  if (end) query = query.lte(col, `${end}T23:59:59.999`);
  return query;
}

const ReportController = {
  // ===== RELATÓRIO FINANCEIRO: entradas, saídas, trocas (heurística) e saldo =====
  async financial(req, res) {
    try {
      const { start, end } = req.query;
      let q = supabase.from('financial_transactions').select('type, amount, description, created_at');
      q = aplicarPeriodo(q, start, end);
      const { data, error } = await q;
      if (error) throw error;

      const rows = data || [];
      const isEntrada = (t) => String(t || '').toUpperCase() === 'ENTRADA';
      const isTroca = (d) => /troca|devolu/i.test(String(d || ''));

      let entradas = 0, saidas = 0, trocas = 0;
      let cEntradas = 0, cSaidas = 0, cTrocas = 0;

      for (const r of rows) {
        const amount = Number(r.amount) || 0;
        if (isTroca(r.description)) { trocas += amount; cTrocas++; }
        if (isEntrada(r.type)) { entradas += amount; cEntradas++; }
        else { saidas += amount; cSaidas++; }
      }

      return res.status(200).json({
        periodo: { start: start || null, end: end || null },
        entradas: { total: entradas, count: cEntradas },
        saidas: { total: saidas, count: cSaidas },
        trocas: { total: trocas, count: cTrocas, heuristica: true },
        saldo: entradas - saidas,
        observacao: 'Trocas são detectadas pela descrição (palavra "troca"/"devolução"); o controle formal virá com o módulo de devoluções.'
      });
    } catch (err) {
      console.error('Erro no relatório financeiro:', err);
      return res.status(500).json({ message: 'Erro ao gerar o relatório financeiro.' });
    }
  },

  // ===== RELATÓRIO DE ESTOQUE: quantidade parada (atual) e movimentada (período) =====
  async inventory(req, res) {
    try {
      const { start, end } = req.query;

      const { data: products, error: prodErr } = await supabase
        .from('products').select('name, variants');
      if (prodErr) throw prodErr;

      // A data da venda está no cabeçalho (sales); então descobrimos quais vendas
      // caem no período e filtramos os itens por esses sale_id.
      let salesQ = supabase.from('sales').select('id');
      salesQ = aplicarPeriodo(salesQ, start, end);
      const { data: salesInRange, error: salesErr } = await salesQ;
      if (salesErr) throw salesErr;
      const saleIds = new Set((salesInRange || []).map(s => s.id));

      const { data: allItems, error: itemsErr } = await supabase
        .from('sale_items').select('sale_id, variant_id, product_name, quantity');
      if (itemsErr) throw itemsErr;

      const temFiltro = !!(start || end);
      const items = (allItems || []).filter(i => !temFiltro || saleIds.has(i.sale_id));

      const movPorProduto = {};
      const variantesVendidas = new Set();
      let totalMovimentado = 0;
      for (const it of items) {
        const qty = Number(it.quantity) || 0;
        totalMovimentado += qty;
        movPorProduto[it.product_name] = (movPorProduto[it.product_name] || 0) + qty;
        if (it.variant_id) variantesVendidas.add(it.variant_id);
      }

      // estoque atual (snapshot de HOJE) + variações sem giro no período
      let totalEmEstoque = 0;
      const semGiro = [];
      for (const p of (products || [])) {
        if (!Array.isArray(p.variants)) continue;
        for (const v of p.variants) {
          const stock = Number(v.stock) || 0;
          totalEmEstoque += stock;
          if (stock > 0 && v.id && !variantesVendidas.has(v.id)) {
            semGiro.push({ produto: p.name, cor: v.color, tamanho: v.size, estoque: stock });
          }
        }
      }

      const topMovimentados = Object.entries(movPorProduto)
        .map(([produto, quantidade]) => ({ produto, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);

      semGiro.sort((a, b) => b.estoque - a.estoque);

      return res.status(200).json({
        periodo: { start: start || null, end: end || null },
        totalEmEstoque,                 // estoque ATUAL (hoje) — não depende do período
        totalMovimentado,               // vendido no período
        topMovimentados,                // por produto, no período
        semGiro: semGiro.slice(0, 50),  // itens com estoque e sem venda no período
        observacao: 'O "estoque atual" é a foto de hoje e não depende do período — não há histórico de movimentação para reconstruir o estoque de datas passadas. Já "movimentado", "mais movimentados" e "itens parados" consideram apenas as vendas dentro do período selecionado.'
      });
    } catch (err) {
      console.error('Erro no relatório de estoque:', err);
      return res.status(500).json({ message: 'Erro ao gerar o relatório de estoque.' });
    }
  },

  // ===== RELATÓRIO DE USUÁRIOS: ativos, funções e DETALHE por usuário =====
  async users(req, res) {
    try {
      const { start, end } = req.query;
      let q = supabase.from('audit_logs').select('user_email, action, created_at');
      q = aplicarPeriodo(q, start, end);
      const { data, error } = await q;
      if (error) throw error;

      const rows = data || [];
      const porUsuario = {};
      const porAcao = {};
      const matriz = {}; // usuario -> { acao -> contagem }

      for (const r of rows) {
        const u = r.user_email || 'DESCONHECIDO';
        const a = r.action || 'OUTRA';
        porUsuario[u] = (porUsuario[u] || 0) + 1;
        porAcao[a] = (porAcao[a] || 0) + 1;
        matriz[u] = matriz[u] || {};
        matriz[u][a] = (matriz[u][a] || 0) + 1;
      }

      const maisAtivos = Object.entries(porUsuario)
        .map(([usuario, acoes]) => ({ usuario, acoes }))
        .sort((a, b) => b.acoes - a.acoes);

      const funcoesMaisRealizadas = Object.entries(porAcao)
        .map(([acao, total]) => ({ acao, total }))
        .sort((a, b) => b.total - a.total);

      // Detalhe: para cada usuário, quais funções realizou e quantas vezes
      const detalhePorUsuario = Object.entries(matriz)
        .map(([usuario, acoesObj]) => {
          const acoes = Object.entries(acoesObj)
            .map(([acao, total]) => ({ acao, total }))
            .sort((a, b) => b.total - a.total);
          const totalAcoes = acoes.reduce((s, x) => s + x.total, 0);
          return { usuario, totalAcoes, acoes };
        })
        .sort((a, b) => b.totalAcoes - a.totalAcoes);

      return res.status(200).json({
        periodo: { start: start || null, end: end || null },
        totalAcoes: rows.length,
        maisAtivos,
        funcoesMaisRealizadas,
        detalhePorUsuario
      });
    } catch (err) {
      console.error('Erro no relatório de usuários:', err);
      return res.status(500).json({ message: 'Erro ao gerar o relatório de usuários.' });
    }
  }
};

module.exports = ReportController;