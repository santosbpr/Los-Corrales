# Documentação do Projeto (Los Corrales ERP)
#### Sistema de Gestão de Estoque, Vendas e Controle de Acesso

Breno Prado Dos Santos e Miguel Fraga Machado

Este artigo tem como objetivo ilustrar a documentação de um projeto final na unidade curricular Projeto de Desenvolvimento II do cursos Análise e Desenvolvimento de Sistemas e Ciência de Dados do Centro Universitário Senac-RS.

-----

## Resumo do Projeto
O presente projeto consiste no desenvolvimento de um sistema ERP (Enterprise Resource Planning) web para a loja Los Corrales. Partindo de um núcleo de gestão de estoque e controle de acesso, a solução evoluiu para cobrir o ciclo operacional do varejo: catálogo de produtos com variações, frente de caixa (PDV), integração com hardware de leitura de código de barras, controle financeiro, gestão de clientes (CRM), administração de usuários e um painel de indicadores em tempo real.

O controle manual de um inventário com projeção de escalabilidade para milhares de SKUs (Stock Keeping Units) resulta em ineficiência operacional e divergências de dados. A plataforma centraliza cadastro, vendas, finanças e autenticação em um único sistema, com autorização baseada em papéis. Com isso, busca-se otimizar o tempo de resposta da gerência, garantir a integridade e a rastreabilidade das informações e oferecer ao estabelecimento uma base sólida para evoluções futuras (compras, relatórios de margem e emissão fiscal).

## Definição do Problema
O varejo de vestuário e artigos de selaria lida com alta complexidade de variáveis no estoque, incluindo categorias, tamanhos, cores e controle de estoque mínimo por variante. A ausência de uma ferramenta sistêmica integrada torna o controle operacional suscetível a falhas humanas, perda de histórico e dificuldade na tomada de decisão em tempo real.

A falta de um sistema centralizado não apenas atrasa o atendimento ao cliente, como também compromete a segurança da informação, uma vez que dados sensíveis do negócio ficam dispersos ou acessíveis sem controle de privilégios. Além disso, o registro de vendas desconectado do cliente e do financeiro impede análises de faturamento, margem e recompra. O Los Corrales ERP propõe uma interface corporativa sob medida, baseada em arquitetura cliente-servidor desacoplada e consumo de API RESTful, integrando catálogo, vendas, finanças e segurança em um fluxo único.

## Objetivos
**Objetivo Geral:**
Desenvolver e implementar uma aplicação web Full Stack para o gerenciamento de estoque, vendas e autenticação corporativa da loja Los Corrales, substituindo controles manuais por uma plataforma centralizada, segura e de alta performance.

**Objetivos Específicos:**
* Criar uma interface de usuário (Frontend) responsiva e reativa para o controle de catálogo, vendas e indicadores.
* Desenvolver uma API (Backend) capaz de processar operações CRUD de forma segura e validada.
* Modelar o catálogo com variações por produto (cor, tamanho e estoque), identificador estável e SKU determinístico.
* Implementar uma frente de caixa (PDV) que registre a venda como uma transação completa (cabeçalho e itens), vinculada a cliente e forma de pagamento.
* Integrar o sistema a um hardware de leitura de código de barras para baixa automática de estoque.
* Automatizar o lançamento financeiro a cada venda e permitir lançamentos manuais (entradas e saídas).
* Estabelecer uma camada de segurança com autenticação de sessão e **autorização baseada em papéis** (Administrador e Caixa) aplicada no servidor e refletida na navegação.
* Disponibilizar a administração de usuários (criação, redefinição de senha e exclusão) restrita à gerência.
* Registrar em trilha de auditoria as ações sensíveis do sistema.
* Apresentar um Dashboard interativo com métricas operacionais atualizadas (faturamento, peças vendidas e alertas de estoque baixo).

## Stack Tecnológico
A arquitetura é baseada em JavaScript/TypeScript, com as seguintes tecnologias:

* **Node.js & Express (Backend):** escolhidos pela eficiência no processamento assíncrono (I/O não bloqueante) e pela facilidade na construção de APIs RESTful. O Express atua como framework de roteamento e organiza a aplicação em rotas, controladores, middlewares e serviços.
* **Angular (Frontend):** framework adotado pela robustez na criação de Single Page Applications (SPAs), com componentes *standalone*, formulários reativos, *guards* de rota e *interceptors* HTTP. O TypeScript garante tipagem estática e segurança na transição de dados.
* **Supabase / PostgreSQL (Banco de Dados e Auth):** utilizado como Backend as a Service (BaaS). Fornece um banco de dados relacional PostgreSQL integrado a um serviço de autenticação de usuários, além da Admin API utilizada para a gestão de contas pelo backend.
* **SweetAlert2:** biblioteca de notificações e diálogos (confirmações, prompts e *toasts*) que padroniza o retorno visual das operações.
* **Vitest (Testes):** execução dos testes unitários dos componentes Angular.
* **Integração IoT:** endpoint REST dedicado que recebe leituras de um microcontrolador/leitor de código de barras.

