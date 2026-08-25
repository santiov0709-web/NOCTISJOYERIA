import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'motion/react';
import { getWaUrl } from '../config/whatsapp';
import { ChevronLeft, ChevronRight, Play, Eye } from 'lucide-react';
import JewelryModal from './JewelryModal';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { INITIAL_GALLERY_ITEMS } from '../config/initialProducts';

const ease = [0.16, 1, 0.3, 1];

const getCombinedGalleryItems = (supabaseProducts = []) => {
  let customFromStorage = [];
  try {
    const stored = localStorage.getItem('noctis_custom_products');
    if (stored) {
      customFromStorage = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading custom products:', e);
  }

  const combinedMap = new Map();

  // 1. Static base items
  INITIAL_GALLERY_ITEMS.forEach(item => combinedMap.set(item.id, item));

  // 2. Storage items (override static items if edited)
  customFromStorage.forEach(item => combinedMap.set(item.id, item));

  return Array.from(combinedMap.values());
};

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
    <div className={`gallery-card ${item.spanClass}`} onClick={() => onOpenModal(item, index)}>
      <div className="gallery-card-img-wrap">
        {currentMedia.type === 'video' ? (
          <video
            src={currentMedia.url}
            autoPlay
            muted
            loop
            playsInline
            className="gallery-card-img"
          />
        ) : (
          <img
            src={currentMedia.url}
            alt={item.name}
            className="gallery-card-img"
            loading="lazy"
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
  const [items, setItems] = useState(() => getCombinedGalleryItems([]));

  const loadSupabaseProducts = async () => {
    if (!isSupabaseConfigured || !supabase) return;
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
        setItems(getCombinedGalleryItems(formatted));
      }
    } catch (err) {
      console.error('Error cargando la galería de Supabase:', err);
    }
  };

  useEffect(() => {
    loadSupabaseProducts();

    const handleLocalUpdate = () => {
      setItems(getCombinedGalleryItems([]));
      loadSupabaseProducts();
    };

    window.addEventListener('noctis_products_updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    let channel;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel('public:products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          loadSupabaseProducts();
        })
        .subscribe();
    }

    return () => {
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
          >
            🎵 TikTok: @noctis.joyeria
          </a>

          <a
            href="https://instagram.com/noctisjoyeria"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-instagram-luxury"
          >
            📸 Instagram: @noctisjoyeria
          </a>
        </div>
      </motion.div>
    </section>
  );
}
