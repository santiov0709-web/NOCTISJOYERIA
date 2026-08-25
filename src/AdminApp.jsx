import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock, KeyRound, Plus, Trash2, Copy, Check,
  Image as ImageIcon, Video, RefreshCw, ShieldAlert,
  Sparkles, FolderPlus, Database, Wifi, WifiOff, ExternalLink, ArrowLeft,
  Upload, Search, Tag, DollarSign, FileText, Eye, Layers, Star, X, Edit, RotateCcw,
  Palette, LayoutGrid, List, Zap, Crown, Sliders
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './config/supabase';
import { INITIAL_GALLERY_ITEMS } from './config/initialProducts';
import {
  getAllProductsDB,
  saveProductDB,
  saveAllProductsDB,
  deleteProductDB
} from './config/indexedDBStorage';

const DEFAULT_PIN = import.meta.env.VITE_ADMIN_PIN || 'BRAYAN2323';
const STORAGE_KEY = 'noctis_custom_products';

const withTimeout = (promise, ms = 20000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Petición a la nube cancelada por tiempo de espera')), ms))
  ]);
};

const compressImageDataUrl = (dataUrl, maxDimension = 1600, quality = 0.85) => {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      return resolve(dataUrl);
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width <= maxDimension && height <= maxDimension) {
        return resolve(dataUrl);
      }
      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Custom Personalization State
  const [panelTheme, setPanelTheme] = useState('emerald'); // 'emerald' | 'gold' | 'obsidian'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Tabs
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'list'

  // Product Form State
  const [editingProductId, setEditingProductId] = useState(null);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Anillos');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [productTag, setProductTag] = useState('Destacado Imperiale');
  const [spanClass, setSpanClass] = useState('gallery-card--normal');

  // Media Items State: [{ id, type: 'image'|'video', url, name }]
  const [mediaItems, setMediaItems] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [urlType, setUrlType] = useState('image');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

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

    // Supabase Realtime Subscription (si está activo en dashboard)
    let channel;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel('admin:products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          loadProducts();
        })
        .subscribe();
    }

    // Polling automático: Forzar recarga cada 10 segundos (No requiere configuración manual)
    const pollInterval = setInterval(() => {
      loadProducts();
    }, 10000);

    return () => {
      clearInterval(pollInterval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
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
          supabaseList = data.map(item => {
            const meta = item.media?.[0] || {};
            return {
              id: item.id,
              name: item.name,
              category: item.category,
              price: item.price || meta.price || '',
              description: item.description || meta.description || '',
              tag: item.tag || meta.tag || '',
              spanClass: item.span_class || item.spanClass || 'gallery-card--normal',
              media: item.media || [],
              createdAt: item.created_at
            };
          });
        }
      } catch (e) {
        console.error('Error cargando de Supabase:', e);
      }
    }

    let indexedList = [];
    try {
      indexedList = await getAllProductsDB();
    } catch (e) {
      console.error('Error cargando de IndexedDB:', e);
    }

    let storageList = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        storageList = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error cargando de localStorage:', e);
    }

    const combinedMap = new Map();
    INITIAL_GALLERY_ITEMS.forEach(item => combinedMap.set(item.id, item));

    if (isSupabaseConfigured) {
      // Si Supabase está funcionando, es la fuente de verdad absoluta. 
      // Se ignoran los locales bugeados y se purga el almacenamiento local.
      supabaseList.forEach(item => combinedMap.set(item.id, item));
      
      const finalProducts = Array.from(combinedMap.values());
      setCustomProducts(finalProducts);
      
      // Sincronizar y limpiar IndexedDB/LocalStorage para eliminar rastros de joyas fallidas
      await saveAllProductsDB(finalProducts);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalProducts));
      } catch (e) {}
    } else {
      // Fallback offline
      storageList.forEach(item => combinedMap.set(item.id, item));
      indexedList.forEach(item => combinedMap.set(item.id, item));
      supabaseList.forEach(item => combinedMap.set(item.id, item));

      const finalProducts = Array.from(combinedMap.values());
      setCustomProducts(finalProducts);
      await saveAllProductsDB(finalProducts);
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

  // Multiple File Selection & Upload (Batch Upload with Heavy Image Compression)
  const processFiles = async (files) => {
    const validFiles = Array.from(files);
    if (validFiles.length === 0) return;

    setIsProcessingFiles(true);
    setProcessingMessage(`Procesando ${validFiles.length} archivo(s)...`);

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const isVideo = file.type.startsWith('video/');
      setProcessingMessage(`Procesando archivo ${i + 1} de ${validFiles.length}: ${file.name}`);

      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });

      if (!dataUrl) continue;

      let finalUrl = dataUrl;
      if (!isVideo && dataUrl.startsWith('data:image')) {
        finalUrl = await compressImageDataUrl(dataUrl, 1600, 0.85);
      }

      setMediaItems((prev) => [
        ...prev,
        {
          id: 'media-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          type: isVideo ? 'video' : 'image',
          url: finalUrl,
          name: file.name
        }
      ]);
    }

    setIsProcessingFiles(false);
    setProcessingMessage('');
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

  const handleStartEdit = (prod) => {
    setEditingProductId(prod.id);
    setProductName(prod.name || '');
    const standardCategories = ['Anillos', 'Pulseras', 'Cadenas', 'Alta Joyería', 'Esmeraldas', 'Relojes', 'Topos', 'Herrajes'];
    if (standardCategories.includes(prod.category)) {
      setCategory(prod.category);
      setCustomCategory('');
    } else {
      setCategory('Otro');
      setCustomCategory(prod.category);
    }
    const meta = prod.media?.[0] || {};
    setPrice(prod.price || meta.price || '');
    setDescription(prod.description || meta.description || '');
    setProductTag(prod.tag || meta.tag || 'Destacado Imperiale');
    setSpanClass(prod.spanClass || 'gallery-card--normal');
    setMediaItems(
      (prod.media || []).map((m, idx) => ({
        id: 'media-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substr(2, 4),
        type: m.type || 'image',
        url: m.url || '',
        name: m.name || (m.type === 'video' ? 'Video' : 'Foto')
      }))
    );
    setActiveTab('add');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setProductName('');
    setCategory('Anillos');
    setCustomCategory('');
    setPrice('');
    setDescription('');
    setProductTag('Destacado Imperiale');
    setSpanClass('gallery-card--normal');
    setMediaItems([]);
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
    try {
      const finalCategory = category === 'Otro' ? customCategory.trim() || 'Exclusivo' : category;

      // Optimizar imágenes en segundo plano (HD 1600px) y guardar metadata en JSONB
      const formattedMedia = await Promise.all(
        mediaItems.map(async (m, idx) => {
          const compressedUrl = m.type === 'image' ? await compressImageDataUrl(m.url, 1600, 0.85) : m.url;
          const itemObj = {
            type: m.type,
            url: compressedUrl,
            name: m.name || (m.type === 'video' ? 'Video' : 'Foto')
          };
          if (idx === 0) {
            if (price.trim()) itemObj.price = price.trim();
            if (description.trim()) itemObj.description = description.trim();
            if (productTag) itemObj.tag = productTag;
          }
          return itemObj;
        })
      );

      if (editingProductId) {
        // MODO EDICIÓN
        const targetProd = customProducts.find(p => p.id === editingProductId);
        const updatedProd = {
          id: editingProductId,
          name: productName.trim(),
          category: finalCategory,
          price: price.trim(),
          description: description.trim(),
          tag: productTag,
          spanClass: spanClass,
          media: formattedMedia,
          createdAt: targetProd?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        if (isSupabaseConfigured && supabase) {
          try {
            await withTimeout(
              supabase
                .from('products')
                .update({
                  name: updatedProd.name,
                  category: updatedProd.category,
                  span_class: updatedProd.spanClass,
                  media: updatedProd.media
                })
                .eq('id', editingProductId)
            );
          } catch (err) {
            console.warn('Advertencia Supabase update:', err);
          }
        }

        const updatedList = customProducts.map(p => p.id === editingProductId ? updatedProd : p);
        await saveProductDB(updatedProd);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
        } catch (err) {
          console.warn('LocalStorage lleno, guardado en IndexedDB ampliado:', err);
        }
        setCustomProducts(updatedList);
        setEditingProductId(null);

        setSuccessMessage('✨ ¡Joya actualizada con éxito en el catálogo!');
      } else {
        // MODO CREACIÓN
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

        // Save to Supabase if active with timeout
        if (isSupabaseConfigured && supabase) {
          try {
            await withTimeout(
              supabase.from('products').insert([
                {
                  id: newProd.id,
                  name: newProd.name,
                  category: newProd.category,
                  span_class: newProd.spanClass,
                  media: newProd.media,
                  created_at: newProd.createdAt
                }
              ])
            );
          } catch (err) {
            console.warn('Advertencia Supabase insert (guardado en almacenamiento local):', err);
          }
        }

        // Save to IndexedDB (Unlimited Storage) & LocalStorage (Safe Fallback)
        await saveProductDB(newProd);
        const existing = [newProd, ...customProducts];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        } catch (err) {
          console.warn('LocalStorage lleno, guardado en IndexedDB ampliado:', err);
        }
        setCustomProducts(existing);

        setSuccessMessage('✨ ¡Joya añadida con éxito al catálogo y publicada en vivo!');
      }

      // Reset Form
      setProductName('');
      setCustomCategory('');
      setPrice('');
      setDescription('');
      setMediaItems([]);

      window.dispatchEvent(new Event('noctis_products_updated'));

      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    } catch (err) {
      console.error('Error al guardar joya:', err);
    } finally {
      setIsSaving(false);
    }
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

    await deleteProductDB(id);
    const updated = customProducts.filter(p => p.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Advertencia localStorage:', e);
    }
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

  const applyQuickTemplate = (type) => {
    if (type === 'rolex') {
      setProductName('Anillo Rolex Imperial en Oro 18k Ley 750');
      setCategory('Anillos');
      setPrice('$3.200.000 COP');
      setDescription('Anillo estilo Rolex elaborado en Oro Amarillo de 18 Kilates con acabados pulidos de alta precisión. Peso aprox 9.5g.');
      setProductTag('🌟 Destacado');
      setSpanClass('gallery-card--tall');
    } else if (type === 'hilo-rojo') {
      setProductName('Pulsera en Hilo Rojo con Balines & Neopreno 18k');
      setCategory('Pulseras');
      setPrice('$480.000 COP');
      setDescription('Tejido artesanal ajustable en hilo rojo de máxima resistencia con balines tallados en Oro 18k.');
      setProductTag('✨ Nuevo');
      setSpanClass('gallery-card--normal');
    } else if (type === 'cadena-cubana') {
      setProductName('Cadena Tejido Cubano 18k con Dije Exclusivo');
      setCategory('Cadenas');
      setPrice('$5.800.000 COP');
      setDescription('Cadena de eslabón cubano macizo en Oro 18k ley 750 de 55cm. Certificado de autenticidad total.');
      setProductTag('🔥 Pieza Única');
      setSpanClass('gallery-card--wide');
    } else if (type === 'esmeralda') {
      setProductName('Dije Esmeralda Colombiana en Gota y Diamantes 18k');
      setCategory('Esmeraldas');
      setPrice('Consultar Asesor');
      setDescription('Esmeralda natural colombiana corte gota montada en bisel de Oro Blanco y Amarillo de 18 Kilates.');
      setProductTag('💎 Edición Limitada');
      setSpanClass('gallery-card--normal');
    }
  };

  const getThemeStyles = () => {
    if (panelTheme === 'gold') {
      return {
        bg: 'linear-gradient(180deg, #110e06 0%, #070502 100%)',
        border: 'rgba(212, 175, 55, 0.45)',
        headerBg: 'rgba(20, 16, 7, 0.95)',
        accent: '#f5d77f',
        cardBg: 'rgba(24, 20, 10, 0.9)',
        glow: 'rgba(212, 175, 55, 0.3)'
      };
    }
    if (panelTheme === 'obsidian') {
      return {
        bg: 'linear-gradient(180deg, #060608 0%, #020203 100%)',
        border: 'rgba(255, 255, 255, 0.2)',
        headerBg: 'rgba(10, 10, 15, 0.95)',
        accent: '#ffffff',
        cardBg: 'rgba(12, 12, 18, 0.9)',
        glow: 'rgba(255, 255, 255, 0.15)'
      };
    }
    return {
      bg: 'linear-gradient(180deg, #040905 0%, #020503 100%)',
      border: 'rgba(212, 175, 55, 0.3)',
      headerBg: 'rgba(6, 17, 9, 0.95)',
      accent: '#00ffb3',
      cardBg: 'rgba(14, 22, 16, 0.9)',
      glow: 'rgba(0, 255, 179, 0.2)'
    };
  };

  const tStyle = getThemeStyles();

  return (
    <div style={{ minHeight: '100vh', background: tStyle.bg, color: '#fff', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif", transition: 'all 0.4s' }}>
      
      {/* Top Header Personalizado Noctis */}
      <header style={{
        padding: '14px 28px',
        background: tStyle.headerBg,
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${tStyle.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: `0 4px 30px ${tStyle.glow}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d4af37', textDecoration: 'none', fontSize: '13px', fontWeight: '600', background: 'rgba(212,175,55,0.1)', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.3)', transition: 'all 0.2s' }}>
            <ArrowLeft size={16} /> Volver a Tienda
          </a>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', border: '1px solid #d4af37', overflow: 'hidden', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo-noctis.png" alt="Noctis Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <h1 className="font-cinzel" style={{ fontSize: '15px', margin: 0, letterSpacing: '0.12em', color: '#f5d77f', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                NOCTIS JOYERÍA · VAULT PRIVADO <Crown size={14} color="#d4af37" />
              </h1>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>
                GESTIÓN EXCLUSIVA ORO 18K · MEDELLÍN
              </span>
            </div>
          </div>
        </div>

        {/* Theme Selector & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Custom Theme Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.12)' }}>
            <Palette size={13} color="#d4af37" style={{ marginLeft: '4px' }} />
            <button
              onClick={() => setPanelTheme('emerald')}
              style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: panelTheme === 'emerald' ? 'rgba(0,255,179,0.2)' : 'transparent', border: panelTheme === 'emerald' ? '1px solid #00ffb3' : 'none', color: panelTheme === 'emerald' ? '#00ffb3' : 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
              title="Tema Esmeralda Noctis"
            >
              Esmeralda
            </button>
            <button
              onClick={() => setPanelTheme('gold')}
              style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: panelTheme === 'gold' ? 'rgba(212,175,55,0.25)' : 'transparent', border: panelTheme === 'gold' ? '1px solid #d4af37' : 'none', color: panelTheme === 'gold' ? '#f5d77f' : 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
              title="Tema Imperial Oro 18k"
            >
              Oro 18k
            </button>
            <button
              onClick={() => setPanelTheme('obsidian')}
              style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: panelTheme === 'obsidian' ? 'rgba(255,255,255,0.2)' : 'transparent', border: panelTheme === 'obsidian' ? '1px solid #fff' : 'none', color: panelTheme === 'obsidian' ? '#ffffff' : 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
              title="Tema Obsidiana Oscura"
            >
              Obsidiana
            </button>
          </div>

          {isAuthenticated && (
            <button className="admin-tab-logout" onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,85,85,0.15)', border: '1px solid rgba(255,85,85,0.3)', color: '#ff7777', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
              <Lock size={14} /> Salir
            </button>
          )}
        </div>
      </header>

      {/* Body Container Responsive */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 14px', maxWidth: '1240px', width: '100%', margin: '0 auto' }}>
        
        {!isAuthenticated ? (
          /* Pantalla de Bloqueo / Desbloqueo por PIN */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              maxWidth: '440px',
              width: '100%',
              margin: '30px auto',
              background: 'linear-gradient(145deg, #0e1219 0%, #07090e 100%)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '20px',
              padding: '36px 24px',
              textAlign: 'center',
              boxShadow: '0 30px 70px rgba(0,0,0,0.9), 0 0 40px rgba(212,175,55,0.2)'
            }}
          >
            <div className="admin-lock-icon-wrap" style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Lock size={36} color="#d4af37" />
            </div>
            <h2 className="font-cinzel" style={{ fontSize: '1.4rem', marginBottom: '10px', color: '#fff', letterSpacing: '0.08em' }}>Vault Administrativo</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', marginBottom: '24px', lineHeight: '1.6' }}>
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
                    fontSize: '16px',
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
          /* Dashboard Principal de Administración 100% Responsivo */
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Stats Summary Bar Responsive */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              width: '100%'
            }}>
              <div style={{ background: 'rgba(14, 18, 25, 0.8)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FolderPlus size={20} color="#d4af37" />
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Joyas Guardadas</span>
                  <h3 style={{ fontSize: '20px', margin: '2px 0 0', color: '#fff', fontWeight: '700' }}>{customProducts.length}</h3>
                </div>
              </div>

              <div style={{ background: 'rgba(14, 18, 25, 0.8)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ImageIcon size={20} color="#d4af37" />
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Fotos & Videos</span>
                  <h3 style={{ fontSize: '20px', margin: '2px 0 0', color: '#fff', fontWeight: '700' }}>{totalMediaUploaded}</h3>
                </div>
              </div>

              <div style={{ background: 'rgba(14, 18, 25, 0.8)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(0, 255, 179, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={20} color="#00ffb3" />
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>Estado Galería</span>
                  <h3 style={{ fontSize: '13px', margin: '2px 0 0', color: '#00ffb3', fontWeight: '600' }}>
                    ⚡ Publicado en Vivo
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
                  {editingProductId ? (
                    <>
                      <Edit size={16} color="#00ffb3" /> Editando Joya en Curso
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Publicar Nueva Joya
                    </>
                  )}
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

                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#f5d77f', fontSize: '12px', textDecoration: 'none', fontWeight: '500', background: 'rgba(212,175,55,0.1)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.3)' }}
                >
                  Ver Tienda en Vivo <ExternalLink size={14} />
                </a>
              </div>

              {/* Tab 1: Formulario para Añadir / Editar Joyas */}
              {activeTab === 'add' && (
                <form onSubmit={handleCreateProduct} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {editingProductId && (
                    <div style={{
                      background: 'rgba(212, 175, 55, 0.12)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      borderRadius: '12px',
                      padding: '14px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#f5d77f'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                        <Edit size={18} color="#00ffb3" />
                        <span>Modo Edición: Modificando la joya seleccionada</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        style={{
                          background: 'rgba(255, 85, 85, 0.2)',
                          border: '1px solid rgba(255, 85, 85, 0.4)',
                          color: '#ff7777',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <RotateCcw size={14} /> Cancelar Edición
                      </button>
                    </div>
                  )}

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
                        <option value="Topos">Topos 18k</option>
                        <option value="Herrajes">Herrajes 18k</option>
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
                        <option value="Destacado Imperiale">Destacado Imperiale</option>
                        <option value="Nueva Colección 18k">Nueva Colección 18k</option>
                        <option value="Edición Limitada 18k">Edición Limitada 18k</option>
                        <option value="Pieza Única de Autor">Pieza Única de Autor</option>
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
                      {isProcessingFiles ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                          <RefreshCw size={36} color="#00ffb3" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#00ffb3' }}>
                            {processingMessage || 'Optimizando fotos pesadas...'}
                          </p>
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                            Por favor espera un segundo mientras procesamos y comprimimos tus imágenes HD sin perder calidad.
                          </span>
                        </div>
                      ) : (
                        <>
                          <Upload size={36} color={isDragging ? '#00ffb3' : '#d4af37'} style={{ marginBottom: '10px' }} />
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                            Arrastra y suelta aquí tus fotos o videos
                          </p>
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', display: 'block' }}>
                            Formatos soportados: JPG, PNG, WEBP, MP4, MOV, WEBM (Soporta fotos pesadas sin límite de cantidad)
                          </span>
                        </>
                      )}
                    </div>

                    {/* Opción secundaria: Agregar por URL directa */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px' }}>
                      <select
                        value={urlType}
                        onChange={(e) => setUrlType(e.target.value)}
                        style={{ padding: '10px 14px', background: '#0e121a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      >
                        <option value="image">Foto URL</option>
                        <option value="video">Video URL</option>
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
                                <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop playsInline webkit-playsinline="true" />
                              ) : (
                                <img src={item.url} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              )}

                              {/* Badge de tipo */}
                              <span style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(0,0,0,0.75)', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', color: '#fff', fontWeight: '600' }}>
                                {item.type === 'video' ? 'Video' : 'Foto'} #{idx + 1}
                              </span>

                              {/* Portada Badge */}
                              {idx === 0 && (
                                <span style={{ position: 'absolute', bottom: '6px', left: '6px', background: '#d4af37', color: '#000', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: '700' }}>
                                  Portada
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
                      background: editingProductId ? 'linear-gradient(135deg, #00ffb3 0%, #00b37e 100%)' : 'linear-gradient(135deg, #d4af37 0%, #a68426 100%)',
                      color: '#030704',
                      fontSize: '14px',
                      fontWeight: '700',
                      letterSpacing: '0.12em',
                      borderRadius: '12px',
                      border: editingProductId ? '1px solid #00ffb3' : '1px solid #f5d77f',
                      cursor: 'pointer',
                      boxShadow: editingProductId ? '0 6px 30px rgba(0, 255, 179, 0.4)' : '0 6px 30px rgba(212, 175, 55, 0.4)',
                      transition: 'all 0.3s'
                    }}
                  >
                    {isSaving
                      ? 'Guardando Cambios...'
                      : editingProductId
                      ? 'Guardar Cambios en la Joya'
                      : 'Publicar Joya en la Galería'}
                  </button>
                </form>
              )}

              {/* Tab 2: Lista de Joyas Guardadas con Filtro y Búsqueda */}
              {activeTab === 'list' && (
                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Search, Filters and View Mode Header */}
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

                    {/* View Mode Toggle Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)' }}>
                      <button
                        onClick={() => setViewMode('grid')}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: viewMode === 'grid' ? 'rgba(212,175,55,0.25)' : 'transparent', color: viewMode === 'grid' ? '#f5d77f' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600' }}
                        title="Vista de Cuadrícula Visual"
                      >
                        <LayoutGrid size={15} /> Tarjetas HD
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: viewMode === 'table' ? 'rgba(212,175,55,0.25)' : 'transparent', color: viewMode === 'table' ? '#f5d77f' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600' }}
                        title="Vista de Lista Administradora"
                      >
                        <List size={15} /> Lista Tabla
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {['Todos', 'Anillos', 'Pulseras', 'Cadenas', 'Alta Joyería', 'Esmeraldas', 'Relojes', 'Topos', 'Herrajes'].map(cat => (
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

                  {/* Items Grid or Table View */}
                  {filteredProducts.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <Database size={44} color="#555" style={{ marginBottom: '12px' }} />
                      <h4 style={{ margin: 0, color: '#fff' }}>No se encontraron joyas en el catálogo</h4>
                      <p style={{ fontSize: '13px', marginTop: '6px' }}>Intenta cambiando el término de búsqueda o agrega una nueva joya.</p>
                      <button onClick={() => setActiveTab('add')} style={{ marginTop: '14px', background: 'transparent', border: 'none', color: '#f5d77f', textDecoration: 'underline', cursor: 'pointer', fontWeight: '600' }}>
                        + Agregar joya ahora
                      </button>
                    </div>
                  ) : viewMode === 'grid' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                      {filteredProducts.map((prod) => (
                        <div
                          key={prod.id}
                          style={{
                            background: 'rgba(14, 18, 25, 0.9)',
                            border: editingProductId === prod.id ? '2px solid #00ffb3' : '1px solid rgba(212, 175, 55, 0.25)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative'
                          }}
                        >
                          {/* Preview Media */}
                          <div style={{ height: '160px', position: 'relative', background: '#000', pointerEvents: 'none' }}>
                            {prod.media[0]?.type === 'video' ? (
                              <video src={prod.media[0]?.url} autoPlay muted loop playsInline webkit-playsinline="true" style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                            ) : (
                              <img src={prod.media[0]?.url} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                            )}

                            <span style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.75)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', color: '#f5d77f', fontWeight: '600' }}>
                              {prod.media?.length || 0} fotos/videos
                            </span>

                            {prod.tag && (
                              <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(212,175,55,0.9)', color: '#000', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700' }}>
                                {prod.tag}
                              </span>
                            )}
                          </div>

                          {/* Action Buttons: Edit and Delete */}
                          <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '6px', zIndex: 10 }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStartEdit(prod); }}
                              style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(212,175,55,0.95)', border: 'none', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                              title="Editar joya"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteCustomProduct(prod.id); }}
                              style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,85,85,0.85)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
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
                  ) : (
                    /* Vista Tabla Administradora Compacta */
                    <div style={{ overflowX: 'auto', background: 'rgba(10,13,18,0.6)', borderRadius: '14px', border: '1px solid rgba(212,175,55,0.2)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: 'rgba(212,175,55,0.1)', borderBottom: '1px solid rgba(212,175,55,0.2)', color: '#f5d77f' }}>
                            <th style={{ padding: '14px 16px' }}>Portada</th>
                            <th style={{ padding: '14px 16px' }}>Nombre de la Joya</th>
                            <th style={{ padding: '14px 16px' }}>Categoría</th>
                            <th style={{ padding: '14px 16px' }}>Precio</th>
                            <th style={{ padding: '14px 16px' }}>Archivos</th>
                            <th style={{ padding: '14px 16px', textAlign: 'right' }}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((prod) => (
                            <tr key={prod.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: editingProductId === prod.id ? 'rgba(0,255,179,0.08)' : 'transparent' }}>
                              <td style={{ padding: '12px 16px', width: '70px', pointerEvents: 'none' }}>
                                {prod.media[0]?.type === 'video' ? (
                                  <video src={prod.media[0]?.url} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.3)', pointerEvents: 'none' }} autoPlay muted loop playsInline webkit-playsinline="true" />
                                ) : (
                                  <img src={prod.media[0]?.url} alt={prod.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.3)', pointerEvents: 'none' }} />
                                )}
                              </td>
                              <td style={{ padding: '12px 16px', fontWeight: '600', color: '#fff' }}>
                                {prod.name}
                                {prod.tag && <span style={{ marginLeft: '8px', fontSize: '10px', background: 'rgba(212,175,55,0.2)', color: '#f5d77f', padding: '2px 6px', borderRadius: '4px' }}>{prod.tag}</span>}
                              </td>
                              <td style={{ padding: '12px 16px', color: '#d4af37', fontWeight: '600' }}>{prod.category}</td>
                              <td style={{ padding: '12px 16px', color: '#00ffb3', fontWeight: '600' }}>{prod.price || 'Consultar'}</td>
                              <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)' }}>{prod.media?.length || 0} archivos</td>
                              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '8px' }}>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleStartEdit(prod); }}
                                    style={{ padding: '6px 12px', background: 'rgba(212,175,55,0.2)', border: '1px solid #d4af37', color: '#f5d77f', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <Edit size={14} /> Editar
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteCustomProduct(prod.id); }}
                                    style={{ padding: '6px 12px', background: 'rgba(255,85,85,0.2)', border: '1px solid rgba(255,85,85,0.4)', color: '#ff7777', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <Trash2 size={14} /> Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
