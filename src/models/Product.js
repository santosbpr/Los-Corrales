const db = require('../config/database');

class Product {
    //Cria um novo produto "Pai"
    static async create(name, description, category) {
        const query = `INSERT INTO products (name, description, category, created_at) 
                       VALUES ($1, $2, $3, NOW()) 
                       RETURNING *;
        `;
        const values = [name, description, category];

        try {
            const { rows } = await db.query(query, values);
            return rows[0]; // Retorna o produto criado
        } catch (error) {
            throw new Error(`Erro ao criar produto: ${error.message}`);
        }
    }

    //Busca todos produtos para a listagem inicial
    static async findAll() {
        const query = `SELECT * FROM products ORDER BY created_at ASC;`;
        try {
            const { rows } = await db.query(query);
            return rows; // Retorna a lista de produtos
        } catch (error) {
            throw new Error(`Erro ao buscar produtos: ${error.message}`);
        }
    }
}

module.exports = Product;