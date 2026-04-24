require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 1. Pegamos as chaves do seu arquivo .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// 2. AQUI ESTAVA O PROBLEMA! Precisamos garantir que o "const supabase =" está aqui:
const supabase = createClient(supabaseUrl, supabaseKey);

// 3. Agora sim, ele sabe quem é "supabase" e pode exportar!
module.exports = supabase;