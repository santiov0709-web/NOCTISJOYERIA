import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { WA_URL } from '../config/whatsapp';
import HeroLightBackground from './HeroLightBackground';

const ease = [0.16, 1, 0.3, 1];
const TAGS = ['Oro 18k Certificado', 'Anillos de Hombre', 'Pulseras Tejidas', 'Envíos Asegurados'];

/* ─── Partículas de luz dorada sutiles ─── */
const PARTICLES = [
  { x:'12%',  y:'22%', s:3.5, d:0    },
  { x:'82%',  y:'14%', s:2.2, d:0.9  },
  { x:'68%',  y:'72%', s:4.0, d:1.5  },
  { x:'22%',  y:'68%', s:2.8, d:2.2  },
  { x:'50%',  y:'8%',  s:2.0, d:0.5  },
  { x:'90%',  y:'44%', s:3.1, d:1.9  },
  { x:'8%',   y:'48%', s:2.4, d:1.2  },
  { x:'58%',  y:'87%', s:1.8, d:2.7  },
  { x:'38%',  y:'80%', s:3.4, d:0.7  },
  { x:'94%',  y:'80%', s:2.0, d:3.1  },
];

/* ─── Emblema Principal con Logo Noctis Joyería & Oro 18k ─── */
function HeroLogoEmblem() {
  return (
    <div className="hero-logo-container">
      {/* Anillo exterior dorado de rotación continua */}
      <motion.div
        className="hero-logo-ring-outer"
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />

      {/* Anillo interior contrarrotativo de esmeralda y oro */}
      <motion.div
        className="hero-logo-ring-inner"
        animate={{ rotate: -360 }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
      />

      {/* Marco principal del Logo Noctis con destellos */}
      <div className="hero-logo-frame">
        <motion.img
          src="/logo-noctis-transparent.png"
          onError={(e) => { e.target.src = '/logo-noctis.png'; }}
          alt="Logo Oficial Noctis Joyería"
          className="hero-logo-img"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease }}
        />
        <div className="hero-logo-shimmer" />
      </div>
    </div>
  );
}

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start','end start'] });
  const gemY = useTransform(scrollYProgress, [0,1], [0, -70]);
  const gemScale = useTransform(scrollYProgress, [0,1], [1, 0.88]);
  const textY = useTransform(scrollYProgress, [0,1], [0, 30]);

  return (
    <section className="hero" id="inicio" ref={ref}>
      <HeroLightBackground />

      <div className="hero-particles" aria-hidden="true">
        {PARTICLES.map((p,i) => (
          <span key={i} className="hero-particle" style={{
            left:p.x, top:p.y, width:p.s, height:p.s,
            animationDelay:`${p.d}s`
          }}/>
        ))}
      </div>

      <motion.div className="hero-gem-wrapper" style={{ y: gemY, scale: gemScale }}>
        <div className="hero-gem-glow"/>
        <HeroLogoEmblem />
      </motion.div>

      <div className="scroll-hint" aria-hidden="true">
        <div className="scroll-hint-line"/>
        <span className="scroll-hint-text">Desliza</span>
      </div>

      {/* Titular Principal en Cursiva de Oro Líquido 100% */}
      <motion.div className="footer-content" style={{ y: textY }}>
        <div className="footer-inner">
          <div className="footer-left">
            <motion.div
              className="subtitle-line"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease }}
            >
              <div className="subtitle-dot"/>
              <span className="subtitle-text">NOCTIS JOYERÍA · ORO 18K · MEDELLÍN</span>
            </motion.div>

            <motion.h1
              className="hero-heading"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.5, ease }}
            >
              <span className="block font-cinzel">El brillo eterno</span>
              <span className="block font-cinzel">del verdadero{' '}
                <span className="gold-cursive-shimmer" style={{ display: 'inline-block', verticalAlign: 'middle' }}>Oro 18k.</span>
              </span>
            </motion.h1>

            <motion.div
              className="btn-group"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease }}
            >
              <motion.a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                id="hero-wa-btn"
                className="btn-wa-luxury"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
                Asesoría por WhatsApp
              </motion.a>
              <button
                className="btn-secondary"
                id="gallery-btn"
                onClick={() => document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver Galería de Joyas
              </button>
            </motion.div>
          </div>

          <div className="footer-right">
            {TAGS.map((tag, i) => (
              <motion.div
                key={tag}
                className="collection-tag"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + i * 0.08, ease }}
              >
                <div className="collection-tag-dot"/>
                {tag}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
