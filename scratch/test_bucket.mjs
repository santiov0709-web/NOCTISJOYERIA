import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jejecrygfjfwnfpiephq.supabase.co';
const supabaseAnonKey = 'sb_publishable_JpkDi8rs1S29TOzvSDa08g_td5QTOH-';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBucket() {
  console.log('Verificando buckets disponibles...');
  const { data, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error('Error obteniendo buckets:', error);
    return;
  }
  
  console.log('Buckets encontrados:');
  data.forEach(b => console.log(`- ${b.name} (Public: ${b.public})`));
  
  const jewelryBucket = data.find(b => b.name === 'jewelry');
  if (!jewelryBucket) {
    console.log('\n❌ EL BUCKET "jewelry" NO EXISTE. Por favor crealo en el dashboard.');
  } else {
    console.log('\n✅ El bucket "jewelry" existe.');
    if (!jewelryBucket.public) {
      console.log('⚠️ ADVERTENCIA: El bucket "jewelry" NO ES PÚBLICO. Debes hacerlo público.');
    } else {
      console.log('✅ El bucket "jewelry" es público y está listo.');
    }
  }
}

testBucket();
