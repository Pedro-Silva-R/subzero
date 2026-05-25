import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types.ts';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[SubZero] Faltan variables de entorno de Supabase. ' +
    'Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env.local'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
