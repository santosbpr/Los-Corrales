//Simulaçao de um banco de dados em memória
let variantIdCounter = 1;
const variantsDb = [];

//const db = require('../config/db');

class Variant {
   
    //Cria uma nova variante "Filho" associada a um produto
    static async create(productId, sku, color, size, minimumStock) {
        // Logica em memoria
        const newVariant = {
            id: variantIdCounter++,
            product_id: productId,
            sku,
            color,
            size,
            minimum_stock: minimumStock || 0,
            created_at: new Date()
        };
        variantsDb.push(newVariant);
        return newVariant;
        //FIM DA LOGICA EM MEMORIA

        // const query = `INSERT INTO variants (product_id, sku, color, size, minimum_stock, created_at)
        //                 VALUES ($1, $2, $3, $4, $5, NOW())
        //                 RETURNING *;
        // `;
        // const values = [productId, sku, color, size, minimumStock];

        // try {
        //     const { rows } = await db.query(query, values);
        //     return rows[0]; // Retorna a variante criada
        // } catch (error) {
        //     throw new Error(`Erro ao criar variante: ${error.message}`);
        // }
    }

    //Busca todas as variantes associadas a um produto específico
    static async findByProductId(productId) {
        // Logica em memoria
        return variantsDb.filter(variant => variant.product_id === productId);
        // fim da logica em memoria
                
        // const query = `SELECT * FROM variants WHERE product_id = $1 ORDER BY color, size;`;
        // try {
        //     const { rows } = await db.query(query, [productId]);
        //     return rows; // Retorna a lista de variantes para o produto
        // } catch (error) {
        //     throw new Error(`Erro ao buscar variantes: ${error.message}`);
        // }
    }   
}

module.exports = Variant;