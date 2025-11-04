'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
} from 'react';
import {
  habitsApi,
  Habit,
  CreateHabitDto,
  UpdateHabitDto,
} from '../api/habits';
import { hivesApi, Hive, CreateHiveDto, UpdateHiveDto } from '../api/hives';
import {
  hiveMembersApi,
  HiveMember,
  CreateHiveMemberDto,
  UpdateHiveMemberDto,
} from '../api/hiveMembers';

interface HabitHiveState {
  habits: Habit[];
  hives: Hive[];
  hiveMembers: HiveMember[];
  loading: {
    habits: boolean;
    hives: boolean;
    hiveMembers: boolean;
  };
  errors: {
    habits: string | null;
    hives: string | null;
    hiveMembers: string | null;
  };
}

type HabitHiveAction =
  | { type: 'SET_HABITS'; payload: Habit[] }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'SET_HABITS_LOADING'; payload: boolean }
  | { type: 'SET_HABITS_ERROR'; payload: string | null }
  | { type: 'SET_HIVES'; payload: Hive[] }
  | { type: 'ADD_HIVE'; payload: Hive }
  | { type: 'UPDATE_HIVE'; payload: Hive }
  | { type: 'DELETE_HIVE'; payload: string }
  | { type: 'SET_HIVES_LOADING'; payload: boolean }
  | { type: 'SET_HIVES_ERROR'; payload: string | null }
  | { type: 'SET_HIVE_MEMBERS'; payload: HiveMember[] }
  | { type: 'ADD_HIVE_MEMBER'; payload: HiveMember }
  | { type: 'UPDATE_HIVE_MEMBER'; payload: HiveMember }
  | {
      type: 'DELETE_HIVE_MEMBER';
      payload: { hiveId: string; userId: string };
    }
  | { type: 'SET_HIVE_MEMBERS_LOADING'; payload: boolean }
  | { type: 'SET_HIVE_MEMBERS_ERROR'; payload: string | null }
  | { type: 'RESET_ALL' };

interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

interface HabitHiveContextType {
  state: HabitHiveState;
  dispatch: React.Dispatch<HabitHiveAction>;
  setHabits: (habits: Habit[]) => void;
  addHabit: (habit: Habit) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  setHabitsLoading: (loading: boolean) => void;
  setHabitsError: (error: string | null) => void;
  fetchHabits: () => Promise<OperationResult<Habit[]>>;
  createHabitAsync: (data: CreateHabitDto) => Promise<OperationResult<Habit>>;
  updateHabitAsync: (
    id: string,
    data: UpdateHabitDto
  ) => Promise<OperationResult<Habit>>;
  deleteHabitAsync: (id: string) => Promise<OperationResult<void>>;
  setHives: (hives: Hive[]) => void;
  addHive: (hive: Hive) => void;
  updateHive: (hive: Hive) => void;
  deleteHive: (id: string) => void;
  setHivesLoading: (loading: boolean) => void;
  setHivesError: (error: string | null) => void;
  fetchHives: () => Promise<OperationResult<Hive[]>>;
  createHiveAsync: (data: CreateHiveDto) => Promise<OperationResult<Hive>>;
  updateHiveAsync: (
    id: string,
    data: UpdateHiveDto
  ) => Promise<OperationResult<Hive>>;
  deleteHiveAsync: (id: string) => Promise<OperationResult<void>>;
  setHiveMembers: (members: HiveMember[]) => void;
  addHiveMember: (member: HiveMember) => void;
  updateHiveMember: (member: HiveMember) => void;
  deleteHiveMember: (hiveId: string, userId: string) => void;
  setHiveMembersLoading: (loading: boolean) => void;
  setHiveMembersError: (error: string | null) => void;
  fetchHiveMembers: () => Promise<OperationResult<HiveMember[]>>;
  createHiveMemberAsync: (
    data: CreateHiveMemberDto
  ) => Promise<OperationResult<HiveMember>>;
  updateHiveMemberAsync: (
    id: string,
    data: UpdateHiveMemberDto
  ) => Promise<OperationResult<HiveMember>>;
  deleteHiveMemberAsync: (
    hiveId: string,
    userId: string
  ) => Promise<OperationResult<void>>;
  resetAll: () => void;
}

const initialState: HabitHiveState = {
  habits: [],
  hives: [],
  hiveMembers: [],
  loading: {
    habits: false,
    hives: false,
    hiveMembers: false,
  },
  errors: {
    habits: null,
    hives: null,
    hiveMembers: null,
  },
};

