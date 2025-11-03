'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react';
import { usersApi, User, CreateUserDto, UpdateUserDto } from '../api/users';
import { rolesApi, Role, CreateRoleDto, UpdateRoleDto } from '../api/roles';
import { permissionsApi, Permission } from '../api/permissions';
import {
  rolePermissionsApi,
  RolePermission,
  CreateRolePermissionDto,
} from '../api/rolePermissions';

// State interface
interface DataState {
  users: User[];
  roles: Role[];
  permissions: Permission[];
  rolePermissions: RolePermission[];
  loading: {
    users: boolean;
    roles: boolean;
    permissions: boolean;
    rolePermissions: boolean;
  };
  errors: {
    users: string | null;
    roles: string | null;
    permissions: string | null;
    rolePermissions: string | null;
  };
}

// Action types
type DataAction =
  // Users
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_USERS_LOADING'; payload: boolean }
  | { type: 'SET_USERS_ERROR'; payload: string | null }
  // Roles
  | { type: 'SET_ROLES'; payload: Role[] }
  | { type: 'ADD_ROLE'; payload: Role }
  | { type: 'UPDATE_ROLE'; payload: Role }
  | { type: 'DELETE_ROLE'; payload: string }
  | { type: 'SET_ROLES_LOADING'; payload: boolean }
  | { type: 'SET_ROLES_ERROR'; payload: string | null }
  // Permissions
  | { type: 'SET_PERMISSIONS'; payload: Permission[] }
  | { type: 'SET_PERMISSIONS_LOADING'; payload: boolean }
  | { type: 'SET_PERMISSIONS_ERROR'; payload: string | null }
  // Role Permissions
  | { type: 'SET_ROLE_PERMISSIONS'; payload: RolePermission[] }
  | { type: 'ADD_ROLE_PERMISSION'; payload: RolePermission }
  | {
      type: 'DELETE_ROLE_PERMISSION';
      payload: { roleId: string; permissionId: string };
    }
  | { type: 'SET_ROLE_PERMISSIONS_LOADING'; payload: boolean }
  | { type: 'SET_ROLE_PERMISSIONS_ERROR'; payload: string | null }
  // Reset
  | { type: 'RESET_ALL' };

interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// Initial state
const initialState: DataState = {
  users: [],
  roles: [],
  permissions: [],
  rolePermissions: [],
  loading: {
    users: false,
    roles: false,
    permissions: false,
    rolePermissions: false,
  },
  errors: {
    users: null,
    roles: null,
    permissions: null,
    rolePermissions: null,
  },
};

// Reducer
const dataReducer = (state: DataState, action: DataAction): DataState => {
  switch (action.type) {
    // Users
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        ),
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
      };
    case 'SET_USERS_LOADING':
      return {
        ...state,
        loading: { ...state.loading, users: action.payload },
      };
    case 'SET_USERS_ERROR':
      return { ...state, errors: { ...state.errors, users: action.payload } };

    // Roles
    case 'SET_ROLES':
      return { ...state, roles: action.payload };
    case 'ADD_ROLE':
      return { ...state, roles: [...state.roles, action.payload] };
    case 'UPDATE_ROLE':
      return {
        ...state,
        roles: state.roles.map(role =>
          role.id === action.payload.id ? action.payload : role
        ),
      };
    case 'DELETE_ROLE':
      return {
        ...state,
        roles: state.roles.filter(role => role.id !== action.payload),
      };
    case 'SET_ROLES_LOADING':
      return {
        ...state,
        loading: { ...state.loading, roles: action.payload },
      };
    case 'SET_ROLES_ERROR':
      return { ...state, errors: { ...state.errors, roles: action.payload } };

    // Permissions
    case 'SET_PERMISSIONS':
      return { ...state, permissions: action.payload };
    case 'SET_PERMISSIONS_LOADING':
      return {
        ...state,
        loading: { ...state.loading, permissions: action.payload },
      };
    case 'SET_PERMISSIONS_ERROR':
      return {
        ...state,
        errors: { ...state.errors, permissions: action.payload },
      };

    // Role Permissions
    case 'SET_ROLE_PERMISSIONS':
      return { ...state, rolePermissions: action.payload };
    case 'ADD_ROLE_PERMISSION':
      return {
        ...state,
        rolePermissions: [...state.rolePermissions, action.payload],
      };
    case 'DELETE_ROLE_PERMISSION':
      return {
        ...state,
        rolePermissions: state.rolePermissions.filter(
          rp =>
            !(
              rp.roleId === action.payload.roleId &&
              rp.permissionId === action.payload.permissionId
            )
        ),
      };
    case 'SET_ROLE_PERMISSIONS_LOADING':
      return {
        ...state,
        loading: { ...state.loading, rolePermissions: action.payload },
      };
    case 'SET_ROLE_PERMISSIONS_ERROR':
      return {
        ...state,
        errors: { ...state.errors, rolePermissions: action.payload },
      };

    // Reset
    case 'RESET_ALL':
      return initialState;

    default:
      return state;
  }
};

