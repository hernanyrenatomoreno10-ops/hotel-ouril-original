import { createClient } from '@supabase/supabase-js';

// Usamos variáveis de ambiente para a conexão com o Supabase.
// No Vite, as variáveis começam com VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
