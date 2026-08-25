import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle, Video, Camera, MapPin } from 'lucide-react';
import { WA_URL } from '../config/whatsapp';

const ease = [0.16, 1, 0.3, 1];

const REAL_MENU_LINKS = [
  { id: 'inicio', label: 'Inicio', isAnchor: true },
  { id: 'galeria', label: 'Catálogo de Joyas', isAnchor: true },
  { id: 'como-funciona', label: 'Proceso de Pedido', isAnchor: true },
  { id: 'nosotros', label: 'Garantía & Taller', isAnchor: true },
  { id: 'wa-asesoria', label: 'Asesoría por WhatsApp', isAnchor: false, isWa: true },
];

export default function MenuDrawer({ open, onClose }) {
  const handleNavigate = (link) => {
    onClose();
    if (link.isWa) {
      window.open(WA_URL, '_blank');
      return;
    }
    const elem = document.getElementById(link.id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(6px)',
              zIndex: 100,
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.5, ease }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: 'min(380px, 90vw)',
              background: 'linear-gradient(180deg, #061109 0%, #030704 100%)',
              borderRight: '1px solid rgba(212, 175, 55, 0.25)',
              boxShadow: '10px 0 40px rgba(0, 0, 0, 0.9)',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              padding: '36px 30px',
              gap: '36px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src="/logo-noctis.png"
                  alt="Noctis"
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1px solid rgba(212, 175, 55, 0.5)',
                    boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)'
                  }}
                />
                <div>
                  <p className="font-cinzel" style={{ fontSize: '1.4rem', color: 'var(--white)', letterSpacing: '0.08em', lineHeight: 1.1 }}>
                    Noctis
                  </p>
                  <p style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'var(--gold-light)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Joyería · Oro 18k
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                id="menu-close-btn"
                aria-label="Cerrar menú"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  background: 'rgba(212, 175, 55, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                <X size={18} color="var(--gold-light)" strokeWidth={1.8} />
              </button>
            </div>

            {/* Nav links con navegación 100% real */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {REAL_MENU_LINKS.map((link, i) => (
                <motion.div
                  key={link.label}
                  onClick={() => handleNavigate(link)}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.06 * i, ease }}
                  style={{
                    fontFamily: 'Bodoni Moda, serif',
                    fontSize: '1.6rem',
                    fontWeight: 400,
                    color: link.isWa ? 'var(--gold-light)' : 'rgba(255,255,255,0.85)',
                    padding: '12px 0',
                    borderBottom: '1px solid rgba(212, 175, 55, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#f5d77f';
                    e.currentTarget.style.paddingLeft = '8px';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = link.isWa ? 'var(--gold-light)' : 'rgba(255,255,255,0.85)';
                    e.currentTarget.style.paddingLeft = '0px';
                  }}
                >
                  <span>{link.label}</span>
                  <span style={{ fontSize: '1rem', color: 'var(--gold-light)', opacity: 0.8 }}>
                    {link.isWa ? <MessageCircle size={16} /> : '✦'}
                  </span>
                </motion.div>
              ))}
            </nav>

            {/* Bottom contact info real */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--gold-light)', textTransform: 'uppercase', fontWeight: 600 }}>
                Contacto & Redes Oficiales
              </p>
              
              <a
                href="https://www.tiktok.com/@noctis.joyeria"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Video size={15} color="#00ffb3" /> TikTok: <strong style={{ color: 'var(--gold-light)' }}>@noctis.joyeria</strong>
              </a>

              <a
                href="https://www.instagram.com/noctisjoyeria/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Camera size={15} color="#f5d77f" /> Instagram: <strong style={{ color: 'var(--gold-light)' }}>@noctisjoyeria</strong>
              </a>

              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <MessageCircle size={15} color="#25D366" /> WhatsApp Oficial
              </a>

              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#f5d77f" /> Medellín, Colombia
              </p>

              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>
                CEO <a href="https://instagram.com/espinosab_77" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-light)', textDecoration: 'none' }}>@espinosab_77</a>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
