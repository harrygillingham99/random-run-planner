import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

// Mock next/dynamic
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (...args: any[]) => {
    const dynamicModule = jest.requireActual('next/dynamic');
    const dynamicActualComp = dynamicModule.default;
    const RequiredComponent = dynamicActualComp(args[0]);
    RequiredComponent.preload
      ? RequiredComponent.preload()
      : RequiredComponent.render.preload();
    return RequiredComponent;
  },
}));

// Mock the Map component
jest.mock('@/app/components/Map', () => {
  return function MockMap(props: any) {
    return <div data-testid="map-component">Map Component</div>;
  };
});

// Mock route utilities
jest.mock('@/app/lib/routeUtils', () => ({
  generateRoute: jest.fn(),
  calculateStats: jest.fn(),
}));

// Mock RouteGeneratorClient
jest.mock('@/app/components/RouteGeneratorClient', () => {
  return function MockRouteGeneratorClient() {
    return <div data-testid="route-generator-client">Route Generator Client</div>;
  };
});

describe('Home Page Component', () => {
  it('should render the layout container', () => {
    render(<Home />);

    const layoutContainer = document.querySelector('.layout');
    expect(layoutContainer).toBeInTheDocument();
  });

  it('should render the RouteGeneratorClient component', () => {
    render(<Home />);

    expect(screen.getByTestId('route-generator-client')).toBeInTheDocument();
  });

  it('should have proper structure', () => {
    const { container } = render(<Home />);

    const layout = container.querySelector('.layout');
    expect(layout).toBeInTheDocument();
    expect(layout?.firstChild).toHaveAttribute('data-testid', 'route-generator-client');
  });
});
