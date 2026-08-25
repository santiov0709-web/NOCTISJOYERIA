import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play, MessageCircle } from 'lucide-react';
import { getWaUrl } from '../config/whatsapp';

export default function JewelryModal({ item, open, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!open || !item) return null;

  const mediaList = item.media || [];
  const currentMedia = mediaList[currentIndex] || {};

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % mediaList.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  const waUrl = getWaUrl(`Hola Noctis Joyería, me interesa ver más información del producto: ${item.name}`);

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-container"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar galeria">
            <X size={20} color="#fff" />
          </button>

          {/* Main Display Area (Photo or Video) */}
          <div className="modal-viewport">
            {currentMedia.type === 'video' ? (
              <video
                src={currentMedia.url}
                autoPlay
                muted
                loop
                playsInline
                webkit-playsinline="true"
                controls
                className="modal-media"
              />
            ) : (
              <img
                src={currentMedia.url}
                alt={item.name}
                className="modal-media"
              />
            )}

            {/* Navigation Arrows */}
            {mediaList.length > 1 && (
              <>
                <button className="modal-nav-btn modal-nav-btn--prev" onClick={handlePrev}>
                  <ChevronLeft size={24} color="#fff" />
                </button>
                <button className="modal-nav-btn modal-nav-btn--next" onClick={handleNext}>
                  <ChevronRight size={24} color="#fff" />
                </button>
              </>
            )}

            {/* Counter badge */}
            <div className="modal-counter-badge">
              {currentIndex + 1} / {mediaList.length} · {currentMedia.type === 'video' ? 'Video 18k' : 'Foto 18k'}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {mediaList.length > 1 && (
            <div className="modal-thumbs">
              {mediaList.map((m, idx) => (
                <div
                  key={idx}
                  className={`modal-thumb-item ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                >
                  {m.type === 'video' ? (
                    <div className="modal-thumb-video-icon">
                      <Play size={12} color="#fff" fill="#fff" />
                    </div>
                  ) : (
                    <img src={m.url} alt="thumbnail" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Bottom Info & WhatsApp CTA */}
          <div className="modal-info-footer">
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 className="modal-item-title font-cinzel" style={{ margin: 0 }}>{item.name}</h3>
                {item.tag && (
                  <span style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid #d4af37', color: '#f5d77f', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700' }}>
                    {item.tag}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <p className="modal-item-subtitle font-unicase" style={{ margin: 0 }}>ORO 18K CERTIFICADO · MEDELLÍN</p>
                {item.price && (
                  <span style={{ color: '#00ffb3', fontWeight: '700', fontSize: '14px' }}>
                    {item.price}
                  </span>
                )}
              </div>

              {item.description && (
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '6px', lineHeight: '1.4' }}>
                  {item.description}
                </p>
              )}
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-wa-btn btn-wa-luxury"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <MessageCircle size={16} /> Pedir Asesoría de esta Joya
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
