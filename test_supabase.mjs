import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jejecrygfjfwnfpiephq.supabase.co';
const supabaseAnonKey = 'sb_publishable_JpkDi8rs1S29TOzvSDa08g_td5QTOH-';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing Supabase query...');
  const { data, error } = await supabase.from('products').select('id, name');
  console.log('Error:', error);
  console.log('Data:', data);
  console.log('Total de registros:', data ? data.length : 0);
}

test();