const habitHiveReducer = (
  state: HabitHiveState,
  action: HabitHiveAction
): HabitHiveState => {
  switch (action.type) {
    case 'SET_HABITS':
      return { ...state, habits: action.payload };
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] };
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(habit =>
          habit.id === action.payload.id ? action.payload : habit
        ),
      };
    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(habit => habit.id !== action.payload),
      };
    case 'SET_HABITS_LOADING':
      return {
        ...state,
        loading: { ...state.loading, habits: action.payload },
      };
    case 'SET_HABITS_ERROR':
      return {
        ...state,
        errors: { ...state.errors, habits: action.payload },
      };
    case 'SET_HIVES':
      return { ...state, hives: action.payload };
    case 'ADD_HIVE':
      return { ...state, hives: [...state.hives, action.payload] };
    case 'UPDATE_HIVE':
      return {
        ...state,
        hives: state.hives.map(hive =>
          hive.id === action.payload.id ? action.payload : hive
        ),
      };
    case 'DELETE_HIVE':
      return {
        ...state,
        hives: state.hives.filter(hive => hive.id !== action.payload),
      };
    case 'SET_HIVES_LOADING':
      return {
        ...state,
        loading: { ...state.loading, hives: action.payload },
      };
    case 'SET_HIVES_ERROR':
      return {
        ...state,
        errors: { ...state.errors, hives: action.payload },
      };
    case 'SET_HIVE_MEMBERS':
      return { ...state, hiveMembers: action.payload };
    case 'ADD_HIVE_MEMBER':
      return {
        ...state,
        hiveMembers: [...state.hiveMembers, action.payload],
      };
    case 'UPDATE_HIVE_MEMBER':
      return {
        ...state,
        hiveMembers: state.hiveMembers.map(member =>
          member.id === action.payload.id ? action.payload : member
        ),
      };
    case 'DELETE_HIVE_MEMBER':
      return {
        ...state,
        hiveMembers: state.hiveMembers.filter(
          member =>
            !(
              member.hiveId === action.payload.hiveId &&
              member.userId === action.payload.userId
            )
        ),
      };
    case 'SET_HIVE_MEMBERS_LOADING':
      return {
        ...state,
        loading: { ...state.loading, hiveMembers: action.payload },
      };
    case 'SET_HIVE_MEMBERS_ERROR':
      return {
        ...state,
        errors: { ...state.errors, hiveMembers: action.payload },
      };
    case 'RESET_ALL':
      return initialState;
    default:
      return state;
  }
};

const HabitHiveContext = createContext<HabitHiveContextType | undefined>(
  undefined
);

