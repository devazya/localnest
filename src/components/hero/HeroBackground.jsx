import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { glowPulse } from '../../animations/heroVariants';
import styles from './HeroBackground.module.css';

function MeshCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const POINTS = 22;
    const pts = Array.from({ length: POINTS }, () => ({
      x:  Math.random(),
      y:  Math.random(),
      vx: (Math.random() - 0.5) * 0.00012,
      vy: (Math.random() - 0.5) * 0.00012,
    }));

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      pts.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
      });

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx   = (pts[i].x - pts[j].x) * W;
          const dy   = (pts[i].y - pts[j].y) * H;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 220) {
            const alpha = (1 - dist / 220) * 0.18;
            ctx.beginPath();
            ctx.moveTo(pts[i].x * W, pts[i].y * H);
            ctx.lineTo(pts[j].x * W, pts[j].y * H);
            ctx.strokeStyle = `rgba(110,231,183,${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(110,231,183,0.35)';
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.meshCanvas} />;
}

export default function HeroBackground() {
  return (
    <div className={styles.bg} aria-hidden="true">
      <MeshCanvas />

      <motion.div className={styles.orb1} {...glowPulse} />

      <motion.div
        className={styles.orb2}
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.08, 1] }}
        transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity, delay: 1 }}
      />

      <motion.div
        className={styles.orb3}
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity, delay: 2.5 }}
      />

      <div className={styles.grid} />
      <div className={styles.vignette} />
      <div className={styles.fade} />
    </div>
  );
}
