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

/* ─── Diamante de Esmeralda & Oro 18k ─── */
function HeroDiamond() {
  return (
    <svg className="hero-diamond-svg" viewBox="0 0 340 380" fill="none">
      <defs>
        <linearGradient id="hd-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f7e19e"/>
          <stop offset="100%" stopColor="#d4af37"/>
        </linearGradient>
        <linearGradient id="hd-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0d2415"/>
          <stop offset="100%" stopColor="#183f25"/>
        </linearGradient>
        <linearGradient id="hd-right" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8c46a"/>
          <stop offset="100%" stopColor="#b8922c"/>
        </linearGradient>
        <linearGradient id="hd-center" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="rgba(247,225,158,0.95)"/>
          <stop offset="100%" stopColor="rgba(212,175,55,0.4)"/>
        </linearGradient>
        <filter id="glow-gem"><feGaussianBlur stdDeviation="8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-soft"><feGaussianBlur stdDeviation="22" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <ellipse cx="170" cy="200" rx="140" ry="120" fill="rgba(212,175,55,0.12)" filter="url(#glow-soft)"/>
      <ellipse cx="170" cy="200" rx="100" ry="80" fill="rgba(24,63,37,0.35)" filter="url(#glow-soft)"/>

      <polygon points="170,40 230,100 170,130 110,100" fill="url(#hd-top)" opacity="0.95" filter="url(#glow-gem)"/>
      <polygon points="110,100 170,130 140,175 70,145" fill="url(#hd-left)" opacity="0.9"/>
      <polygon points="230,100 290,145 220,175 170,130" fill="url(#hd-right)" opacity="0.88"/>
      <polygon points="70,145 140,175 120,220 50,190" fill="#0d2415" opacity="0.85"/>
      <polygon points="220,175 290,145 310,190 240,220" fill="#d4af37" opacity="0.8"/>
      <polygon points="140,175 220,175 200,220 160,220" fill="url(#hd-center)" opacity="0.95"/>
      <polygon points="50,190 120,220 100,280 30,240" fill="#0b1b10" opacity="0.8"/>
      <polygon points="240,220 310,190 330,240 260,280" fill="#a68426" opacity="0.75"/>
      <polygon points="160,220 200,220 180,290" fill="#d4af37" opacity="0.85"/>
      <polygon points="100,280 160,220 180,290 130,330" fill="#183f25" opacity="0.8"/>
      <polygon points="200,220 260,280 210,330 180,290" fill="#b8922c" opacity="0.78"/>
      <polygon points="130,330 180,290 210,330 170,355" fill="url(#hd-top)" opacity="0.9" filter="url(#glow-gem)"/>
      <polygon points="170,48 215,95 170,122 125,95" fill="rgba(255,248,220,0.45)"/>
      <g stroke="rgba(212,175,55,0.28)" strokeWidth="0.8" fill="none">
        <line x1="170" y1="40"  x2="110" y2="100"/>
        <line x1="170" y1="40"  x2="230" y2="100"/>
        <line x1="110" y1="100" x2="170" y2="130"/>
        <line x1="230" y1="100" x2="170" y2="130"/>
        <line x1="170" y1="130" x2="140" y2="175"/>
        <line x1="170" y1="130" x2="220" y2="175"/>
        <line x1="110" y1="100" x2="70"  y2="145"/>
        <line x1="230" y1="100" x2="290" y2="145"/>
        <line x1="70"  y1="145" x2="140" y2="175"/>
        <line x1="290" y1="145" x2="220" y2="175"/>
        <line x1="140" y1="175" x2="120" y2="220"/>
        <line x1="220" y1="175" x2="240" y2="220"/>
        <line x1="160" y1="220" x2="180" y2="290"/>
        <line x1="200" y1="220" x2="180" y2="290"/>
        <line x1="100" y1="280" x2="170" y2="355"/>
        <line x1="260" y1="280" x2="170" y2="355"/>
        <line x1="180" y1="290" x2="170" y2="355"/>
      </g>
    </svg>
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
        <HeroDiamond />
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
