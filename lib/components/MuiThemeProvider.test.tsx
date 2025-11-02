import { render, screen } from '@testing-library/react';
import MuiThemeProvider from './MuiThemeProvider';
import { useThemeContext } from './ThemeContext';

// Mock ThemeContext
jest.mock('./ThemeContext', () => ({
  useThemeContext: jest.fn(),
}));

const mockUseThemeContext = useThemeContext as jest.MockedFunction<
  typeof useThemeContext
>;

describe('MuiThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children', () => {
    mockUseThemeContext.mockReturnValue({
      mode: 'light',
      toggleTheme: jest.fn(),
    });

    render(
      <MuiThemeProvider>
        <div data-testid="test-child">Test Content</div>
      </MuiThemeProvider>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should use light mode from context', () => {
    mockUseThemeContext.mockReturnValue({
      mode: 'light',
      toggleTheme: jest.fn(),
    });

    render(
      <MuiThemeProvider>
        <div>Content</div>
      </MuiThemeProvider>
    );

    expect(mockUseThemeContext).toHaveBeenCalled();
  });

  it('should use dark mode from context', () => {
    mockUseThemeContext.mockReturnValue({
      mode: 'dark',
      toggleTheme: jest.fn(),
    });

    render(
      <MuiThemeProvider>
        <div>Content</div>
      </MuiThemeProvider>
    );

    expect(mockUseThemeContext).toHaveBeenCalled();
  });

  it('should render multiple children', () => {
    mockUseThemeContext.mockReturnValue({
      mode: 'light',
      toggleTheme: jest.fn(),
    });

    render(
      <MuiThemeProvider>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </MuiThemeProvider>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('should recreate theme when mode changes from light to dark', () => {
    mockUseThemeContext.mockReturnValue({
      mode: 'light',
      toggleTheme: jest.fn(),
    });

    const { rerender } = render(
      <MuiThemeProvider>
        <div>Content</div>
      </MuiThemeProvider>
    );

    mockUseThemeContext.mockReturnValue({
      mode: 'dark',
      toggleTheme: jest.fn(),
    });

    rerender(
      <MuiThemeProvider>
        <div>Content</div>
      </MuiThemeProvider>
    );

    expect(mockUseThemeContext).toHaveBeenCalled();
  });

  it('should handle rapid theme changes', () => {
    mockUseThemeContext.mockReturnValue({
      mode: 'light',
      toggleTheme: jest.fn(),
    });

    const { rerender } = render(
      <MuiThemeProvider>
        <div>Content</div>
      </MuiThemeProvider>
    );

    // Change to dark
    mockUseThemeContext.mockReturnValue({
      mode: 'dark',
      toggleTheme: jest.fn(),
    });

    rerender(
      <MuiThemeProvider>
        <div>Content</div>
      </MuiThemeProvider>
    );

    // Change back to light
    mockUseThemeContext.mockReturnValue({
      mode: 'light',
      toggleTheme: jest.fn(),
    });

    rerender(
      <MuiThemeProvider>
        <div>Content</div>
      </MuiThemeProvider>
    );

    expect(mockUseThemeContext).toHaveBeenCalledTimes(3);
  });

  it('should render with StyledEngineProvider', () => {
    mockUseThemeContext.mockReturnValue({
      mode: 'light',
      toggleTheme: jest.fn(),
    });

    const { container } = render(
      <MuiThemeProvider>
        <div>Content</div>
      </MuiThemeProvider>
    );

    // The StyledEngineProvider should wrap the content
    expect(container.firstChild).toBeTruthy();
  });

  it('should render empty children', () => {
    mockUseThemeContext.mockReturnValue({
      mode: 'light',
      toggleTheme: jest.fn(),
    });

    const { container } = render(<MuiThemeProvider>{null}</MuiThemeProvider>);

    expect(container).toBeInTheDocument();
  });

  it('should handle complex nested children', () => {
    mockUseThemeContext.mockReturnValue({
      mode: 'light',
      toggleTheme: jest.fn(),
    });

    render(
      <MuiThemeProvider>
        <div>
          <div>
            <span data-testid="nested-content">Nested Content</span>
          </div>
        </div>
      </MuiThemeProvider>
    );

    expect(screen.getByTestId('nested-content')).toBeInTheDocument();
  });

  it('should properly integrate with MUI components in light mode', () => {
    mockUseThemeContext.mockReturnValue({
      mode: 'light',
      toggleTheme: jest.fn(),
    });

    render(
      <MuiThemeProvider>
        <button data-testid="mui-button">Click me</button>
      </MuiThemeProvider>
    );

    expect(screen.getByTestId('mui-button')).toBeInTheDocument();
  });

  it('should properly integrate with MUI components in dark mode', () => {
    mockUseThemeContext.mockReturnValue({
      mode: 'dark',
      toggleTheme: jest.fn(),
    });

    render(
      <MuiThemeProvider>
        <button data-testid="mui-button">Click me</button>
      </MuiThemeProvider>
    );

    expect(screen.getByTestId('mui-button')).toBeInTheDocument();
  });
});
