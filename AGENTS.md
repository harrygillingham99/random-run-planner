<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
# Testing Guide for Run Route Planner Web

## Overview

This Next.js application uses **Jest** and **React Testing Library** for comprehensive test coverage following Next.js best practices.

## Test Setup

### Configuration Files

- **jest.config.ts** - Jest configuration with Next.js integration
- **jest.setup.ts** - Test setup and global imports
- **package.json** - Updated with test scripts

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are organized in `__tests__` directories alongside their source files:

```
app/
  __tests__/
    page.test.tsx      # Home page component tests
  components/
    __tests__/
      Map.test.tsx     # Map component tests
  lib/
    __tests__/
      routeUtils.test.ts  # Utility function tests
```

## Test Categories

### 1. **Unit Tests** (`routeUtils.test.ts`)

Tests for pure utility functions without dependencies.

**Key Functions Tested:**
- `offset()` - Geographic coordinate calculations
- `calculateStats()` - Route statistics formatting

**Example:**
```typescript
it('should calculate offset coordinates correctly', () => {
  const [lat, lng] = offset(50.9097, -1.4044, 1, 0);
  expect(lat).toBeGreaterThan(50.9097);
});
```

**Best Practices:**
- Test edge cases (zero values, extremes, negative numbers)
- Test multiple input scenarios
- Use descriptive test names

### 2. **Component Tests** (`Map.test.tsx`)

Tests for React components with mocked external libraries.

**Key Aspects:**
- Leaflet library is fully mocked to isolate component behavior
- Tests verify props handling and rendering
- Props validation against coordinate ranges

**Mocking Pattern:**
```typescript
jest.mock('leaflet', () => ({
  map: jest.fn(() => mockMap),
  tileLayer: jest.fn(() => mockTileLayer),
  // ... other Leaflet functions
}));
```

### 3. **Integration Tests** (`page.test.tsx`)

Tests for the main page component with user interactions.

**Key Features Tested:**
- State management (coordinates, distance, style)
- User input handling (latitude/longitude inputs)
- Geolocation API integration
- Route generation workflow
- Error handling

**Example:**
```typescript
it('should handle geolocation errors', async () => {
  const mockGetCurrentPosition = jest.fn((success, error) => {
    error({ code: 1 }); // Permission denied
  });
  global.navigator.geolocation.getCurrentPosition = mockGetCurrentPosition;
  
  render(<Home />);
  const geoButton = screen.getByRole('button', { name: /Detect my location/i });
  await user.click(geoButton);
  
  await waitFor(() => {
    expect(screen.getByText(/Location permission denied/i)).toBeInTheDocument();
  });
});
```

## Common Testing Patterns

### Mocking Functions

```typescript
jest.mock('@/app/lib/routeUtils', () => ({
  generateRoute: jest.fn(),
  calculateStats: jest.fn(),
}));

// Use in tests
(routeUtils.generateRoute as jest.Mock).mockResolvedValue({
  result: { path: [[50, -1]], distance: 5000 },
  waypoints: [[50, -1], [50.1, -1.1]],
});
```

### Testing Async Operations

```typescript
it('should handle async route generation', async () => {
  (routeUtils.generateRoute as jest.Mock).mockResolvedValue({ ... });
  
  render(<Home />);
  const generateButton = screen.getByRole('button', { name: /Generate run/i });
  await user.click(generateButton);
  
  await waitFor(() => {
    expect(screen.getByText(/Route ready/i)).toBeInTheDocument();
  });
});
```

### Querying Elements

```typescript
// By role (preferred)
screen.getByRole('button', { name: /Generate run/i })

// By placeholder
screen.getByPlaceholderText('50.90970')

// By text
screen.getByText('Start point set')

// Multiple elements
screen.getAllByText('—')

// With waiting for async
await waitFor(() => {
  expect(screen.getByText('Route ready')).toBeInTheDocument();
});
```

### User Interactions

```typescript
const user = userEvent.setup();

// Click
await user.click(button);

// Type
await user.type(input, 'text');

// Select option
await user.selectOptions(select, 'outback');

// Change input
fireEvent.change(input, { target: { value: '51.5074' } });
```

## Writing New Tests

### For New Utility Functions

1. Create a test file in `__tests__` directory
2. Test all branches and edge cases
3. Use descriptive names

```typescript
describe('newFunction', () => {
  it('should handle valid inputs', () => {
    const result = newFunction(input);
    expect(result).toBe(expectedValue);
  });

  it('should handle edge cases', () => {
    // Test boundaries, null, undefined, etc.
  });
});
```

### For New Components

1. Mock external dependencies (Leaflet, API calls)
2. Test rendering with different props
3. Test user interactions
4. Test conditional rendering

```typescript
jest.mock('external-library');

describe('NewComponent', () => {
  it('should render with required props', () => {
    render(<NewComponent prop1="value" />);
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<NewComponent />);
    await user.click(screen.getByRole('button'));
    expect(/* assertion */);
  });
});
```

## Coverage Goals

Current test coverage:
- **Route Utilities**: 100% (pure functions)
- **Map Component**: 100% (with mocks)
- **Page Component**: Core functionality covered

**Target Areas for Additional Tests:**
- Error boundary handling
- Browser API fallbacks
- Accessibility features (keyboard navigation)
- Performance optimizations

## Best Practices Applied

✅ **Isolation** - Components and functions tested independently
✅ **Mocking** - External dependencies mocked to isolate code
✅ **User-Centric** - Tests verify user workflows, not implementation
✅ **Async Handling** - Proper waiting for async operations
✅ **Cleanup** - Mocks cleared between tests
✅ **Descriptive Names** - Test names explain what is being tested
✅ **DRY** - Common setup in `beforeEach` blocks

## Debugging Tests

```bash
# Run single test file
npm test -- Map.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="coordinate"

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Verbose output
npm test -- --verbose
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
- [Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Continuous Integration

To run tests automatically in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test -- --coverage --watchAll=false
```

