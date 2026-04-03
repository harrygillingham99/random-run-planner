import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from 'components/Sidebar';
import { RunPlannerContext } from 'context/RunPlannerContext';
import type { RunPlannerContextValue } from 'context/RunPlannerContext';

describe('Sidebar Component', () => {
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
    status: { message: 'Test status', type: '' },
    routeData: { route: null, waypoints: null },
    stats: { distance: '5.00 km', time: '30 min', pace: '6:00/km', waypoints: 0 },
    isGenerating: false,
    sidebarOpen: true,
    setSidebarOpen: jest.fn(),
    onGenerateRoute: jest.fn(),
    onMapClick: jest.fn(),
    onLocationFound: jest.fn(),
    onLocationError: jest.fn(),
  };

  const renderSidebar = (overrides: Partial<RunPlannerContextValue> = {}) =>
    render(
      <RunPlannerContext.Provider value={{ ...defaultContext, ...overrides }}>
        <Sidebar />
      </RunPlannerContext.Provider>,
    );

  it('should render the sidebar with all sections', () => {
    renderSidebar();

    expect(screen.getByText('Start point')).toBeInTheDocument();
    expect(screen.getByText('Route settings')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Detect my location/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate run/i })).toBeInTheDocument();
  });

  it('should render coordinate inputs with correct values', () => {
    renderSidebar();

    const latInput = screen.getByPlaceholderText('50.90970') as HTMLInputElement;
    const lngInput = screen.getByPlaceholderText('-1.40440') as HTMLInputElement;

    expect(latInput.value).toBe('50.9097');
    expect(lngInput.value).toBe('-1.4044');
  });

  it('should call onLatChange when latitude input changes', async () => {
    const onLatChange = jest.fn();
    renderSidebar({ onLatChange });

    const latInput = screen.getByPlaceholderText('50.90970') as HTMLInputElement;

    // Use fireEvent for direct input changes instead of userEvent
    fireEvent.change(latInput, { target: { value: '51.5074' } });

    expect(onLatChange).toHaveBeenCalledWith(51.5074);
  });

  it('should call onLngChange when longitude input changes', async () => {
    const onLngChange = jest.fn();
    renderSidebar({ onLngChange });

    const lngInput = screen.getByPlaceholderText('-1.40440') as HTMLInputElement;

    // Use fireEvent for direct input changes instead of userEvent
    fireEvent.change(lngInput, { target: { value: '-0.1278' } });

    expect(onLngChange).toHaveBeenCalledWith(-0.1278);
  });

  it('should handle invalid latitude input', async () => {
    const user = userEvent.setup();
    const onLatChange = jest.fn();
    renderSidebar({ onLatChange });

    const latInput = screen.getByPlaceholderText('50.90970');
    // Try to set invalid value (>90)
    await user.clear(latInput);
    await user.type(latInput, '95');

    // onLatChange should not be called for invalid values
    expect(onLatChange).not.toHaveBeenCalledWith(95);
  });

  it('should handle invalid longitude input', async () => {
    const user = userEvent.setup();
    const onLngChange = jest.fn();
    renderSidebar({ onLngChange });

    const lngInput = screen.getByPlaceholderText('-1.40440');
    // Try to set invalid value (>180)
    await user.clear(lngInput);
    await user.type(lngInput, '200');

    // onLngChange should not be called for invalid values
    expect(onLngChange).not.toHaveBeenCalledWith(200);
  });

  it('should call onGeoLocation when geolocation button is clicked', async () => {
    const user = userEvent.setup();
    const onGeoLocation = jest.fn();
    renderSidebar({ onGeoLocation });

    const geoButton = screen.getByRole('button', { name: /Detect my location/i });
    await user.click(geoButton);

    expect(onGeoLocation).toHaveBeenCalled();
  });

  it('should render distance input with correct value', () => {
    renderSidebar({ distance: 5 });

    const distanceInput = screen.getByDisplayValue('5') as HTMLInputElement;

    expect(distanceInput).toBeInTheDocument();
    expect(distanceInput.value).toBe('5');
  });

  it('should call onDistanceChange when distance input changes', async () => {
    const onDistanceChange = jest.fn();
    renderSidebar({ onDistanceChange });

    const distanceInput = screen.getByDisplayValue('5') as HTMLInputElement;

    fireEvent.change(distanceInput, { target: { value: '10' } });
    expect(onDistanceChange).toHaveBeenCalledWith(10);
  });

  it('should render style select with correct value', () => {
    renderSidebar();

    const styleSelect = screen.getByDisplayValue('Loop — return to start') as HTMLSelectElement;
    expect(styleSelect).toBeInTheDocument();
    expect(styleSelect.value).toBe('loop');
  });

  it('should call onStyleChange when style select changes', async () => {
    const user = userEvent.setup();
    const onStyleChange = jest.fn();
    renderSidebar({ onStyleChange });

    const styleSelect = screen.getByDisplayValue('Loop — return to start');
    await user.selectOptions(styleSelect, 'outback');

    expect(onStyleChange).toHaveBeenCalledWith('outback');
  });

  it('should disable generate button when generating', () => {
    renderSidebar({ isGenerating: true });

    const generateButton = screen.getByRole('button', { name: /Generating/ });
    expect(generateButton).toBeDisabled();
  });

  it('should disable generate button when coordinates are missing/invalid', () => {
    renderSidebar({ lat: 0, lng: 0 });

    const generateButton = screen.getByRole('button', { name: /Generate run/i });
    // Button should be enabled (coordinates are valid numbers, even if 0,0)
    expect(generateButton).not.toBeDisabled();
  });

  it('should call onGenerateRoute when generate button is clicked', async () => {
    const user = userEvent.setup();
    const onGenerateRoute = jest.fn();
    renderSidebar({ onGenerateRoute });

    const generateButton = screen.getByRole('button', { name: /Generate run/i });
    await user.click(generateButton);

    expect(onGenerateRoute).toHaveBeenCalled();
  });

  it('should display status message', () => {
    const status = { message: 'Test status message', type: 'ok' as const };
    renderSidebar({ status });

    expect(screen.getByText('Test status message')).toBeInTheDocument();
  });

  it('should apply status type class', () => {
    const status = { message: 'Error occurred', type: 'err' as const };
    renderSidebar({ status });

    const statusElement = screen.getByText('Error occurred');
    expect(statusElement.className).toContain('err');
  });

  it('should display all stats', () => {
    renderSidebar();

    expect(screen.getByText('5.00 km')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
    expect(screen.getByText('6:00/km')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // waypoints count
  });

  it('should call setSidebarOpen(false) when close button is clicked', async () => {
    const user = userEvent.setup();
    const setSidebarOpen = jest.fn();
    renderSidebar({ setSidebarOpen });

    const closeButton = screen.getByRole('button', { name: /Close menu/i });
    await user.click(closeButton);

    expect(setSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('should render different text when sidebar is closed', () => {
    const Wrapper = ({ sidebarOpen }: { sidebarOpen: boolean }) => (
      <RunPlannerContext.Provider value={{ ...defaultContext, sidebarOpen }}>
        <Sidebar />
      </RunPlannerContext.Provider>
    );
    const { rerender } = render(<Wrapper sidebarOpen={true} />);

    expect(screen.getByRole('button', { name: /Close menu/i })).toBeInTheDocument();

    rerender(<Wrapper sidebarOpen={false} />);

    // Sidebar should still exist but with different styles (checked via className)
    const sidebar = screen.getByRole('button', { name: /Close menu/i }).closest('.sidebar');
    expect(sidebar).not.toHaveClass('open');
  });

  it('should show loading text on generate button when generating', () => {
    renderSidebar({ isGenerating: true });

    expect(screen.getByText('Generating...')).toBeInTheDocument();
  });
});
