const Product = require('../models/Product');
const Variant = require('../models/Variant');

const ProductController = {
    // Primeira função: Cadastrar
    async createProductWithVariants(req, res) {
        const { name, category, description, variants } = req.body;

        if (!name || !category) {
            return res.status(400).json({ error: 'Nome e categoria são obrigatórios.' });
        }

        try {
            const newProduct = await Product.create(name, category, description);

            let createdVariants = [];
            if (variants && variants.length > 0) {
                for (const item of variants) {
                    const variant = await Variant.create(
                        newProduct.id, 
                        item.sku, 
                        item.color, 
                        item.size, 
                        item.minStock
                    );
                    createdVariants.push(variant);
                }
            }

            return res.status(201).json({
                message: 'Produto e grades cadastrados com sucesso!',
                product: newProduct,
                variants: createdVariants
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro interno ao processar o cadastro.' });
        }
    },

    // Segunda função: Listar
    async listAll(req, res) {
        try {
            const products = await Product.findAll();
            return res.status(200).json(products);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar o catálogo de produtos.' });
        }
    },

    //Buscar Produto por ID e suas variantes
    async findById(req, res) {
        try {
            // Pega o ID que o usuário digitou na URL
            const { id } = req.params;

            // Busca o produto base
            const product = await Product.findById(id);

            if (!product) {
                return res.status(404).json({ error: 'Produto não encontrado.' });
            }

            // Se achou o produto, busca também as cores e tamanhos (variantes) dele
            const variants = await Variant.findByProductId(product.id);

            // Retorna tudo empacotado para o front-end
            return res.status(200).json({
                product: product,
                variants: variants
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Ocorreu um erro ao buscar os detalhes do produto.' });
        }
    }
};

module.exports = ProductController;