/**
 * SEED de dados de teste — Los Corrales ERP
 * -----------------------------------------------------------------------------
 * Popula fornecedores, produtos (com variações e vínculo a fornecedor),
 * clientes e um lote de vendas espalhadas nos últimos ~90 dias.
 *
 * Uso (a partir da pasta backend/, com o .env configurado):
 *   node seed.js            -> adiciona dados de teste
 *   node seed.js --reset    -> APAGA vendas/produtos/clientes/fornecedores e recria do zero
 *
 * ⚠️  Rode apenas em ambiente de TESTE. Usuários de login NÃO são criados aqui
 *     (eles vivem no auth do Supabase — use a tela de Configurações).
 */
require('dotenv').config();
const crypto = require('crypto');
const supabase = require('./src/config/supabase');

const RESET = process.argv.includes('--reset');
const OPERADOR = 'seed@loscorrales.com';
const N_VENDAS = 45;

// ---------- helpers ----------
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const diasAtrasISO = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

function makeVariantSku(productSku, color, size) {
  const c = String(color).toUpperCase().replace(/\s+/g, '');
  const s = String(size).toUpperCase().replace(/\s+/g, '');
  return `${productSku}-${c}-${s}`;
}

// ---------- dados base (tema: vestuário/selaria gaúcha) ----------
const FORNECEDORES = [
  { name: 'Couros do Pampa Ltda',   cnpj: '12.345.678/0001-11', phone: '(51) 3111-1000', email: 'contato@courosdopampa.com', contact_name: 'Ariel Motta',    category: 'Couro e Selaria', notes: 'Entrega em 7 dias úteis.' },
  { name: 'Tecidos Sul Distribuidora', cnpj: '98.765.432/0001-22', phone: '(51) 3222-2000', email: 'vendas@tecidossul.com',     contact_name: 'Marta Réel',    category: 'Tecidos',         notes: 'Pedido mínimo R$ 1.000.' },
  { name: 'Chapelaria Gaúcha ME',   cnpj: '11.222.333/0001-33', phone: '(54) 3033-3000', email: 'comercial@chapelariagaucha.com', contact_name: 'Nestor Braga', category: 'Acessórios',      notes: '' },
  { name: 'Calçados Fronteira SA',  cnpj: '44.555.666/0001-44', phone: '(53) 3044-4000', email: 'sac@calcadosfronteira.com', contact_name: 'Célia Nunes',   category: 'Calçados',        notes: 'Trocas em até 30 dias.' }
];

const CATALOGO = [
  { name: 'Bombacha Tradicional',      category: 'Bombachas',  price: 289.90, cost: 150, cores: ['Bege', 'Preto', 'Caqui'], tamanhos: ['38', '40', '42', '44'] },
  { name: 'Bota Texana de Couro',      category: 'Calçados',   price: 459.90, cost: 260, cores: ['Marrom', 'Preto'],        tamanhos: ['38', '39', '40', '41', '42'] },
  { name: 'Camisa Social Xadrez',      category: 'Camisas',    price: 139.90, cost: 60,  cores: ['Azul', 'Vermelho', 'Verde'], tamanhos: ['P', 'M', 'G', 'GG'] },
  { name: 'Chapéu de Feltro',          category: 'Acessórios', price: 199.90, cost: 90,  cores: ['Preto', 'Marrom'],        tamanhos: ['ÚNICO'] },
  { name: 'Cinto de Couro com Fivela', category: 'Acessórios', price: 119.90, cost: 45,  cores: ['Marrom', 'Preto'],        tamanhos: ['90', '100', '110'] },
  { name: 'Bermuda Sarja Cargo',       category: 'Bermudas',   price: 99.90,  cost: 40,  cores: ['Azul', 'Bege', 'Verde'],  tamanhos: ['38', '40', '42', '44'] },
  { name: 'Jaqueta Jeans',             category: 'Jaquetas',   price: 249.90, cost: 120, cores: ['Azul', 'Preto'],          tamanhos: ['P', 'M', 'G', 'GG'] },
  { name: 'Lenço de Seda',             category: 'Acessórios', price: 59.90,  cost: 20,  cores: ['Vermelho', 'Azul'],       tamanhos: ['ÚNICO'] },
  { name: 'Meia-Bota Feminina',        category: 'Calçados',   price: 329.90, cost: 170, cores: ['Caramelo', 'Preto'],      tamanhos: ['35', '36', '37', '38'] },
  { name: 'Colete de Lã',              category: 'Coletes',    price: 179.90, cost: 80,  cores: ['Cinza', 'Marrom'],        tamanhos: ['P', 'M', 'G'] }
];

const CLIENTES = [
  { name: 'João da Silva',        cpf: '111.111.111-11', phone: '(51) 99911-0001', email: 'joao.silva@email.com' },
  { name: 'Maria Fernandes',      cpf: '222.222.222-22', phone: '(51) 99911-0002', email: 'maria.f@email.com' },
  { name: 'Pedro Rodrigues',      cpf: '333.333.333-33', phone: '(54) 99911-0003', email: 'pedro.r@email.com' },
  { name: 'Ana Beatriz Costa',    cpf: '444.444.444-44', phone: '(53) 99911-0004', email: 'ana.costa@email.com' },
  { name: 'Carlos Eduardo Lima',  cpf: '555.555.555-55', phone: '(51) 99911-0005', email: 'cadu.lima@email.com' },
  { name: 'Fernanda Oliveira',    cpf: '666.666.666-66', phone: '(51) 99911-0006', email: 'fe.oliveira@email.com' }
];

