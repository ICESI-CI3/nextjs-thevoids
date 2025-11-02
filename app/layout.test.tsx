import { render } from '@testing-library/react';
import RootLayout, { metadata } from './layout';

// Mock AppProviders component
jest.mock('@/lib/components/AppProviders', () => {
  return function MockAppProviders({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div data-testid="app-providers">{children}</div>;
  };
});

describe('RootLayout', () => {
  it('should render the component structure correctly', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    );

    // Since testing-library doesn't render full html/body tags,
    // we just verify the component renders without errors
    expect(container).toBeTruthy();
  });

  it('should render with AppProviders wrapper', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    );

    expect(getByTestId('app-providers')).toBeInTheDocument();
    expect(getByTestId('test-child')).toBeInTheDocument();
  });

  it('should wrap children with AppProviders', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    );

    expect(getByTestId('app-providers')).toBeInTheDocument();
    expect(getByTestId('test-child')).toBeInTheDocument();
  });

  it('should have correct metadata', () => {
    expect(metadata.title).toBe('HabitHive');
    expect(metadata.description).toBe(
      'App for managing habits, hives, and more'
    );
  });

  it('should render multiple children correctly', () => {
    const { getByText } = render(
      <RootLayout>
        <div>Child 1</div>
        <div>Child 2</div>
      </RootLayout>
    );

    expect(getByText('Child 1')).toBeInTheDocument();
    expect(getByText('Child 2')).toBeInTheDocument();
  });
});
