import { motion } from 'framer-motion';
import styles from './GlassCard.module.css';

export default function GlassCard({
  children,
  className = '',
  hover = true,
  onClick,
  padding = 'md',
  glow = false,
  style = {},
}) {
  const paddingMap = { none: '0', sm: '16px', md: '20px', lg: '28px' };

  return (
    <motion.div
      className={`${styles.card} ${hover ? styles.hoverable : ''} ${glow ? styles.glow : ''} ${className}`}
      style={{ padding: paddingMap[padding], ...style }}
      onClick={onClick}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
    >
      {children}
    </motion.div>
  );
}
