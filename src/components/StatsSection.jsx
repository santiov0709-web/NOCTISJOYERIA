import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const ease = [0.16, 1, 0.3, 1];

const STATS = [
  { number: '100%', label: 'Oro 18k Garantizado' },
  { number: 'Medellín', label: 'Taller & Fabricación' },
  { number: 'Directo', label: 'Asesoría por WhatsApp' },
  { number: 'Envíos', label: 'Asegurados a toda Colombia' },
];

export default function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="stats-section" id="nosotros" ref={ref}>
      <motion.div
        className="stats-grid"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease }}
      >
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="stat-item"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 * i, ease }}
          >
            <div className="stat-number gold-shimmer">{stat.number}</div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