// Context type
interface DataContextType {
  state: DataState;
  dispatch: React.Dispatch<DataAction>;
  // Helper functions
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  setUsersLoading: (loading: boolean) => void;
  setUsersError: (error: string | null) => void;
  fetchUsers: () => Promise<OperationResult<User[]>>;
  createUserAsync: (user: CreateUserDto) => Promise<OperationResult<User>>;
  updateUserAsync: (
    id: string,
    user: UpdateUserDto
  ) => Promise<OperationResult<User>>;
  deleteUserAsync: (id: string) => Promise<OperationResult<void>>;
  setRoles: (roles: Role[]) => void;
  addRole: (role: Role) => void;
  updateRole: (role: Role) => void;
  deleteRole: (id: string) => void;
  setRolesLoading: (loading: boolean) => void;
  setRolesError: (error: string | null) => void;
  fetchRoles: () => Promise<OperationResult<Role[]>>;
  createRoleAsync: (role: CreateRoleDto) => Promise<OperationResult<Role>>;
  updateRoleAsync: (
    id: string,
    role: UpdateRoleDto
  ) => Promise<OperationResult<Role>>;
  deleteRoleAsync: (id: string) => Promise<OperationResult<void>>;
  setPermissions: (permissions: Permission[]) => void;
  setPermissionsLoading: (loading: boolean) => void;
  setPermissionsError: (error: string | null) => void;
  fetchPermissions: () => Promise<OperationResult<Permission[]>>;
  setRolePermissions: (rolePermissions: RolePermission[]) => void;
  addRolePermission: (rolePermission: RolePermission) => void;
  deleteRolePermission: (roleId: string, permissionId: string) => void;
  setRolePermissionsLoading: (loading: boolean) => void;
  setRolePermissionsError: (error: string | null) => void;
  fetchRolePermissions: () => Promise<OperationResult<RolePermission[]>>;
  createRolePermissionAsync: (
    rolePermission: CreateRolePermissionDto
  ) => Promise<OperationResult<RolePermission>>;
  deleteRolePermissionAsync: (
    roleId: string,
    permissionId: string
  ) => Promise<OperationResult<void>>;
  resetAll: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Helper functions using useCallback to prevent unnecessary re-renders
  const setUsers = useCallback((users: User[]) => {
    dispatch({ type: 'SET_USERS', payload: users });
  }, []);

  const addUser = useCallback((user: User) => {
    dispatch({ type: 'ADD_USER', payload: user });
  }, []);

  const updateUser = useCallback((user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  }, []);

  const deleteUser = useCallback((id: string) => {
    dispatch({ type: 'DELETE_USER', payload: id });
  }, []);

