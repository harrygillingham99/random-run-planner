import DarkModeToggle from './DarkModeToggle';
import styles from 'styles/Navbar.module.scss';

export default function Navbar() {
  return (
    <header className={styles.header}>
      <div className={styles.logoMark}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 4v4l3 3-3 3v4" />
          <path d="M6 8l3 4-3 4" />
        </svg>
      </div>
      <h1>Run Route Planner</h1>
      <span></span>
      <DarkModeToggle />
    </header>
  );
}
