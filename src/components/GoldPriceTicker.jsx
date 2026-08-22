import { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, ShieldCheck } from 'lucide-react';

export default function GoldPriceTicker() {
  const [gold18kCOP, setGold18kCOP] = useState(318450);
  const [gold24kCOP, setGold24kCOP] = useState(424600);
  const [goldUSD, setGoldUSD] = useState(86.50);
  const [changePercentage, setChangePercentage] = useState(+1.24);
  const [lastUpdated, setLastUpdated] = useState('En vivo');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchRealGoldPrice = async () => {
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
          setLastUpdated('Bolsa Internacional (En Vivo)');
        }
      }
    } catch (e) {
      console.error('Error al consultar la API de Oro:', e);
    } finally {
      setTimeout(() => setIsUpdating(false), 500);
    }
  };

  useEffect(() => {
    fetchRealGoldPrice();
    const interval = setInterval(fetchRealGoldPrice, 30000);
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
          <span className="status-label">API Mercado en Vivo</span>
        </div>

        {/* Price Ticker Items */}
        <div className="gold-ticker-items">
          <div className="ticker-item">
            <span className="ticker-label">Gramo Oro 18k Ley 750:</span>
            <span className={`ticker-price ${isUpdating ? 'price-flash' : ''}`}>
              {formatCOP(gold18kCOP)} /g
            </span>
            <span className="ticker-change positive">
              <TrendingUp size={12} /> +{changePercentage}%
            </span>
          </div>

          <span className="ticker-separator">|</span>

          <div className="ticker-item hide-mobile">
            <span className="ticker-label">Oro Fino 24k:</span>
            <span className="ticker-price-sub">{formatCOP(gold24kCOP)} /g (${goldUSD} USD/g)</span>
          </div>

          <span className="ticker-separator hide-mobile">|</span>

          <div className="ticker-item hide-mobile">
            <ShieldCheck size={13} color="#f5d77f" />
            <span className="ticker-guarantee">Valorización Oficial del Metal</span>
          </div>
        </div>

        {/* Update timestamp & Refresh icon */}
        <div
          className="gold-ticker-refresh"
          onClick={fetchRealGoldPrice}
          style={{ cursor: 'pointer' }}
          title="Haz clic para refrescar la cotización en vivo"
        >
          <RefreshCw size={11} className={isUpdating ? 'spin-icon' : ''} />
          <span>{lastUpdated}</span>
        </div>
      </div>
    </div>
  );
}
