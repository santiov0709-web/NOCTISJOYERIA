import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, KeyRound, Plus, Trash2, Copy, Check, Image as ImageIcon, Video, RefreshCw, ShieldAlert, Sparkles, FolderPlus, Database, Wifi, WifiOff, Edit, RotateCcw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { INITIAL_GALLERY_ITEMS } from '../config/initialProducts';

const DEFAULT_PIN = import.meta.env.VITE_ADMIN_PIN || '1804';
const STORAGE_KEY = 'noctis_custom_products';

export default function AdminPanelModal({ open, onClose, onProductsUpdated }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Form state
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'list' | 'export'
  const [editingProductId, setEditingProductId] = useState(null);
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

  // Check session storage on mount
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('noctis_admin_authenticated');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
    loadProducts();
  }, []);

  const loadProducts = async () => {
    let supabaseList = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          supabaseList = data.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            spanClass: item.span_class || item.spanClass,
            media: item.media,
            createdAt: item.created_at
          }));
        }
      } catch (e) {
        console.error('Error al cargar de Supabase:', e);
      }
    }

    let storageList = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        storageList = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error al cargar de localStorage:', e);
    }

    const combinedMap = new Map();
    INITIAL_GALLERY_ITEMS.forEach(item => combinedMap.set(item.id, item));
    storageList.forEach(item => combinedMap.set(item.id, item));
    supabaseList.forEach(item => combinedMap.set(item.id, item));

    setCustomProducts(Array.from(combinedMap.values()));
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

  // Media item helpers
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

  // Local File Upload Handler (Converts file to Base64 Data URL)
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

  const handleStartEdit = (prod) => {
    setEditingProductId(prod.id);
    setProductName(prod.name || '');
    const standardCategories = ['Anillos', 'Pulseras', 'Cadenas', 'Alta Joyería'];
    if (standardCategories.includes(prod.category)) {
      setCategory(prod.category);
      setCustomCategory('');
    } else {
      setCategory('Otro');
      setCustomCategory(prod.category);
    }
    setSpanClass(prod.spanClass || 'gallery-card--normal');
    setMediaItems(
      (prod.media || []).length > 0
        ? (prod.media || []).map(m => ({ type: m.type || 'image', url: m.url || '' }))
        : [{ type: 'image', url: '' }]
    );
    setActiveTab('add');
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setProductName('');
    setCategory('Anillos');
    setCustomCategory('');
    setSpanClass('gallery-card--normal');
    setMediaItems([{ type: 'image', url: '' }]);
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

    if (editingProductId) {
      // MODO EDICIÓN
      const targetProd = customProducts.find(p => p.id === editingProductId);
      const updatedProd = {
        id: editingProductId,
        name: productName.trim(),
        category: finalCategory,
        spanClass: spanClass,
        media: validMedia,
        createdAt: targetProd?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase
            .from('products')
            .update({
              name: updatedProd.name,
              category: updatedProd.category,
              span_class: updatedProd.spanClass,
              media: updatedProd.media
            })
            .eq('id', editingProductId);

          if (error) console.error('Error actualizando Supabase:', error);
        } catch (err) {
          console.error('Error Supabase catch:', err);
        }
      }

      const updatedList = customProducts.map(p => p.id === editingProductId ? updatedProd : p);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      setCustomProducts(updatedList);
      setEditingProductId(null);

      setSuccessMessage('✨ ¡Joya actualizada con éxito!');
    } else {
      // MODO CREACIÓN
      const newProd = {
        id: 'custom-' + Date.now(),
        name: productName.trim(),
        category: finalCategory,
        spanClass: spanClass,
        media: validMedia,
        createdAt: new Date().toISOString()
      };

      // 1. Guardar en Supabase si está activo
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

      // 2. Guardar en localStorage
      const existing = [newProd, ...customProducts];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      setCustomProducts(existing);

      setSuccessMessage(
        isSupabaseConfigured
          ? '✨ ¡Joya guardada en Supabase y publicada en tiempo real!'
          : '✨ ¡Joya añadida con éxito a la galería local!'
      );
    }

    // Reset form
    setProductName('');
    setCustomCategory('');
    setMediaItems([{ type: 'image', url: '' }]);
    setIsSaving(false);

    if (onProductsUpdated) {
      onProductsUpdated();
    }

    window.dispatchEvent(new Event('noctis_products_updated'));

    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  const handleDeleteCustomProduct = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta joya?')) return;

    // 1. Eliminar en Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.error('Error eliminando en Supabase:', err);
      }
    }

    // 2. Eliminar en LocalStorage
    const updated = customProducts.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setCustomProducts(updated);

    if (onProductsUpdated) {
      onProductsUpdated();
    }
    window.dispatchEvent(new Event('noctis_products_updated'));
  };

  const handleCopyJson = () => {
    const jsonString = JSON.stringify(customProducts, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleClearAllCustom = async () => {
    if (window.confirm('¿Eliminar todas las joyas personalizadas añadidas?')) {
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('products').delete().neq('id', '0');
        } catch (e) {
          console.error('Error clearing Supabase', e);
        }
      }
      localStorage.removeItem(STORAGE_KEY);
      setCustomProducts([]);
      if (onProductsUpdated) {
        onProductsUpdated();
      }
      window.dispatchEvent(new Event('noctis_products_updated'));
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="admin-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="admin-modal-card"
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="admin-modal-header">
            <div className="admin-brand-title">
              <Sparkles size={20} color="#d4af37" />
              <span className="font-cinzel text-gold">PANEL DE CONTROL NOCTIS</span>
              <span className="admin-badge-secret">Acceso Privado</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="admin-close-btn" onClick={onClose} aria-label="Cerrar panel">
                <X size={20} color="#888" />
              </button>
            </div>
          </div>

          {!isAuthenticated ? (
            /* Pantalla de Bloqueo por PIN */
            <div className="admin-pin-view">
              <div className="admin-lock-icon-wrap">
                <Lock size={36} color="#d4af37" />
              </div>
              <h3 className="admin-pin-title font-cinzel">Autenticación Requerida</h3>
              <p className="admin-pin-subtitle">
                Ingresa el PIN de seguridad administrativo para acceder al gestor del catálogo.
              </p>

              <form onSubmit={handlePinSubmit} className="admin-pin-form">
                <div className="admin-input-group">
                  <KeyRound size={18} color="#888" className="admin-input-icon" />
                  <input
                    type="password"
                    placeholder="Ingresa tu PIN de Seguridad"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className={`admin-input-field ${pinError ? 'error' : ''}`}
                    autoFocus
                  />
                </div>

                {pinError && (
                  <div className="admin-error-msg">
                    <ShieldAlert size={14} /> PIN incorrecto. Inténtalo de nuevo.
                  </div>
                )}

                <button type="submit" className="admin-submit-btn font-unicase">
                  Desbloquear Panel
                </button>
              </form>

            </div>
          ) : (
            /* Panel de Administración Principal */
            <div className="admin-main-view">
              {/* Navigation Tabs */}
              <div className="admin-tabs">
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
                <button className="admin-tab-logout" onClick={handleLogout} title="Bloquear sesión">
                  <Lock size={14} /> Salir
                </button>
              </div>

              {/* Tab 1: Formulario Añadir Producto */}
              {activeTab === 'add' && (
                <form onSubmit={handleCreateProduct} className="admin-form">
                  {successMessage && (
                    <motion.div
                      className="admin-success-banner"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Check size={16} /> {successMessage}
                    </motion.div>
                  )}

                  <div className="admin-field-row">
                    <div className="admin-field-col">
                      <label className="admin-label">Nombre de la Joya *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Cadena Cubana 18k con Dije Medusa"
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
                      <label className="admin-label">Especificar Categoría Personalizada</label>
                      <input
                        type="text"
                        placeholder="Ej. Aretes, Sellos, Colección Especial"
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

                  {/* Sección de Fotos y Videos */}
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
                            placeholder={media.type === 'video' ? '/media/video.mp4 o URL externa' : '/media/foto.jpg o URL de imagen'}
                            value={media.url}
                            onChange={(e) => handleMediaChange(idx, 'url', e.target.value)}
                            className="admin-input media-input"
                          />

                          {/* Subir archivo local */}
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
                              title="Eliminar este archivo"
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
                    {isSaving ? 'Guardando en la nube...' : '✨ Publicar Joya en la Galería'}
                  </button>
                </form>
              )}

              {/* Tab 2: Lista de productos añadidos */}
              {activeTab === 'list' && (
                <div className="admin-list-view">
                  <div className="admin-list-header">
                    <h4>
                      Joyas registradas en la Galería ({customProducts.length})
                    </h4>
                    {customProducts.length > 0 && (
                      <button className="btn-clear-all" onClick={handleClearAllCustom}>
                        <RefreshCw size={13} /> Limpiar Todas
                      </button>
                    )}
                  </div>

                  {customProducts.length === 0 ? (
                    <div className="admin-empty-state">
                      <Database size={36} color="#555" />
                      <p>Aún no hay joyas adicionales agregadas.</p>
                      <button className="admin-btn-link" onClick={() => setActiveTab('add')}>
                        + Agregar la primera joya ahora
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
                            <span className="custom-card-badge">{prod.media?.length || 0} multimedia</span>
                          </div>

                          <div className="admin-custom-card-info">
                            <span className="card-category">{prod.category}</span>
                            <h5 className="card-name">{prod.name}</h5>
                            <span className="card-date">
                              {prod.createdAt ? new Date(prod.createdAt).toLocaleDateString() : 'Reciente'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn-edit-card"
                              onClick={() => handleStartEdit(prod)}
                              title="Editar joya"
                              style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid #d4af37', color: '#f5d77f', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn-delete-card"
                              onClick={() => handleDeleteCustomProduct(prod.id)}
                              title="Eliminar joya"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
