import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1];

const COLLECTIONS = [
  {
    id: 'col-1',
    tag: 'Nueva Colección',
    title: 'Eternidad',
    sub: 'Anillos de compromiso',
    gradient: 'linear-gradient(135deg, #1a1208 0%, #2d2010 50%, #1a1208 100%)',
    accent: '#e8c46a',
  },
  {
    id: 'col-2',
    tag: 'Best Seller',
    title: 'Lumière',
    sub: 'Collares y colgantes',
    gradient: 'linear-gradient(135deg, #0a0f1a 0%, #101828 50%, #0a0f1a 100%)',
    accent: '#a8c4e8',
  },
  {
    id: 'col-3',
    tag: 'Exclusivo',
    title: 'Cosmos',
    sub: 'Pulseras artesanales',
    gradient: 'linear-gradient(135deg, #100a1a 0%, #1e1028 50%, #100a1a 100%)',
    accent: '#c4a8e8',
  },
];

// Placeholder card visuals with CSS gradients
function CollectionVisual({ gradient, accent, title }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: gradient,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
      }}
    >
      {/* Decorative gem shape */}
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ opacity: 0.6 }}>
        <polygon points="40,8 56,24 40,36 24,24" fill={accent} opacity="0.9"/>
        <polygon points="24,24 40,36 34,58 12,42" fill={accent} opacity="0.5"/>
        <polygon points="56,24 68,42 46,58 40,36" fill={accent} opacity="0.7"/>
        <polygon points="34,58 40,36 46,58 40,70" fill={accent} opacity="0.9"/>
      </svg>
      <span style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '1.4rem',
        fontWeight: 300,
        color: accent,
        opacity: 0.4,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
      }}>{title}</span>
    </div>
  );
}

export default function CollectionsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="section" id="colecciones" ref={ref}>
      <motion.div
        className="section-header"
        initial={{ y: 30, opacity: 0 }}
        animate={inView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.8, ease }}
      >
        <div className="section-overline">
          <div className="section-overline-line" />
          Nuestras Colecciones
        </div>
        <h2 className="section-title">
          Piezas que cuentan<br />
          <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>tu historia</em>
        </h2>
        <p className="section-subtitle">
          Cada joya es creada a mano por nuestros maestros artesanos con materiales seleccionados de las mejores fuentes del mundo.
        </p>
      </motion.div>

      <div className="collections-grid">
        {COLLECTIONS.map((col, i) => (
          <motion.div
            key={col.id}
            className="collection-card"
            id={col.id}
            initial={{ y: 40, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.1 * i, ease }}
          >
            <CollectionVisual
              gradient={col.gradient}
              accent={col.accent}
              title={col.title}
            />
            <div className="collection-card-overlay" />
            <div className="collection-card-content">
              <div className="collection-card-tag">{col.tag}</div>
              <div className="collection-card-title">{col.title}</div>
              <div className="collection-card-sub">{col.sub}</div>
            </div>
            <div className="collection-card-arrow">
              <ArrowUpRight size={16} color="#e8c46a" strokeWidth={1.5} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
