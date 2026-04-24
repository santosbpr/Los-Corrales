// Simulação do Banco de Dados em Memória
const productsDb = [];
let productIdCounter = 1;

// Quando for usar o banco real, descomente a importação abaixo:
// const db = require('../config/database');

class Product {
    static async create(name, category, description) {
        // --- INÍCIO DA LÓGICA EM MEMÓRIA ---
        const newProduct = {
            id: productIdCounter++,
            name,
            category,
            description,
            created_at: new Date()
        };
        productsDb.push(newProduct);
        return newProduct;
        // --- FIM DA LÓGICA EM MEMÓRIA ---

        /* --- LÓGICA DO BANCO DE DADOS REAL (POSTGRESQL) ---
        const query = `
            INSERT INTO products (name, category, description, created_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING *;
        `;
        const values = [name, category, description];
        
        try {
            const { rows } = await db.query(query, values);
            return rows[0];
        } catch (error) {
            throw new Error(\`Erro ao criar produto: \${error.message}\`);
        }
        -------------------------------------------------- */
    }

    static async findAll() {
        // --- INÍCIO DA LÓGICA EM MEMÓRIA ---
        return productsDb;
        // --- FIM DA LÓGICA EM MEMÓRIA ---

        /* --- LÓGICA DO BANCO DE DADOS REAL (POSTGRESQL) ---
        const query = `SELECT * FROM products ORDER BY name ASC;`;
        try {
            const { rows } = await db.query(query);
            return rows;
        } catch (error) {
            throw new Error(\`Erro ao buscar produtos: \${error.message}\`);
        }
        -------------------------------------------------- */
    }
}

module.exports = Product;