## Arquitetura da Solução
A solução é dividida em rotas públicas (Login) e rotas privadas (Dashboard, Estoque, PDV, Financeiro, CRM e Configurações). O acesso ocorre por uma tela de autenticação; uma vez logado, o cliente consome a API em Node.js, que por sua vez conversa com o PostgreSQL via Supabase.

Pontos centrais da arquitetura:

* **Configuração de API centralizada:** a URL da API vive em arquivos de ambiente (`environment.ts` / `environment.prod.ts`), com troca automática no *build* de produção. Não há URLs espalhadas pelos serviços.
* **Interceptor de autenticação:** todas as requisições destinadas à API recebem automaticamente o cabeçalho de identificação do usuário e o token de sessão, sem repetição de código nos serviços.
* **Guards de rota:** a navegação é protegida por *guards* — um exige usuário autenticado, outro restringe páginas de gestão ao papel Administrador, e um terceiro impede que usuários já logados retornem ao login.
* **Autorização no servidor:** independentemente do que o frontend exibe, o backend valida o papel do usuário a cada requisição sensível, sendo a fonte de verdade da segurança.

A figura abaixo ilustra uma visão geral da solução:
<img width="1884" height="853" alt="Captura de tela 2026-05-09 202000" src="https://github.com/user-attachments/assets/3dd0a190-0401-4780-9b9e-cb602d6a5d2c" />

## Modelo de Dados
As principais entidades persistidas no PostgreSQL são:

* **products:** catálogo. Cada produto possui `name`, `category`, `price`, `cost` e uma coluna `variants` (JSONB) com a lista de variações. Cada variação tem **identificador estável** (`id`), **SKU determinístico** (`COR-TAMANHO` derivado do SKU do produto), `color`, `size` e `stock`.
* **sales:** cabeçalho da venda — `customer_id`, `operator_email`, `payment_method` (Dinheiro, Pix ou Cartão), `subtotal`, `discount`, `total` e `status`.
* **sale_items:** itens da venda — `sale_id`, `product_id`, `variant_id`, *snapshots* de nome e variação, `quantity`, `unit_price` e `unit_cost` (custo **congelado** no momento da venda, base para o cálculo de margem).
* **financial_transactions:** movimentações financeiras (`ENTRADA`/`SAÍDA`), alimentadas automaticamente pelas vendas e por lançamentos manuais.
* **customers:** base de clientes do CRM.
* **profiles:** perfil de cada usuário (`email`, `role`), sincronizado automaticamente a partir da autenticação por um *trigger* de banco.
* **colors / sizes / categories:** tabelas de configuração que alimentam o cadastro de produtos.
* **audit_logs:** trilha de auditoria das ações sensíveis.

## Módulos do Sistema

### Autenticação e Controle de Acesso
A autenticação é feita via Supabase, que emite um token de sessão. O papel do usuário (`ADMIN` ou `CAIXA`) é lido da tabela `profiles` no login e usado para decidir a navegação. No servidor, um *middleware* de autorização confere o papel a cada operação restrita, de forma tolerante a maiúsculas/minúsculas. As páginas de gestão (Dashboard, Financeiro, CRM e Configurações) são exclusivas do Administrador; o Caixa acessa o PDV e a consulta de produtos.

### Gestão de Usuários
Restrita ao Administrador, permite **criar** novos funcionários (já com e-mail confirmado, via Admin API do Supabase, para acesso imediato), **redefinir senhas** e **excluir** usuários. Um *trigger* no banco garante que todo usuário criado tenha automaticamente seu perfil correspondente em `profiles`.

### Catálogo e Estoque
CRUD completo de produtos, com variações por cor e tamanho. Cada variação recebe um identificador estável e um SKU determinístico gerado pelo backend, evitando códigos aleatórios e garantindo consistência com as etiquetas físicas. O cadastro consome listas oficiais de cores, tamanhos e categorias, com filtragem reativa de tamanhos conforme a categoria selecionada.

