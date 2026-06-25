import { motion } from 'framer-motion';
import styles from './CategorySection.module.css';
import { staggerContainer, staggerItem } from '../../animations/pageVariants';

const CATEGORIES = [
  {
    id: 'pg',
    title: 'PG Rooms',
    description: 'Find comfortable and affordable PGs',
    count: '42+ Listings',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=300&q=80',
    alt: 'PG room interior',
    featured: false,
    route: 'pgs',
  },
  {
    id: 'shops',
    title: 'Shops & Services',
    description: 'Everything you need, nearby',
    count: '120+ Shops',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=300&q=80',
    alt: 'Local shop storefront',
    featured: false,
    route: 'shops',
  },
  {
    id: 'events',
    title: 'Events',
    description: 'Local events, meetups and more',
    count: '8+ Events',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&q=80',
    alt: 'Community event',
    featured: true,
    route: 'events',
  },
  {
    id: 'rides',
    title: 'Rides',
    description: 'Share rides, travel together',
    count: '14+ Active Rides',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&q=80',
    alt: 'Car ride sharing',
    featured: false,
    route: 'rideshare',
  },
  {
    id: 'community',
    title: 'Community',
    description: 'Connect, chat and collaborate',
    count: 'Active Community',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&q=80',
    alt: 'Community members',
    featured: false,
    route: 'community',
  },
];

export default function CategorySection({ onNavigate }) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.heading}>Explore by category</h2>
          <button
            className={styles.viewAll}
            onClick={() => onNavigate && onNavigate('home')}
          >
            View all <span className={styles.arrow}>→</span>
          </button>
        </div>

        {/* Cards Grid */}
        <motion.div
          className={styles.grid}
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {CATEGORIES.map((cat) => (
            <motion.div
              key={cat.id}
              variants={staggerItem}
              className={`${styles.card} ${cat.featured ? styles.cardFeatured : ''}`}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => onNavigate && onNavigate(cat.route)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onNavigate && onNavigate(cat.route)}
            >
              {/* Text content */}
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{cat.title}</h3>
                <p className={styles.cardDesc}>{cat.description}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.cardCount}>{cat.count}</span>
                  <span className={styles.cardArrow}>→</span>
                </div>
              </div>

              {/* Image */}
              <div className={styles.cardImageWrap}>
                <img
                  src={cat.image}
                  alt={cat.alt}
                  className={styles.cardImage}
                  loading="lazy"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
