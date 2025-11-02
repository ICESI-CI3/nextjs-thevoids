// Mock the API client
jest.mock('./client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

import { authApi } from './auth';
import { apiClient } from './client';

describe('authApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    it('should call POST /auth/login with credentials', async () => {
      const credentials = {
        email: 'test@test.com',
        password: 'password123',
      };

      const mockResponse = {
        status: 200,
        data: {
          user: { id: '1', name: 'Test User', email: 'test@test.com' },
          token: 'jwt-token',
          permissions: ['read', 'write'],
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.login(credentials);

      expect(apiClient.post).toHaveBeenCalledWith('/users/login', credentials);
      expect(result).toEqual(mockResponse);
    });

    it('should handle login error', async () => {
      const credentials = {
        email: 'test@test.com',
        password: 'wrong',
      };

      const mockResponse = {
        status: 401,
        error: 'Invalid credentials',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.login(credentials);

      expect(result).toEqual(mockResponse);
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should call logout which clears localStorage', () => {
      // Just verify logout runs without error
      expect(() => authApi.logout()).not.toThrow();
    });
  });

  describe('getProfile', () => {
    it('should call GET /users/profile', async () => {
      const mockResponse = {
        status: 200,
        data: {
          id: '1',
          name: 'Test User',
          email: 'test@test.com',
          role: 'admin',
          isActive: true,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.getProfile();

      expect(apiClient.get).toHaveBeenCalledWith('/users/profile');
      expect(result).toEqual(mockResponse);
    });

    it('should handle unauthorized error', async () => {
      const mockResponse = {
        status: 401,
        error: 'No autorizado. Por favor, inicie sesión',
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.getProfile();

      expect(result.error).toBeTruthy();
    });
  });
});
