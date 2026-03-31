import { createClient } from '@supabase/supabase-js';

// Essas variáveis de ambiente precisam ser fornecidas pela Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO CRÍTICO: Variáveis do Supabase não foram encontradas na Vercel.');
}

// Fornece um valor provisório falso para que "createClient" não derrube a tela inteira com erro,
// mas as consultas de dados irão falhar até que a Vercel contenha as credenciais corretas.
export const supabase = createClient(
  supabaseUrl || 'https://projeto-sem-url.supabase.co',
  supabaseAnonKey || 'chave-publica-inexistente'
);
