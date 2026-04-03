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

export function offset(lat: number, lng: number, km: number, deg: number): [number, number] {
  const R = 6371;
  const d = km / R;
  const b = (deg * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(b));
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(b) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2),
    );
  return [lat2 * (180 / Math.PI), lng2 * (180 / Math.PI)];
}

export async function osrmRoute(points: [number, number][]): Promise<RouteResult | null> {
  const coords = points.map((p) => p[1] + ',' + p[0]).join(';');
  const url = `https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson&continue_straight=true`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes.length) {
      return null;
    }

    return {
      path: data.routes[0].geometry.coordinates.map(
        (c: [number, number]) => [c[1], c[0]] as [number, number],
      ),
      distance: data.routes[0].distance,
    };
  } catch {
    return null;
  }
}

function buildLoopWaypoints(lat: number, lng: number, targetKm: number): [number, number][] {
  // Distribute waypoints around a circle to create a natural loop.
  // Road routing typically adds ~50-80% distance vs. straight lines,
  // so we scale the radius down to hit the target distance.
  const baseWaypoints = targetKm < 6 ? 3 : targetKm < 12 ? 4 : 5;
  const n = baseWaypoints + Math.floor(Math.random() * 2); // base to base+1
  const radius = (targetKm / (2 * Math.PI)) * 0.55;
  const startBearing = Math.random() * 360;
  const loopWaypoints: [number, number][] = [[lat, lng]];

  for (let i = 0; i < n; i++) {
    // Evenly space bearings around the circle
    const angleDeg = startBearing + (360 / n) * i;
    // Add angle jitter (+/-20deg) and radius jitter (+/-30%) for variety
    const jitteredAngle = angleDeg + (Math.random() - 0.5) * 40;
    const jitteredRadius = radius * (0.7 + Math.random() * 0.6);
    const point = offset(lat, lng, jitteredRadius, jitteredAngle);
    loopWaypoints.push([point[0], point[1]]);
  }

  loopWaypoints.push([lat, lng]);
  return loopWaypoints;
}

function routeBacktrackScore(path: [number, number][]): number {
  if (!path || path.length < 3) {
    return 1;
  }

  // Quantize coordinates and count repeated undirected segments.
  const seen = new Set<string>();
  let repeatedSegments = 0;
  let totalSegments = 0;

  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const aKey = `${a[0].toFixed(4)},${a[1].toFixed(4)}`;
    const bKey = `${b[0].toFixed(4)},${b[1].toFixed(4)}`;
    const segmentKey = aKey < bKey ? `${aKey}|${bKey}` : `${bKey}|${aKey}`;

    totalSegments++;
    if (seen.has(segmentKey)) {
      repeatedSegments++;
    } else {
      seen.add(segmentKey);
    }
  }

  return totalSegments > 0 ? repeatedSegments / totalSegments : 1;
}

export async function generateRoute(
  lat: number,
  lng: number,
  targetKm: number,
  style: 'loop' | 'outback',
): Promise<{ result: RouteResult | null; waypoints: [number, number][] | null }> {
  let waypoints: [number, number][] = [];

  if (style === 'outback') {
    const bearing = Math.random() * 360;
    const outDistance = (targetKm / 2) * 0.7;
    const mid = offset(lat, lng, outDistance, bearing);
    waypoints = [
      [lat, lng],
      [mid[0], mid[1]],
      [lat, lng],
    ];
  } else {
    const quickAcceptThreshold = 0.12;
    const maxCandidates = targetKm >= 12 ? 3 : 2;

    // Fire first candidate — return immediately if overlap is acceptable (1 API call).
    const firstWp = buildLoopWaypoints(lat, lng, targetKm);
    const firstResult = await osrmRoute(firstWp);

    if (firstResult && routeBacktrackScore(firstResult.path) <= quickAcceptThreshold) {
      return { result: firstResult, waypoints: firstWp };
    }

    // First result was poor — fire remaining candidates in parallel.
    const fallbackResults = await Promise.all(
      Array.from({ length: maxCandidates - 1 }, () => {
        const wp = buildLoopWaypoints(lat, lng, targetKm);
        return osrmRoute(wp).then((res) => ({ result: res, waypoints: wp }));
      }),
    );

    let bestResult = firstResult;
    let bestWaypoints: [number, number][] | null = firstWp;
    let bestScore = firstResult ? routeBacktrackScore(firstResult.path) : Number.POSITIVE_INFINITY;

    for (const { result: res, waypoints: wp } of fallbackResults) {
      if (!res) continue;
      const score = routeBacktrackScore(res.path);
      if (score < bestScore) {
        bestScore = score;
        bestResult = res;
        bestWaypoints = wp;
      }
    }

    return { result: bestResult, waypoints: bestWaypoints };
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
