import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle, ArrowLeft } from 'lucide-react';
import { WA_NUMBER, getWaUrl } from '../config/whatsapp';

const ease = [0.16, 1, 0.3, 1];

export default function WhatsAppModal({ open, onClose, customMessage, productTitle }) {
  if (!open) return null;

  const msg = customMessage || `Hola Noctis Joyería, quisiera recibir atención personalizada sobre ${productTitle || 'sus joyas en Oro 18k'}.`;
  const targetUrl = getWaUrl(msg);

  const handleOpenWa = () => {
    window.location.href = targetUrl;
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="wa-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="wa-modal-card"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ duration: 0.4, ease }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="wa-modal-header">
            <div className="wa-modal-brand">
              <img src="/logo-noctis.png" alt="Noctis" className="wa-modal-logo" />
              <div>
                <h4 className="font-cinzel" style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>
                  NOCTIS JOYERÍA
                </h4>
                <p className="font-unicase" style={{ fontSize: '9px', color: 'var(--gold-light)', margin: 0, letterSpacing: '0.15em' }}>
                  ATENCIÓN DIRECTA · ORO 18K
                </p>
              </div>
            </div>

            <button className="wa-modal-close" onClick={onClose} aria-label="Cerrar ventana">
              <X size={18} color="#fff" />
            </button>
          </div>

          {/* Body */}
          <div className="wa-modal-body">
            <div className="wa-status-badge">
              <span className="wa-status-dot" />
              <span>Asesor en línea · Respuesta inmediata</span>
            </div>

            <p className="wa-modal-message-preview">
              "{msg}"
            </p>

            <p className="wa-modal-num font-unicase">
              NÚMERO VERIFICADO: <strong>+57 313 731 1578</strong>
            </p>
          </div>

          {/* Actions */}
          <div className="wa-modal-actions">
            <button className="wa-modal-btn-primary" onClick={handleOpenWa}>
              <MessageCircle size={18} /> ABRIR WHATSAPP AHORA
            </button>

            <button className="wa-modal-btn-secondary" onClick={onClose}>
              <ArrowLeft size={14} /> SEGUIR EXPLORANDO LA PÁGINA
            </button>
          </div>

          <p className="wa-modal-note">
            Al abrir WhatsApp, esta página permanecerá 100% activa en segundo plano para que continúes navegando cuando desees.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
