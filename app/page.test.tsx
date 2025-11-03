import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import HomePage from './page';
import { useAuth } from '@/lib/contexts/AuthContext';

// Mock dependencies

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('HomePage', () => {
  const mockPush = jest.fn();

  const createMockAuthContext = (
    overrides: Partial<ReturnType<typeof useAuth>> = {}
  ) => ({
    isAuthenticated: true,
    isLoading: false,
    token: 'mock-token',
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN',
      isActive: true,
    },
    permissions: [],
    login: jest.fn(),
    logout: jest.fn(),
    hasPermission: jest.fn().mockReturnValue(true),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useAuth as jest.Mock).mockReturnValue(createMockAuthContext());
  });

  describe('Rendering', () => {
    it('should render dashboard cards', () => {
      render(<HomePage />);

      expect(screen.getByText(/HabitHive/i)).toBeInTheDocument();
      const cardTitles = [
        'Usuarios',
        'Roles',
        'Permisos',
        'Permisos de Rol',
        'Colmenas',
        'Hábitos',
        'Progresos',
        'Pagos',
        'Transacciones',
        'Cerrar Sesión',
      ];

      cardTitles.forEach(title => {
        expect(screen.getByText(title)).toBeInTheDocument();
      });
    });

    it('should render card descriptions', () => {
      render(<HomePage />);

      const descriptions = [
        'Gestionar usuarios del sistema',
        'Administrar roles y permisos',
        'Configurar permisos del sistema',
        'Asignar permisos a roles',
        'Gestionar colmenas y hábitos',
        'Administrar tus hábitos',
        'Ver y analizar tu progreso',
        'Gestionar pagos y suscripciones',
        'Ver historial de transacciones',
        'Salir de tu cuenta',
      ];

      descriptions.forEach(description => {
        expect(screen.getByText(description)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should redirect to login if not authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue(
        createMockAuthContext({
          isAuthenticated: false,
          user: null,
          token: null,
        })
      );

      render(<HomePage />);

      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('should not redirect if authenticated', () => {
      render(<HomePage />);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Card Interactions', () => {
    it('should navigate to users page when users card is clicked', () => {
      render(<HomePage />);

      const usersCard = screen.getByText('Usuarios').closest('button');
      fireEvent.click(usersCard!);

      expect(mockPush).toHaveBeenCalledWith('/users');
    });

    it('should navigate to roles page when roles card is clicked', () => {
      render(<HomePage />);

      const rolesCard = screen.getByText('Roles').closest('button');
      fireEvent.click(rolesCard!);

      expect(mockPush).toHaveBeenCalledWith('/roles');
    });

    it('should navigate to permissions page when permissions card is clicked', () => {
      render(<HomePage />);

      const permissionsCard = screen.getByText('Permisos').closest('button');
      fireEvent.click(permissionsCard!);

      expect(mockPush).toHaveBeenCalledWith('/permissions');
    });

    it('should navigate to rolePermissions page when rolePermissions card is clicked', () => {
      render(<HomePage />);

      const rolePermissionsCard = screen
        .getByText('Permisos de Rol')
        .closest('button');
      fireEvent.click(rolePermissionsCard!);

      expect(mockPush).toHaveBeenCalledWith('/rolePermissions');
    });
  });

  describe('Accessibility', () => {
    it('should have proper card structure', () => {
      render(<HomePage />);

      const cards = screen.getAllByRole('button');
      expect(cards).toHaveLength(10);

      cards.forEach(card => {
        expect(card).toBeInTheDocument();
      });
    });

    it('should have descriptive text for each card', () => {
      render(<HomePage />);

      const descriptions = [
        'Gestionar usuarios del sistema',
        'Administrar roles y permisos',
        'Configurar permisos del sistema',
        'Asignar permisos a roles',
        'Gestionar colmenas y hábitos',
        'Administrar tus hábitos',
        'Ver y analizar tu progreso',
        'Gestionar pagos y suscripciones',
        'Ver historial de transacciones',
        'Salir de tu cuenta',
      ];

      descriptions.forEach(description => {
        expect(screen.getByText(description)).toBeInTheDocument();
      });
    });
  });
});
