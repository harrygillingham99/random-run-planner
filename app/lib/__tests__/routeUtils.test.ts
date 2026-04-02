import { offset, calculateStats } from '@/app/lib/routeUtils';

describe('routeUtils', () => {
  describe('offset', () => {
    it('should calculate offset coordinates correctly', () => {
      const [lat, lng] = offset(50.9097, -1.4044, 1, 0);
      
      // Moving 1 km north
      expect(lat).toBeGreaterThan(50.9097);
      expect(lng).toBeCloseTo(-1.4044, 4);
    });

    it('should handle different directions', () => {
      const north = offset(50, 0, 1, 0);
      const east = offset(50, 0, 1, 90);
      const south = offset(50, 0, 1, 180);
      const west = offset(50, 0, 1, 270);

      expect(north[0]).toBeGreaterThan(50);
      expect(east[1]).toBeGreaterThan(0);
      expect(south[0]).toBeLessThan(50);
      expect(west[1]).toBeLessThan(0);
    });

    it('should handle zero distance', () => {
      const [lat, lng] = offset(50, 0, 0, 45);
      
      expect(lat).toBe(50);
      expect(lng).toBe(0);
    });

    it('should handle large distances', () => {
      const [lat, lng] = offset(0, 0, 1000, 90);
      
      expect(lat).toBeDefined();
      expect(lng).toBeDefined();
      expect(Math.abs(lat)).toBeLessThan(90);
      expect(Math.abs(lng)).toBeLessThanOrEqual(180);
    });

    it('should handle negative coordinates', () => {
      const [lat, lng] = offset(-50, -100, 10, 45);
      
      expect(lat).toBeDefined();
      expect(lng).toBeDefined();
    });
  });

  describe('calculateStats', () => {
    it('should calculate stats for a 5km run', () => {
      const stats = calculateStats(5000);

      expect(stats.distance).toBe('5.00 km');
      expect(stats.pace).toBe('6:00/km');
      expect(stats.waypoints).toBe(0);
    });

    it('should format time correctly for short runs', () => {
      // 1km at 6min/km = 6 minutes
      const stats = calculateStats(1000);
      
      expect(stats.distance).toBe('1.00 km');
      expect(stats.time).toBe('6 min');
    });

    it('should format time correctly for long runs', () => {
      // 10km at 6min/km = 60 minutes = 1h 0m
      const stats = calculateStats(10000);
      
      expect(stats.distance).toBe('10.00 km');
      expect(stats.time).toBe('1h 0m');
    });

    it('should handle decimal kilometers', () => {
      const stats = calculateStats(5250);
      
      expect(stats.distance).toBe('5.25 km');
    });

    it('should handle very small distances', () => {
      const stats = calculateStats(100);
      
      expect(stats.distance).toBe('0.10 km');
      expect(stats.time).toMatch(/\d+ min/);
    });

    it('should handle zero distance', () => {
      const stats = calculateStats(0);
      
      expect(stats.distance).toBe('0.00 km');
      expect(stats.time).toBe('0 min');
    });
  });
});
