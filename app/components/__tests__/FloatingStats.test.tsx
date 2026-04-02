import React from 'react';
import { render, screen } from '@testing-library/react';
import FloatingStats from '@/app/components/FloatingStats';

describe('FloatingStats Component', () => {
  it('should render floating stats when visible is true', () => {
    render(<FloatingStats distance="5.00 km" time="30 min" isVisible={true} />);

    expect(screen.getByText('Distance')).toBeInTheDocument();
    expect(screen.getByText('Est. time')).toBeInTheDocument();
    expect(screen.getByText('5.00 km')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
  });

  it('should not render when visible is false', () => {
    const { container } = render(<FloatingStats distance="5.00 km" time="30 min" isVisible={false} />);

    expect(container.firstChild).toBeNull();
  });

  it('should display correct distance value', () => {
    render(<FloatingStats distance="10.50 km" time="45 min" isVisible={true} />);

    expect(screen.getByText('10.50 km')).toBeInTheDocument();
  });

  it('should display correct time value', () => {
    render(<FloatingStats distance="7.22 km" time="1h 15m" isVisible={true} />);

    expect(screen.getByText('1h 15m')).toBeInTheDocument();
  });

  it('should render float-stat class elements', () => {
    const { container } = render(<FloatingStats distance="5.00 km" time="30 min" isVisible={true} />);

    const floatingStats = container.querySelector('.floating-stats');
    expect(floatingStats).toBeInTheDocument();

    const floatStats = container.querySelectorAll('.float-stat');
    expect(floatStats).toHaveLength(2); // Distance and time
  });

  it('should have proper structure for distance stat', () => {
    const { container } = render(<FloatingStats distance="5.00 km" time="30 min" isVisible={true} />);

    const floatStatLabels = container.querySelectorAll('.float-stat-label');
    expect(floatStatLabels[0]).toHaveTextContent('Distance');

    const floatStatValues = container.querySelectorAll('.float-stat-value');
    expect(floatStatValues[0]).toHaveTextContent('5.00 km');
  });

  it('should have proper structure for time stat', () => {
    const { container } = render(<FloatingStats distance="5.00 km" time="30 min" isVisible={true} />);

    const floatStatLabels = container.querySelectorAll('.float-stat-label');
    expect(floatStatLabels[1]).toHaveTextContent('Est. time');

    const floatStatValues = container.querySelectorAll('.float-stat-value');
    expect(floatStatValues[1]).toHaveTextContent('30 min');
  });

  it('should handle empty string values', () => {
    render(<FloatingStats distance="" time="" isVisible={true} />);

    const floatingStats = screen.getByText('Distance').closest('.floating-stats');
    expect(floatingStats).toBeInTheDocument();
  });

  it('should handle dash values (initial state)', () => {
    render(<FloatingStats distance="—" time="—" isVisible={true} />);

    const floatStatValues = screen.getAllByText('—');
    expect(floatStatValues.length).toBeGreaterThanOrEqual(2);
  });

  it('should toggle visibility correctly', () => {
    const { rerender, container } = render(
      <FloatingStats distance="5.00 km" time="30 min" isVisible={true} />
    );

    expect(screen.getByText('5.00 km')).toBeInTheDocument();

    rerender(<FloatingStats distance="5.00 km" time="30 min" isVisible={false} />);

    expect(container.firstChild).toBeNull();
  });
});
