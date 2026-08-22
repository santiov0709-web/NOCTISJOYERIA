import { useState, useEffect } from 'react';
import { TrendingUp, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';

export default function GoldPriceTicker() {
  // Precio base inicial del gramo de Oro 18k en Colombia (COP) y USD
  const [goldPrice18kCOP, setGoldPrice18kCOP] = useState(318450);
  const [goldPrice24kCOP, setGoldPrice24kCOP] = useState(424600);
  const [changePercentage, setChangePercentage] = useState(+1.24);
  const [lastUpdated, setLastUpdated] = useState('Hace un momento');
  const [isUpdating, setIsUpdating] = useState(false);

  // Simulación de fluctuación de mercado en tiempo real cada 20 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      setTimeout(() => {
        // Pequeña variación realista (+- 150 a 450 COP)
        const delta = Math.floor(Math.random() * 600) - 200;
        setGoldPrice18kCOP(prev => Math.max(310000, prev + delta));
        setGoldPrice24kCOP(prev => Math.max(410000, prev + Math.floor(delta * 1.33)));

        const newChange = (Math.random() * 0.4 + 1.1).toFixed(2);
        setChangePercentage(parseFloat(newChange));
        setLastUpdated('Hace un momento');
        setIsUpdating(false);
      }, 600);
    }, 20000);

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
    <div className="gold-ticker-bar">
      <div className="gold-ticker-container">
        {/* Market Status Live Pulse */}
        <div className="gold-ticker-status">
          <span className="live-pulse-dot" />
          <span className="status-label">Mercado Abierto</span>
        </div>

        {/* Price Ticker Items */}
        <div className="gold-ticker-items">
          <div className="ticker-item">
            <span className="ticker-label">Gramo Oro 18k Ley 750:</span>
            <span className={`ticker-price ${isUpdating ? 'price-flash' : ''}`}>
              {formatCOP(goldPrice18kCOP)} /g
            </span>
            <span className="ticker-change positive">
              <TrendingUp size={12} /> +{changePercentage}%
            </span>
          </div>

          <span className="ticker-separator">|</span>

          <div className="ticker-item hide-mobile">
            <span className="ticker-label">Oro Fino 24k:</span>
            <span className="ticker-price-sub">{formatCOP(goldPrice24kCOP)} /g</span>
          </div>

          <span className="ticker-separator hide-mobile">|</span>

          <div className="ticker-item hide-mobile">
            <ShieldCheck size={13} color="#f5d77f" />
            <span className="ticker-guarantee">Valorización Continua del Metal</span>
          </div>
        </div>

        {/* Update timestamp & Refresh icon */}
        <div className="gold-ticker-refresh" title="Actualizado en tiempo real">
          <RefreshCw size={11} className={isUpdating ? 'spin-icon' : ''} />
          <span>{lastUpdated}</span>
        </div>
      </div>
    </div>
  );
}
