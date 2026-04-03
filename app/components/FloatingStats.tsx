'use client';

import { useRunPlanner } from '../context/RunPlannerContext';
import styles from 'styles/FloatingStats.module.scss';

export default function FloatingStats() {
  const { stats, routeData, sidebarOpen } = useRunPlanner();
  const isVisible = routeData.route !== null && !sidebarOpen;

  if (!isVisible) {
    return null;
  }

  const { distance, time } = stats;

  return (
    <div className={styles.floatingStats}>
      <div className={styles.floatStat}>
        <div className={styles.floatStatLabel}>Distance</div>
        <div className={styles.floatStatValue}>{distance}</div>
      </div>
      <div className={styles.floatStat}>
        <div className={styles.floatStatLabel}>Est. time</div>
        <div className={styles.floatStatValue}>{time}</div>
      </div>
    </div>
  );
}
