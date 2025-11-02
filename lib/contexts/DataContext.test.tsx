import { renderHook, act } from '@testing-library/react';
import { DataProvider, useData } from './DataContext';
import type { User } from '../api/users';
import type { Role } from '../api/roles';
import type { Permission } from '../api/permissions';
import type { RolePermission } from '../api/rolePermissions';

describe('DataContext', () => {
  describe('useData hook', () => {
    it('should throw error when used outside DataProvider', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useData());
      }).toThrow('useData must be used within a DataProvider');

      consoleSpy.mockRestore();
    });

    it('should provide data context when used within DataProvider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DataProvider>{children}</DataProvider>
      );

      const { result } = renderHook(() => useData(), { wrapper });

      expect(result.current).toHaveProperty('state');
      expect(result.current).toHaveProperty('dispatch');
      expect(result.current).toHaveProperty('setUsers');
      expect(result.current).toHaveProperty('setRoles');
      expect(result.current).toHaveProperty('setPermissions');
      expect(result.current).toHaveProperty('setRolePermissions');
    });
  });

  describe('Initial state', () => {
    it('should have empty arrays and false loading states', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DataProvider>{children}</DataProvider>
      );

      const { result } = renderHook(() => useData(), { wrapper });

      expect(result.current.state.users).toEqual([]);
      expect(result.current.state.roles).toEqual([]);
      expect(result.current.state.permissions).toEqual([]);
      expect(result.current.state.rolePermissions).toEqual([]);
      expect(result.current.state.loading).toEqual({
        users: false,
        roles: false,
        permissions: false,
        rolePermissions: false,
      });
      expect(result.current.state.errors).toEqual({
        users: null,
        roles: null,
        permissions: null,
        rolePermissions: null,
      });
    });
  });

  describe('Users operations', () => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'User 1',
        email: 'user1@test.com',
        role: 'admin',
        isActive: true,
      },
      {
        id: '2',
        name: 'User 2',
        email: 'user2@test.com',
        role: 'user',
        isActive: true,
      },
    ];

    it('should set users', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DataProvider>{children}</DataProvider>
      );

      const { result } = renderHook(() => useData(), { wrapper });

      act(() => {
        result.current.setUsers(mockUsers);
      });

      expect(result.current.state.users).toEqual(mockUsers);
    });

    it('should add a user', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DataProvider>{children}</DataProvider>
      );

      const { result } = renderHook(() => useData(), { wrapper });

      const newUser: User = {
        id: '3',
        name: 'User 3',
        email: 'user3@test.com',
        role: 'user',
        isActive: true,
      };

      act(() => {
        result.current.setUsers(mockUsers);
        result.current.addUser(newUser);
      });

      expect(result.current.state.users).toHaveLength(3);
      expect(result.current.state.users[2]).toEqual(newUser);
    });

    it('should update a user', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DataProvider>{children}</DataProvider>
      );

      const { result } = renderHook(() => useData(), { wrapper });

      act(() => {
        result.current.setUsers(mockUsers);
      });

      const updatedUser: User = {
        ...mockUsers[0],
        name: 'Updated User',
      };

      act(() => {
        result.current.updateUser(updatedUser);
      });

      expect(result.current.state.users[0].name).toBe('Updated User');
    });

    it('should delete a user', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DataProvider>{children}</DataProvider>
      );

      const { result } = renderHook(() => useData(), { wrapper });

      act(() => {
        result.current.setUsers(mockUsers);
        result.current.deleteUser('1');
      });

      expect(result.current.state.users).toHaveLength(1);
      expect(result.current.state.users[0].id).toBe('2');
    });

    it('should set users loading state', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DataProvider>{children}</DataProvider>
      );

      const { result } = renderHook(() => useData(), { wrapper });

      act(() => {
        result.current.setUsersLoading(true);
      });

      expect(result.current.state.loading.users).toBe(true);

      act(() => {
        result.current.setUsersLoading(false);
      });

      expect(result.current.state.loading.users).toBe(false);
    });

    it('should set users error', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DataProvider>{children}</DataProvider>
      );

      const { result } = renderHook(() => useData(), { wrapper });

      act(() => {
        result.current.setUsersError('Error loading users');
      });

      expect(result.current.state.errors.users).toBe('Error loading users');

      act(() => {
        result.current.setUsersError(null);
      });

      expect(result.current.state.errors.users).toBeNull();
    });
  });

  describe('Roles operations', () => {
    const mockRoles: Role[] = [
      { id: '1', name: 'Admin', description: 'Administrator role' },
      { id: '2', name: 'User', description: 'Regular user role' },
    ];

    it('should set roles', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DataProvider>{children}</DataProvider>
      );

      const { result } = renderHook(() => useData(), { wrapper });

      act(() => {
        result.current.setRoles(mockRoles);
      });

      expect(result.current.state.roles).toEqual(mockRoles);
    });

    it('should add a role', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DataProvider>{children}</DataProvider>
      );

      const { result } = renderHook(() => useData(), { wrapper });

      const newRole: Role = {
        id: '3',
        name: 'Moderator',
        description: 'Moderator role',
      };

      act(() => {
        result.current.setRoles(mockRoles);
        result.current.addRole(newRole);
      });

      expect(result.current.state.roles).toHaveLength(3);
      expect(result.current.state.roles[2]).toEqual(newRole);
    });

    it('should update a role', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DataProvider>{children}</DataProvider>
      );

      const { result } = renderHook(() => useData(), { wrapper });

      act(() => {
        result.current.setRoles(mockRoles);
      });

      const updatedRole: Role = {
        ...mockRoles[0],
        description: 'Updated description',
      };

      act(() => {
        result.current.updateRole(updatedRole);
      });

      expect(result.current.state.roles[0].description).toBe(
        'Updated description'
      );
    });

    it('should delete a role', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DataProvider>{children}</DataProvider>
      );

      const { result } = renderHook(() => useData(), { wrapper });

      act(() => {
        result.current.setRoles(mockRoles);
        result.current.deleteRole('1');
      });

      expect(result.current.state.roles).toHaveLength(1);
      expect(result.current.state.roles[0].id).toBe('2');
    });
  });

  describe('Permissions operations', () => {
    const mockPermissions: Permission[] = [
      { id: '1', name: 'read', description: 'Read permission' },
      { id: '2', name: 'write', description: 'Write permission' },
    ];

    it('should set permissions', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DataProvider>{children}</DataProvider>
      );

      const { result } = renderHook(() => useData(), { wrapper });

      act(() => {
        result.current.setPermissions(mockPermissions);
      });

      expect(result.current.state.permissions).toEqual(mockPermissions);
    });

    it('should set permissions loading state', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DataProvider>{children}</DataProvider>
      );

      const { result } = renderHook(() => useData(), { wrapper });

      act(() => {
        result.current.setPermissionsLoading(true);
      });

      expect(result.current.state.loading.permissions).toBe(true);
    });

    it('should set permissions error', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DataProvider>{children}</DataProvider>
      );

      const { result } = renderHook(() => useData(), { wrapper });

      act(() => {
        result.current.setPermissionsError('Error loading permissions');
      });

      expect(result.current.state.errors.permissions).toBe(
        'Error loading permissions'
      );
    });
  });

  describe('Role Permissions operations', () => {
    const mockRolePermissions: RolePermission[] = [
      {
        roleId: '1',
        permissionId: '1',
        role: { id: '1', name: 'Admin' },
        permission: { id: '1', name: 'read' },
      },
      {
        roleId: '1',
        permissionId: '2',
        role: { id: '1', name: 'Admin' },
        permission: { id: '2', name: 'write' },
      },
    ];

    it('should set role permissions', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DataProvider>{children}</DataProvider>
      );

      const { result } = renderHook(() => useData(), { wrapper });

      act(() => {
        result.current.setRolePermissions(mockRolePermissions);
      });

      expect(result.current.state.rolePermissions).toEqual(mockRolePermissions);
    });

    it('should add a role permission', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DataProvider>{children}</DataProvider>
      );

      const { result } = renderHook(() => useData(), { wrapper });

      const newRolePermission: RolePermission = {
        roleId: '2',
        permissionId: '1',
        role: { id: '2', name: 'User' },
        permission: { id: '1', name: 'read' },
      };

      act(() => {
        result.current.setRolePermissions(mockRolePermissions);
        result.current.addRolePermission(newRolePermission);
      });

      expect(result.current.state.rolePermissions).toHaveLength(3);
      expect(result.current.state.rolePermissions[2]).toEqual(
        newRolePermission
      );
    });

    it('should delete a role permission', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DataProvider>{children}</DataProvider>
      );

      const { result } = renderHook(() => useData(), { wrapper });

      act(() => {
        result.current.setRolePermissions(mockRolePermissions);
        result.current.deleteRolePermission('1', '1');
      });

      expect(result.current.state.rolePermissions).toHaveLength(1);
      expect(result.current.state.rolePermissions[0].permissionId).toBe('2');
    });
  });

  describe('Reset operation', () => {
    it('should reset all state to initial values', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DataProvider>{children}</DataProvider>
      );

      const { result } = renderHook(() => useData(), { wrapper });

      // Set some data
      act(() => {
        result.current.setUsers([
          {
            id: '1',
            name: 'User',
            email: 'user@test.com',
            role: 'user',
            isActive: true,
          },
        ]);
        result.current.setRoles([{ id: '1', name: 'Role' }]);
        result.current.setUsersError('Some error');
        result.current.setUsersLoading(true);
      });

      // Reset
      act(() => {
        result.current.resetAll();
      });

      expect(result.current.state.users).toEqual([]);
      expect(result.current.state.roles).toEqual([]);
      expect(result.current.state.permissions).toEqual([]);
      expect(result.current.state.rolePermissions).toEqual([]);
      expect(result.current.state.loading).toEqual({
        users: false,
        roles: false,
        permissions: false,
        rolePermissions: false,
      });
      expect(result.current.state.errors).toEqual({
        users: null,
        roles: null,
        permissions: null,
        rolePermissions: null,
      });
    });
  });
});
