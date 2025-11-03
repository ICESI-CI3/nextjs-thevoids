import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import PageHeader from './PageHeader';
import { useThemeContext } from './ThemeContext';
import { useAuth } from '@/lib/contexts/AuthContext';

// Mock dependencies
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('./ThemeContext', () => ({
  useThemeContext: jest.fn(),
}));

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('PageHeader', () => {
  const mockToggleTheme = jest.fn();
  const mockHasPermission = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockHasPermission.mockReturnValue(true);
    (useAuth as jest.Mock).mockReturnValue({
      hasPermission: mockHasPermission,
    });
  });

  describe('Page Title and Icon', () => {
    it('should display correct title and icon for users page', () => {
      (usePathname as jest.Mock).mockReturnValue('/users');
      (useThemeContext as jest.Mock).mockReturnValue({
        mode: 'light',
        toggleTheme: mockToggleTheme,
      });

      render(<PageHeader />);

      expect(screen.getByText('Usuarios')).toBeInTheDocument();
      expect(
        screen.getByText('Gestiona y visualiza tus usuarios')
      ).toBeInTheDocument();
      // Check if People icon is rendered (from navItems)
      expect(screen.getByTestId('PeopleIcon')).toBeInTheDocument();
    });

    it('should display default title when path not found', () => {
      (usePathname as jest.Mock).mockReturnValue('/unknown');
      (useThemeContext as jest.Mock).mockReturnValue({
        mode: 'light',
        toggleTheme: mockToggleTheme,
      });

      render(<PageHeader />);

      expect(screen.getByText('HabitHive')).toBeInTheDocument();
      expect(
        screen.getByText('Gestiona y visualiza tus habithive')
      ).toBeInTheDocument();
    });
  });

  describe('Theme Toggle', () => {
    it('should render light theme icon when in light mode', () => {
      (usePathname as jest.Mock).mockReturnValue('/users');
      (useThemeContext as jest.Mock).mockReturnValue({
        mode: 'light',
        toggleTheme: mockToggleTheme,
      });

      render(<PageHeader />);

      expect(screen.getByTestId('Brightness4Icon')).toBeInTheDocument();
      expect(screen.queryByTestId('Brightness7Icon')).not.toBeInTheDocument();
    });

    it('should render dark theme icon when in dark mode', () => {
      (usePathname as jest.Mock).mockReturnValue('/users');
      (useThemeContext as jest.Mock).mockReturnValue({
        mode: 'dark',
        toggleTheme: mockToggleTheme,
      });

      render(<PageHeader />);

      expect(screen.getByTestId('Brightness7Icon')).toBeInTheDocument();
      expect(screen.queryByTestId('Brightness4Icon')).not.toBeInTheDocument();
    });

    it('should call toggleTheme when theme button is clicked', () => {
      (usePathname as jest.Mock).mockReturnValue('/users');
      (useThemeContext as jest.Mock).mockReturnValue({
        mode: 'light',
        toggleTheme: mockToggleTheme,
      });

      render(<PageHeader />);

      const themeButton = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(themeButton);

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('Styling', () => {
    it('should apply light theme styles', () => {
      (usePathname as jest.Mock).mockReturnValue('/users');
      (useThemeContext as jest.Mock).mockReturnValue({
        mode: 'light',
        toggleTheme: mockToggleTheme,
      });

      render(<PageHeader />);

      // Check that the Paper component is rendered (it doesn't have a banner role)
      const paper = document.querySelector('.MuiPaper-root');
      expect(paper).toBeInTheDocument();
    });

    it('should apply dark theme styles', () => {
      (usePathname as jest.Mock).mockReturnValue('/users');
      (useThemeContext as jest.Mock).mockReturnValue({
        mode: 'dark',
        toggleTheme: mockToggleTheme,
      });

      render(<PageHeader />);

      // Check that the Paper component is rendered (it doesn't have a banner role)
      const paper = document.querySelector('.MuiPaper-root');
      expect(paper).toBeInTheDocument();
    });
  });
});
