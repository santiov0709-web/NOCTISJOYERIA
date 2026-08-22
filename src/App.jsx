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
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();

  return (
    <div className="app">
      {/* Preloader de Lujo Exclusivo Noctis */}
      <LuxuryPreloader onFinish={() => setLoading(false)} />

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


