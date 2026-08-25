import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jejecrygfjfwnfpiephq.supabase.co';
const supabaseAnonKey = 'sb_publishable_JpkDi8rs1S29TOzvSDa08g_td5QTOH-';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function uploadToStorage(dataUrl, filename) {
  if (dataUrl.startsWith('http')) return dataUrl;

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${safeFilename}`;
    
    const { data, error } = await supabase.storage
      .from('jewelry')
      .upload(`media/${uniqueName}`, blob, {
        cacheControl: '31536000',
        upsert: false
      });
      
    if (error) {
      console.error(`Error subiendo ${filename}:`, error.message);
      return dataUrl;
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('jewelry')
      .getPublicUrl(`media/${uniqueName}`);
      
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error(`Excepción subiendo ${filename}:`, err);
    return dataUrl;
  }
}

async function runMigration() {
  console.log('Iniciando migración de Base64 a Supabase Storage...');
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*');
    
  if (error) {
    console.error('Error obteniendo productos:', error);
    return;
  }

  let totalMigrated = 0;

  for (const product of products) {
    let needsUpdate = false;
    const newMedia = [];

    if (!product.media || !Array.isArray(product.media)) continue;

    for (const m of product.media) {
      if (m.url && m.url.startsWith('data:')) {
        console.log(`Migrando archivo Base64 para el producto: ${product.name}...`);
        const newUrl = await uploadToStorage(m.url, m.name || (m.type === 'video' ? 'video.mp4' : 'foto.jpg'));
        newMedia.push({ ...m, url: newUrl });
        if (newUrl.startsWith('http')) {
          needsUpdate = true;
        }
      } else {
        newMedia.push(m);
      }
    }

    if (needsUpdate) {
      console.log(`Actualizando producto ${product.name} en la base de datos...`);
      const { error: updateError } = await supabase
        .from('products')
        .update({ media: newMedia })
        .eq('id', product.id);
        
      if (updateError) {
        console.error(`Error actualizando ${product.name}:`, updateError);
      } else {
        console.log(`✅ Producto ${product.name} actualizado con éxito.`);
        totalMigrated++;
      }
    } else {
      console.log(`⏩ Producto ${product.name} ya está optimizado.`);
    }
  }

  console.log(`\n🎉 Migración completada. ${totalMigrated} productos optimizados.`);
}

runMigration();
