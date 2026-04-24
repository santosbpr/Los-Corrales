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
    }, // <-- OLHA A VÍRGULA AQUI! Ela é essencial para separar as funções.

    // Segunda função: Listar
    async listAll(req, res) {
        try {
            const products = await Product.findAll();
            return res.status(200).json(products);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar o catálogo de produtos.' });
        }
    }
};

module.exports = ProductController;