// ─────────────────────────────────────────────
// NÚMERO OFICIAL DE NOCTIS JOYERÍA: 3137311578 (+57)
// Esquema nativo (whatsapp://) para abrir la APP instalada en el celular sin pasar por páginas web intermedias
// ─────────────────────────────────────────────
export const WA_NUMBER = '573137311578';

export const WA_DEFAULT_MSG = '¡Hola Noctis Joyería! 💛\nMe interesa recibir asesoría personalizada sobre sus joyas en Oro 18k.';

// Esquema directo nativo para celular (Abre la app nativa directamente)
export const WA_NATIVE_URL = `whatsapp://send?phone=${WA_NUMBER}&text=${encodeURIComponent(WA_DEFAULT_MSG)}`;

// Web fallback URL por si está en computador de escritorio sin la app instalada
export const WA_URL = `whatsapp://send?phone=${WA_NUMBER}&text=${encodeURIComponent(WA_DEFAULT_MSG)}`;

export function getWaUrl(text) {
  return `whatsapp://send?phone=${WA_NUMBER}&text=${encodeURIComponent(text || WA_DEFAULT_MSG)}`;
}

export function openNativeWhatsApp(text) {
  const customText = text || WA_DEFAULT_MSG;
  const nativeUrl = `whatsapp://send?phone=${WA_NUMBER}&text=${encodeURIComponent(customText)}`;
  
  // Abre el protocolo nativo whatsapp:// sin redirigir la página del navegador
  window.location.href = nativeUrl;
}
