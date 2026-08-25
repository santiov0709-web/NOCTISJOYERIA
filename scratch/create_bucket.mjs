import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jejecrygfjfwnfpiephq.supabase.co';
const supabaseAnonKey = 'sb_publishable_JpkDi8rs1S29TOzvSDa08g_td5QTOH-';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createBucket() {
  console.log('Intentando crear bucket...');
  const { data, error } = await supabase.storage.createBucket('jewelry', { public: true });
  
  if (error) {
    console.error('Error al crear bucket:', error.message);
  } else {
    console.log('Bucket creado con éxito:', data);
  }
}

createBucket();
