'use client';

import { useRunPlanner } from '../context/RunPlannerContext';
import { useCoordinateInputs } from '../hooks/useCoordinateInputs';
import styles from 'styles/Sidebar.module.scss';

export default function Sidebar() {
  const {
    lat,
    lng,
    distance,
    style,
    onLatChange,
    onLngChange,
    onDistanceChange,
    onStyleChange,
    onGeoLocation,
    onGenerateRoute,
    isGenerating,
    status,
    stats,
    sidebarOpen,
    setSidebarOpen,
  } = useRunPlanner();

  const { latRaw, lngRaw, distanceRaw, handleLatChange, handleLngChange, handleDistanceChange } =
    useCoordinateInputs({ lat, lng, distance, onLatChange, onLngChange, onDistanceChange });

  return (
    <div className={`${styles.sidebar}${sidebarOpen ? ` ${styles.open}` : ''}`}>
      <button
        className={styles.sidebarClose}
        onClick={() => setSidebarOpen(false)}
        aria-label="Close menu"
      >
        ✕
      </button>

      <div>
        <div className={styles.sectionLabel}>Start point</div>
        <button onClick={onGeoLocation}>Detect my location</button>
      </div>

      <div className={styles.divider}>
        <span>or enter manually</span>
      </div>

      <div className={styles.coordRow}>
        <div className={styles.field}>
          <label>Latitude</label>
          <input
            type="text"
            inputMode="decimal"
            value={latRaw}
            onChange={handleLatChange}
            placeholder="50.90970"
          />
        </div>
        <div className={styles.field}>
          <label>Longitude</label>
          <input
            type="text"
            inputMode="decimal"
            value={lngRaw}
            onChange={handleLngChange}
            placeholder="-1.40440"
          />
        </div>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
        Or click anywhere on the map to set your start point.
      </p>

      <div className={styles.sep}></div>

      <div>
        <div className={styles.sectionLabel}>Route settings</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className={styles.field}>
            <label>Distance (km)</label>
            <input
              type="text"
              inputMode="decimal"
              value={distanceRaw}
              onChange={handleDistanceChange}
              placeholder="5"
            />
          </div>
          <div className={styles.field}>
            <label>Route style</label>
            <select
              value={style}
              onChange={(e) => onStyleChange(e.target.value as 'loop' | 'outback')}
            >
              <option value="loop">Loop — return to start</option>
              <option value="outback">Out and back</option>
            </select>
          </div>
        </div>
      </div>

      <button
        className={styles.primary}
        onClick={onGenerateRoute}
        disabled={isGenerating || isNaN(lat) || isNaN(lng)}
      >
        {isGenerating ? 'Generating...' : 'Generate run'}
      </button>

      <div
        id="status"
        className={[
          styles.status,
          status.type === 'err' ? styles.err : '',
          status.type === 'ok' ? styles.ok : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {status.message}
      </div>

      <div className={styles.sep}></div>

      <div>
        <div className={styles.sectionLabel}>Stats</div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Distance</div>
            <div className={styles.statValue}>{stats.distance}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Est. time</div>
            <div className={styles.statValue}>{stats.time}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Pace</div>
            <div className={styles.statValue}>{stats.pace}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Waypoints</div>
            <div className={styles.statValue}>{stats.waypoints}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
