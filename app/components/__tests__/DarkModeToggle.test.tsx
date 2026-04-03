import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DarkModeToggle from 'components/DarkModeToggle';
import { useDarkMode } from 'hooks/useDarkMode';

jest.mock('hooks/useDarkMode', () => ({
  useDarkMode: jest.fn(),
}));

describe('DarkModeToggle Component', () => {
  const mockUseDarkMode = useDarkMode as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when not mounted', () => {
    mockUseDarkMode.mockReturnValue({
      isDark: false,
      mounted: false,
      toggleTheme: jest.fn(),
    });

    const { container } = render(<DarkModeToggle />);
    expect(container.firstChild).toBeNull();
  });

  it('should render dark mode toggle button when mounted', () => {
    mockUseDarkMode.mockReturnValue({
      isDark: false,
      mounted: true,
      toggleTheme: jest.fn(),
    });

    render(<DarkModeToggle />);

    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  it('should render light mode label when currently dark', () => {
    mockUseDarkMode.mockReturnValue({
      isDark: true,
      mounted: true,
      toggleTheme: jest.fn(),
    });

    render(<DarkModeToggle />);

    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
  });

  it('should call toggleTheme when clicked', async () => {
    const user = userEvent.setup();
    const toggleTheme = jest.fn();

    mockUseDarkMode.mockReturnValue({
      isDark: false,
      mounted: true,
      toggleTheme,
    });

    render(<DarkModeToggle />);

    await user.click(screen.getByRole('button', { name: /switch to dark mode/i }));
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });
});
