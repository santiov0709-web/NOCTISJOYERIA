import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock, KeyRound, Plus, Trash2, Copy, Check,
  Image as ImageIcon, Video, RefreshCw, ShieldAlert,
  Sparkles, FolderPlus, Database, Wifi, WifiOff, ExternalLink, ArrowLeft,
  Upload, Search, Tag, DollarSign, FileText, Eye, Layers, Star, X
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './config/supabase';

const DEFAULT_PIN = import.meta.env.VITE_ADMIN_PIN || '1804';
const STORAGE_KEY = 'noctis_custom_products';

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'list' | 'export'

  // Product Form State
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Anillos');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [productTag, setProductTag] = useState('🌟 Destacado');
  const [spanClass, setSpanClass] = useState('gallery-card--normal');

  // Media Items State: [{ id, type: 'image'|'video', url, name }]
  const [mediaItems, setMediaItems] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [urlType, setUrlType] = useState('image');
  const [isDragging, setIsDragging] = useState(false);

  // UI state
  const [customProducts, setCustomProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Todos');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);

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
            price: item.price || '',
            description: item.description || '',
            tag: item.tag || '',
            spanClass: item.span_class || item.spanClass || 'gallery-card--normal',
            media: item.media || [],
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

  // Multiple File Selection & Upload (Batch Upload)
  const processFiles = (files) => {
    const validFiles = Array.from(files);
    if (validFiles.length === 0) return;

    validFiles.forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();

      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setMediaItems((prev) => [
          ...prev,
          {
            id: 'media-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            type: isVideo ? 'video' : 'image',
            url: dataUrl,
            name: file.name
          }
        ]);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e) => {
    if (e.target.files) {
      processFiles(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Manual URL Add
  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setMediaItems((prev) => [
      ...prev,
      {
        id: 'media-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        type: urlType,
        url: urlInput.trim(),
        name: 'URL Externa'
      }
    ]);
    setUrlInput('');
  };

  const handleRemoveMediaItem = (id) => {
    setMediaItems((prev) => prev.filter(item => item.id !== id));
  };

  const handleMoveMedia = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= mediaItems.length) return;
    const updated = [...mediaItems];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setMediaItems(updated);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!productName.trim()) {
      alert('Por favor escribe el nombre de la joya.');
      return;
    }

    if (mediaItems.length === 0) {
      alert('Debes agregar al menos una foto o video a la joya.');
      return;
    }

    setIsSaving(true);
    const finalCategory = category === 'Otro' ? customCategory.trim() || 'Exclusivo' : category;

    const formattedMedia = mediaItems.map(m => ({
      type: m.type,
      url: m.url
    }));

    const newProd = {
      id: 'custom-' + Date.now(),
      name: productName.trim(),
      category: finalCategory,
      price: price.trim(),
      description: description.trim(),
      tag: productTag,
      spanClass: spanClass,
      media: formattedMedia,
      createdAt: new Date().toISOString()
    };

    // Save to Supabase if active
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('products').insert([
          {
            id: newProd.id,
            name: newProd.name,
            category: newProd.category,
            price: newProd.price,
            description: newProd.description,
            tag: newProd.tag,
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

    // Save to LocalStorage
    const existing = [newProd, ...customProducts];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    setCustomProducts(existing);

    // Reset Form
    setProductName('');
    setCustomCategory('');
    setPrice('');
    setDescription('');
    setMediaItems([]);
    setIsSaving(false);

    setSuccessMessage(
      isSupabaseConfigured
        ? '✨ ¡Joya guardada en Supabase Cloud y publicada en tiempo real!'
        : '✨ ¡Joya añadida con éxito al catálogo!'
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

  // Filtered products for list view
  const filteredProducts = customProducts.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'Todos' || item.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalMediaUploaded = customProducts.reduce((acc, p) => acc + (p.media?.length || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#05070a', color: '#fff', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Top Header */}
      <header style={{
        padding: '16px 28px',
        background: 'rgba(10, 13, 18, 0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d4af37', textDecoration: 'none', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }}>
            <ArrowLeft size={16} /> Volver a la Tienda
          </a>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="#d4af37" />
            <h1 className="font-cinzel" style={{ fontSize: '16px', margin: 0, letterSpacing: '0.12em', color: '#f5d77f', fontWeight: '700' }}>
              NOCTIS JOYERÍA · VAULT PRIVADO
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isSupabaseConfigured ? (
            <span className="badge-supabase-active" style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,255,179,0.12)', border: '1px solid rgba(0,255,179,0.3)', color: '#00ffb3' }}>
              <Wifi size={13} /> Supabase Cloud Conectado
            </span>
          ) : (
            <span className="badge-supabase-offline" style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,170,0,0.12)', border: '1px solid rgba(255,170,0,0.3)', color: '#ffaa00' }}>
              <WifiOff size={13} /> Modo Local (LocalStorage)
            </span>
          )}

          {isAuthenticated && (
            <button className="admin-tab-logout" onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,85,85,0.15)', border: '1px solid rgba(255,85,85,0.3)', color: '#ff7777', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
              <Lock size={14} /> Salir
            </button>
          )}
        </div>
      </header>

      {/* Body Container */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 20px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        
        {!isAuthenticated ? (
          /* Pantalla de Bloqueo / Desbloqueo por PIN */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              maxWidth: '440px',
              width: '100%',
              margin: '60px auto',
              background: 'linear-gradient(145deg, #0e1219 0%, #07090e 100%)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '20px',
              padding: '48px 36px',
              textAlign: 'center',
              boxShadow: '0 30px 70px rgba(0,0,0,0.9), 0 0 40px rgba(212,175,55,0.2)'
            }}
          >
            <div className="admin-lock-icon-wrap" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Lock size={40} color="#d4af37" />
            </div>
            <h2 className="font-cinzel" style={{ fontSize: '1.6rem', marginBottom: '10px', color: '#fff', letterSpacing: '0.08em' }}>Vault Administrativo</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', marginBottom: '28px', lineHeight: '1.6' }}>
              Ingresa tu PIN de seguridad para gestionar el catálogo exclusivo de joyas en tiempo real.
            </p>

            <form onSubmit={handlePinSubmit} className="admin-pin-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="admin-input-group" style={{ position: 'relative' }}>
                <KeyRound size={20} color="#d4af37" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  placeholder="Ingresa tu PIN de Seguridad"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 48px',
                    background: 'rgba(255,255,255,0.05)',
                    border: pinError ? '1px solid #ff4d4d' : '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                />
              </div>

              {pinError && (
                <div style={{ color: '#ff5555', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <ShieldAlert size={15} /> PIN incorrecto. Inténtalo de nuevo.
                </div>
              )}

              <button
                type="submit"
                className="font-unicase"
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #a68426 100%)',
                  color: '#050b07',
                  fontWeight: '700',
                  fontSize: '13px',
                  letterSpacing: '0.12em',
                  borderRadius: '12px',
                  border: '1px solid #f5d77f',
                  cursor: 'pointer',
                  boxShadow: '0 6px 25px rgba(212, 175, 55, 0.4)',
                  transition: 'all 0.3s'
                }}
              >
                Desbloquear Vault Privado
              </button>
            </form>
          </motion.div>
        ) : (
          /* Dashboard Principal de Administración de Lujo */
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Stats Summary Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              width: '100%'
            }}>
              <div style={{ background: 'rgba(14, 18, 25, 0.8)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FolderPlus size={24} color="#d4af37" />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>Joyas Guardadas</span>
                  <h3 style={{ fontSize: '24px', margin: '4px 0 0', color: '#fff', fontWeight: '700' }}>{customProducts.length}</h3>
                </div>
              </div>

              <div style={{ background: 'rgba(14, 18, 25, 0.8)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon size={24} color="#d4af37" />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>Fotos & Videos En Vivo</span>
                  <h3 style={{ fontSize: '24px', margin: '4px 0 0', color: '#fff', fontWeight: '700' }}>{totalMediaUploaded}</h3>
                </div>
              </div>

              <div style={{ background: 'rgba(14, 18, 25, 0.8)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: isSupabaseConfigured ? 'rgba(0, 255, 179, 0.12)' : 'rgba(255, 170, 0, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={24} color={isSupabaseConfigured ? '#00ffb3' : '#ffaa00'} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>Sincronización Nube</span>
                  <h3 style={{ fontSize: '14px', margin: '4px 0 0', color: isSupabaseConfigured ? '#00ffb3' : '#ffaa00', fontWeight: '600' }}>
                    {isSupabaseConfigured ? '⚡ Supabase Conectado' : '💾 LocalStorage Activo'}
                  </h3>
                </div>
              </div>
            </div>

            {/* Main Tabs Container */}
            <div style={{ background: '#0a0d13', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
              
              {/* Header Navigation Tabs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 24px', background: '#0e121a', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveTab('add')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 22px',
                    borderRadius: '12px',
                    background: activeTab === 'add' ? 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))' : 'transparent',
                    border: activeTab === 'add' ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid transparent',
                    color: activeTab === 'add' ? '#f5d77f' : 'rgba(255,255,255,0.6)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Plus size={16} /> Publicar Nueva Joya
                </button>

                <button
                  onClick={() => setActiveTab('list')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 22px',
                    borderRadius: '12px',
                    background: activeTab === 'list' ? 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))' : 'transparent',
                    border: activeTab === 'list' ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid transparent',
                    color: activeTab === 'list' ? '#f5d77f' : 'rgba(255,255,255,0.6)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <FolderPlus size={16} /> Joyas Guardadas ({customProducts.length})
                </button>

                <button
                  onClick={() => setActiveTab('export')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 22px',
                    borderRadius: '12px',
                    background: activeTab === 'export' ? 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))' : 'transparent',
                    border: activeTab === 'export' ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid transparent',
                    color: activeTab === 'export' ? '#f5d77f' : 'rgba(255,255,255,0.6)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Copy size={16} /> Copia JSON
                </button>

                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#f5d77f', fontSize: '12px', textDecoration: 'none', fontWeight: '500', background: 'rgba(212,175,55,0.1)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.3)' }}
                >
                  Ver Tienda en Vivo <ExternalLink size={14} />
                </a>
              </div>

              {/* Tab 1: Formulario para Añadir Joyas con Carga de Archivos Múltiples */}
              {activeTab === 'add' && (
                <form onSubmit={handleCreateProduct} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ background: 'rgba(0, 255, 179, 0.12)', border: '1px solid rgba(0, 255, 179, 0.4)', color: '#00ffb3', padding: '14px 20px', borderRadius: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' }}
                    >
                      <Check size={18} /> {successMessage}
                    </motion.div>
                  )}

                  {/* Fila 1: Nombre y Categoría */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>
                        Nombre de la Joya *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Anillo de Oro 18k con Zafiro Azul y Diamantes"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>
                        Categoría
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{ width: '100%', padding: '14px 16px', background: '#0e121a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      >
                        <option value="Anillos">Anillos 18k</option>
                        <option value="Pulseras">Pulseras 18k</option>
                        <option value="Cadenas">Cadenas & Dijes 18k</option>
                        <option value="Alta Joyería">Alta Joyería</option>
                        <option value="Esmeraldas">Esmeraldas & Gemas</option>
                        <option value="Relojes">Relojes de Lujo</option>
                        <option value="Otro">Otra Categoría Personalizada</option>
                      </select>
                    </div>
                  </div>

                  {category === 'Otro' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>
                        Nombre de la Categoría Personalizada
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Dijes Exclusivos, Aretes, Broches"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  )}

                  {/* Fila 2: Precio y Descripción */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>
                        <DollarSign size={14} color="#d4af37" /> Precio Estimado (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. $2.850.000 COP o Consultar Asesor"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>
                        <Tag size={14} color="#d4af37" /> Etiqueta Promocional
                      </label>
                      <select
                        value={productTag}
                        onChange={(e) => setProductTag(e.target.value)}
                        style={{ width: '100%', padding: '14px 16px', background: '#0e121a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                      >
                        <option value="🌟 Destacado">🌟 Destacado</option>
                        <option value="✨ Nuevo">✨ Nuevo Lanzamiento</option>
                        <option value="💎 Edición Limitada">💎 Edición Limitada</option>
                        <option value="🔥 Pieza Única">🔥 Pieza Única de Autor</option>
                      </select>
                    </div>
                  </div>

                  {/* Fila 3: Descripción detallada */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>
                      <FileText size={14} color="#d4af37" /> Descripción & Especificaciones (Gramos, ley 750, etc.)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ej. Fabricado en Oro Amarillo de 18 Kilates ley 750 con un peso aproximado de 8.4 gramos. Incluye certificado de autenticidad y estuche de lujo."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Formato de Tarjeta en Galería */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}>
                      Formato de Tarjeta en Galería
                    </label>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'gallery-card--normal', label: 'Estándar (Cuadrada 1:1)' },
                        { id: 'gallery-card--tall', label: 'Alta (Destacada 1:2)' },
                        { id: 'gallery-card--wide', label: 'Ancha (Colección 2:1)' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSpanClass(item.id)}
                          style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: spanClass === item.id ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.12)',
                            background: spanClass === item.id ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.03)',
                            color: spanClass === item.id ? '#f5d77f' : 'rgba(255,255,255,0.7)',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SECCIÓN DE CARGA MASIVA DE ARCHIVOS MULTIMEDIA (FOTOS Y VIDEOS) */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '15px', color: '#f5d77f', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ImageIcon size={18} /> Fotos y Videos de la Joya ({mediaItems.length} Agregados)
                        </h4>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                          Puedes seleccionar varias fotos y videos a la vez desde tu celular o computadora.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 20px',
                          background: 'linear-gradient(135deg, #d4af37 0%, #a68426 100%)',
                          color: '#050b07',
                          fontWeight: '700',
                          fontSize: '12px',
                          letterSpacing: '0.08em',
                          borderRadius: '10px',
                          border: '1px solid #f5d77f',
                          cursor: 'pointer',
                          boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                        }}
                      >
                        <Upload size={16} /> Seleccionar Archivos Múltiples
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileInputChange}
                        style={{ display: 'none' }}
                      />
                    </div>

                    {/* Zona Drag and Drop */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: isDragging ? '2px dashed #00ffb3' : '2px dashed rgba(212, 175, 55, 0.4)',
                        background: isDragging ? 'rgba(0, 255, 179, 0.08)' : 'rgba(212, 175, 55, 0.03)',
                        borderRadius: '12px',
                        padding: '32px 20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Upload size={36} color={isDragging ? '#00ffb3' : '#d4af37'} style={{ marginBottom: '10px' }} />
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                        Arrastra y suelta aquí tus fotos o videos
                      </p>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', display: 'block' }}>
                        Formatos soportados: JPG, PNG, WEBP, MP4, MOV, WEBM (Puedes subir 5, 10 o más de una vez)
                      </span>
                    </div>

                    {/* Opción secundaria: Agregar por URL directa */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px' }}>
                      <select
                        value={urlType}
                        onChange={(e) => setUrlType(e.target.value)}
                        style={{ padding: '10px 14px', background: '#0e121a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      >
                        <option value="image">📷 Foto URL</option>
                        <option value="video">🎥 Video URL</option>
                      </select>

                      <input
                        type="text"
                        placeholder="O pega un enlace/URL externa de foto o video (ej. https://...)"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '12px', outline: 'none' }}
                      />

                      <button
                        type="button"
                        onClick={handleAddUrl}
                        style={{ padding: '10px 16px', background: 'rgba(212,175,55,0.2)', border: '1px solid #d4af37', color: '#f5d77f', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        + Agregar URL
                      </button>
                    </div>

                    {/* VISTA PREVIA INTERACTIVA DE ARCHIVOS MULTIMEDIA */}
                    {mediaItems.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Archivos Listos para Publicar ({mediaItems.length}):
                        </span>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', marginTop: '12px' }}>
                          {mediaItems.map((item, idx) => (
                            <div
                              key={item.id}
                              style={{
                                position: 'relative',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                background: '#000',
                                border: idx === 0 ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.15)',
                                height: '110px'
                              }}
                            >
                              {item.type === 'video' ? (
                                <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop />
                              ) : (
                                <img src={item.url} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              )}

                              {/* Badge de tipo */}
                              <span style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(0,0,0,0.75)', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', color: '#fff', fontWeight: '600' }}>
                                {item.type === 'video' ? '🎥 Video' : '📷 Foto'} #{idx + 1}
                              </span>

                              {/* Portada Badge */}
                              {idx === 0 && (
                                <span style={{ position: 'absolute', bottom: '6px', left: '6px', background: '#d4af37', color: '#000', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: '700' }}>
                                  ⭐ Portada
                                </span>
                              )}

                              {/* Del Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveMediaItem(item.id)}
                                style={{ position: 'absolute', top: '6px', right: '6px', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,85,85,0.9)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                title="Eliminar este archivo"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="font-unicase"
                    style={{
                      padding: '18px',
                      background: 'linear-gradient(135deg, #d4af37 0%, #a68426 100%)',
                      color: '#030704',
                      fontSize: '14px',
                      fontWeight: '700',
                      letterSpacing: '0.12em',
                      borderRadius: '12px',
                      border: '1px solid #f5d77f',
                      cursor: 'pointer',
                      boxShadow: '0 6px 30px rgba(212, 175, 55, 0.4)',
                      transition: 'all 0.3s'
                    }}
                  >
                    {isSaving ? 'Guardando en la Nube...' : '✨ Publicar Joya en la Galería'}
                  </button>
                </form>
              )}

              {/* Tab 2: Lista de Joyas Guardadas con Filtro y Búsqueda */}
              {activeTab === 'list' && (
                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Search and Filters Header */}
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
                      <Search size={16} color="#888" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        placeholder="Buscar por nombre o categoría..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px 12px 42px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {['Todos', 'Anillos', 'Pulseras', 'Cadenas', 'Alta Joyería'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategoryFilter(cat)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            background: selectedCategoryFilter === cat ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)',
                            border: selectedCategoryFilter === cat ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                            color: selectedCategoryFilter === cat ? '#f5d77f' : 'rgba(255,255,255,0.6)',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Items Grid */}
                  {filteredProducts.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <Database size={44} color="#555" style={{ marginBottom: '12px' }} />
                      <h4 style={{ margin: 0, color: '#fff' }}>No se encontraron joyas en el catálogo</h4>
                      <p style={{ fontSize: '13px', marginTop: '6px' }}>Intenta cambiando el término de búsqueda o agrega una nueva joya.</p>
                      <button onClick={() => setActiveTab('add')} style={{ marginTop: '14px', background: 'transparent', border: 'none', color: '#f5d77f', textDecoration: 'underline', cursor: 'pointer', fontWeight: '600' }}>
                        + Agregar joya ahora
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                      {filteredProducts.map((prod) => (
                        <div
                          key={prod.id}
                          style={{
                            background: 'rgba(14, 18, 25, 0.9)',
                            border: '1px solid rgba(212, 175, 55, 0.25)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative'
                          }}
                        >
                          {/* Preview Media */}
                          <div style={{ height: '160px', position: 'relative', background: '#000' }}>
                            {prod.media[0]?.type === 'video' ? (
                              <video src={prod.media[0]?.url} autoPlay muted loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <img src={prod.media[0]?.url} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}

                            <span style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.75)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', color: '#f5d77f', fontWeight: '600' }}>
                              {prod.media?.length || 0} fotos/videos
                            </span>

                            {prod.tag && (
                              <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(212,175,55,0.9)', color: '#000', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700' }}>
                                {prod.tag}
                              </span>
                            )}

                            <button
                              onClick={() => handleDeleteCustomProduct(prod.id)}
                              style={{ position: 'absolute', top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,85,85,0.85)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                              title="Eliminar joya"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {/* Info */}
                          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                            <span style={{ fontSize: '11px', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700' }}>
                              {prod.category}
                            </span>
                            <h4 style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: '600' }}>
                              {prod.name}
                            </h4>

                            {prod.price && (
                              <span style={{ fontSize: '14px', color: '#00ffb3', fontWeight: '700', marginTop: '2px' }}>
                                {prod.price}
                              </span>
                            )}

                            {prod.description && (
                              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {prod.description}
                              </p>
                            )}

                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: 'auto', paddingTop: '8px' }}>
                              Publicado: {prod.createdAt ? new Date(prod.createdAt).toLocaleDateString() : 'Reciente'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Respaldo JSON */}
              {activeTab === 'export' && (
                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ margin: 0, color: '#f5d77f', fontSize: '16px' }}>Copia de Seguridad y Migración JSON</h4>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>
                    Aquí puedes copiar toda la estructura de joyas registradas para respaldarla localmente o en tu base de datos:
                  </p>

                  <div style={{ background: '#05070a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', maxHeight: '300px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px', color: '#00ffb3' }}>
                    <pre style={{ margin: 0 }}>{JSON.stringify(customProducts, null, 2)}</pre>
                  </div>

                  <button
                    onClick={handleCopyJson}
                    className="font-unicase"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '16px',
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid #d4af37',
                      color: '#f5d77f',
                      fontWeight: '700',
                      fontSize: '13px',
                      letterSpacing: '0.1em',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    {copied ? <Check size={18} color="#00ffb3" /> : <Copy size={18} />}
                    {copied ? '¡Código JSON Copiado al Portapapeles!' : 'Copiar Estructura JSON'}
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
