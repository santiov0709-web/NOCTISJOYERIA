import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { ShoppingBag, Heart } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1];

// Decorative gem for featured product
function FeaturedGem() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #0f0c06 0%, #1a1408 40%, #0d0a04 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
      }} />

      {/* Large diamond */}
      <svg width="220" height="220" viewBox="0 0 100 100" fill="none" style={{ filter: 'drop-shadow(0 0 24px rgba(232,196,106,0.4))' }}>
        <defs>
          <linearGradient id="gem-top" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0d88a"/>
            <stop offset="100%" stopColor="#c9a84c"/>
          </linearGradient>
          <linearGradient id="gem-left" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7a5c20"/>
            <stop offset="100%" stopColor="#9a7c38"/>
          </linearGradient>
          <linearGradient id="gem-right" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c9a84c"/>
            <stop offset="100%" stopColor="#e8c46a"/>
          </linearGradient>
        </defs>
        <polygon points="50,8 68,30 50,42 32,30" fill="url(#gem-top)"/>
        <polygon points="32,30 50,42 40,70 14,50" fill="url(#gem-left)"/>
        <polygon points="68,30 86,50 60,70 50,42" fill="url(#gem-right)"/>
        <polygon points="40,70 50,42 60,70 50,88" fill="#c9a84c"/>
        {/* Inner facets */}
        <line x1="50" y1="8" x2="50" y2="42" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
        <line x1="32" y1="30" x2="68" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
        <line x1="50" y1="42" x2="14" y2="50" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
        <line x1="50" y1="42" x2="86" y2="50" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
        <line x1="50" y1="42" x2="50" y2="88" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
      </svg>

      {/* Bottom label */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.1rem',
          fontWeight: 300,
          letterSpacing: '0.3em',
          color: 'rgba(232,196,106,0.5)',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>Vista 360°</p>
      </div>
    </div>
  );
}

export default function FeaturedSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="featured-section" id="destacado" ref={ref}>
      <motion.div
        className="featured-inner"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, ease }}
      >
        {/* Visual */}
        <motion.div
          className="featured-visual"
          initial={{ x: -40, opacity: 0 }}
          animate={inView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.9, ease }}
        >
          <FeaturedGem />
          <div className="featured-badge">✦ Pieza del Mes</div>
        </motion.div>

        {/* Info */}
        <motion.div
          className="featured-info"
          initial={{ x: 40, opacity: 0 }}
          animate={inView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.15, ease }}
        >
          <div className="featured-meta">
            <span className="featured-meta-tag">Colección Eternidad</span>
            <div className="featured-meta-divider" />
            <span className="featured-meta-sub">Ref. NT-2026-001</span>
          </div>

          <h2 className="featured-title">
            Anillo Solitario<br />
            <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Diamante Puro</em>
          </h2>

          <p className="featured-desc">
            Un solitario atemporal engarzado en oro blanco 18k. El diamante central de 1.2 quilates,
            certificado GIA con claridad VS1 y color E, captura la luz en cada movimiento.
            Creado a mano por nuestros maestros artesanos en Bogotá.
          </p>

          {/* Specs */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { label: 'Material', val: 'Oro 18k' },
              { label: 'Piedra', val: 'Diamante' },
              { label: 'Quilates', val: '1.2 ct' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.12em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 500 }}>{s.label}</span>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>{s.val}</span>
              </div>
            ))}
          </div>

          <div className="featured-price-row">
            <span className="featured-price">$12,500,000</span>
            <span className="featured-price-original">$14,200,000</span>
          </div>

          <div className="featured-actions">
            <button className="btn-primary" id="add-to-cart-btn">
              <ShoppingBag size={14} strokeWidth={2} />
              Agregar al Carrito
            </button>
            <button className="btn-secondary" id="wishlist-btn">
              <Heart size={14} strokeWidth={2} />
              Lista de Deseos
            </button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
