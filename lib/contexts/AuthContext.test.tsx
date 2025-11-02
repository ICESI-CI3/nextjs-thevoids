import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { authApi } from '../api/auth';

jest.mock('../api/auth', () => ({
  authApi: {
    login: jest.fn(),
    logout: jest.fn(),
  },
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    localStorage.clear();
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });

    it('should provide auth context when used within AuthProvider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('token');
      expect(result.current).toHaveProperty('permissions');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('hasPermission');
    });
  });

  describe('Initial state', () => {
    it('should have null user and token initially', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.permissions).toEqual([]);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should restore state from localStorage if valid', async () => {
      const mockToken = 'test-token';
      const mockUser = { id: '1', name: 'Test User', email: 'test@test.com' };
      const mockPermissions = ['read', 'write'];

      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('permissions', JSON.stringify(mockPermissions));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.token).toBe(mockToken);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.permissions).toEqual(mockPermissions);
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    it('should handle corrupted localStorage data gracefully', async () => {
      localStorage.setItem('token', 'valid-token');
      localStorage.setItem('user', 'invalid-json');
      localStorage.setItem('permissions', 'invalid-json');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.token).toBe('valid-token');
        expect(result.current.user).toBeNull();
        expect(result.current.permissions).toEqual([]);
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    it('should ignore undefined string values in localStorage', async () => {
      localStorage.setItem('token', 'undefined');
      localStorage.setItem('user', 'undefined');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.token).toBeNull();
        expect(result.current.user).toBeNull();
        expect(result.current.permissions).toEqual([]);
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });

  describe('login', () => {
    it('should login successfully and store data', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', name: 'Test User', email: 'test@test.com' },
          token: 'new-token',
          permissions: ['read', 'write'],
        },
        status: 200,
      };

      (authApi.login as jest.Mock).mockResolvedValue(mockResponse);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login({
          email: 'test@test.com',
          password: 'password',
        });
      });

      expect(loginResult).toEqual({ success: true });
      expect(result.current.user).toEqual(mockResponse.data.user);
      expect(result.current.token).toBe(mockResponse.data.token);
      expect(result.current.permissions).toEqual(mockResponse.data.permissions);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle login error from API', async () => {
      const mockResponse = {
        error: 'Invalid credentials',
        status: 401,
      };

      (authApi.login as jest.Mock).mockResolvedValue(mockResponse);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login({
          email: 'test@test.com',
          password: 'wrong',
        });
      });

      expect(loginResult).toEqual({
        success: false,
        error: 'Invalid credentials',
      });
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle unexpected login error', async () => {
      (authApi.login as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login({
          email: 'test@test.com',
          password: 'password',
        });
      });

      expect(loginResult).toEqual({
        success: false,
        error: 'An unexpected error occurred',
      });
    });
  });

  describe('logout', () => {
    it('should logout and clear state', async () => {
      const mockToken = 'test-token';
      const mockUser = { id: '1', name: 'Test', email: 'test@test.com' };
      const mockPermissions = ['read'];

      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('permissions', JSON.stringify(mockPermissions));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      act(() => {
        result.current.logout();
      });

      expect(result.current.token).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.permissions).toEqual([]);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has permission', async () => {
      const mockPermissions = ['read', 'write', 'delete'];

      localStorage.setItem('token', 'token');
      localStorage.setItem('user', JSON.stringify({ id: '1' }));
      localStorage.setItem('permissions', JSON.stringify(mockPermissions));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasPermission('read')).toBe(true);
      expect(result.current.hasPermission('write')).toBe(true);
      expect(result.current.hasPermission('delete')).toBe(true);
    });

    it('should return false if user does not have permission', async () => {
      const mockPermissions = ['read'];

      localStorage.setItem('token', 'token');
      localStorage.setItem('user', JSON.stringify({ id: '1' }));
      localStorage.setItem('permissions', JSON.stringify(mockPermissions));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasPermission('write')).toBe(false);
      expect(result.current.hasPermission('delete')).toBe(false);
    });
  });
});
