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
    }
};

module.exports = AuthController;