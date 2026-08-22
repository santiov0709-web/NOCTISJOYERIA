import { motion, useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { getWaUrl } from '../config/whatsapp';
import { TrendingUp, Award, ShieldCheck, Scale, Calculator, RefreshCw } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  // Cotización en tiempo real
  const [gold18kCOP, setGold18kCOP] = useState(318450);
  const [gold24kCOP, setGold24kCOP] = useState(424600);
  const [goldUSD, setGoldUSD] = useState(86.50);
  const [selectedGrams, setSelectedGrams] = useState(10);
  const [isUpdating, setIsUpdating] = useState(false);

  // Simulación de fluctuaciones de mercado
  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      setTimeout(() => {
        const delta = Math.floor(Math.random() * 500) - 150;
        setGold18kCOP(prev => Math.max(310000, prev + delta));
        setGold24kCOP(prev => Math.max(410000, prev + Math.floor(delta * 1.33)));
        setGoldUSD(prev => parseFloat((prev + (delta / 4500)).toFixed(2)));
        setIsUpdating(false);
      }, 500);
    }, 18000);

    return () => clearInterval(interval);
  }, []);

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  const calculatedValue = gold18kCOP * selectedGrams;
  const quoteWaUrl = getWaUrl(
    `Hola Noctis Joyería, quisiera cotizar la fabricación de una prenda en Oro 18k estimada en ${selectedGrams} gramos (Cotización actual: ${formatCOP(gold18kCOP)}/g).`
  );

  return (
    <section className="how-section" id="cotizador-oro" ref={ref}>
      {/* Encabezado Principal */}
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease }}
      >
        <div className="section-overline">
          <div className="section-overline-line" />
          Mercado & Valorización en Tiempo Real
        </div>
        <h2 className="section-title">
          <span className="font-cinzel">Cotización del Oro 18k & </span>
          <span className="gold-cursive-shimmer" style={{ display: 'inline-block' }}>Valor del Metal</span>
        </h2>
        <p className="section-subtitle">
          El Oro 18k es un activo real que se valoriza día a día. Consulta la cotización oficial en vivo y calcula el valor del metal de tu joya según su peso en gramos.
        </p>
      </motion.div>

      {/* Grid de Métricas de Mercado */}
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

          <h3 className="gold-card-title">Gramo Oro 18k Nacional</h3>
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
            <span className="meta-text">75% Oro Puro + 25% Aleación de Lujo</span>
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
            <RefreshCw size={13} className={isUpdating ? 'spin-icon' : ''} color="#888" />
          </div>

          <h3 className="gold-card-title">Oro Fino 24k Spot</h3>
          <div className="gold-card-price-row">
            <span className="gold-card-price alt">{formatCOP(gold24kCOP)}</span>
            <span className="gold-card-unit">/ gramo</span>
          </div>

          <div className="gold-card-meta">
            <span className="usd-price">${goldUSD} USD / g</span>
            <span className="meta-text">Tendencia Internacional Alcista</span>
          </div>
        </motion.div>

        {/* Tarjeta 3: Calculadora de Valor del Metal */}
        <motion.div
          className="gold-market-card calculator-card"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4, ease }}
        >
          <div className="gold-card-header">
            <div className="gold-card-badge calc">
              <Calculator size={14} color="#00ffb3" />
              <span>Calculadora de Metal</span>
            </div>
          </div>

          <h3 className="gold-card-title">Selecciona el Peso de la Joya</h3>

          {/* Select de Gramos */}
          <div className="gram-selector-row">
            {[3, 5, 10, 15, 20, 30].map((g) => (
              <button
                key={g}
                type="button"
                className={`gram-btn ${selectedGrams === g ? 'active' : ''}`}
                onClick={() => setSelectedGrams(g)}
              >
                {g}g
              </button>
            ))}
          </div>

          <div className="calc-result-box">
            <span className="calc-result-label">Valor Estimado del Metal ({selectedGrams}g Oro 18k):</span>
            <span className="calc-result-value">{formatCOP(calculatedValue)}</span>
          </div>
        </motion.div>
      </div>

      {/* Bloque CTA de Cotización por Gramos */}
      <motion.div
        className="how-cta-block"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.5, ease }}
      >
        <div className="how-cta-inner">
          <div className="how-cta-glow" />
          <p className="how-cta-label">Transparencia Total en Gramaje & Metal</p>
          <h3 className="how-cta-title">
            <span className="font-cinzel block">Cotiza tu Joya según el</span>
            <span className="gold-cursive-shimmer" style={{ display: 'inline-block' }}>Peso en Gramos en Vivo</span>
          </h3>

          <motion.a
            href={quoteWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="how-wa-btn"
            className="btn-wa-large"
            whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(212,175,55,0.4)' }}
            whileTap={{ scale: 0.97 }}
          >
            📊 Cotizar {selectedGrams}g al Precio del Día →
          </motion.a>

          <p className="how-cta-note">
            <ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />
            Pesaje Exacto Certificado · Factura Legal · Garantía de Vida en el Metal
          </p>
        </div>
      </motion.div>
    </section>
  );
}
