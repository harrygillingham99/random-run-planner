'use client';

interface FloatingStatsProps {
  distance: string;
  time: string;
  isVisible: boolean;
}

export default function FloatingStats({ distance, time, isVisible }: FloatingStatsProps) {
  if (!isVisible) {
    return null;
  }

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
