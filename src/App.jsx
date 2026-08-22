import { useState, useEffect } from 'react';
import { motion, useScroll } from 'motion/react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Marquee from './components/Marquee';
import GallerySection from './components/GallerySection';
import HowItWorksSection from './components/HowItWorksSection';
import StatsSection from './components/StatsSection';
import NewsletterSection from './components/NewsletterSection';
import SiteFooter from './components/SiteFooter';
import MenuDrawer from './components/MenuDrawer';
import LuxuryPreloader from './components/LuxuryPreloader';
import AdminPanelModal from './components/AdminPanelModal';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    // Detectar hash en la URL (ej. #admin o #/noctis-admin)
    const checkHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('admin') || hash.includes('noctis-admin')) {
        setAdminOpen(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);

    // Atajo de teclado secreto (Ctrl + Shift + A)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="app">
      {/* Preloader de Lujo Exclusivo Noctis */}
      <LuxuryPreloader onFinish={() => setLoading(false)} />

      {/* Panel de Control Administrativo Oculto */}
      <AdminPanelModal open={adminOpen} onClose={() => setAdminOpen(false)} />

      {/* Scroll Progress Bar PRO */}
      <motion.div
        className="scroll-progress-bar"
        style={{ scaleX: scrollYProgress }}
      />

      <Navbar onMenuOpen={() => setMenuOpen(true)} />
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <HeroSection />
      <Marquee />
      <GallerySection />
      <HowItWorksSection />
      <StatsSection />
      <NewsletterSection />
      <SiteFooter />
    </div>
  );
}

