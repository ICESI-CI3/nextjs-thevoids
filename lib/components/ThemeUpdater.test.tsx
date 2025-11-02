import { render } from '@testing-library/react';
import ThemeUpdater from './ThemeUpdater';
import { useThemeContext } from './ThemeContext';

// Mock the theme context
jest.mock('./ThemeContext', () => ({
  useThemeContext: jest.fn(),
}));

describe('ThemeUpdater', () => {
  const mockSetProperty = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock document.documentElement
    Object.defineProperty(document, 'documentElement', {
      value: {
        style: {
          setProperty: mockSetProperty,
        },
      },
      writable: true,
    });
  });

  it('should apply light theme styles on mount', () => {
    (useThemeContext as jest.Mock).mockReturnValue({ mode: 'light' });

    render(<ThemeUpdater />);

    expect(mockSetProperty).toHaveBeenCalledWith('--background', '#ffffff');
    expect(mockSetProperty).toHaveBeenCalledWith('--foreground', '#064e3b');
  });

  it('should apply dark theme styles on mount', () => {
    (useThemeContext as jest.Mock).mockReturnValue({ mode: 'dark' });

    render(<ThemeUpdater />);

    expect(mockSetProperty).toHaveBeenCalledWith('--background', '#0a0a0a');
    expect(mockSetProperty).toHaveBeenCalledWith('--foreground', '#f0fdf4');
  });

  it('should update styles when theme changes', () => {
    let currentMode = 'light';
    (useThemeContext as jest.Mock).mockReturnValue({ mode: currentMode });

    const { rerender } = render(<ThemeUpdater />);

    expect(mockSetProperty).toHaveBeenCalledWith('--background', '#ffffff');
    expect(mockSetProperty).toHaveBeenCalledWith('--foreground', '#064e3b');

    // Clear mock calls
    mockSetProperty.mockClear();

    // Change mode
    currentMode = 'dark';
    (useThemeContext as jest.Mock).mockReturnValue({ mode: currentMode });

    rerender(<ThemeUpdater />);

    expect(mockSetProperty).toHaveBeenCalledWith('--background', '#0a0a0a');
    expect(mockSetProperty).toHaveBeenCalledWith('--foreground', '#f0fdf4');
  });

  it('should render nothing', () => {
    (useThemeContext as jest.Mock).mockReturnValue({ mode: 'light' });

    const { container } = render(<ThemeUpdater />);

    expect(container.firstChild).toBeNull();
  });
});
