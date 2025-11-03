global.fetch = jest.fn();
import { ApiClient, apiClient } from './client';

// Mock fetch globally
global.fetch = jest.fn();
const fetchMock = global.fetch as jest.Mock;

const createResponse = (
  status: number,
  body?: Record<string, unknown>,
  ok = true
) => ({
  ok,
  status,
  headers: new Headers(
    body ? { 'content-type': 'application/json' } : undefined
  ),
  json: async () => body,
});

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
      fetchMock.mockResolvedValueOnce(createResponse(200, mockData));

      const response = await client.get('/test');

      expect(fetchMock).toHaveBeenCalledWith(
        'http://test-api.com/test',
        expect.any(Object)
      );

      const [, options] = fetchMock.mock.calls[0];
      const headers = options.headers as Headers;

      expect(options.method).toBe('GET');
      expect(headers.get('Content-Type')).toBe('application/json');

      expect(response).toEqual({
        status: 200,
        data: mockData,
      });
    });

    it('should include auth token in headers when available', async () => {
      localStorage.setItem('token', 'test-token');

      const mockData = { id: 1 };
      fetchMock.mockResolvedValueOnce(createResponse(200, mockData));

      await client.get('/test');

      const [, options] = fetchMock.mock.calls[0];
      const headers = options.headers as Headers;

      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Authorization')).toBe('Bearer test-token');
    });

    it('should handle 204 No Content response', async () => {
      fetchMock.mockResolvedValueOnce(createResponse(204));

      const response = await client.delete('/test/1');

      expect(response).toEqual({
        status: 204,
        data: undefined,
      });
    });

    it('should handle 400 Bad Request error', async () => {
      fetchMock.mockResolvedValueOnce(
        createResponse(400, { message: 'Invalid data' }, false)
      );

      const response = await client.post('/test', { invalid: 'data' });

      expect(response).toEqual({
        status: 400,
        error: 'Invalid data',
      });
    });

    it('should handle 401 Unauthorized error', async () => {
      fetchMock.mockResolvedValueOnce(
        createResponse(401, { message: 'Unauthorized' }, false)
      );

      const response = await client.get('/protected');

      expect(response).toEqual({
        status: 401,
        error: 'No autorizado. Por favor, inicie sesión',
      });
    });

    it('should handle 403 Forbidden error', async () => {
      fetchMock.mockResolvedValueOnce(
        createResponse(403, { message: 'Forbidden' }, false)
      );

      const response = await client.delete('/admin/user/1');

      expect(response).toEqual({
        status: 403,
        error: 'No tiene permisos para realizar esta acción',
      });
    });

    it('should handle 404 Not Found error', async () => {
      fetchMock.mockResolvedValueOnce(
        createResponse(404, { message: 'Not found' }, false)
      );

      const response = await client.get('/not-exist');

      expect(response).toEqual({
        status: 404,
        error: 'Not found',
      });
    });

    it('should handle 409 Conflict error', async () => {
      fetchMock.mockResolvedValueOnce(
        createResponse(409, { message: 'Email already exists' }, false)
      );

      const response = await client.post('/users', {
        email: 'duplicate@test.com',
      });

      expect(response).toEqual({
        status: 409,
        error: 'Email already exists',
      });
    });

    it('should handle 500 Internal Server Error', async () => {
      fetchMock.mockResolvedValueOnce(
        createResponse(500, { message: 'Server error' }, false)
      );

      const response = await client.get('/test');

      expect(response).toEqual({
        status: 500,
        error: 'Error interno del servidor',
      });
    });

    it('should handle network errors', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network failure'));

      const response = await client.get('/test');

      expect(response).toEqual({
        status: 500,
        error: 'Network failure',
      });
    });

    it('should handle non-Error exceptions', async () => {
      fetchMock.mockRejectedValueOnce('String error');

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

      fetchMock.mockResolvedValueOnce(createResponse(201, mockData));

      const response = await client.post('/items', postData);

      const [, options] = fetchMock.mock.calls[0];
      expect(options.method).toBe('POST');
      expect(options.body).toBe(JSON.stringify(postData));

      expect(response.data).toEqual(mockData);
    });

    it('should make PATCH request with body', async () => {
      const mockData = { id: 1, name: 'Updated' };
      const patchData = { name: 'Updated Item' };

      fetchMock.mockResolvedValueOnce(createResponse(200, mockData));

      const response = await client.patch('/items/1', patchData);

      const [, options] = fetchMock.mock.calls[0];
      expect(options.method).toBe('PATCH');
      expect(options.body).toBe(JSON.stringify(patchData));

      expect(response.data).toEqual(mockData);
    });

    it('should make DELETE request', async () => {
      fetchMock.mockResolvedValueOnce(createResponse(204));

      const response = await client.delete('/items/1');

      const [, options] = fetchMock.mock.calls[0];
      expect(options.method).toBe('DELETE');

      expect(response.status).toBe(204);
    });

    it('should make POST request without body', async () => {
      fetchMock.mockResolvedValueOnce(createResponse(200, { success: true }));

      await client.post('/action');

      const [, options] = fetchMock.mock.calls[0];
      expect(options.method).toBe('POST');
      expect(options.body).toBeUndefined();
    });
  });

  describe('error message handling', () => {
    it('should use default message for 409 when API message is missing', async () => {
      fetchMock.mockResolvedValueOnce(createResponse(409, {}, false));

      const response = await client.post('/test', {});

      expect(response.error).toBe(
        'Conflicto: el recurso ya existe o está en uso'
      );
    });

    it('should use default message for 404 when API message is missing', async () => {
      fetchMock.mockResolvedValueOnce(createResponse(404, {}, false));

      const response = await client.get('/test');

      expect(response.error).toBe('Recurso no encontrado');
    });

    it('should use default message for 400 when API message is missing', async () => {
      fetchMock.mockResolvedValueOnce(createResponse(400, {}, false));

      const response = await client.post('/test', {});

      expect(response.error).toBe('Datos inválidos');
    });

    it('should use generic error for unknown status codes', async () => {
      fetchMock.mockResolvedValueOnce(createResponse(418, {}, false));

      const response = await client.get('/test');

      expect(response.error).toBe('An error occurred');
    });
  });
});
