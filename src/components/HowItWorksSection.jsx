import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { WA_URL } from '../config/whatsapp';

const ease = [0.16, 1, 0.3, 1];

const STEPS = [
  {
    n: '01',
    title: 'Escríbenos',
    desc: 'Contáctanos por WhatsApp y cuéntanos qué tipo de joya buscas.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Te Asesoramos',
    desc: 'Un experto te guía y muestra opciones en Oro 18k que se ajusten a tu presupuesto.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Recibe tu Joya',
    desc: 'Realizamos el envío a cualquier parte de Colombia con total garantía.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="how-section" id="como-funciona" ref={ref}>
      <motion.div className="section-header"
        initial={{ opacity:0, y:30 }}
        animate={inView ? { opacity:1, y:0 } : {}}
        transition={{ duration:0.8, ease }}>
        <div className="section-overline">
          <div className="section-overline-line"/>
          Así de Fácil
        </div>
        <h2 className="section-title">
          <span className="font-cinzel">Atención 100% </span>
          <span className="gold-cursive-shimmer" style={{ display: 'inline-block' }}>Personalizada</span>
        </h2>
        <p className="section-subtitle">
          No tienes que elegir solo. Te acompañamos desde la primera consulta hasta que recibas tu joya.
        </p>
      </motion.div>

      <div className="how-steps">
        {STEPS.map((step, i) => (
          <motion.div key={step.n} className="how-step"
            initial={{ opacity:0, y:40 }}
            animate={inView ? { opacity:1, y:0 } : {}}
            transition={{ duration:0.7, delay:i*0.15, ease }}>
            <div className="how-step-num">{step.n}</div>
            <div className="how-step-icon">{step.icon}</div>
            <h3 className="how-step-title">{step.title}</h3>
            <p className="how-step-desc">{step.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Gran CTA */}
      <motion.div className="how-cta-block"
        initial={{ opacity:0, scale:0.95 }}
        animate={inView ? { opacity:1, scale:1 } : {}}
        transition={{ duration:0.8, delay:0.5, ease }}>
        <div className="how-cta-inner">
          <div className="how-cta-glow"/>
          <p className="how-cta-label">¿Lista/o para empezar?</p>
          <h3 className="how-cta-title">
            <span className="font-cinzel block">Recibe tu asesoría</span>
            <span className="gold-cursive-shimmer" style={{ display: 'inline-block' }}>gratis ahora</span>
          </h3>
          <motion.a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="how-wa-btn"
            className="btn-wa-large"
            whileHover={{ scale:1.05, boxShadow:'0 0 60px rgba(37,211,102,0.4)' }}
            whileTap={{ scale:0.97 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
            Hablar con un Asesor →
          </motion.a>
          <p className="how-cta-note">Respuesta inmediata · Sin compromiso · 100% Gratis</p>
        </div>
      </motion.div>
    </section>
  );
}
