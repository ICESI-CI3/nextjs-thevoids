import { usersApi } from './users';
import { apiClient } from './client';

jest.mock('./client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('usersApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should call GET /users without params', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'User 1',
          email: 'user1@test.com',
          role: 'user',
          isActive: true,
        },
      ];

      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockUsers,
      });

      const result = await usersApi.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/users');
      expect(result.data).toEqual(mockUsers);
    });

    it('should call GET /users with pagination params', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 200,
        data: [],
      });

      await usersApi.getAll({ limit: 10, offset: 20 });

      expect(apiClient.get).toHaveBeenCalledWith('/users?limit=10&offset=20');
    });
  });

  describe('getById', () => {
    it('should call GET /users/:id', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        role: 'admin',
        isActive: true,
      };

      (apiClient.get as jest.Mock).mockResolvedValue({
        status: 200,
        data: mockUser,
      });

      const result = await usersApi.getById('1');

      expect(apiClient.get).toHaveBeenCalledWith('/users/1');
      expect(result.data).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('should call POST /users/register with user data', async () => {
      const newUser = {
        name: 'New User',
        email: 'new@test.com',
        password: 'password123',
        role: 'user',
      };

      const createdUser = {
        id: '2',
        name: 'New User',
        email: 'new@test.com',
        role: 'user',
        isActive: true,
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        status: 201,
        data: createdUser,
      });

      const result = await usersApi.create(newUser);

      expect(apiClient.post).toHaveBeenCalledWith('/users/register', newUser);
      expect(result.data).toEqual(createdUser);
    });

    it('should handle 409 conflict error', async () => {
      const newUser = {
        name: 'New User',
        email: 'existing@test.com',
        password: 'password123',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        status: 409,
        error: 'Email already exists',
      });

      const result = await usersApi.create(newUser);

      expect(result.error).toBe('Email already exists');
    });
  });

  describe('update', () => {
    it('should call PATCH /users/:id with update data', async () => {
      const updateData = {
        name: 'Updated Name',
        isActive: false,
      };

      const updatedUser = {
        id: '1',
        name: 'Updated Name',
        email: 'test@test.com',
        role: 'user',
        isActive: false,
      };

      (apiClient.patch as jest.Mock).mockResolvedValue({
        status: 200,
        data: updatedUser,
      });

      const result = await usersApi.update('1', updateData);

      expect(apiClient.patch).toHaveBeenCalledWith('/users/1', updateData);
      expect(result.data).toEqual(updatedUser);
    });
  });

  describe('delete', () => {
    it('should call DELETE /users/:id', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({
        status: 204,
      });

      const result = await usersApi.delete('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/users/1');
      expect(result.status).toBe(204);
    });

    it('should handle 404 not found error', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({
        status: 404,
        error: 'User not found',
      });

      const result = await usersApi.delete('999');

      expect(result.error).toBe('User not found');
    });
  });
});
