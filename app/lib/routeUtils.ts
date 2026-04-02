export interface RouteResult {
  path: [number, number][];
  distance: number;
}

export interface Stats {
  distance: string;
  time: string;
  pace: string;
  waypoints: number;
}

export function offset(
  lat: number,
  lng: number,
  km: number,
  deg: number
): [number, number] {
  const R = 6371;
  const d = km / R;
  const b = (deg * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(b)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(b) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );
  return [lat2 * (180 / Math.PI), lng2 * (180 / Math.PI)];
}

export async function osrmRoute(
  points: [number, number][]
): Promise<RouteResult | null> {
  const coords = points.map((p) => p[1] + ',' + p[0]).join(';');
  const url = `https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes.length) {
      return null;
    }

    return {
      path: data.routes[0].geometry.coordinates.map(
        (c: [number, number]) => [c[1], c[0]] as [number, number]
      ),
      distance: data.routes[0].distance,
    };
  } catch {
    return null;
  }
}

export async function generateRoute(
  lat: number,
  lng: number,
  targetKm: number,
  style: 'loop' | 'outback'
): Promise<{ result: RouteResult | null; waypoints: [number, number][] | null }> {
  let waypoints: [number, number][] = [];

  if (style === 'outback') {
    const b = Math.random() * 360;
    const mid = offset(lat, lng, (targetKm / 2) * 0.7, b);
    waypoints = [
      [lat, lng],
      [mid[0], mid[1]],
      [lat, lng],
    ];
  } else {
    const n = 3 + Math.floor(Math.random() * 3);
    waypoints = [[lat, lng]];
    const seg = (targetKm * 0.55) / n;
    let lastB: number | null = null;

    for (let i = 0; i < n; i++) {
      let b: number;
      do {
        b = Math.random() * 360;
      } while (
        lastB !== null &&
        Math.abs((((b - lastB + 540) % 360) - 180)) < 70
      );

      const prev = waypoints[waypoints.length - 1];
      const jitter = 0.7 + Math.random() * 0.6;
      const newPoint = offset(prev[0], prev[1], seg * jitter, b);
      waypoints.push([newPoint[0], newPoint[1]]);
      lastB = b;
    }
    waypoints.push([lat, lng]);
  }

  const result = await osrmRoute(waypoints);

  return { result, waypoints };
}

export function calculateStats(distance: number): Stats {
  const km = (distance / 1000).toFixed(2);
  const mins = Math.round((distance / 1000) * 6);
  const h = Math.floor(mins / 60);
  const m = mins % 60;

  return {
    distance: `${km} km`,
    time: h > 0 ? `${h}h ${m}m` : `${m} min`,
    pace: '6:00/km',
    waypoints: 0,
  };
}
