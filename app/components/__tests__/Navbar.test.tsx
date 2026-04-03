import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from 'components/Navbar';
import styles from '../../styles/Navbar.module.scss';

jest.mock('components/DarkModeToggle', () => {
  return function MockDarkModeToggle() {
    return <button aria-label="mock theme toggle">Theme</button>;
  };
});

describe('Navbar Component', () => {
  it('should render app title', () => {
    render(<Navbar />);

    expect(screen.getByRole('heading', { name: 'Run Route Planner' })).toBeInTheDocument();
  });

  it('should render dark mode toggle', () => {
    render(<Navbar />);

    expect(screen.getByRole('button', { name: /mock theme toggle/i })).toBeInTheDocument();
  });

  it('should render brand logo svg', () => {
    const { container } = render(<Navbar />);

    const svg = container.querySelector(`header .${styles.logoMark} svg`);
    expect(svg).toBeInTheDocument();
  });
});
