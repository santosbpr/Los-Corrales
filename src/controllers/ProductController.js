const Product = require('../models/Product');
const Variant = require('../models/Variant');

class ProductController {
    //Cria um novo produto "Pai" e suas variantes "Filhos"
    static async createProductWithVariants(req, res) {
        const { name, description, category, variants } = req.body; // Espera um array de variantes no corpo da requisição

        //Validação básica
        if (!name || !category) {
            return res.status(400).json({ error: 'Nome e categoria do produto são obrigatórios.' });
        }
        
        try {
            //1. Cria o produto base
            const newProduct = await Product.create(name, description, category);
            
            //2. Se houver variantes, cria todas atreladas ao ID do produto recém-criado
            let createdVariants = [];
            if (variants && variants.length > 0) {
                //Usa um loop para o banco processar na ordem certa.
                for (const item of variants) {
                    const variant = await Variant.create(
                        newProduct.id, // ID do produto pai
                        item.sku,
                        item.color,
                        item.size,
                        item.minimumStock
                    );
                    createdVariants.push(variant);
                }
            }

            //3. Retorna o sucesso para o front-end
            return res.status(201).json({
                message: 'Produto e variantes criados com sucesso!',
                product: newProduct,
                variants: createdVariants
            });
        } catch (error) {
            console.error('Erro ao criar produto e variantes:', error);
            return res.status(500).json({ error: 'Ocorreu um erro ao criar o produto e suas variantes.' });
        }
    }

    //Rota para listar tudo
    async listAll(req, res) {
        try {
            const products = await Product.findAll();
            return res.status(200).json({ products });
        } catch (error) {
            return res.status(500).json({ error: 'Ocorreu um erro ao buscar os produtos.' });
        }
    }   
};

module.exports = ProductController;