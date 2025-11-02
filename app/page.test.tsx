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

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, name: 'Test User' },
    });
  });

  describe('Rendering', () => {
    it('should render dashboard cards', () => {
      render(<HomePage />);

      expect(screen.getByText(/HabitHive/i)).toBeInTheDocument();
      expect(screen.getByText('Usuarios')).toBeInTheDocument();
      expect(screen.getByText('Roles')).toBeInTheDocument();
      expect(screen.getByText('Permisos')).toBeInTheDocument();
      expect(screen.getByText('Permisos de Rol')).toBeInTheDocument();
    });

    it('should render card descriptions', () => {
      render(<HomePage />);

      expect(
        screen.getByText('Gestionar usuarios del sistema')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Administrar roles y permisos')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Configurar permisos del sistema')
      ).toBeInTheDocument();
      expect(screen.getByText('Asignar permisos a roles')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should redirect to login if not authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

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
      expect(cards).toHaveLength(4);

      cards.forEach(card => {
        expect(card).toBeInTheDocument();
      });
    });

    it('should have descriptive text for each card', () => {
      render(<HomePage />);

      expect(
        screen.getByText('Gestionar usuarios del sistema')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Administrar roles y permisos')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Configurar permisos del sistema')
      ).toBeInTheDocument();
      expect(screen.getByText('Asignar permisos a roles')).toBeInTheDocument();
    });
  });
});
