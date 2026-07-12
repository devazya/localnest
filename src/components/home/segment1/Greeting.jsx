/**
 * Greeting.jsx — §6, §7, §10
 * The only 28px/600 text moment on the screen (§15 acceptance checklist).
 * Time-aware copy, including the gentle "Still up, {name}?" variant past
 * 11pm (§10 micro-delight) — a one-line content rule, zero new UI. The
 * name renders in the app's purple accent, matching the target design.
 */
import styles from './Greeting.module.css';

export function getGreeting(name, hour = new Date().getHours()) {
  if (hour >= 23 || hour < 5) return { text: `Still up, ${name}?`, emoji: '🌙' };
  if (hour < 12) return { text: 'Good Morning', emoji: '👋' };
  if (hour < 17) return { text: 'Good Afternoon', emoji: '☀️' };
  return { text: 'Good Evening', emoji: '🌙' };
}

export default function Greeting({ name }) {
  const { text, emoji } = getGreeting(name);
  const showName = !text.includes(name);

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>
        {showName ? (
          <>
            {text}, <span className={styles.name}>{name}</span>
          </>
        ) : text} <span aria-hidden="true">{emoji}</span>
      </h1>
      <p className={styles.subtitle}>Everything around your neighbourhood, in one place.</p>
    </div>
  );
}
