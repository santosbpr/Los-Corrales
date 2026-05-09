# Documentação do Projeto (Los Corrales ERP)
#### Sistema de Gestão de Estoque e Movimentações

Breno Prado Dos Santos

Este artigo tem como objetivo ilustrar a documentação de um projeto final na unidade curricular Projeto de Desenvolvimento II dos cursos Análise e Desenvolvimento de Sistemas, Sistemas para Internet e Ciência de Dados e Inteligência Analítica do Centro Universitário Senac-RS.

-----

## Resumo do Projeto
O presente projeto consiste no desenvolvimento de um sistema ERP (Enterprise Resource Planning) web focado na gestão de estoque e controle de acesso para a loja Los Corrales. O controle manual de um inventário com projeção de escalabilidade para milhares de SKUs (Stock Keeping Units) resulta em ineficiência operacional e divergências de dados. A solução centraliza o cadastro de produtos, filtragem reativa e autenticação de usuários em uma plataforma única. Com isso, busca-se otimizar o tempo de resposta da gerência, garantir a integridade das informações e preparar o estabelecimento comercial para futuras integrações de fluxo de caixa e ponto de venda.

## Definição do Problema
O varejo de vestuário e artigos de selaria lida com uma alta complexidade de variáveis em seu estoque, incluindo categorias, tamanhos, cores e controle de estoque mínimo por variante. Atualmente, a ausência de uma ferramenta sistêmica integrada faz com que o controle operacional seja suscetível a falhas humanas, perda de histórico e dificuldade na tomada de decisões em tempo real.

A falta de um sistema centralizado não apenas atrasa o atendimento ao cliente, como também compromete a segurança da informação, uma vez que dados sensíveis do negócio ficam dispersos ou acessíveis sem controle de privilégios. Projetos correlatos no mercado costumam oferecer soluções genéricas, enquanto o Los Corrales ERP propõe uma interface corporativa sob medida, baseada em arquitetura de microsserviços e consumo de API RESTful, garantindo que o gerenciamento de categorias e produtos seja fluido e seguro.

## Objetivos
**Objetivo Geral:**
Desenvolver e implementar uma aplicação web Full Stack para o gerenciamento de estoque e autenticação corporativa da loja Los Corrales, substituindo controles manuais por uma plataforma centralizada e de alta performance.

**Objetivos Específicos:**
* Criar uma interface de usuário (Frontend) responsiva e reativa para o controle de catálogo.
* Desenvolver uma API (Backend) capaz de processar operações CRUD (Create, Read, Update, Delete) de forma segura.
* Implementar um sistema de filtragem de dados em tempo real no lado do cliente.
* Projetar e conectar um banco de dados relacional em nuvem para a persistência dos registros.
* Estabelecer uma camada de segurança com autenticação via Token JWT para acesso às rotas gerenciais.
* Apresentar um Dashboard interativo que forneça métricas operacionais atualizadas em tempo real.

## Stack Tecnológico
Para atender aos requisitos de escalabilidade e modernidade, o projeto foi construído sobre uma arquitetura baseada em JavaScript/TypeScript, utilizando as seguintes tecnologias:

* **Node.js & Express (Backend):** Escolhidos por sua eficiência no processamento de requisições assíncronas (I/O não bloqueante) e facilidade na construção de APIs RESTful. O Express atua como o framework de roteamento principal.
* **Angular (Frontend):** Framework adotado pela sua robustez na criação de Single Page Applications (SPAs). O uso de TypeScript garante tipagem estática e segurança na transição de dados, enquanto ferramentas nativas permitem a manipulação de DOM em tempo real e validação de formulários.
* **Supabase / PostgreSQL (Banco de Dados e Auth):** Utilizado como Backend as a Service (BaaS). A escolha do Supabase justifica-se por fornecer um banco de dados relacional poderoso (PostgreSQL) sob o capô, integrado nativamente a um serviço de autenticação de usuários.

## Descrição da Solução
A solução foi arquitetada como uma aplicação web dividida em rotas públicas (Login) e rotas privadas (Dashboard e Estoque). O acesso inicial ocorre através de uma interface de "Split Screen", onde o usuário corporativo deve fornecer credenciais válidas. Uma vez autenticado, o sistema consome a API desenvolvida em Node.js para buscar e apresentar métricas atualizadas no Dashboard. A tela de gestão de estoque disponibiliza um ciclo completo de CRUD, com busca reativa no lado do cliente.

A figura abaixo ilustra uma visão geral de solução
![image](cole_aqui_o_link_do_print_da_sua_tela_de_estoque_ou_dashboard)

Exemplo de código da Autenticação (Node.js + Supabase):
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password
});
