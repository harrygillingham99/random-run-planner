import React from 'react';
import RootLayout, { metadata } from '../layout';

type ElementWithProps<TProps extends object = Record<string, unknown>> = React.ReactElement<
  TProps & { children?: React.ReactNode }
>;

jest.mock('components/Navbar', () => {
  return function MockNavbar() {
    return <div data-testid="navbar">Navbar</div>;
  };
});

describe('RootLayout', () => {
  it('should expose expected metadata', () => {
    expect(metadata.title).toBe('Run Route Planner');
    expect(metadata.description).toContain('OpenStreetMap');
  });

  it('should include html/body structure, navbar, children', () => {
    const children = <main data-testid="page-content">Content</main>;
    const tree = RootLayout({ children });

    expect(tree.type).toBe('html');
    const htmlElement = tree as ElementWithProps<{ lang: string }>;
    expect(htmlElement.props.lang).toBe('en');

    const [head, body] = React.Children.toArray(htmlElement.props.children) as [
      ElementWithProps,
      ElementWithProps<{ suppressHydrationWarning?: boolean }>,
    ];
    expect(head.type).toBe('head');
    expect(body.type).toBe('body');
    expect(body.props.suppressHydrationWarning).toBe(true);

    const bodyChildren = React.Children.toArray(body.props.children) as [
      ElementWithProps,
      ElementWithProps<{ 'data-testid'?: string }>,
    ];
    expect(bodyChildren[0].type).toBeTruthy();
    expect(bodyChildren[1].type).toBe('main');
    expect(bodyChildren[1].props['data-testid']).toBe('page-content');
  });
});
