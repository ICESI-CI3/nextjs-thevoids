import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeContextProvider, useThemeContext } from './ThemeContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('ThemeContextProvider', () => {
    it('should provide default light theme', () => {
      const TestComponent = () => {
        const { mode } = useThemeContext();
        return <div data-testid="theme-mode">{mode}</div>;
      };

      render(
        <ThemeContextProvider>
          <TestComponent />
        </ThemeContextProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    });

    it('should load saved theme from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      const TestComponent = () => {
        const { mode } = useThemeContext();
        return <div data-testid="theme-mode">{mode}</div>;
      };

      render(
        <ThemeContextProvider>
          <TestComponent />
        </ThemeContextProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    });

    it('should ignore invalid saved theme', () => {
      localStorageMock.getItem.mockReturnValue('invalid');

      const TestComponent = () => {
        const { mode } = useThemeContext();
        return <div data-testid="theme-mode">{mode}</div>;
      };

      render(
        <ThemeContextProvider>
          <TestComponent />
        </ThemeContextProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    });
  });

  describe('useThemeContext', () => {
    it('should throw error when used outside provider', () => {
      const TestComponent = () => {
        useThemeContext();
        return <div>Test</div>;
      };

      // Mock console.error to avoid noise in test output
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => render(<TestComponent />)).toThrow(
        'useThemeContext must be used within ThemeContextProvider'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      const TestComponent = () => {
        const { mode, toggleTheme } = useThemeContext();
        return (
          <div>
            <div data-testid="theme-mode">{mode}</div>
            <button onClick={toggleTheme} data-testid="toggle-btn">
              Toggle
            </button>
          </div>
        );
      };

      render(
        <ThemeContextProvider>
          <TestComponent />
        </ThemeContextProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');

      fireEvent.click(screen.getByTestId('toggle-btn'));

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should toggle from dark to light', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      const TestComponent = () => {
        const { mode, toggleTheme } = useThemeContext();
        return (
          <div>
            <div data-testid="theme-mode">{mode}</div>
            <button onClick={toggleTheme} data-testid="toggle-btn">
              Toggle
            </button>
          </div>
        );
      };

      render(
        <ThemeContextProvider>
          <TestComponent />
        </ThemeContextProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');

      fireEvent.click(screen.getByTestId('toggle-btn'));

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    });
  });
});
