import { render, screen, waitFor } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '@/lib/contexts/AuthContext';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@mui/material', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Box: ({ children, ...props }: any) => (
    <div data-testid="loading-box" {...props}>
      {children}
    </div>
  ),
  CircularProgress: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe('ProtectedRoute', () => {
  const mockPush = jest.fn();
  const TestContent = () => <div>Protected Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (usePathname as jest.Mock).mockReturnValue('/users');
  });

  describe('Authentication Checking', () => {
    it('should render children when user is authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should redirect to login when user is not authenticated', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      render(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should not redirect when user is not authenticated but on public route', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });
      (usePathname as jest.Mock).mockReturnValue('/login');

      render(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );

      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when auth is loading', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      });

      render(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should not redirect while loading', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      });

      render(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should show loading box with correct styling', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      });

      render(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );

      const loadingBox = screen.getByTestId('loading-box');
      expect(loadingBox).toBeInTheDocument();
    });
  });

  describe('Public Routes', () => {
    it('should allow access to login page without authentication', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });
      (usePathname as jest.Mock).mockReturnValue('/login');

      render(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Protected Routes', () => {
    it('should protect /users route', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });
      (usePathname as jest.Mock).mockReturnValue('/users');

      render(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should protect /roles route', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });
      (usePathname as jest.Mock).mockReturnValue('/roles');

      render(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should protect /permissions route', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });
      (usePathname as jest.Mock).mockReturnValue('/permissions');

      render(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Render Behavior', () => {
    it('should render null when redirecting to login', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });
      (usePathname as jest.Mock).mockReturnValue('/users');

      const { container } = render(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });

    it('should render children directly when authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      render(
        <ProtectedRoute>
          <div>
            <h1>Dashboard</h1>
            <p>Welcome</p>
          </div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome')).toBeInTheDocument();
    });
  });

  describe('useEffect Dependencies', () => {
    it('should re-evaluate when authentication state changes', async () => {
      const { rerender } = render(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );

      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      rerender(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();

      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      rerender(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should re-evaluate when pathname changes', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });
      (usePathname as jest.Mock).mockReturnValue('/users');

      const { rerender } = render(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });

      mockPush.mockClear();

      (usePathname as jest.Mock).mockReturnValue('/login');

      rerender(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined pathname gracefully', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });
      (usePathname as jest.Mock).mockReturnValue(undefined);

      render(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should handle transition from loading to authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      });

      const { rerender } = render(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      rerender(
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});
