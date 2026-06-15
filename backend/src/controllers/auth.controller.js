const supabase = require('../config/supabase');

const AuthController = {
    async login(req, res) {
        const { email, password } = req.body;

        // Autenticação via Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            return res.status(401).json({ error: 'E-mail ou senha inválidas' });
        }

        // Busca o papel (role) na tabela profiles para devolver ao frontend.
        // Default seguro: CAIXA, caso o perfil ainda não tenha role definido.
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('email', data.user.email)
            .single();

        const role = String(profile?.role || 'CAIXA').toUpperCase();

        return res.status(200).json({
            message: 'Login bem-sucedido',
            token: data.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email,
                role: role
            }
        });
    },

    async register(req, res) {
        const { email, password, role } = req.body;

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { role: role || 'CAIXA' } // o gatilho do banco copia isto para profiles
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