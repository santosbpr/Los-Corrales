require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;

// O BACKEND faz operações privilegiadas (ler 'profiles' p/ autorização, gravar audit_logs).
// A chave service_role ignora RLS — é o que evita o SELECT vazio que dispara o 403.
// Mantém fallback para a anon key para não quebrar caso a service ainda não esteja no .env.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ATENÇÃO: SUPABASE_URL e uma chave (SERVICE_ROLE ou ANON) precisam estar no .env.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;