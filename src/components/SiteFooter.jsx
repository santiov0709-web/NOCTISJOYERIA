import { WA_URL } from '../config/whatsapp';
import { ShieldCheck, Award, Truck, MapPin, Sparkles } from 'lucide-react';

const IconInstagram = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

const IconTikTok = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
  </svg>
);

const IconWhatsApp = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const TRUST_BADGES = [
  { icon: Award, label: 'Oro 18k Certificado', sub: 'Calidad Real Garantizada' },
  { icon: ShieldCheck, label: '100% Garantizado', sub: 'Garantía de Vida en Metal' },
  { icon: Truck, label: 'Envíos Nacionales', sub: 'Asegurados a toda Colombia' },
  { icon: MapPin, label: 'Medellín, Colombia', sub: 'Taller & Fabricación Directa' },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer" id="contacto">
      {/* Top Gold Shimmer Border Line */}
      <div className="footer-gold-divider" />

      {/* Trust Badges Bar */}
      <div className="trust-bar">
        {TRUST_BADGES.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div key={idx} className="trust-item">
              <div className="trust-icon-box">
                <IconComponent size={18} color="#f5d77f" />
              </div>
              <div className="trust-info">
                <span className="trust-title">{item.label}</span>
                <span className="trust-sub">{item.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Footer Body */}
      <div className="site-footer-top">
        {/* Brand Column */}
        <div className="footer-brand">
          <div className="footer-logo-row">
            <div className="footer-logo-wrap">
              <img src="/logo-noctis.png" alt="Noctis Joyería" className="footer-logo-img" />
              <div className="footer-logo-ring" />
            </div>
            <div className="footer-brand-text">
              <span className="footer-brand-title font-cinzel">Noctis Joyería</span>
              <span className="footer-brand-tagline">ORO 18K · MEDELLÍN</span>
            </div>
          </div>

          <p className="footer-brand-desc">
            Piezas exclusivas en Oro 18k con garantía total. Fabricación artesanal de autor que destaca por su brillo, elegancia y distinción con envíos a toda Colombia.
          </p>

          <div className="footer-ceo-badge">
            <span className="ceo-label">CEO & Fundador:</span>
            <a href="https://instagram.com/espinosab_77" target="_blank" rel="noopener noreferrer" className="ceo-link">
              @espinosab_77
            </a>
          </div>

          <a
            href="https://instagram.com/noctisjoyeria"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-ig-btn"
          >
            <IconInstagram />
            <span>@noctisjoyeria</span>
          </a>
        </div>

        {/* Links Column 1: Colecciones */}
        <div className="footer-links-group">
          <h4 className="footer-links-title font-cinzel">Colecciones 18k</h4>
          <ul className="footer-links-list">
            <li><a href="#galeria" className="footer-link">Anillos & Sellos de Hombre</a></li>
            <li><a href="#galeria" className="footer-link">Pulseras Tejidas & Hilo Rojo</a></li>
            <li><a href="#galeria" className="footer-link">Cadenas & Dijes Exclusivos</a></li>
            <li><a href="#galeria" className="footer-link">Alta Joyería Noctis</a></li>
            <li><a href="#galeria" className="footer-link">Prendas Personalizadas</a></li>
          </ul>
        </div>

        {/* Links Column 2: Información */}
        <div className="footer-links-group">
          <h4 className="footer-links-title font-cinzel">Experiencia Noctis</h4>
          <ul className="footer-links-list">
            <li><a href="#nosotros" className="footer-link">Sobre Nuestra Marca</a></li>
            <li><a href="#proceso" className="footer-link">¿Por qué elegir Oro 18k?</a></li>
            <li><a href="#garantia" className="footer-link">Garantía Total Certificada</a></li>
            <li><a href="#taller" className="footer-link">Taller de Joyería en Medellín</a></li>
          </ul>
        </div>

        {/* Links Column 3: Atención al Cliente */}
        <div className="footer-links-group">
          <h4 className="footer-links-title font-cinzel">Atención & Soporte</h4>
          <ul className="footer-links-list">
            <li><a href={WA_URL} target="_blank" rel="noreferrer" className="footer-link">Asesoría Directa por WhatsApp</a></li>
            <li><a href="#envios" className="footer-link">Envíos Asegurados a Colombia</a></li>
            <li><a href="#cuidados" className="footer-link">Guía de Cuidado de Joyas</a></li>
            <li><a href="#preguntas" className="footer-link">Preguntas Frecuentes</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="site-footer-bottom">
        <div className="footer-copy-container">
          <p className="footer-copy">
            © 2026 <strong>NOCTIS JOYERÍA</strong> · Todos los derechos reservados · Medellín, Colombia
          </p>

          <div className="designer-signature">
            <Sparkles size={13} color="#d4af37" />
            <span>Crafted & Designed with Excellence by <strong>Santiago Otero</strong></span>
          </div>
        </div>

        <div className="footer-socials">
          <a
            href="https://instagram.com/noctisjoyeria"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
            title="Instagram @noctisjoyeria"
          >
            <IconInstagram />
          </a>
          <a
            href="https://tiktok.com/@noctis.joyeria"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
            title="TikTok @noctis.joyeria"
          >
            <IconTikTok />
          </a>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
            title="WhatsApp Oficial Noctis"
          >
            <IconWhatsApp />
          </a>
        </div>
      </div>
    </footer>
  );
}
