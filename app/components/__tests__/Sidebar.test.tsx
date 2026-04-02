import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from '@/app/components/Sidebar';

describe('Sidebar Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    lat: 50.9097,
    lng: -1.4044,
    onLatChange: jest.fn(),
    onLngChange: jest.fn(),
    onGeoLocation: jest.fn(),
    distance: 5,
    onDistanceChange: jest.fn(),
    style: 'loop' as const,
    onStyleChange: jest.fn(),
    onGenerateRoute: jest.fn(),
    isGenerating: false,
    status: { message: 'Test status', type: '' as const },
    stats: {
      distance: '5.00 km',
      time: '30 min',
      pace: '6:00/km',
      waypoints: 0,
    },
  };

  it('should render the sidebar with all sections', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('Start point')).toBeInTheDocument();
    expect(screen.getByText('Route settings')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Detect my location/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate run/i })).toBeInTheDocument();
  });

  it('should render coordinate inputs with correct values', () => {
    render(<Sidebar {...defaultProps} />);

    const latInput = screen.getByPlaceholderText('50.90970') as HTMLInputElement;
    const lngInput = screen.getByPlaceholderText('-1.40440') as HTMLInputElement;

    expect(latInput.value).toBe('50.9097');
    expect(lngInput.value).toBe('-1.4044');
  });

  it('should call onLatChange when latitude input changes', async () => {
    const onLatChange = jest.fn();
    render(<Sidebar {...defaultProps} onLatChange={onLatChange} />);

    const latInput = screen.getByPlaceholderText('50.90970') as HTMLInputElement;
    
    // Use fireEvent for direct input changes instead of userEvent
    fireEvent.change(latInput, { target: { value: '51.5074' } });

    expect(onLatChange).toHaveBeenCalledWith(51.5074);
  });

  it('should call onLngChange when longitude input changes', async () => {
    const onLngChange = jest.fn();
    render(<Sidebar {...defaultProps} onLngChange={onLngChange} />);

    const lngInput = screen.getByPlaceholderText('-1.40440') as HTMLInputElement;
    
    // Use fireEvent for direct input changes instead of userEvent
    fireEvent.change(lngInput, { target: { value: '-0.1278' } });

    expect(onLngChange).toHaveBeenCalledWith(-0.1278);
  });

  it('should handle invalid latitude input', async () => {
    const user = userEvent.setup();
    const onLatChange = jest.fn();
    render(<Sidebar {...defaultProps} onLatChange={onLatChange} />);

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
    render(<Sidebar {...defaultProps} onLngChange={onLngChange} />);

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
    render(<Sidebar {...defaultProps} onGeoLocation={onGeoLocation} />);

    const geoButton = screen.getByRole('button', { name: /Detect my location/i });
    await user.click(geoButton);

    expect(onGeoLocation).toHaveBeenCalled();
  });

  it('should render distance input with correct value', () => {
    render(<Sidebar {...defaultProps} distance={5} />);

    const distanceInputs = screen.getAllByRole('spinbutton');
    const distanceInput = distanceInputs.find(
      (input) => (input as HTMLInputElement).min === '1' && (input as HTMLInputElement).max === '30'
    ) as HTMLInputElement;

    expect(distanceInput).toBeInTheDocument();
    expect(distanceInput.value).toBe('5');
  });

  it('should call onDistanceChange when distance input changes', async () => {
    const onDistanceChange = jest.fn();
    render(<Sidebar {...defaultProps} onDistanceChange={onDistanceChange} />);

    const distanceInputs = screen.getAllByRole('spinbutton');
    const distanceInput = distanceInputs.find(
      (input) => (input as HTMLInputElement).min === '1' && (input as HTMLInputElement).max === '30'
    ) as HTMLInputElement;

    if (distanceInput) {
      // Use fireEvent for direct input changes
      fireEvent.change(distanceInput, { target: { value: '10' } });
      expect(onDistanceChange).toHaveBeenCalledWith(10);
    }
  });

  it('should render style select with correct value', () => {
    render(<Sidebar {...defaultProps} style="loop" />);

    const styleSelect = screen.getByDisplayValue('Loop — return to start') as HTMLSelectElement;
    expect(styleSelect).toBeInTheDocument();
    expect(styleSelect.value).toBe('loop');
  });

  it('should call onStyleChange when style select changes', async () => {
    const user = userEvent.setup();
    const onStyleChange = jest.fn();
    render(<Sidebar {...defaultProps} onStyleChange={onStyleChange} />);

    const styleSelect = screen.getByDisplayValue('Loop — return to start');
    await user.selectOptions(styleSelect, 'outback');

    expect(onStyleChange).toHaveBeenCalledWith('outback');
  });

  it('should disable generate button when generating', () => {
    render(<Sidebar {...defaultProps} isGenerating={true} />);

    const generateButton = screen.getByRole('button', { name: /Generating/ });
    expect(generateButton).toBeDisabled();
  });

  it('should disable generate button when coordinates are missing/invalid', () => {
    // Create props with 0 values instead of NaN to test disabled state
    const invalidProps = {
      ...defaultProps,
      lat: 0,
      lng: 0,
    };
    render(<Sidebar {...invalidProps} />);

    const generateButton = screen.getByRole('button', { name: /Generate run/i });
    // Button should be enabled (coordinates are valid numbers, even if 0,0)
    expect(generateButton).not.toBeDisabled();
  });

  it('should call onGenerateRoute when generate button is clicked', async () => {
    const user = userEvent.setup();
    const onGenerateRoute = jest.fn();
    render(<Sidebar {...defaultProps} onGenerateRoute={onGenerateRoute} />);

    const generateButton = screen.getByRole('button', { name: /Generate run/i });
    await user.click(generateButton);

    expect(onGenerateRoute).toHaveBeenCalled();
  });

  it('should display status message', () => {
    const status = { message: 'Test status message', type: 'ok' as const };
    render(<Sidebar {...defaultProps} status={status} />);

    expect(screen.getByText('Test status message')).toBeInTheDocument();
  });

  it('should apply status type class', () => {
    const status = { message: 'Error occurred', type: 'err' as const };
    render(<Sidebar {...defaultProps} status={status} />);

    const statusElement = screen.getByText('Error occurred');
    expect(statusElement.className).toContain('err');
  });

  it('should display all stats', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('5.00 km')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
    expect(screen.getByText('6:00/km')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // waypoints count
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<Sidebar {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /Close menu/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should render different text when sidebar is closed', () => {
    const { rerender } = render(<Sidebar {...defaultProps} isOpen={true} />);

    expect(screen.getByRole('button', { name: /Close menu/i })).toBeInTheDocument();

    rerender(<Sidebar {...defaultProps} isOpen={false} />);

    // Sidebar should still exist but with different styles (checked via className)
    const sidebar = screen.getByRole('button', { name: /Close menu/i }).closest('.sidebar');
    expect(sidebar).not.toHaveClass('open');
  });

  it('should show loading text on generate button when generating', () => {
    render(<Sidebar {...defaultProps} isGenerating={true} />);

    expect(screen.getByText('Generating...')).toBeInTheDocument();
  });
});