export const HabitHiveProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(habitHiveReducer, initialState);

  const setHabits = useCallback((habits: Habit[]) => {
    dispatch({ type: 'SET_HABITS', payload: habits });
  }, []);

  const addHabit = useCallback((habit: Habit) => {
    dispatch({ type: 'ADD_HABIT', payload: habit });
  }, []);

  const updateHabit = useCallback((habit: Habit) => {
    dispatch({ type: 'UPDATE_HABIT', payload: habit });
  }, []);

  const deleteHabit = useCallback((id: string) => {
    dispatch({ type: 'DELETE_HABIT', payload: id });
  }, []);

  const setHabitsLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_HABITS_LOADING', payload: loading });
  }, []);

  const setHabitsError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_HABITS_ERROR', payload: error });
  }, []);

  const setHives = useCallback((hives: Hive[]) => {
    dispatch({ type: 'SET_HIVES', payload: hives });
  }, []);

  const addHive = useCallback((hive: Hive) => {
    dispatch({ type: 'ADD_HIVE', payload: hive });
  }, []);

  const updateHive = useCallback((hive: Hive) => {
    dispatch({ type: 'UPDATE_HIVE', payload: hive });
  }, []);

  const deleteHive = useCallback((id: string) => {
    dispatch({ type: 'DELETE_HIVE', payload: id });
  }, []);

  const setHivesLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_HIVES_LOADING', payload: loading });
  }, []);

  const setHivesError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_HIVES_ERROR', payload: error });
  }, []);

  const setHiveMembers = useCallback((members: HiveMember[]) => {
    dispatch({ type: 'SET_HIVE_MEMBERS', payload: members });
  }, []);

  const addHiveMember = useCallback((member: HiveMember) => {
    dispatch({ type: 'ADD_HIVE_MEMBER', payload: member });
  }, []);

  const updateHiveMember = useCallback((member: HiveMember) => {
    dispatch({ type: 'UPDATE_HIVE_MEMBER', payload: member });
  }, []);

  const deleteHiveMember = useCallback((hiveId: string, userId: string) => {
    dispatch({
      type: 'DELETE_HIVE_MEMBER',
      payload: { hiveId, userId },
    });
  }, []);

  const setHiveMembersLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_HIVE_MEMBERS_LOADING', payload: loading });
  }, []);

  const setHiveMembersError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_HIVE_MEMBERS_ERROR', payload: error });
  }, []);

  const fetchHabits = useCallback(async (): Promise<
    OperationResult<Habit[]>
  > => {
    setHabitsLoading(true);
    setHabitsError(null);
    try {
      const response = await habitsApi.getAll();
      if (response.error || !response.data) {
        const message = response.error || 'No se pudieron cargar los hábitos';
        setHabits([]);
        setHabitsError(message);
        return { success: false, error: message };
      }

      setHabits(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar los hábitos';
      setHabitsError(message);
      return { success: false, error: message };
    } finally {
      setHabitsLoading(false);
    }
  }, [setHabits, setHabitsError, setHabitsLoading]);

  const createHabitAsync = useCallback(
    async (data: CreateHabitDto): Promise<OperationResult<Habit>> => {
      setHabitsError(null);
      setHabitsLoading(true);
      try {
        const response = await habitsApi.create(data);
        if (response.error || !response.data) {
          const message = response.error || 'No se pudo crear el hábito';
          setHabitsError(message);
          return { success: false, error: message };
        }

        addHabit(response.data);
        return { success: true, data: response.data };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'No se pudo crear el hábito';
        setHabitsError(message);
        return { success: false, error: message };
      } finally {
        setHabitsLoading(false);
      }
    },
    [addHabit, setHabitsError, setHabitsLoading]
  );

  const updateHabitAsync = useCallback(
    async (
      id: string,
      data: UpdateHabitDto
    ): Promise<OperationResult<Habit>> => {
      setHabitsError(null);
      setHabitsLoading(true);
      try {
        const response = await habitsApi.update(id, data);
        if (response.error || !response.data) {
          const message = response.error || 'No se pudo actualizar el hábito';
          setHabitsError(message);
          return { success: false, error: message };
        }

        updateHabit(response.data);
        return { success: true, data: response.data };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo actualizar el hábito';
        setHabitsError(message);
        return { success: false, error: message };
      } finally {
        setHabitsLoading(false);
      }
    },
    [setHabitsError, setHabitsLoading, updateHabit]
  );

  const deleteHabitAsync = useCallback(
    async (id: string): Promise<OperationResult<void>> => {
      setHabitsError(null);
      setHabitsLoading(true);
      try {
        const response = await habitsApi.delete(id);
        if (response.error) {
          const message =
            response.status === 400
              ? 'Error: Hay colmenas asociadas a este hábito'
              : response.error || 'No se pudo eliminar el hábito';
          setHabitsError(message);
          return { success: false, error: message };
        }

        deleteHabit(id);
        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo eliminar el hábito';
        setHabitsError(message);
        return { success: false, error: message };
      } finally {
        setHabitsLoading(false);
      }
    },
    [deleteHabit, setHabitsError, setHabitsLoading]
  );

  const fetchHives = useCallback(async (): Promise<OperationResult<Hive[]>> => {
    setHivesLoading(true);
    setHivesError(null);
    try {
      const response = await hivesApi.getAll();
      if (response.error || !response.data) {
        const message = response.error || 'No se pudieron cargar las colmenas';
        setHives([]);
        setHivesError(message);
        return { success: false, error: message };
      }

      setHives(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar las colmenas';
      setHivesError(message);
      return { success: false, error: message };
    } finally {
      setHivesLoading(false);
    }
  }, [setHives, setHivesError, setHivesLoading]);

  const createHiveAsync = useCallback(
    async (data: CreateHiveDto): Promise<OperationResult<Hive>> => {
      setHivesError(null);
      setHivesLoading(true);
      try {
        const response = await hivesApi.create(data);
        if (response.error || !response.data) {
          const message = response.error || 'No se pudo crear la colmena';
          setHivesError(message);
          return { success: false, error: message };
        }

        addHive(response.data);
        return { success: true, data: response.data };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo crear la colmena';
        setHivesError(message);
        return { success: false, error: message };
      } finally {
        setHivesLoading(false);
      }
    },
    [addHive, setHivesError, setHivesLoading]
  );

  const updateHiveAsync = useCallback(
    async (id: string, data: UpdateHiveDto): Promise<OperationResult<Hive>> => {
      setHivesError(null);
      setHivesLoading(true);
      try {
        const response = await hivesApi.update(id, data);
        if (response.error || !response.data) {
          const message = response.error || 'No se pudo actualizar la colmena';
          setHivesError(message);
          return { success: false, error: message };
        }

        updateHive(response.data);
        return { success: true, data: response.data };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo actualizar la colmena';
        setHivesError(message);
        return { success: false, error: message };
      } finally {
        setHivesLoading(false);
      }
    },
    [setHivesError, setHivesLoading, updateHive]
  );

  const deleteHiveAsync = useCallback(
    async (id: string): Promise<OperationResult<void>> => {
      setHivesError(null);
      setHivesLoading(true);
      try {
        const response = await hivesApi.delete(id);
        if (response.error) {
          const message = response.error || 'No se pudo eliminar la colmena';
          setHivesError(message);
          return { success: false, error: message };
        }

        deleteHive(id);
        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo eliminar la colmena';
        setHivesError(message);
        return { success: false, error: message };
      } finally {
        setHivesLoading(false);
      }
    },
    [deleteHive, setHivesError, setHivesLoading]
  );

  const fetchHiveMembers = useCallback(async (): Promise<
    OperationResult<HiveMember[]>
  > => {
    setHiveMembersLoading(true);
    setHiveMembersError(null);
    try {
      const response = await hiveMembersApi.getAll();
      if (response.error || !response.data) {
        const message =
          response.error || 'No se pudieron cargar los miembros de colmenas';
        setHiveMembers([]);
        setHiveMembersError(message);
        return { success: false, error: message };
      }

      setHiveMembers(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar los miembros de colmenas';
      setHiveMembersError(message);
      return { success: false, error: message };
    } finally {
      setHiveMembersLoading(false);
    }
  }, [setHiveMembers, setHiveMembersError, setHiveMembersLoading]);

  const createHiveMemberAsync = useCallback(
    async (data: CreateHiveMemberDto): Promise<OperationResult<HiveMember>> => {
      setHiveMembersError(null);
      setHiveMembersLoading(true);
      try {
        const response = await hiveMembersApi.create(data);
        if (response.error || !response.data) {
          const message =
            response.error || 'No se pudo agregar el miembro a la colmena';
          setHiveMembersError(message);
          return { success: false, error: message };
        }

        addHiveMember(response.data);
        return { success: true, data: response.data };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo agregar el miembro a la colmena';
        setHiveMembersError(message);
        return { success: false, error: message };
      } finally {
        setHiveMembersLoading(false);
      }
    },
    [addHiveMember, setHiveMembersError, setHiveMembersLoading]
  );

  const updateHiveMemberAsync = useCallback(
    async (
      id: string,
      data: UpdateHiveMemberDto
    ): Promise<OperationResult<HiveMember>> => {
      setHiveMembersError(null);
      setHiveMembersLoading(true);
      try {
        const response = await hiveMembersApi.update(id, data);
        if (response.error || !response.data) {
          const message =
            response.error || 'No se pudo actualizar el miembro de la colmena';
          setHiveMembersError(message);
          return { success: false, error: message };
        }

        updateHiveMember(response.data);
        return { success: true, data: response.data };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo actualizar el miembro de la colmena';
        setHiveMembersError(message);
        return { success: false, error: message };
      } finally {
        setHiveMembersLoading(false);
      }
    },
    [setHiveMembersError, setHiveMembersLoading, updateHiveMember]
  );

  const deleteHiveMemberAsync = useCallback(
    async (hiveId: string, userId: string): Promise<OperationResult<void>> => {
      setHiveMembersError(null);
      setHiveMembersLoading(true);
      try {
        const response = await hiveMembersApi.delete(hiveId, userId);
        if (response.error) {
          const message =
            response.error || 'No se pudo eliminar el miembro de la colmena';
          setHiveMembersError(message);
          return { success: false, error: message };
        }

        deleteHiveMember(hiveId, userId);
        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo eliminar el miembro de la colmena';
        setHiveMembersError(message);
        return { success: false, error: message };
      } finally {
        setHiveMembersLoading(false);
      }
    },
    [deleteHiveMember, setHiveMembersError, setHiveMembersLoading]
  );

  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
  }, []);

  return (
    <HabitHiveContext.Provider
      value={{
        state,
        dispatch,
        setHabits,
        addHabit,
        updateHabit,
        deleteHabit,
        setHabitsLoading,
        setHabitsError,
        fetchHabits,
        createHabitAsync,
        updateHabitAsync,
        deleteHabitAsync,
        setHives,
        addHive,
        updateHive,
        deleteHive,
        setHivesLoading,
        setHivesError,
        fetchHives,
        createHiveAsync,
        updateHiveAsync,
        deleteHiveAsync,
        setHiveMembers,
        addHiveMember,
        updateHiveMember,
        deleteHiveMember,
        setHiveMembersLoading,
        setHiveMembersError,
        fetchHiveMembers,
        createHiveMemberAsync,
        updateHiveMemberAsync,
        deleteHiveMemberAsync,
        resetAll,
      }}
    >
      {children}
    </HabitHiveContext.Provider>
  );
};

export const useHabitHive = () => {
  const context = useContext(HabitHiveContext);
  if (context === undefined) {
    throw new Error('useHabitHive must be used within a HabitHiveProvider');
  }
  return context;
};
