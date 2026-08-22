import { motion } from 'motion/react';
import { WA_URL } from '../config/whatsapp';

const ease = [0.16, 1, 0.3, 1];

/* ─── Logo PRO: Imagen transparente con anillo dorado giratorio ─── */
export const NoctisLogoSVG = ({ size = 44, hasRing = true }) => (
  <div className="logo-pro-wrapper" style={{ width: size, height: size }}>
    {hasRing && <div className="logo-pro-ring" />}
    <img
      src="/logo-noctis.png"
      alt="NOCTIS Joyería"
      className="logo-img-pro"
      style={{ width: size, height: size }}
    />
  </div>
);

/* ─── Íconos inline ─── */
const GridIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <circle cx="3" cy="3" r="1.5" fill="#0a0a0a"/>
    <circle cx="9" cy="3" r="1.5" fill="#0a0a0a"/>
    <circle cx="3" cy="9" r="1.5" fill="#0a0a0a"/>
    <circle cx="9" cy="9" r="1.5" fill="#0a0a0a"/>
  </svg>
);

const WaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

export default function Navbar({ onMenuOpen }) {
  return (
    <motion.nav
      className="navbar"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease }}
    >
      {/* Left */}
      <div className="navbar-left">
        <motion.div
          className="logo-wrapper"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3 }}
        >
          <NoctisLogoSVG size={44} />
          <div className="logo-text">
            <span className="logo-name">Noctis</span>
            <span className="logo-tagline">Oro 18k · Medellín</span>
          </div>
        </motion.div>

        <button className="menu-btn" onClick={onMenuOpen} id="menu-open-btn">
          <div className="menu-circle">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <line x1="1" y1="3" x2="11" y2="3" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="1" y1="6" x2="11" y2="6" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="1" y1="9" x2="11" y2="9" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="menu-text">Menú</span>
        </button>

        <div className="tags-pill">
          <span className="tag-label">Oro 18k</span>
          <div className="tag-dot" />
          <span className="tag-label">100% Garantizado</span>
        </div>
      </div>

      {/* Right */}
      <div className="navbar-right">
        <div
          className="right-pill"
          onClick={() => document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' })}
          style={{ cursor: 'pointer' }}
        >
          <div className="right-circle"><GridIcon /></div>
          <span className="right-label">Colecciones</span>
        </div>

        {/* CTA WhatsApp en navbar con animación PRO */}
        <motion.a
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          id="navbar-wa-btn"
          className="navbar-wa-btn"
          whileHover={{ scale: 1.06, y: -1 }}
          whileTap={{ scale: 0.96 }}
        >
          <WaIcon />
          <span className="navbar-wa-text">Asesoría</span>
        </motion.a>
      </div>
    </motion.nav>
  );
}
