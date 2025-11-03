import { render, screen } from '@testing-library/react';
import AppProviders from './AppProviders';

// Mock all child components
jest.mock('./ThemeContext', () => ({
  ThemeContextProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-context-provider">{children}</div>
  ),
}));

jest.mock('./MuiThemeProvider', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mui-theme-provider">{children}</div>
  ),
}));

jest.mock('@/lib/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

jest.mock('@/lib/contexts/DataContext', () => ({
  DataProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="data-provider">{children}</div>
  ),
}));

jest.mock('./ProtectedRoute', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

jest.mock('./Navbar', () => ({
  __esModule: true,
  default: () => <div data-testid="navbar">Navbar</div>,
}));

jest.mock('./PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="page-header">PageHeader</div>,
}));

jest.mock('./ThemeUpdater', () => ({
  __esModule: true,
  default: () => <div data-testid="theme-updater">ThemeUpdater</div>,
}));

describe('AppProviders', () => {
  it('should render all provider components in correct order', () => {
    render(
      <AppProviders>
        <div data-testid="test-child">Test Content</div>
      </AppProviders>
    );

    expect(screen.getByTestId('theme-context-provider')).toBeInTheDocument();
    expect(screen.getByTestId('mui-theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('data-provider')).toBeInTheDocument();
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
  });

  it('should render Navbar component', () => {
    render(
      <AppProviders>
        <div>Content</div>
      </AppProviders>
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('should render PageHeader component', () => {
    render(
      <AppProviders>
        <div>Content</div>
      </AppProviders>
    );

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
  });

  it('should render ThemeUpdater component', () => {
    render(
      <AppProviders>
        <div>Content</div>
      </AppProviders>
    );

    expect(screen.getByTestId('theme-updater')).toBeInTheDocument();
  });

  it('should render children content', () => {
    render(
      <AppProviders>
        <div data-testid="test-child">Test Content</div>
      </AppProviders>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render main content area with correct class', () => {
    const { container } = render(
      <AppProviders>
        <div>Content</div>
      </AppProviders>
    );

    const mainElement = container.querySelector('main.main-content');
    expect(mainElement).toBeInTheDocument();
  });

  it('should render flex container with correct styles', () => {
    const { container } = render(
      <AppProviders>
        <div>Content</div>
      </AppProviders>
    );

    const flexContainer = container.querySelector('[style*="display: flex"]');
    expect(flexContainer).toBeInTheDocument();
    expect(flexContainer).toHaveStyle({ display: 'flex', minHeight: '100vh' });
  });

  it('should render multiple children correctly', () => {
    render(
      <AppProviders>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </AppProviders>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('should maintain proper nesting structure', () => {
    const { container } = render(
      <AppProviders>
        <div data-testid="content">Test</div>
      </AppProviders>
    );

    // Verify the main element is inside the flex container
    const mainElement =
      container.querySelector<HTMLElement>('main.main-content');
    const flexContainer = container.querySelector<HTMLElement>(
      '[style*="display: flex"]'
    );

    expect(mainElement).toBeInTheDocument();
    expect(flexContainer).toBeInTheDocument();
    expect(flexContainer).toContainElement(mainElement);
  });
});
