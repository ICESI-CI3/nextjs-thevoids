import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import Navbar, { navItems } from './Navbar';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useThemeContext } from './ThemeContext';

// Mock dependencies
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('./ThemeContext', () => ({
  useThemeContext: jest.fn(),
}));

// Mock MUI components to simplify testing
jest.mock('@mui/material', () => ({
  Drawer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drawer">{children}</div>
  ),
  List: ({ children }: { children: React.ReactNode }) => (
    <ul data-testid="nav-list">{children}</ul>
  ),
  ListItem: ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  ),
  ListItemButton: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  ListItemText: ({ primary }: { primary: string }) => <span>{primary}</span>,
  ListItemIcon: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Typography: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant?: string;
  }) => <div data-variant={variant}>{children}</div>,
  Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Divider: () => <hr />,
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

describe('Navbar', () => {
  const mockLogout = jest.fn();
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@test.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/users');
    (useThemeContext as jest.Mock).mockReturnValue({ mode: 'light' });
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isAuthenticated: true,
      hasPermission: jest.fn(() => true), // Mock hasPermission to return true by default
    });
  });

  describe('Authentication', () => {
    it('should not render when user is not authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        logout: mockLogout,
        isAuthenticated: false,
        hasPermission: jest.fn(() => false),
      });

      const { container } = render(<Navbar />);
      expect(container.firstChild).toBeNull();
    });

    it('should render when user is authenticated', () => {
      render(<Navbar />);
      expect(screen.getByTestId('drawer')).toBeInTheDocument();
    });
  });

  describe('Branding', () => {
    it('should display HabitHive title', () => {
      render(<Navbar />);
      expect(screen.getByText('🌿 HabitHive')).toBeInTheDocument();
    });

    it('should display tagline', () => {
      render(<Navbar />);
      expect(screen.getByText('Cultiva buenos hábitos')).toBeInTheDocument();
    });
  });

  describe('User information', () => {
    it('should display user name', () => {
      render(<Navbar />);
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  describe('Navigation items', () => {
    it('should render all navigation items', () => {
      render(<Navbar />);

      navItems.forEach(item => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });

    it('debe mostrar los items de navegación correctamente', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: 1, email: 'test@test.com', name: 'Test User' },
        logout: jest.fn(),
        isAuthenticated: true,
        loading: false,
        permissions: [],
        hasPermission: jest.fn(() => true),
      });

      (usePathname as jest.Mock).mockReturnValue('/users');

      render(<Navbar />);

      expect(screen.getByText('Usuarios')).toBeInTheDocument();
    });
  });

  describe('Logout functionality', () => {
    it('should render logout button', () => {
      render(<Navbar />);
      expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
    });

    it('should call logout when logout button is clicked', () => {
      render(<Navbar />);

      const logoutButton = screen.getByText('Cerrar Sesión');
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Theme support', () => {
    it('should handle light theme', () => {
      (useThemeContext as jest.Mock).mockReturnValue({ mode: 'light' });
      render(<Navbar />);
      expect(screen.getByTestId('drawer')).toBeInTheDocument();
    });

    it('should handle dark theme', () => {
      (useThemeContext as jest.Mock).mockReturnValue({ mode: 'dark' });
      render(<Navbar />);
      expect(screen.getByTestId('drawer')).toBeInTheDocument();
    });
  });

  describe('navItems export', () => {
    it('should export navigation items array', () => {
      expect(navItems).toBeDefined();
      expect(Array.isArray(navItems)).toBe(true);
      expect(navItems.length).toBeGreaterThan(0);
    });

    it('should have correct structure for nav items', () => {
      navItems.forEach(item => {
        expect(item).toHaveProperty('href');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('icon');
        expect(item).toHaveProperty('permission');
        expect(typeof item.href).toBe('string');
        expect(typeof item.label).toBe('string');
        expect(typeof item.permission).toBe('string');
      });
    });

    it('should include expected routes', () => {
      const expectedRoutes = [
        '/users',
        '/roles',
        '/permissions',
        '/rolePermissions',
      ];

      expectedRoutes.forEach(route => {
        const item = navItems.find(item => item.href === route);
        expect(item).toBeDefined();
      });
    });
  });

  describe('Permission-based filtering', () => {
    it('should filter navigation items based on permissions', () => {
      const mockHasPermission = jest.fn(
        (permission: string) =>
          permission === 'READ_USERS' || permission === 'READ_ROLES'
      );

      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        logout: mockLogout,
        isAuthenticated: true,
        hasPermission: mockHasPermission,
      });

      render(<Navbar />);

      // Should show items with allowed permissions
      expect(screen.getByText('Usuarios')).toBeInTheDocument();
      expect(screen.getByText('Roles')).toBeInTheDocument();

      // Should not show items without permissions
      expect(screen.queryByText('Hábitos')).not.toBeInTheDocument();
      expect(screen.queryByText('Permisos')).not.toBeInTheDocument();
    });

    it('should show all items when user has all permissions', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        logout: mockLogout,
        isAuthenticated: true,
        hasPermission: jest.fn(() => true),
      });

      render(<Navbar />);

      navItems.forEach(item => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });

    it('should show no items when user has no permissions', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        logout: mockLogout,
        isAuthenticated: true,
        hasPermission: jest.fn(() => false),
      });

      render(<Navbar />);

      navItems.forEach(item => {
        expect(screen.queryByText(item.label)).not.toBeInTheDocument();
      });

      // But should still show logout button
      expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
    });
  });
});
