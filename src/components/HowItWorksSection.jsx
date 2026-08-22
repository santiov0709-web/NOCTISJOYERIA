import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Sparkles, ShieldCheck, Box, Droplets, CheckCircle2, Award } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1];

const CARE_TIPS = [
  {
    icon: Sparkles,
    badge: 'Limpieza Delicada',
    title: 'Brillo & Limpieza Profesional',
    desc: 'Limpia tus joyas en Oro 18k con un paño de microfibra suave. Para una limpieza profunda, usa agua tibia y jabón neutro, secando con sutileza para preservar su lustre natural sin rayar el metal noble.',
  },
  {
    icon: Box,
    badge: 'Almacenamiento',
    title: 'Conservación Individual',
    desc: 'Guarda cada prenda en su estuche de lujo o bolsa de terciopelo Noctis de forma independiente. Esto evita el contacto entre metales y mantiene intactos los eslabones, sellos y engastes finos.',
  },
  {
    icon: Droplets,
    badge: 'Protección Diaria',
    title: 'Cuidado ante Químicos',
    desc: 'Ponte tus joyas como último paso al vestirte, después de aplicar lociones, perfumes o fijadores. Evita exponer el oro a cloro o productos de limpieza abrasivos para mantener su aleación pura.',
  },
  {
    icon: CheckCircle2,
    badge: 'Mantenimiento',
    title: 'Revisión en Taller Noctis',
    desc: 'Inspecciona periódicamente broches y cierres. En nuestro taller especializado en Medellín ofrecemos servicio de pulido, ajuste y mantenimiento preventivo para que tus prendas luzcan como nuevas siempre.',
  },
];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="how-section" id="cuidado-prendas" ref={ref}>
      {/* Encabezado Principal */}
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease }}
      >
        <div className="section-overline">
          <div className="section-overline-line" />
          Guía de Conservación & Alta Joyería
        </div>
        <h2 className="section-title">
          <span className="font-cinzel">Cuida tus Prendas en </span>
          <span className="gold-cursive-shimmer" style={{ display: 'inline-block' }}>Oro 18k</span>
        </h2>
        <p className="section-subtitle">
          En <strong>Noctis Joyería</strong> te enseñamos a preservar el brillo, la pureza y la elegancia eterna de tus piezas con nuestros consejos de cuidado profesional.
        </p>
      </motion.div>

      {/* Grid de Consejos de Cuidado de Lujo */}
      <div className="care-grid">
        {CARE_TIPS.map((tip, idx) => {
          const IconComponent = tip.icon;
          return (
            <motion.div
              key={idx}
              className="care-card"
              initial={{ opacity: 0, y: 35 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: idx * 0.12, ease }}
            >
              <div className="care-card-header">
                <div className="care-icon-box">
                  <IconComponent size={20} color="#f5d77f" />
                </div>
                <span className="care-badge">{tip.badge}</span>
              </div>

              <h3 className="care-title">{tip.title}</h3>
              <p className="care-desc">{tip.desc}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Bloque de Garantía y Sello Noctis */}
      <motion.div
        className="care-banner-block"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.45, ease }}
      >
        <div className="care-banner-inner">
          <div className="care-banner-glow" />
          <div className="care-stamp-badge">
            <Award size={16} color="#d4af37" />
            <span>Garantía Noctis Joyería</span>
          </div>

          <h3 className="care-banner-title font-cinzel">
            Elegancia Eterna & Metal de Autor
          </h3>

          <p className="care-banner-text">
            Todas nuestras piezas son elaboradas con técnicas de alta orfebrería en <strong>Oro 18k Ley 750</strong>. Ofrecemos respaldo permanente sobre la calidad del metal y servicio especializado de mantenimiento en nuestro taller de Medellín.
          </p>

          <div className="care-footer-pills">
            <span className="care-pill">✦ Oro 18k Ley 750 Certificado</span>
            <span className="care-pill">✦ Mantenimiento de Autor</span>
            <span className="care-pill">✦ Taller Especializado Medellín</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
