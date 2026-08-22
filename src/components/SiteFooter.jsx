import { WA_URL } from '../config/whatsapp';

// Social icons as inline SVGs (lucide-react doesn't include brand icons)
const IconInstagram = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="rgba(255,255,255,0.5)" stroke="none"/>
  </svg>
);

const IconTikTok = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
  </svg>
);

const IconWhatsApp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

// Logo para el footer
const NoctisLogoFooter = () => (
  <img
    src="/logo-noctis.png"
    alt="Noctis Joyería"
    style={{
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      objectFit: 'cover',
      display: 'block',
      border: '1px solid rgba(212, 175, 55, 0.4)',
      boxShadow: '0 0 15px rgba(212, 175, 55, 0.2)'
    }}
  />
);


const NAV_LINKS = {
  'Colecciones': ['Anillos de Oro', 'Pulseras 18k', 'Collares', 'Aretes', 'Dijes'],
  'Información': ['Sobre Noctis', '¿Por qué Oro 18k?', 'Garantía 100%', 'CEO @espinosab_77'],
  'Soporte': ['Envíos Nacionales', 'WhatsApp', 'Devoluciones', 'Cuidado de Joyas'],
};

// Badges de confianza
const TRUST_BADGES = [
  { icon: '✦', text: 'Oro 18k Certificado' },
  { icon: '🛡', text: '100% Garantizado' },
  { icon: '🚚', text: 'Envíos Nacionales' },
  { icon: '📍', text: 'Medellín, Colombia' },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer" id="contacto">

      {/* Trust badges bar */}
      <div className="trust-bar">
        {TRUST_BADGES.map((b) => (
          <div key={b.text} className="trust-badge">
            <span className="trust-icon">{b.icon}</span>
            <span className="trust-text">{b.text}</span>
          </div>
        ))}
      </div>

      <div className="site-footer-top">
        {/* Brand */}
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <NoctisLogoFooter />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span className="footer-brand-name">Noctis Joyería</span>
              <span style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.12em', fontWeight: 500, textTransform: 'uppercase' }}>
                Oro 18k · Medellín
              </span>
            </div>
          </div>
          <p className="footer-brand-desc">
            Joyas en oro 18k con garantía total. Piezas únicas que brillan con la calidad que mereces, con envíos a toda Colombia.
          </p>
          {/* Instagram handle */}
          <a
            href="https://instagram.com/noctisjoyeria"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-instagram-link"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
            @noctisjoyeria
          </a>
        </div>

        {/* Links */}
        {Object.entries(NAV_LINKS).map(([title, links]) => (
          <div key={title} className="footer-links-group">
            <div className="footer-links-title">{title}</div>
            {links.map(link => (
              <a key={link} href="#" className="footer-link">{link}</a>
            ))}
          </div>
        ))}
      </div>

      <div className="site-footer-bottom">
        <p className="footer-copy">
          © 2026 <strong style={{ color: 'rgba(201,168,76,0.6)' }}>NOCTIS JOYERÍA</strong> · Medellín, Colombia · CEO <a href="https://instagram.com/espinosab_77" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(201,168,76,0.5)', textDecoration: 'none' }}>@espinosab_77</a>
        </p>
        <div className="footer-socials" aria-label="Redes sociales">
          <a
            href="https://instagram.com/noctisjoyeria"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
            id="social-instagram"
            title="Instagram @noctisjoyeria"
          >
            <IconInstagram />
          </a>
          <a
            href="https://tiktok.com/@noctisjoyeria"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
            id="social-tiktok"
            title="TikTok @noctisjoyeria"
          >
            <IconTikTok />
          </a>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
            id="social-whatsapp"
            title="WhatsApp Oficial"
          >
            <IconWhatsApp />
          </a>
        </div>
      </div>
    </footer>
  );
}
