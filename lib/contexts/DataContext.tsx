'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react';
import { User } from '../api/users';
import { Role } from '../api/roles';
import { Permission } from '../api/permissions';
import { RolePermission } from '../api/rolePermissions';

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
  setRoles: (roles: Role[]) => void;
  addRole: (role: Role) => void;
  updateRole: (role: Role) => void;
  deleteRole: (id: string) => void;
  setRolesLoading: (loading: boolean) => void;
  setRolesError: (error: string | null) => void;
  setPermissions: (permissions: Permission[]) => void;
  setPermissionsLoading: (loading: boolean) => void;
  setPermissionsError: (error: string | null) => void;
  setRolePermissions: (rolePermissions: RolePermission[]) => void;
  addRolePermission: (rolePermission: RolePermission) => void;
  deleteRolePermission: (roleId: string, permissionId: string) => void;
  setRolePermissionsLoading: (loading: boolean) => void;
  setRolePermissionsError: (error: string | null) => void;
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
        setRoles,
        addRole,
        updateRole,
        deleteRole,
        setRolesLoading,
        setRolesError,
        setPermissions,
        setPermissionsLoading,
        setPermissionsError,
        setRolePermissions,
        addRolePermission,
        deleteRolePermission,
        setRolePermissionsLoading,
        setRolePermissionsError,
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
