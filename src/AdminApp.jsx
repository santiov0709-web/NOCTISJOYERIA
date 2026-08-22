import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock, KeyRound, Plus, Trash2, Copy, Check,
  Image as ImageIcon, Video, RefreshCw, ShieldAlert,
  Sparkles, FolderPlus, Database, Wifi, WifiOff, ExternalLink, ArrowLeft
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './config/supabase';

const DEFAULT_PIN = '1804';
const STORAGE_KEY = 'noctis_custom_products';

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'list' | 'export'
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Anillos');
  const [customCategory, setCustomCategory] = useState('');
  const [spanClass, setSpanClass] = useState('gallery-card--normal');
  const [mediaItems, setMediaItems] = useState([
    { type: 'image', url: '' }
  ]);
  const [copied, setCopied] = useState(false);
  const [customProducts, setCustomProducts] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('noctis_admin_authenticated');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
    loadProducts();
  }, []);

  const loadProducts = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const formatted = data.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            spanClass: item.span_class || item.spanClass,
            media: item.media,
            createdAt: item.created_at
          }));
          setCustomProducts(formatted);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(formatted));
          return;
        }
      } catch (e) {
        console.error('Error cargando de Supabase:', e);
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCustomProducts(JSON.parse(stored));
      } else {
        setCustomProducts([]);
      }
    } catch (e) {
      console.error('Error cargando de localStorage:', e);
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === DEFAULT_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('noctis_admin_authenticated', 'true');
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('noctis_admin_authenticated');
  };

  const handleAddMedia = (type = 'image') => {
    setMediaItems([...mediaItems, { type, url: '' }]);
  };

  const handleRemoveMedia = (index) => {
    if (mediaItems.length <= 1) return;
    setMediaItems(mediaItems.filter((_, i) => i !== index));
  };

  const handleMediaChange = (index, field, value) => {
    const updated = [...mediaItems];
    updated[index][field] = value;
    setMediaItems(updated);
  };

  const handleFileUpload = (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const updated = [...mediaItems];
      updated[index] = {
        type: isVideo ? 'video' : 'image',
        url: dataUrl
      };
      setMediaItems(updated);
    };

    reader.readAsDataURL(file);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!productName.trim()) {
      alert('Por favor escribe el nombre del producto.');
      return;
    }

    const validMedia = mediaItems.filter(m => m.url.trim() !== '');
    if (validMedia.length === 0) {
      alert('Debes agregar al menos una foto o video válido.');
      return;
    }

    setIsSaving(true);
    const finalCategory = category === 'Otro' ? customCategory.trim() || 'Exclusivo' : category;

    const newProd = {
      id: 'custom-' + Date.now(),
      name: productName.trim(),
      category: finalCategory,
      spanClass: spanClass,
      media: validMedia,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('products').insert([
          {
            id: newProd.id,
            name: newProd.name,
            category: newProd.category,
            span_class: newProd.spanClass,
            media: newProd.media,
            created_at: newProd.createdAt
          }
        ]);

        if (error) {
          console.error('Error insertando en Supabase:', error);
        }
      } catch (err) {
        console.error('Error Supabase catch:', err);
      }
    }

    const existing = [newProd, ...customProducts];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    setCustomProducts(existing);

    setProductName('');
    setCustomCategory('');
    setMediaItems([{ type: 'image', url: '' }]);
    setIsSaving(false);

    setSuccessMessage(
      isSupabaseConfigured
        ? '✨ ¡Joya guardada en Supabase y publicada en tiempo real para todos los clientes!'
        : '✨ ¡Joya añadida con éxito!'
    );

    window.dispatchEvent(new Event('noctis_products_updated'));

    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  const handleDeleteCustomProduct = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta joya del catálogo?')) return;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.error('Error eliminando en Supabase:', err);
      }
    }

    const updated = customProducts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setCustomProducts(updated);
    window.dispatchEvent(new Event('noctis_products_updated'));
  };

  const handleCopyJson = () => {
    const jsonString = JSON.stringify(customProducts, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080a0d', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <header style={{
        padding: '16px 24px',
        background: 'rgba(12, 14, 18, 0.95)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d4af37', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
            <ArrowLeft size={16} /> Volver a la Tienda
          </a>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#d4af37" />
            <h1 className="font-cinzel" style={{ fontSize: '16px', margin: 0, letterSpacing: '0.1em', color: '#f5d77f' }}>
              NOCTIS JOYERIA · PANEL PRIVADO
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {isSupabaseConfigured ? (
            <span className="badge-supabase-active" style={{ padding: '4px 12px', fontSize: '11px' }}>
              <Wifi size={12} /> Supabase Cloud Conectado
            </span>
          ) : (
            <span className="badge-supabase-offline" style={{ padding: '4px 12px', fontSize: '11px' }}>
              <WifiOff size={12} /> Modo Local (Falta .env)
            </span>
          )}

          {isAuthenticated && (
            <button className="admin-tab-logout" onClick={handleLogout} style={{ padding: '8px 14px', borderRadius: '8px' }}>
              <Lock size={14} /> Salir
            </button>
          )}
        </div>
      </header>

      {/* Main View Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px' }}>
        {!isAuthenticated ? (
          /* Pantalla de Desbloqueo por PIN */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              maxWidth: '420px',
              width: '100%',
              margin: 'auto',
              background: '#0e1117',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '16px',
              padding: '40px 32px',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.2)'
            }}
          >
            <div className="admin-lock-icon-wrap" style={{ margin: '0 auto 20px' }}>
              <Lock size={36} color="#d4af37" />
            </div>
            <h2 className="font-cinzel" style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#fff' }}>Acceso Administrativo</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px', lineHeight: '1.5' }}>
              Ingresa el PIN de seguridad para gestionar el catálogo de joyas en la nube.
            </p>

            <form onSubmit={handlePinSubmit} className="admin-pin-form">
              <div className="admin-input-group">
                <KeyRound size={18} color="#888" className="admin-input-icon" />
                <input
                  type="password"
                  placeholder="PIN de Seguridad (1804)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className={`admin-input-field ${pinError ? 'error' : ''}`}
                  autoFocus
                />
              </div>

              {pinError && (
                <div className="admin-error-msg" style={{ marginTop: '8px' }}>
                  <ShieldAlert size={14} /> PIN incorrecto. Inténtalo de nuevo.
                </div>
              )}

              <button type="submit" className="admin-submit-btn font-unicase" style={{ marginTop: '16px' }}>
                Desbloquear Panel
              </button>
            </form>
          </motion.div>
        ) : (
          /* Dashboard Principal de Administración */
          <div style={{ maxWidth: '960px', width: '100%' }}>
            {/* Nav Tabs */}
            <div className="admin-tabs" style={{ background: '#0e1117', padding: '14px 20px', borderRadius: '14px 14px 0 0', border: '1px solid rgba(212, 175, 55, 0.25)', borderBottom: 'none' }}>
              <button
                className={`admin-tab-btn ${activeTab === 'add' ? 'active' : ''}`}
                onClick={() => setActiveTab('add')}
              >
                <Plus size={16} /> Añadir Joya
              </button>
              <button
                className={`admin-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                onClick={() => setActiveTab('list')}
              >
                <FolderPlus size={16} /> Joyas Guardadas ({customProducts.length})
              </button>
              <button
                className={`admin-tab-btn ${activeTab === 'export' ? 'active' : ''}`}
                onClick={() => setActiveTab('export')}
              >
                <Copy size={16} /> Copia de Seguridad JSON
              </button>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#f5d77f', fontSize: '12px', textDecoration: 'none' }}
              >
                Ver Tienda en Vivo <ExternalLink size={14} />
              </a>
            </div>

            {/* Tab Container */}
            <div style={{ background: '#0d0f14', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '0 0 14px 14px', minHeight: '520px' }}>
              {/* Tab 1: Formulario Añadir Joya */}
              {activeTab === 'add' && (
                <form onSubmit={handleCreateProduct} className="admin-form" style={{ maxHeight: 'none' }}>
                  {successMessage && (
                    <div className="admin-success-banner">
                      <Check size={16} /> {successMessage}
                    </div>
                  )}

                  <div className="admin-field-row">
                    <div className="admin-field-col">
                      <label className="admin-label">Nombre de la Joya *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Anillo de Oro 18k con Zafiro Azul"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="admin-input"
                      />
                    </div>

                    <div className="admin-field-col">
                      <label className="admin-label">Categoría</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="admin-select"
                      >
                        <option value="Anillos">Anillos 18k</option>
                        <option value="Pulseras">Pulseras 18k</option>
                        <option value="Cadenas">Cadenas & Dijes 18k</option>
                        <option value="Alta Joyería">Alta Joyería</option>
                        <option value="Otro">Otra Categoría Personalizada</option>
                      </select>
                    </div>
                  </div>

                  {category === 'Otro' && (
                    <div className="admin-field">
                      <label className="admin-label">Categoría Personalizada</label>
                      <input
                        type="text"
                        placeholder="Ej. Dijes, Aretes, Edición Limitada"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="admin-input"
                      />
                    </div>
                  )}

                  <div className="admin-field">
                    <label className="admin-label">Formato de Tarjeta en Galería</label>
                    <div className="admin-radio-group">
                      <label className={`admin-radio-btn ${spanClass === 'gallery-card--normal' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="spanClass"
                          value="gallery-card--normal"
                          checked={spanClass === 'gallery-card--normal'}
                          onChange={(e) => setSpanClass(e.target.value)}
                        />
                        <span>Estándar (Cuadrada)</span>
                      </label>
                      <label className={`admin-radio-btn ${spanClass === 'gallery-card--tall' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="spanClass"
                          value="gallery-card--tall"
                          checked={spanClass === 'gallery-card--tall'}
                          onChange={(e) => setSpanClass(e.target.value)}
                        />
                        <span>Alta (Destacada)</span>
                      </label>
                      <label className={`admin-radio-btn ${spanClass === 'gallery-card--wide' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="spanClass"
                          value="gallery-card--wide"
                          checked={spanClass === 'gallery-card--wide'}
                          onChange={(e) => setSpanClass(e.target.value)}
                        />
                        <span>Ancha (Colección)</span>
                      </label>
                    </div>
                  </div>

                  <div className="admin-field">
                    <div className="admin-media-header">
                      <label className="admin-label">Archivos Multimedia ({mediaItems.length})</label>
                      <div className="admin-media-add-buttons">
                        <button
                          type="button"
                          className="btn-add-media"
                          onClick={() => handleAddMedia('image')}
                        >
                          <ImageIcon size={14} /> + Foto URL
                        </button>
                        <button
                          type="button"
                          className="btn-add-media"
                          onClick={() => handleAddMedia('video')}
                        >
                          <Video size={14} /> + Video URL
                        </button>
                      </div>
                    </div>

                    <div className="admin-media-list">
                      {mediaItems.map((media, idx) => (
                        <div key={idx} className="admin-media-row">
                          <span className="admin-media-badge">
                            {media.type === 'video' ? '🎥 Video' : '📷 Foto'} #{idx + 1}
                          </span>

                          <input
                            type="text"
                            placeholder={media.type === 'video' ? '/media/mi-video.mp4 o URL externa' : '/media/mi-foto.jpg o URL de imagen'}
                            value={media.url}
                            onChange={(e) => handleMediaChange(idx, 'url', e.target.value)}
                            className="admin-input media-input"
                          />

                          <label className="admin-file-upload-btn" title="Cargar desde tu dispositivo">
                            📁 Cargar
                            <input
                              type="file"
                              accept={media.type === 'video' ? 'video/*' : 'image/*'}
                              onChange={(e) => handleFileUpload(idx, e)}
                              style={{ display: 'none' }}
                            />
                          </label>

                          {mediaItems.length > 1 && (
                            <button
                              type="button"
                              className="admin-media-del"
                              onClick={() => handleRemoveMedia(idx)}
                            >
                              <Trash2 size={14} color="#ff5555" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="admin-save-product-btn font-unicase"
                  >
                    {isSaving ? 'Guardando en la Nube...' : '✨ Publicar Joya en la Galería'}
                  </button>
                </form>
              )}

              {/* Tab 2: Joyas Guardadas */}
              {activeTab === 'list' && (
                <div className="admin-list-view" style={{ maxHeight: 'none' }}>
                  <div className="admin-list-header">
                    <h4>Joyas en la Nube ({customProducts.length})</h4>
                  </div>

                  {customProducts.length === 0 ? (
                    <div className="admin-empty-state">
                      <Database size={40} color="#555" />
                      <p>Aún no hay joyas adicionales agregadas.</p>
                      <button className="admin-btn-link" onClick={() => setActiveTab('add')}>
                        + Publicar la primera joya ahora
                      </button>
                    </div>
                  ) : (
                    <div className="admin-custom-items-grid">
                      {customProducts.map((prod) => (
                        <div key={prod.id} className="admin-custom-card">
                          <div className="admin-custom-card-preview">
                            {prod.media[0]?.type === 'video' ? (
                              <video src={prod.media[0]?.url} autoPlay muted loop className="preview-media" />
                            ) : (
                              <img src={prod.media[0]?.url} alt={prod.name} className="preview-media" />
                            )}
                            <span className="custom-card-badge">{prod.media?.length || 0} archivos</span>
                          </div>

                          <div className="admin-custom-card-info">
                            <span className="card-category">{prod.category}</span>
                            <h5 className="card-name">{prod.name}</h5>
                            <span className="card-date">
                              {prod.createdAt ? new Date(prod.createdAt).toLocaleDateString() : 'Reciente'}
                            </span>
                          </div>

                          <button
                            className="btn-delete-card"
                            onClick={() => handleDeleteCustomProduct(prod.id)}
                            title="Eliminar joya"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Copia JSON */}
              {activeTab === 'export' && (
                <div className="admin-export-view" style={{ maxHeight: 'none' }}>
                  <h4>Copia de Respaldo JSON</h4>
                  <p className="admin-export-desc">
                    Puedes copiar el código JSON de tus joyas registradas si deseas conservarlas en un respaldo local:
                  </p>

                  <div className="admin-json-box">
                    <pre>{JSON.stringify(customProducts, null, 2)}</pre>
                  </div>

                  <button className="admin-copy-json-btn font-unicase" onClick={handleCopyJson}>
                    {copied ? <Check size={18} color="#00ffb3" /> : <Copy size={18} />}
                    {copied ? '¡Copiado al Portapapeles!' : 'Copiar Estructura JSON'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