  const setUsersLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_USERS_LOADING', payload: loading });
  }, []);

  const setUsersError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_USERS_ERROR', payload: error });
  }, []);

  const setRoles = useCallback((roles: Role[]) => {
    dispatch({ type: 'SET_ROLES', payload: roles });
  }, []);

  const addRole = useCallback((role: Role) => {
    dispatch({ type: 'ADD_ROLE', payload: role });
  }, []);

  const updateRole = useCallback((role: Role) => {
    dispatch({ type: 'UPDATE_ROLE', payload: role });
  }, []);

  const deleteRole = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ROLE', payload: id });
  }, []);

  const setRolesLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_ROLES_LOADING', payload: loading });
  }, []);

  const setRolesError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ROLES_ERROR', payload: error });
  }, []);

  const setPermissions = useCallback((permissions: Permission[]) => {
    dispatch({ type: 'SET_PERMISSIONS', payload: permissions });
  }, []);

  const setPermissionsLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_PERMISSIONS_LOADING', payload: loading });
  }, []);

  const setPermissionsError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_PERMISSIONS_ERROR', payload: error });
  }, []);

  const setRolePermissions = useCallback(
    (rolePermissions: RolePermission[]) => {
      dispatch({ type: 'SET_ROLE_PERMISSIONS', payload: rolePermissions });
    },
    []
  );

  const addRolePermission = useCallback((rolePermission: RolePermission) => {
    dispatch({ type: 'ADD_ROLE_PERMISSION', payload: rolePermission });
  }, []);

  const deleteRolePermission = useCallback(
    (roleId: string, permissionId: string) => {
      dispatch({
        type: 'DELETE_ROLE_PERMISSION',
        payload: { roleId, permissionId },
      });
    },
    []
  );

  const setRolePermissionsLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_ROLE_PERMISSIONS_LOADING', payload: loading });
  }, []);

  const setRolePermissionsError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ROLE_PERMISSIONS_ERROR', payload: error });
  }, []);

  const fetchUsers = useCallback(async (): Promise<OperationResult<User[]>> => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const response = await usersApi.getAll();
      if (response.error || !response.data) {
        const message =
          response.error || 'No se pudo cargar la lista de usuarios';
        setUsers([]);
        setUsersError(message);
        return { success: false, error: message };
      }

      setUsers(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo cargar la lista de usuarios';
      setUsersError(message);
      return { success: false, error: message };
    } finally {
      setUsersLoading(false);
    }
  }, [setUsers, setUsersError, setUsersLoading]);

  const createUserAsync = useCallback(
    async (data: CreateUserDto): Promise<OperationResult<User>> => {
      setUsersError(null);
      setUsersLoading(true);
      try {
        const response = await usersApi.create(data);
        if (response.error || !response.data) {
          const message = response.error || 'No se pudo crear el usuario';
          setUsersError(message);
          return { success: false, error: message };
        }

        addUser(response.data);
        return { success: true, data: response.data };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo crear el usuario';
        setUsersError(message);
        return { success: false, error: message };
      } finally {
        setUsersLoading(false);
      }
    },
    [addUser, setUsersError, setUsersLoading]
  );

  const updateUserAsync = useCallback(
    async (id: string, data: UpdateUserDto): Promise<OperationResult<User>> => {
      setUsersError(null);
      setUsersLoading(true);
      try {
        const response = await usersApi.update(id, data);
        if (response.error || !response.data) {
          const message = response.error || 'No se pudo actualizar el usuario';
          setUsersError(message);
          return { success: false, error: message };
        }

        updateUser(response.data);
        return { success: true, data: response.data };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo actualizar el usuario';
        setUsersError(message);
        return { success: false, error: message };
      } finally {
        setUsersLoading(false);
      }
    },
    [setUsersError, setUsersLoading, updateUser]
  );

  const deleteUserAsync = useCallback(
    async (id: string): Promise<OperationResult<void>> => {
      setUsersError(null);
      setUsersLoading(true);
      try {
        const response = await usersApi.delete(id);
        if (response.error) {
          const message = response.error || 'No se pudo eliminar el usuario';
          setUsersError(message);
          return { success: false, error: message };
        }

        deleteUser(id);
        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo eliminar el usuario';
        setUsersError(message);
        return { success: false, error: message };
      } finally {
        setUsersLoading(false);
      }
    },
    [deleteUser, setUsersError, setUsersLoading]
  );

  const fetchRoles = useCallback(async (): Promise<OperationResult<Role[]>> => {
    setRolesLoading(true);
    setRolesError(null);
    try {
      const response = await rolesApi.getAll();
      if (response.error || !response.data) {
        const message = response.error || 'No se pudieron cargar los roles';
        setRoles([]);
        setRolesError(message);
        return { success: false, error: message };
      }

      setRoles(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar los roles';
      setRolesError(message);
      return { success: false, error: message };
    } finally {
      setRolesLoading(false);
    }
  }, [setRoles, setRolesError, setRolesLoading]);

  const createRoleAsync = useCallback(
    async (data: CreateRoleDto): Promise<OperationResult<Role>> => {
      setRolesError(null);
      setRolesLoading(true);
      try {
        const response = await rolesApi.create(data);
        if (response.error || !response.data) {
          const message = response.error || 'No se pudo crear el rol';
          setRolesError(message);
          return { success: false, error: message };
        }

        addRole(response.data);
        return { success: true, data: response.data };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'No se pudo crear el rol';
        setRolesError(message);
        return { success: false, error: message };
      } finally {
        setRolesLoading(false);
      }
    },
    [addRole, setRolesError, setRolesLoading]
  );

  const updateRoleAsync = useCallback(
    async (id: string, data: UpdateRoleDto): Promise<OperationResult<Role>> => {
      setRolesError(null);
      setRolesLoading(true);
      try {
        const response = await rolesApi.update(id, data);
        if (response.error || !response.data) {
          const message = response.error || 'No se pudo actualizar el rol';
          setRolesError(message);
          return { success: false, error: message };
        }

        updateRole(response.data);
        return { success: true, data: response.data };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo actualizar el rol';
        setRolesError(message);
        return { success: false, error: message };
      } finally {
        setRolesLoading(false);
      }
    },
    [setRolesError, setRolesLoading, updateRole]
  );

  const deleteRoleAsync = useCallback(
    async (id: string): Promise<OperationResult<void>> => {
      setRolesError(null);
      setRolesLoading(true);
      try {
        const response = await rolesApi.delete(id);
        if (response.error) {
          const message = response.error || 'No se pudo eliminar el rol';
          setRolesError(message);
          return { success: false, error: message };
        }

        deleteRole(id);
        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'No se pudo eliminar el rol';
        setRolesError(message);
        return { success: false, error: message };
      } finally {
        setRolesLoading(false);
      }
    },
    [deleteRole, setRolesError, setRolesLoading]
  );

  const fetchPermissions = useCallback(async (): Promise<
    OperationResult<Permission[]>
  > => {
    setPermissionsLoading(true);
    setPermissionsError(null);
    try {
      const response = await permissionsApi.getAll();
      if (response.error || !response.data) {
        const message = response.error || 'No se pudieron cargar los permisos';
        setPermissions([]);
        setPermissionsError(message);
        return { success: false, error: message };
      }

      setPermissions(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar los permisos';
      setPermissionsError(message);
      return { success: false, error: message };
    } finally {
      setPermissionsLoading(false);
    }
  }, [setPermissions, setPermissionsError, setPermissionsLoading]);

  const fetchRolePermissions = useCallback(async (): Promise<
    OperationResult<RolePermission[]>
  > => {
    setRolePermissionsLoading(true);
    setRolePermissionsError(null);
    try {
      const response = await rolePermissionsApi.getAll();
      if (response.error || !response.data) {
        const message =
          response.error || 'No se pudieron cargar las asignaciones';
        setRolePermissions([]);
        setRolePermissionsError(message);
        return { success: false, error: message };
      }

      setRolePermissions(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar las asignaciones';
      setRolePermissionsError(message);
      return { success: false, error: message };
    } finally {
      setRolePermissionsLoading(false);
    }
  }, [setRolePermissions, setRolePermissionsError, setRolePermissionsLoading]);

  const createRolePermissionAsync = useCallback(
    async (
      data: CreateRolePermissionDto
    ): Promise<OperationResult<RolePermission>> => {
      setRolePermissionsError(null);
      setRolePermissionsLoading(true);
      try {
        const response = await rolePermissionsApi.create(data);
        if (response.error || !response.data) {
          const message =
            response.error || 'No se pudo asignar el permiso al rol';
          setRolePermissionsError(message);
          return { success: false, error: message };
        }

        addRolePermission(response.data);
        return { success: true, data: response.data };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo asignar el permiso al rol';
        setRolePermissionsError(message);
        return { success: false, error: message };
      } finally {
        setRolePermissionsLoading(false);
      }
    },
    [addRolePermission, setRolePermissionsError, setRolePermissionsLoading]
  );

  const deleteRolePermissionAsync = useCallback(
    async (
      roleId: string,
      permissionId: string
    ): Promise<OperationResult<void>> => {
      setRolePermissionsError(null);
      setRolePermissionsLoading(true);
      try {
        const response = await rolePermissionsApi.delete(roleId, permissionId);
        if (response.error) {
          const message = response.error || 'No se pudo eliminar la asignación';
          setRolePermissionsError(message);
          return { success: false, error: message };
        }

        deleteRolePermission(roleId, permissionId);
        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo eliminar la asignación';
        setRolePermissionsError(message);
        return { success: false, error: message };
      } finally {
        setRolePermissionsLoading(false);
      }
    },
    [deleteRolePermission, setRolePermissionsError, setRolePermissionsLoading]
  );

  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
  }, []);

  return (
    <DataContext.Provider
      value={{
        state,
        dispatch,
        setUsers,
        addUser,
        updateUser,
        deleteUser,
        setUsersLoading,
        setUsersError,
        fetchUsers,
        createUserAsync,
        updateUserAsync,
        deleteUserAsync,
        setRoles,
        addRole,
        updateRole,
        deleteRole,
        setRolesLoading,
        setRolesError,
        fetchRoles,
        createRoleAsync,
        updateRoleAsync,
        deleteRoleAsync,
        setPermissions,
        setPermissionsLoading,
        setPermissionsError,
        fetchPermissions,
        setRolePermissions,
        addRolePermission,
        deleteRolePermission,
        setRolePermissionsLoading,
        setRolePermissionsError,
        fetchRolePermissions,
        createRolePermissionAsync,
        deleteRolePermissionAsync,
        resetAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
