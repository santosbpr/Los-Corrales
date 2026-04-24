// Simulação do Banco de Dados em Memória
const variantsDb = [];
let variantIdCounter = 1;

// Quando for usar o banco real, descomente a importação abaixo:
// const db = require('../config/database');

class Variant {
    static async create(productId, sku, color, size, minStock) {
        // --- INÍCIO DA LÓGICA EM MEMÓRIA ---
        const newVariant = {
            id: variantIdCounter++,
            product_id: productId,
            sku,
            color,
            size,
            minimum_stock: minStock || 0, // Se não vier valor, assume 0
            created_at: new Date()
        };
        variantsDb.push(newVariant);
        return newVariant;
        // --- FIM DA LÓGICA EM MEMÓRIA ---

        /* --- LÓGICA DO BANCO DE DADOS REAL (POSTGRESQL) ---
        const query = `
            INSERT INTO variants (product_id, sku, color, size, minimum_stock, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *;
        `;
        const values = [productId, sku, color, size, minStock];
        
        try {
            const { rows } = await db.query(query, values);
            return rows[0];
        } catch (error) {
            throw new Error(\`Erro ao criar variante: \${error.message}\`);
        }
        -------------------------------------------------- */
    }

    static async findByProductId(productId) {
        // --- INÍCIO DA LÓGICA EM MEMÓRIA ---
        return variantsDb.filter(variant => variant.product_id === productId);
        // --- FIM DA LÓGICA EM MEMÓRIA ---

        /* --- LÓGICA DO BANCO DE DADOS REAL (POSTGRESQL) ---
        const query = `
            SELECT * FROM variants 
            WHERE product_id = $1 
            ORDER BY color, size;
        `;
        try {
            const { rows } = await db.query(query, [productId]);
            return rows;
        } catch (error) {
            throw new Error(\`Erro ao buscar variantes do produto: \${error.message}\`);
        }
        -------------------------------------------------- */
    }
}

module.exports = Variant;