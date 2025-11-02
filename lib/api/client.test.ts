import { ApiClient, apiClient } from './client';

// Mock fetch globally
global.fetch = jest.fn();

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient('http://test-api.com');
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('constructor', () => {
    it('should use provided base URL', () => {
      const customClient = new ApiClient('http://custom.com');
      expect(customClient['baseUrl']).toBe('http://custom.com');
    });

    it('should use default base URL from env', () => {
      expect(apiClient['baseUrl']).toBeDefined();
    });
  });

  describe('request method', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const response = await client.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(response).toEqual({
        status: 200,
        data: mockData,
      });
    });

    it('should include auth token in headers when available', async () => {
      localStorage.setItem('token', 'test-token');

      const mockData = { id: 1 };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      await client.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should handle 204 No Content response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const response = await client.delete('/test/1');

      expect(response).toEqual({
        status: 204,
        data: undefined,
      });
    });

    it('should handle 400 Bad Request error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid data' }),
      });

      const response = await client.post('/test', { invalid: 'data' });

      expect(response).toEqual({
        status: 400,
        error: 'Invalid data',
      });
    });

    it('should handle 401 Unauthorized error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      const response = await client.get('/protected');

      expect(response).toEqual({
        status: 401,
        error: 'No autorizado. Por favor, inicie sesión',
      });
    });

    it('should handle 403 Forbidden error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Forbidden' }),
      });

      const response = await client.delete('/admin/user/1');

      expect(response).toEqual({
        status: 403,
        error: 'No tiene permisos para realizar esta acción',
      });
    });

    it('should handle 404 Not Found error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' }),
      });

      const response = await client.get('/not-exist');

      expect(response).toEqual({
        status: 404,
        error: 'Not found',
      });
    });

    it('should handle 409 Conflict error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ message: 'Email already exists' }),
      });

      const response = await client.post('/users', {
        email: 'duplicate@test.com',
      });

      expect(response).toEqual({
        status: 409,
        error: 'Email already exists',
      });
    });

    it('should handle 500 Internal Server Error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' }),
      });

      const response = await client.get('/test');

      expect(response).toEqual({
        status: 500,
        error: 'Error interno del servidor',
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network failure')
      );

      const response = await client.get('/test');

      expect(response).toEqual({
        status: 500,
        error: 'Network failure',
      });
    });

    it('should handle non-Error exceptions', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce('String error');

      const response = await client.get('/test');

      expect(response).toEqual({
        status: 500,
        error: 'Network error',
      });
    });
  });

  describe('HTTP methods', () => {
    it('should make POST request with body', async () => {
      const mockData = { id: 1, name: 'Created' };
      const postData = { name: 'New Item' };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockData,
      });

      const response = await client.post('/items', postData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/items',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        })
      );

      expect(response.data).toEqual(mockData);
    });

    it('should make PATCH request with body', async () => {
      const mockData = { id: 1, name: 'Updated' };
      const patchData = { name: 'Updated Item' };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const response = await client.patch('/items/1', patchData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/items/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(patchData),
        })
      );

      expect(response.data).toEqual(mockData);
    });

    it('should make DELETE request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const response = await client.delete('/items/1');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/items/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );

      expect(response.status).toBe(204);
    });

    it('should make POST request without body', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      await client.post('/action');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/action',
        expect.objectContaining({
          method: 'POST',
          body: undefined,
        })
      );
    });
  });

  describe('error message handling', () => {
    it('should use default message for 409 when API message is missing', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({}),
      });

      const response = await client.post('/test', {});

      expect(response.error).toBe(
        'Conflicto: el recurso ya existe o está en uso'
      );
    });

    it('should use default message for 404 when API message is missing', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

      const response = await client.get('/test');

      expect(response.error).toBe('Recurso no encontrado');
    });

    it('should use default message for 400 when API message is missing', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({}),
      });

      const response = await client.post('/test', {});

      expect(response.error).toBe('Datos inválidos');
    });

    it('should use generic error for unknown status codes', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 418, // I'm a teapot
        json: async () => ({}),
      });

      const response = await client.get('/test');

      expect(response.error).toBe('An error occurred');
    });
  });
});
