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

export const uploadMediaToSupabase = async (dataUrl, filename) => {
  if (!isSupabaseConfigured || !supabase) return dataUrl; // Fallback
  if (dataUrl.startsWith('http')) return dataUrl; // Ya es una URL pública

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    // Reemplazar espacios y caracteres raros en el nombre de archivo
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${safeFilename}`;
    
    const { data, error } = await supabase.storage
      .from('jewelry')
      .upload(`media/${uniqueName}`, blob, {
        cacheControl: '31536000',
        upsert: false
      });
      
    if (error) {
      console.error('Error al subir archivo a Supabase Storage:', error);
      return dataUrl; // Si falla, guardamos el Base64 como plan de contingencia
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('jewelry')
      .getPublicUrl(`media/${uniqueName}`);
      
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Excepción subiendo archivo al bucket:', err);
    return dataUrl;
  }
};
