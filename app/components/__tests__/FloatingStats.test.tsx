import { render, screen } from '@testing-library/react';
import FloatingStats from 'components/FloatingStats';
import { RunPlannerContext } from 'context/RunPlannerContext';
import type { RunPlannerContextValue } from 'context/RunPlannerContext';
import styles from 'styles/FloatingStats.module.scss';

describe('FloatingStats Component', () => {
  const defaultContext: RunPlannerContextValue = {
    lat: 50.9097,
    lng: -1.4044,
    distance: 5,
    style: 'loop',
    hasValidCoordinates: true,
    onLatChange: jest.fn(),
    onLngChange: jest.fn(),
    onDistanceChange: jest.fn(),
    onStyleChange: jest.fn(),
    onGeoLocation: jest.fn(),
    status: { message: '', type: '' },
    routeData: { route: [[50, -1]] as [number, number][], waypoints: null },
    stats: { distance: '5.00 km', time: '30 min', pace: '6:00/km', waypoints: 0 },
    isGenerating: false,
    sidebarOpen: false,
    setSidebarOpen: jest.fn(),
    onGenerateRoute: jest.fn(),
    onMapClick: jest.fn(),
    onLocationFound: jest.fn(),
    onLocationError: jest.fn(),
  };

  const renderFloatingStats = (overrides: Partial<RunPlannerContextValue> = {}) =>
    render(
      <RunPlannerContext.Provider value={{ ...defaultContext, ...overrides }}>
        <FloatingStats />
      </RunPlannerContext.Provider>,
    );
  it('should render floating stats when visible is true', () => {
    renderFloatingStats({
      stats: { distance: '5.00 km', time: '30 min', pace: '6:00/km', waypoints: 0 },
      routeData: { route: [[50, -1]] as [number, number][], waypoints: null },
      sidebarOpen: false,
    });

    expect(screen.getByText('Distance')).toBeInTheDocument();
    expect(screen.getByText('Est. time')).toBeInTheDocument();
    expect(screen.getByText('5.00 km')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
  });

  it('should not render when visible is false', () => {
    const { container } = renderFloatingStats({
      routeData: { route: null, waypoints: null },
    });

    expect(container.firstChild).toBeNull();
  });

  it('should display correct distance value', () => {
    renderFloatingStats({
      stats: { distance: '10.50 km', time: '45 min', pace: '6:00/km', waypoints: 0 },
    });

    expect(screen.getByText('10.50 km')).toBeInTheDocument();
  });

  it('should display correct time value', () => {
    renderFloatingStats({
      stats: { distance: '7.22 km', time: '1h 15m', pace: '6:00/km', waypoints: 0 },
    });

    expect(screen.getByText('1h 15m')).toBeInTheDocument();
  });

  it('should render float-stat class elements', () => {
    const { container } = renderFloatingStats({
      stats: { distance: '5.00 km', time: '30 min', pace: '6:00/km', waypoints: 0 },
    });

    const floatingStats = container.querySelector(`.${styles.floatingStats}`);
    expect(floatingStats).toBeInTheDocument();

    const floatStats = container.querySelectorAll(`.${styles.floatStat}`);
    expect(floatStats).toHaveLength(2); // Distance and time
  });

  it('should have proper structure for distance stat', () => {
    const { container } = renderFloatingStats({
      stats: { distance: '5.00 km', time: '30 min', pace: '6:00/km', waypoints: 0 },
    });

    const floatStatLabels = container.querySelectorAll(`.${styles.floatStatLabel}`);
    expect(floatStatLabels[0]).toHaveTextContent('Distance');

    const floatStatValues = container.querySelectorAll(`.${styles.floatStatValue}`);
    expect(floatStatValues[0]).toHaveTextContent('5.00 km');
  });

  it('should have proper structure for time stat', () => {
    const { container } = renderFloatingStats({
      stats: { distance: '5.00 km', time: '30 min', pace: '6:00/km', waypoints: 0 },
    });

    const floatStatLabels = container.querySelectorAll(`.${styles.floatStatLabel}`);
    expect(floatStatLabels[1]).toHaveTextContent('Est. time');

    const floatStatValues = container.querySelectorAll(`.${styles.floatStatValue}`);
    expect(floatStatValues[1]).toHaveTextContent('30 min');
  });

  it('should handle empty string values', () => {
    const { container } = renderFloatingStats({
      stats: { distance: '', time: '', pace: '', waypoints: 0 },
    });

    const floatingStats = container.querySelector(`.${styles.floatingStats}`);
    expect(floatingStats).toBeInTheDocument();
  });

  it('should handle dash values (initial state)', () => {
    renderFloatingStats({ stats: { distance: '—', time: '—', pace: '—', waypoints: 0 } });

    const floatStatValues = screen.getAllByText('—');
    expect(floatStatValues.length).toBeGreaterThanOrEqual(2);
  });

  it('should toggle visibility correctly', () => {
    const Wrapper = ({ hasRoute }: { hasRoute: boolean }) => (
      <RunPlannerContext.Provider
        value={{
          ...defaultContext,
          stats: { distance: '5.00 km', time: '30 min', pace: '6:00/km', waypoints: 0 },
          routeData: {
            route: hasRoute ? ([[50, -1]] as [number, number][]) : null,
            waypoints: null,
          },
          sidebarOpen: false,
        }}
      >
        <FloatingStats />
      </RunPlannerContext.Provider>
    );
    const { rerender, container } = render(<Wrapper hasRoute={true} />);

    expect(screen.getByText('5.00 km')).toBeInTheDocument();

    rerender(<Wrapper hasRoute={false} />);

    expect(container.firstChild).toBeNull();
  });
});
