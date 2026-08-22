import { useEffect, useRef } from 'react';

export default function HeroLightBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Light Orbs Configuration
    const orbs = [
      { x: width * 0.3, y: height * 0.3, radius: 280, color: 'rgba(212, 175, 55, 0.18)', vx: 0.8, vy: 0.5 },
      { x: width * 0.7, y: height * 0.4, radius: 320, color: 'rgba(24, 63, 37, 0.45)', vx: -0.6, vy: 0.7 },
      { x: width * 0.5, y: height * 0.2, radius: 220, color: 'rgba(247, 225, 158, 0.22)', vx: 0.4, vy: -0.4 },
      { x: width * 0.2, y: height * 0.7, radius: 300, color: 'rgba(13, 34, 21, 0.5)', vx: 0.7, vy: -0.6 },
    ];

    // Gold Dust Particles
    const particlesCount = 45;
    const particles = Array.from({ length: particlesCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.8,
      speedY: Math.random() * 0.4 + 0.1,
      alpha: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * 0.02 + 0.005,
    }));

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Dark Luxury Emerald Base Gradient
      const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
      baseGrad.addColorStop(0, '#030704');
      baseGrad.addColorStop(0.5, '#06120a');
      baseGrad.addColorStop(1, '#020503');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw Light Orbs
      orbs.forEach((orb) => {
        orb.x += orb.vx * Math.sin(time * 0.8);
        orb.y += orb.vy * Math.cos(time * 0.8);

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Atmospheric Light Rays / Beam Sweep
      const beamGrad = ctx.createLinearGradient(0, 0, width, height);
      const beamAlpha = 0.06 + Math.sin(time * 1.5) * 0.03;
      beamGrad.addColorStop(0, `rgba(212, 175, 55, ${beamAlpha})`);
      beamGrad.addColorStop(0.5, `rgba(24, 63, 37, ${beamAlpha * 1.5})`);
      beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw Gold Dust Particles
      particles.forEach((p) => {
        p.y -= p.speedY;
        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        p.alpha += Math.sin(time * 2 + p.x) * p.pulse;
        const clampedAlpha = Math.max(0.1, Math.min(0.85, p.alpha));

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 215, 127, ${clampedAlpha})`;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas-bg"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