### Frente de Caixa (PDV) e Vendas
O PDV registra a saída de mercadoria. Cada venda é gravada como uma **transação completa**: um cabeçalho em `sales` (com cliente, operador, forma de pagamento e total) e uma ou mais linhas em `sale_items`. O custo unitário é capturado no momento da venda, viabilizando o cálculo de margem. Toda venda decrementa o estoque da variação e gera o lançamento financeiro correspondente.

### Integração com Hardware (IoT)
Um endpoint REST recebe o código lido por um leitor de código de barras (ou microcontrolador). O sistema localiza a variação pelo SKU/identificador, baixa uma unidade do estoque e registra a venda no mesmo fluxo do PDV, devolvendo a confirmação para o dispositivo.

### Financeiro
Consolida as movimentações em um extrato (`ENTRADA`/`SAÍDA`), exibindo o saldo atual. As vendas geram entradas automaticamente; o gerente pode registrar lançamentos manuais (despesas, pagamentos a fornecedores etc.).

### CRM
Cadastro e listagem de clientes. Com a venda agora vinculada ao cliente, a base está preparada para evoluir para histórico de compras e indicadores de recompra.

### Dashboard / Inteligência de Negócio
Apresenta o faturamento total, o total de peças vendidas (somado a partir de `sale_items`) e um alerta de estoque baixo, varrendo todas as variações de todos os produtos e destacando as que estão abaixo do mínimo.

### Auditoria
Ações sensíveis — exclusão de produtos, redefinição de senha, exclusão de usuários e registros de venda — são gravadas em `audit_logs`, com identificação do responsável, para rastreabilidade.

## Segurança e Qualidade
* **Autorização no servidor:** a verificação de papel acontece no backend a cada requisição sensível; o frontend apenas reflete essa regra na navegação.
* **Segregação de chaves:** a chave de serviço do Supabase (necessária para operações administrativas) é usada **somente no backend**, nunca exposta ao cliente.
* **Estados de carregamento:** as ações de venda, lançamento financeiro e cadastro desabilitam o botão durante o processamento, evitando submissões duplicadas (vendas ou lançamentos em duplicidade).
* **Notificações padronizadas:** retorno visual consistente via SweetAlert2.
* **Padrão visual escopado:** cada página possui estilos próprios (escopados ao componente), seguindo um sistema visual comum, sem folhas de estilo globais.
* **Testes unitários:** componentes cobertos por testes com Vitest, garantindo que a aplicação inicializa corretamente.

## Trabalhos Futuros (Roadmap)
O sistema foi projetado para evoluir em fases. As próximas etapas previstas são:

* **Carrinho de vendas:** o PDV passar a montar uma venda com múltiplos itens, descontos e seleção de cliente por busca, com gravação atômica via função no banco (RPC).
* **Compras e Fornecedores:** módulo de entrada de estoque, fechando o ciclo do inventário (hoje o estoque diminui pelas vendas, mas a reposição é manual), com atualização de custo médio.
* **Relatórios e Margem:** painéis com filtro de período — vendas por dia/mês, por categoria, por forma de pagamento e por operador, além do lucro (receita − custo).
* **Fechamento de Caixa:** abertura e fechamento de turno por operador, com conferência de valores.
* **Trocas e Devoluções:** fluxo específico, essencial no varejo de vestuário.
* **Validação criptográfica do token no backend** e, futuramente, **emissão fiscal (NFC-e)**.

## Anexo — Exemplos de Código

**Autenticação (Node.js + Supabase):**
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password
});
```

**Autorização por papel (middleware Express):**
```javascript
const authorize = (allowedRoles = []) => {
  const permitidos = allowedRoles.map(r => r.toUpperCase());
  return async (req, res, next) => {
    const userEmail = req.headers['user-email'];
    if (!userEmail) return res.status(401).json({ message: 'Usuário não identificado.' });

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('email', userEmail).single();

    const role = String(profile?.role || '').toUpperCase();
    if (!permitidos.includes(role)) {
      return res.status(403).json({ message: 'Permissão insuficiente.' });
    }
    next();
  };
};
```

**Registro da venda como transação (cabeçalho + itens):**
```javascript
// Cria o cabeçalho em 'sales' e as linhas em 'sale_items',
// e lança o total no financeiro.
await recordSale({
  customer_id,
  operator_email,
  payment_method,            // DINHEIRO | PIX | CARTAO
  items: [{
    product_id, variant_id, product_name, variant_info,
    quantity, unit_price, unit_cost   // custo congelado p/ margem
  }]
});
```