const ITEMS = [
  'Noctis Joyería',
  '✦',
  'Oro 18k Certificado',
  '✦',
  'Medellín, Colombia',
  '✦',
  'Garantía Total',
  '✦',
  'Diseños Personalizados',
  '✦',
  'Atención por WhatsApp',
  '✦',
  'Noctis Joyería',
  '✦',
  'Oro 18k Certificado',
  '✦',
  'Medellín, Colombia',
  '✦',
  'Garantía Total',
  '✦',
  'Diseños Personalizados',
  '✦',
  'Atención por WhatsApp',
  '✦',
];

export default function Marquee() {
  return (
    <div className="marquee-section" aria-hidden="true">
      <div className="marquee-track">
        {ITEMS.map((item, i) => (
          <div className="marquee-item" key={i}>
            {item === '✦' ? (
              <span className="marquee-gem">{item}</span>
            ) : (
              <span className="marquee-text">{item}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
