'use client';

import '../styles/Sidebar.scss';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  onLatChange: (value: number) => void;
  onLngChange: (value: number) => void;
  onGeoLocation: () => void;
  distance: number;
  onDistanceChange: (value: number) => void;
  style: 'loop' | 'outback';
  onStyleChange: (value: 'loop' | 'outback') => void;
  onGenerateRoute: () => void;
  isGenerating: boolean;
  status: { message: string; type: '' | 'ok' | 'err' };
  stats: {
    distance: string;
    time: string;
    pace: string;
    waypoints: number;
  };
}

export default function Sidebar({
  isOpen,
  onClose,
  lat,
  lng,
  onLatChange,
  onLngChange,
  onGeoLocation,
  distance,
  onDistanceChange,
  style,
  onStyleChange,
  onGenerateRoute,
  isGenerating,
  status,
  stats,
}: SidebarProps) {
  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = e.target.value.replace(',', '.').trim();
    if (!normalized) {
      return;
    }

    const value = Number(normalized);
    if (!Number.isNaN(value) && value >= -90 && value <= 90) {
      onLatChange(value);
    }
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = e.target.value.replace(',', '.').trim();
    if (!normalized) {
      return;
    }

    const value = Number(normalized);
    if (!Number.isNaN(value) && value >= -180 && value <= 180) {
      onLngChange(value);
    }
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = e.target.value.replace(',', '.').trim();
    if (!normalized) {
      return;
    }

    const value = Number(normalized);
    if (Number.isNaN(value)) {
      return;
    }

    const clampedValue = Math.min(30, Math.max(1, value));
    onDistanceChange(clampedValue);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button
        className="sidebar-close"
        onClick={onClose}
        aria-label="Close menu"
      >
        ✕
      </button>

      {/* Start Point Section */}
      <div>
        <div className="section-label">Start point</div>
        <button onClick={onGeoLocation}>Detect my location</button>
      </div>

      <div className="divider">
        <span>or enter manually</span>
      </div>

      <div className="coord-row">
        <div className="field">
          <label>Latitude</label>
          <input
            type="text"
            inputMode="decimal"
            value={lat}
            onChange={handleLatChange}
            step="0.00001"
            placeholder="50.90970"
          />
        </div>
        <div className="field">
          <label>Longitude</label>
          <input
            type="text"
            inputMode="decimal"
            value={lng}
            onChange={handleLngChange}
            step="0.00001"
            placeholder="-1.40440"
          />
        </div>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
        Or click anywhere on the map to set your start point.
      </p>

      <div className="sep"></div>

      {/* Route Settings Section */}
      <div>
        <div className="section-label">Route settings</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="field">
            <label>Distance (km)</label>
            <input
              type="text"
              inputMode="decimal"
              value={distance}
              onChange={handleDistanceChange}
              placeholder="5"
              step="0.5"
            />
          </div>
          <div className="field">
            <label>Route style</label>
            <select value={style} onChange={(e) => onStyleChange(e.target.value as 'loop' | 'outback')}>
              <option value="loop">Loop — return to start</option>
              <option value="outback">Out and back</option>
            </select>
          </div>
        </div>
      </div>

      <button
        className="primary"
        onClick={onGenerateRoute}
        disabled={isGenerating || isNaN(lat) || isNaN(lng)}
      >
        {isGenerating ? 'Generating...' : 'Generate run'}
      </button>

      <div id="status" className={`status ${status.type}`}>
        {status.message}
      </div>

      <div className="sep"></div>

      {/* Stats Section */}
      <div>
        <div className="section-label">Stats</div>
        <div className="stats">
          <div className="stat">
            <div className="stat-label">Distance</div>
            <div className="stat-value">{stats.distance}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Est. time</div>
            <div className="stat-value">{stats.time}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Pace</div>
            <div className="stat-value">{stats.pace}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Waypoints</div>
            <div className="stat-value">{stats.waypoints}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
