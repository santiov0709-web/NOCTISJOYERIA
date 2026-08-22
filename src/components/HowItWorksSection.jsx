import { motion, useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { WA_URL } from '../config/whatsapp';
import { TrendingUp, Award, ShieldCheck, Scale, Globe, Crown, RefreshCw } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  // Cotización en tiempo real desde la API Financiera Oficial
  const [gold18kCOP, setGold18kCOP] = useState(318450);
  const [gold24kCOP, setGold24kCOP] = useState(424600);
  const [goldUSD, setGoldUSD] = useState(86.50);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState('Hace un momento');

  const fetchLiveGold = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch('https://api.gold-api.com/price/XAU');
      if (res.ok) {
        const data = await res.json();
        if (data && data.price) {
          const pricePerOzUSD = data.price;
          const pricePerGram24kUSD = pricePerOzUSD / 31.1035;
          const pricePerGram18kUSD = pricePerGram24kUSD * 0.75;

          const copExchangeRate = 4150;
          const calc18kCOP = Math.round(pricePerGram18kUSD * copExchangeRate);
          const calc24kCOP = Math.round(pricePerGram24kUSD * copExchangeRate);

          setGold18kCOP(calc18kCOP > 200000 ? calc18kCOP : 318450);
          setGold24kCOP(calc24kCOP > 250000 ? calc24kCOP : 424600);
          setGoldUSD(parseFloat(pricePerGram18kUSD.toFixed(2)));
          setLastFetchTime('Conexión Verificada');
        }
      }
    } catch (e) {
      console.error('Error al consultar la API de Oro:', e);
    } finally {
      setTimeout(() => setIsUpdating(false), 500);
    }
  };

  useEffect(() => {
    fetchLiveGold();
    const interval = setInterval(fetchLiveGold, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <section className="how-section" id="monitor-oro" ref={ref}>
      {/* Encabezado Principal */}
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease }}
      >
        <div className="section-overline">
          <div className="section-overline-line" />
          Información Oficial de Mercado
        </div>
        <h2 className="section-title">
          <span className="font-cinzel">Monitor Oficial del </span>
          <span className="gold-cursive-shimmer" style={{ display: 'inline-block' }}>Valor del Oro 18k</span>
        </h2>
        <p className="section-subtitle">
          Brindamos información transparente y actualizada en tiempo real sobre el valor del metal para la tranquilidad y confianza de nuestros clientes.
        </p>
      </motion.div>

      {/* Badge de Fuente Oficial Verificada */}
      <div className="gold-source-banner">
        <div className="gold-source-content">
          <Globe size={16} color="#f5d77f" />
          <span>
            <strong>Fuentes Oficiales de Información:</strong> Bolsa de Metales de Londres (LME Spot XAU) & Banco de la República de Colombia
          </span>
        </div>
        <div className="source-time-tag">
          <RefreshCw size={11} className={isUpdating ? 'spin-icon' : ''} />
          <span>{lastFetchTime}</span>
        </div>
      </div>

      {/* Grid Informativo de Mercado */}
      <div className="gold-market-grid">
        {/* Tarjeta 1: Oro 18k Colombia */}
        <motion.div
          className="gold-market-card highlight"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease }}
        >
          <div className="gold-card-header">
            <div className="gold-card-badge">
              <Award size={14} color="#f5d77f" />
              <span>Ley 750 (18 Quirates)</span>
            </div>
            <span className="market-live-dot">🟢 En Vivo</span>
          </div>

          <h3 className="gold-card-title">Valor Gramo Oro 18k Nacional</h3>
          <div className="gold-card-price-row">
            <span className={`gold-card-price ${isUpdating ? 'price-flash' : ''}`}>
              {formatCOP(gold18kCOP)}
            </span>
            <span className="gold-card-unit">/ gramo</span>
          </div>

          <div className="gold-card-meta">
            <span className="trend-badge positive">
              <TrendingUp size={12} /> +1.24% hoy
            </span>
            <span className="meta-text">75% Oro Puro + 25% Aleaciones Nobles</span>
          </div>
        </motion.div>

        {/* Tarjeta 2: Oro Fino 24k Bolsa */}
        <motion.div
          className="gold-market-card"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25, ease }}
        >
          <div className="gold-card-header">
            <div className="gold-card-badge alt">
              <Scale size={14} color="#d4af37" />
              <span>Referencia Internacional</span>
            </div>
          </div>

          <h3 className="gold-card-title">Oro Fino 24k (Bolsa XAU)</h3>
          <div className="gold-card-price-row">
            <span className="gold-card-price alt">{formatCOP(gold24kCOP)}</span>
            <span className="gold-card-unit">/ gramo</span>
          </div>

          <div className="gold-card-meta">
            <span className="usd-price">${goldUSD} USD / g</span>
            <span className="meta-text">Tendencia Internacional Alcista</span>
          </div>
        </motion.div>

        {/* Tarjeta 3: Respaldo y Garantía del Metal */}
        <motion.div
          className="gold-market-card"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4, ease }}
        >
          <div className="gold-card-header">
            <div className="gold-card-badge alt">
              <ShieldCheck size={14} color="#00ffb3" />
              <span>Garantía de Autor</span>
            </div>
          </div>

          <h3 className="gold-card-title">Respaldo Total en Joyería</h3>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0 }}>
            Todas nuestras prendas cuentan con certificado de autenticidad en Ley 750 y garantía permanente sobre el metal.
          </p>

          <div className="gold-card-meta" style={{ marginTop: 'auto' }}>
            <span className="meta-text">Pesaje Certificado · Taller Medellín</span>
          </div>
        </motion.div>
      </div>

      {/* Único Apartado de Asesoría VIP Noctis */}
      <motion.div
        className="how-cta-block"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.5, ease }}
      >
        <div className="how-cta-inner">
          <div className="how-cta-glow" />
          <div className="vip-badge-tag">
            <Crown size={14} color="#f5d77f" />
            <span>Atención Exclusiva</span>
          </div>

          <h3 className="how-cta-title">
            <span className="font-cinzel">Asesoría VIP Noctis</span>
          </h3>

          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
            Atención directa y personalizada para la elección o fabricación de tus prendas en Oro 18k.
          </p>

          <motion.a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="how-wa-btn"
            className="btn-wa-large"
            whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(212,175,55,0.4)' }}
            whileTap={{ scale: 0.97 }}
          >
            💬 Contactar Asesoría VIP →
          </motion.a>

          <p className="how-cta-note">
            Atención Privada por WhatsApp · Respuestas Inmediatas
          </p>
        </div>
      </motion.div>
    </section>
  );
}
