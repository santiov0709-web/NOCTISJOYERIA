import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

const ease = [0.16, 1, 0.3, 1];

export default function LuxuryPreloader({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Progress counter simulation from 0 to 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDone(true);
            setTimeout(() => {
              if (onFinish) onFinish();
            }, 800);
          }, 300);
          return 100;
        }
        const diff = Math.floor(Math.random() * 15) + 5;
        return Math.min(prev + diff, 100);
      });
    }, 120);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          className="preloader-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.98 }}
          transition={{ duration: 0.8, ease }}
        >
          {/* Fondo de luces ambientales en esmeralda y oro */}
          <div className="preloader-bg" aria-hidden="true" />

          <div className="preloader-content">
            {/* Logo Noctis con Anillo de Oro Rotatorio */}
            <div className="preloader-logo-wrap">
              <motion.div
                className="preloader-ring"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="preloader-ring-outer"
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              />
              
              <motion.img
                src="/logo-noctis.png"
                alt="NOCTIS Joyería"
                className="preloader-logo-img"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease }}
              />
            </div>

            {/* Texto de Marca en Tipografía Cinzel & Bodoni */}
            <motion.div
              className="preloader-text-group"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease }}
            >
              <h1 className="preloader-title font-cinzel gold-metallic-text">
                NOCTIS JOYERÍA
              </h1>
              <p className="preloader-subtitle font-unicase" style={{ color: 'var(--gold-light)', letterSpacing: '0.25em', fontSize: '11px', marginTop: '6px' }}>
                ORO 18K · MEDELLÍN, COLOMBIA
              </p>
            </motion.div>

            {/* Porcentaje de Carga & Línea de Oro */}
            <motion.div
              className="preloader-progress-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="preloader-bar-bg">
                <motion.div
                  className="preloader-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="preloader-number font-bodoni">
                {progress.toString().padStart(2, '0')}
                <span className="preloader-percent">%</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
