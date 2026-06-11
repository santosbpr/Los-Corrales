const supabase = require('../config/supabase');

const AuthController = {
    async login(req, res) {
        const { email, password } = req.body;
    
        //Login com a senha passa pelo Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) { //Mensagem de erro caso as credenciais estejam erradas
            return res.status(401).json({ error: 'E-mail ou senha inválidas' });
        }

        return res.status(200).json({
            message: 'Login bem-sucedido',
            token: data.session.access_token,
            user:{
                id: data.user.id,
                email: data.user.email
            }
        });
    },

    async register(req, res) {
        const { email, password, role } = req.body;

        // Registo no Supabase
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { role: role || 'CAIXA' } // Guarda o cargo no perfil do utilizador
            }
        });

        if (error) {
            return res.status(400).json({ message: error.message });
        }

        return res.status(201).json({
            message: 'Utilizador criado com sucesso',
            user: {
                id: data.user.id,
                email: data.user.email,
                role: data.user.user_metadata.role
            }
        });
    }
};

module.exports = {
    login: AuthController.login,
    register: AuthController.register
};