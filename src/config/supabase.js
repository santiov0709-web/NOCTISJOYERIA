import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jejecrygfjfwnfpiephq.supabase.co';
const supabaseAnonKey = 'sb_publishable_JpkDi8rs1S29TOzvSDa08g_td5QTOH-';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('YOUR_SUPABASE')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
