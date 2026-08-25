import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'motion/react';
import { getWaUrl } from '../config/whatsapp';
import { ChevronLeft, ChevronRight, Play, Eye, Video, Camera } from 'lucide-react';
import JewelryModal from './JewelryModal';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { INITIAL_GALLERY_ITEMS } from '../config/initialProducts';
import { getAllProductsDB } from '../config/indexedDBStorage';

const ease = [0.16, 1, 0.3, 1];

function SkeletonCard() {
  return (
    <div className="gallery-card skeleton-card">
      <div className="gallery-card-img-wrap skeleton-pulse" />
      <div className="gallery-card-content">
        <div className="skeleton-text skeleton-sub" />
        <div className="skeleton-text skeleton-title" />
        <div className="skeleton-btn" />
      </div>
    </div>
  );
}

function CardCarousel({ item, onOpenModal }) {
  const [index, setIndex] = useState(0);
  const mediaList = item.media || [];
  const currentMedia = mediaList[index] || {};

  const handleNext = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % mediaList.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  const waUrl = getWaUrl(`Hola Noctis Joyería, quisiera recibir asesoría del producto: ${item.name}`);

  return (
    <div 
      className={`gallery-card ${item.spanClass}`} 
      onClick={() => onOpenModal(item, index)}
    >
      <div className="gallery-card-img-wrap">
        {currentMedia.type === 'video' ? (
          <video
            src={currentMedia.url}
            autoPlay
            muted
            loop
            playsInline
            webkit-playsinline="true"
            className="gallery-card-img"
          />
        ) : (
          <img
            src={currentMedia.url}
            alt={item.name}
            className="gallery-card-img"
          />
        )}
      </div>

      <div className="gallery-card-overlay" />
      <div className="gallery-card-border" />

      {/* Badge Indicador de Videos/Fotos */}
      <div className="gallery-media-badge">
        {currentMedia.type === 'video' ? (
          <span className="badge-video">🎥 Video Real 18k</span>
        ) : (
          <span className="badge-photo">📷 Foto 18k ({index + 1}/{mediaList.length})</span>
        )}
      </div>

      {/* Botones de Navegación del Carrusel en la Tarjeta */}
      {mediaList.length > 1 && (
        <div className="gallery-card-nav" onClick={(e) => e.stopPropagation()}>
          <button className="card-nav-arrow" onClick={handlePrev} aria-label="Anterior">
            <ChevronLeft size={16} color="#fff" />
          </button>
          <div className="card-dots">
            {mediaList.map((_, i) => (
              <span key={i} className={`card-dot ${i === index ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setIndex(i); }} />
            ))}
          </div>
          <button className="card-nav-arrow" onClick={handleNext} aria-label="Siguiente">
            <ChevronRight size={16} color="#fff" />
          </button>
        </div>
      )}

      {/* Contenido de la Tarjeta */}
      <div className="gallery-card-content">
        <span className="gallery-card-sub">{item.category} · Oro 18k</span>
        <h3 className="gallery-card-label">{item.name}</h3>

        <div className="gallery-card-actions">
          <button
            className="gallery-card-view-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(item, index);
            }}
          >
            <Eye size={14} /> Explorar Galería HD ({mediaList.length} fotos & videos)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GallerySection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [selectedModal, setSelectedModal] = useState({ open: false, item: null });
  const [isFetching, setIsFetching] = useState(true);
  const [items, setItems] = useState(() => {
    // Carga instantánea sincrónica a 0ms desde caché local (evita pop-in gráfico)
    const combinedMap = new Map();
    INITIAL_GALLERY_ITEMS.forEach(item => combinedMap.set(item.id, item));
    try {
      const stored = localStorage.getItem('noctis_custom_products');
      if (stored) {
        const customFromStorage = JSON.parse(stored);
        customFromStorage.forEach(item => combinedMap.set(item.id, item));
      }
    } catch (e) {}
    return Array.from(combinedMap.values());
  });

  const loadGalleryProducts = async () => {
    setIsFetching(true);
    let supabaseFormatted = null;
    
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          supabaseFormatted = data.map(item => {
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
      } catch (err) {
        console.error('Error cargando la galería de Supabase:', err);
      }
    }

    const combinedMap = new Map();
    INITIAL_GALLERY_ITEMS.forEach(item => combinedMap.set(item.id, item));

    if (supabaseFormatted !== null) {
      // Supabase cargó exitosamente. Es la única fuente de verdad.
      supabaseFormatted.forEach(item => combinedMap.set(item.id, item));
      const finalItems = Array.from(combinedMap.values());
      setItems(finalItems);
      
      // Actualizamos el caché local para purgar fantasmas y preparar el próximo render instantáneo a 0ms
      try {
        localStorage.setItem('noctis_custom_products', JSON.stringify(supabaseFormatted));
      } catch (e) {}

      // Avisar al Preloader que ya todo el catálogo está listo para mostrarse
      window.dispatchEvent(new Event('noctis_supabase_loaded'));
      setIsFetching(false);
    } else {
      // Fallback offline si Supabase falla o no está configurado
      try {
        let indexedList = await getAllProductsDB();
        const stored = localStorage.getItem('noctis_custom_products');
        const storageList = stored ? JSON.parse(stored) : [];
        
        storageList.forEach(item => combinedMap.set(item.id, item));
        indexedList.forEach(item => combinedMap.set(item.id, item));
        
        setItems(Array.from(combinedMap.values()));
      } catch (e) {}
      
      // Avisar al Preloader incluso si falla Supabase para no dejarlo colgado
      window.dispatchEvent(new Event('noctis_supabase_loaded'));
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadGalleryProducts();

    const handleLocalUpdate = () => {
      loadGalleryProducts();
    };

    window.addEventListener('noctis_products_updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    let channel;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel('public:products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          loadGalleryProducts();
        })
        .subscribe();
    }

    // Polling automático: Forzar recarga cada 10 segundos
    const pollInterval = setInterval(() => {
      loadGalleryProducts();
    }, 10000);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('noctis_products_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);


  const handleOpenModal = (item) => {
    setSelectedModal({ open: true, item });
  };

  const handleCloseModal = () => {
    setSelectedModal({ open: false, item: null });
  };

  return (
    <section className="gallery-section" id="galeria" ref={ref}>
      {/* Lightbox Modal para ver las 31 fotos y videos a pantalla completa */}
      <JewelryModal
        open={selectedModal.open}
        item={selectedModal.item}
        onClose={handleCloseModal}
      />

      {/* Encabezado */}
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease }}
      >
        <div className="section-overline">
          <div className="section-overline-line" />
          Muestra de Joyas Reales · Noctis ({items.reduce((acc, it) => acc + (it.media?.length || 0), 0)} Fotos & Videos)
        </div>
        <h2 className="section-title">
          <span className="block font-cinzel">Catálogo Real &</span>
          <span className="gold-cursive-shimmer" style={{ display: 'inline-block', marginTop: '6px' }}>Prendas Exclusivas</span>
        </h2>
        <p className="section-subtitle">
          Explora nuestras fotos y videos reales en <strong>Oro 18k</strong>. Desliza las imágenes o presiona para ver a pantalla completa.
        </p>
      </motion.div>

      {/* Grid de Tarjetas con Carrusel Interactivo */}
      <div className="gallery-grid">
        {items.map((item) => (
          <CardCarousel key={item.id} item={item} onOpenModal={handleOpenModal} />
        ))}
        
        {/* Skeleton Loaders para indicar progreso sin dañar el layout visual */}
        {isFetching && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
      </div>

      {/* CTA Inferior con TikTok e Instagram */}
      <motion.div
        className="gallery-cta"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.4, ease }}
      >
        <p className="gallery-cta-text">
          Síguenos en nuestras redes oficiales para ver más videos exclusivos y fabricación en vivo:
        </p>

        <div className="gallery-social-buttons">
          <a
            href="https://tiktok.com/@noctis.joyeria"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-tiktok-luxury"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Video size={16} color="#00ffb3" /> TikTok: @noctis.joyeria
          </a>

          <a
            href="https://instagram.com/noctisjoyeria"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-instagram-luxury"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Camera size={16} color="#f5d77f" /> Instagram: @noctisjoyeria
          </a>
        </div>
      </motion.div>
    </section>
  );
}
