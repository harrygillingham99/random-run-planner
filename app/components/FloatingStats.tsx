'use client';

import { useRunPlanner } from '../context/RunPlannerContext';
import '../styles/FloatingStats.scss';

export default function FloatingStats() {
  const { stats, routeData, sidebarOpen } = useRunPlanner();
  const isVisible = routeData.route !== null && !sidebarOpen;

  if (!isVisible) {
    return null;
  }

  const { distance, time } = stats;

  return (
    <div className="floating-stats">
      <div className="float-stat">
        <div className="float-stat-label">Distance</div>
        <div className="float-stat-value">{distance}</div>
      </div>
      <div className="float-stat">
        <div className="float-stat-label">Est. time</div>
        <div className="float-stat-value">{time}</div>
      </div>
    </div>
  );
}