// ---------- reset opcional ----------
async function resetar() {
  console.log('🧹 Limpando dados de teste (--reset)...');
  // Ordem respeita dependências (itens antes das vendas, etc.)
  const tabelas = ['exchanges', 'sale_items', 'financial_transactions', 'sales', 'products', 'suppliers', 'customers'];
  for (const t of tabelas) {
    const { error } = await supabase.from(t).delete().neq('id', 0); // apaga tudo (id nunca é 0)
    if (error) console.warn(`  aviso ao limpar ${t}: ${error.message}`);
    else console.log(`  ✔ ${t} limpa`);
  }
}

// ---------- main ----------
async function main() {
  console.log('🌱 Seed Los Corrales — início');

  if (RESET) await resetar();

  // 1) Fornecedores
  const { data: fornecedores, error: eF } = await supabase.from('suppliers').insert(FORNECEDORES).select();
  if (eF) throw eF;
  console.log(`🚚 ${fornecedores.length} fornecedores inseridos`);

  // 2) Produtos (um registro por produto, com todas as variações no JSONB)
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
  let seq = (count || 0);

  const produtosPayload = CATALOGO.map((p) => {
    seq += 1;
    const prefix = p.category.substring(0, 3).toUpperCase();
    const productSku = `${prefix}-${String(seq).padStart(4, '0')}`;
    const variants = [];
    for (const cor of p.cores) {
      for (const tam of p.tamanhos) {
        variants.push({
          id: crypto.randomUUID(),
          sku: makeVariantSku(productSku, cor, tam),
          color: cor,
          size: tam,
          stock: rand(15, 60)
        });
      }
    }
    return {
      name: p.name,
      category: p.category,
      description: 'Produto de teste (seed)',
      price: p.price,
      cost: p.cost,
      sku: productSku,
      supplier_id: pick(fornecedores).id,
      variants
    };
  });

  const { data: produtos, error: eP } = await supabase.from('products').insert(produtosPayload).select();
  if (eP) throw eP;
  console.log(`👕 ${produtos.length} produtos inseridos (com variações e fornecedor)`);

  // achata todas as variações disponíveis para sortear nas vendas
  const variacoes = [];
  for (const prod of produtos) {
    for (const v of (prod.variants || [])) {
      variacoes.push({ product_id: prod.id, variant_id: v.id });
    }
  }

  // 3) Clientes
  const { data: clientes, error: eC } = await supabase.from('customers').insert(CLIENTES).select();
  if (eC) throw eC;
  console.log(`🧑 ${clientes.length} clientes inseridos`);

  // 4) Vendas (via RPC registrar_venda) + backdate/source
  const pagamentos = ['DINHEIRO', 'PIX', 'CARTAO'];
  let ok = 0, falhas = 0;
  let avisouSource = false, avisouFin = false;

  for (let i = 0; i < N_VENDAS; i++) {
    const nItens = rand(1, 3);
    const escolhidas = [];
    const itens = [];
    for (let j = 0; j < nItens; j++) {
      const v = pick(variacoes);
      if (escolhidas.includes(v.variant_id)) continue; // evita repetir a mesma variação na venda
      escolhidas.push(v.variant_id);
      itens.push({ product_id: v.product_id, variant_id: v.variant_id, quantity: rand(1, 3) });
    }
    if (itens.length === 0) continue;

    const cliente = Math.random() < 0.75 ? pick(clientes) : null; // 25% avulsa
    const pagamento = pick(pagamentos);
    const desconto = Math.random() < 0.2 ? rand(5, 30) : 0;

    const { data: saleId, error } = await supabase.rpc('registrar_venda', {
      p_customer_id: cliente ? cliente.id : null,
      p_operator: OPERADOR,
      p_payment: pagamento,
      p_items: itens,
      p_discount: desconto
    });

    if (error) { falhas++; console.warn(`  venda ${i + 1} falhou: ${error.message}`); continue; }
    ok++;

    // Backdate + tipo de venda (independe da assinatura da RPC)
    const dataISO = diasAtrasISO(rand(1, 90));
    const source = Math.random() < 0.7 ? 'PRESENCIAL' : 'ECOMMERCE';

    // sales.created_at + source
    let upd = await supabase.from('sales').update({ created_at: dataISO, source }).eq('id', saleId);
    if (upd.error) {
      // tenta sem 'source' (coluna pode não existir)
      const upd2 = await supabase.from('sales').update({ created_at: dataISO }).eq('id', saleId);
      if (upd2.error && !avisouSource) { console.warn(`  aviso: não foi possível ajustar data/source da venda (${upd2.error.message})`); avisouSource = true; }
      else if (!avisouSource) { console.warn('  aviso: coluna "source" ausente — vendas ficam como PRESENCIAL.'); avisouSource = true; }
    }

    // financial_transactions.created_at (para o relatório financeiro por período)
    const updFin = await supabase.from('financial_transactions').update({ created_at: dataISO }).eq('sale_id', saleId);
    if (updFin.error && !avisouFin) { console.warn(`  aviso: não foi possível backdater o financeiro por sale_id (${updFin.error.message})`); avisouFin = true; }
  }

  console.log(`💳 Vendas: ${ok} criadas, ${falhas} falharam`);
  console.log('✅ Seed concluído.');
}

main().catch((err) => {
  console.error('❌ Erro no seed:', err.message || err);
  process.exit(1);
});