import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import UserRoles from './page';
import { useAuth } from '@/lib/contexts/AuthContext';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('UserRoles Page', () => {
  const mockPush = jest.fn();
  const mockRouter = { push: mockPush };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('Rendering', () => {
    it('should render the page title', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
      });

      render(<UserRoles />);

      expect(screen.getByText('Página eliminada')).toBeInTheDocument();
      expect(
        screen.getByText(/la página.*roles de usuario.*fue removida/i)
      ).toBeInTheDocument();
    });

    it('should render explanatory text', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
      });

      render(<UserRoles />);

      expect(
        screen.getByText(/use la sección de.*roles y permisos de rol/i)
      ).toBeInTheDocument();
    });
  });

  describe('Redirection', () => {
    it('should redirect to roles page when authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
      });

      render(<UserRoles />);

      expect(mockPush).toHaveBeenCalledWith('/roles');
    });

    it('should not redirect when not authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
      });

      render(<UserRoles />);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
