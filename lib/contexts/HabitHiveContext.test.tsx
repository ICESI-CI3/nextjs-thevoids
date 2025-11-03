import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { HabitHiveProvider, useHabitHive } from './HabitHiveContext';
import { habitsApi } from '@/lib/api/habits';
import { hivesApi } from '@/lib/api/hives';
import { hiveMembersApi } from '@/lib/api/hiveMembers';

jest.mock('@/lib/api/habits');
jest.mock('@/lib/api/hives');
jest.mock('@/lib/api/hiveMembers');

describe('HabitHiveContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Provider', () => {
    it('should throw error when used outside HabitHiveProvider', () => {
      expect(() => {
        renderHook(() => useHabitHive());
      }).toThrow('useHabitHive must be used within a HabitHiveProvider');
    });

    it('should provide habit hive context when used within HabitHiveProvider', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HabitHiveProvider>{children}</HabitHiveProvider>
      );

      const { result } = renderHook(() => useHabitHive(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.state).toBeDefined();
      expect(result.current.state.habits).toEqual([]);
      expect(result.current.state.hives).toEqual([]);
      expect(result.current.state.hiveMembers).toEqual([]);
    });
  });

  describe('fetchHabits', () => {
    it('should fetch habits successfully', async () => {
      const mockHabits = [
        { id: '1', title: 'Habit 1', type: 'objective' },
        { id: '2', title: 'Habit 2', type: 'subjective' },
      ];

      (habitsApi.getAll as jest.Mock).mockResolvedValue({
        data: mockHabits,
        error: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HabitHiveProvider>{children}</HabitHiveProvider>
      );

      const { result } = renderHook(() => useHabitHive(), { wrapper });

      await act(async () => {
        await result.current.fetchHabits();
      });

      await waitFor(() => {
        expect(result.current.state.habits).toEqual(mockHabits);
        expect(result.current.state.loading.habits).toBe(false);
        expect(result.current.state.errors.habits).toBeNull();
      });
    });

    it('should handle fetch habits error', async () => {
      (habitsApi.getAll as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Failed to fetch habits',
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HabitHiveProvider>{children}</HabitHiveProvider>
      );

      const { result } = renderHook(() => useHabitHive(), { wrapper });

      await act(async () => {
        await result.current.fetchHabits();
      });

      await waitFor(() => {
        expect(result.current.state.errors.habits).toBe(
          'Failed to fetch habits'
        );
        expect(result.current.state.loading.habits).toBe(false);
      });
    });
  });

  describe('fetchHives', () => {
    it('should fetch hives successfully', async () => {
      const mockHives = [
        { id: '1', name: 'Hive 1', status: 'open' },
        { id: '2', name: 'Hive 2', status: 'in_progress' },
      ];

      (hivesApi.getAll as jest.Mock).mockResolvedValue({
        data: mockHives,
        error: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HabitHiveProvider>{children}</HabitHiveProvider>
      );

      const { result } = renderHook(() => useHabitHive(), { wrapper });

      await act(async () => {
        await result.current.fetchHives();
      });

      await waitFor(() => {
        expect(result.current.state.hives).toEqual(mockHives);
        expect(result.current.state.loading.hives).toBe(false);
        expect(result.current.state.errors.hives).toBeNull();
      });
    });
  });

  describe('createHabitAsync', () => {
    it('should create habit successfully', async () => {
      const newHabit = { title: 'New Habit', type: 'objective' };
      const createdHabit = { id: '3', ...newHabit };

      (habitsApi.create as jest.Mock).mockResolvedValue({
        data: createdHabit,
        error: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HabitHiveProvider>{children}</HabitHiveProvider>
      );

      const { result } = renderHook(() => useHabitHive(), { wrapper });

      let createResult: any;
      await act(async () => {
        createResult = await result.current.createHabitAsync(newHabit as any);
      });

      expect(createResult?.success).toBe(true);
      expect(createResult?.data).toEqual(expect.objectContaining(createdHabit));
      expect(createResult?.error).toBeUndefined();
    });

    it('should handle create habit error', async () => {
      const newHabit = { title: 'New Habit', type: 'objective' };

      (habitsApi.create as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Failed to create habit',
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HabitHiveProvider>{children}</HabitHiveProvider>
      );

      const { result } = renderHook(() => useHabitHive(), { wrapper });

      let createResult: any;
      await act(async () => {
        createResult = await result.current.createHabitAsync(newHabit as any);
      });

      expect(createResult?.success).toBe(false);
      expect(createResult?.error).toBe('Failed to create habit');
    });
  });

  describe('updateHabitAsync', () => {
    it('should update habit successfully', async () => {
      const updatedHabit = {
        id: '1',
        title: 'Updated Habit',
        type: 'objective',
      };

      (habitsApi.update as jest.Mock).mockResolvedValue({
        data: updatedHabit,
        error: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HabitHiveProvider>{children}</HabitHiveProvider>
      );

      const { result } = renderHook(() => useHabitHive(), { wrapper });

      let updateResult: any;
      await act(async () => {
        updateResult = await result.current.updateHabitAsync('1', {
          title: 'Updated Habit',
        });
      });

      expect(updateResult?.success).toBe(true);
      expect(updateResult?.data).toEqual(expect.objectContaining(updatedHabit));
      expect(updateResult?.error).toBeUndefined();
    });
  });

  describe('deleteHabitAsync', () => {
    it('should delete habit successfully', async () => {
      (habitsApi.delete as jest.Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HabitHiveProvider>{children}</HabitHiveProvider>
      );

      const { result } = renderHook(() => useHabitHive(), { wrapper });

      let deleteResult: any;
      await act(async () => {
        deleteResult = await result.current.deleteHabitAsync('1');
      });

      expect(deleteResult?.success).toBe(true);
      expect(deleteResult?.error).toBeUndefined();
    });
  });

  describe('Error setters', () => {
    it('should set habits error', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HabitHiveProvider>{children}</HabitHiveProvider>
      );

      const { result } = renderHook(() => useHabitHive(), { wrapper });

      act(() => {
        result.current.setHabitsError('Test error');
      });

      expect(result.current.state.errors.habits).toBe('Test error');
    });

    it('should set hives error', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HabitHiveProvider>{children}</HabitHiveProvider>
      );

      const { result } = renderHook(() => useHabitHive(), { wrapper });

      act(() => {
        result.current.setHivesError('Test error');
      });

      expect(result.current.state.errors.hives).toBe('Test error');
    });

    it('should set hive members error', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HabitHiveProvider>{children}</HabitHiveProvider>
      );

      const { result } = renderHook(() => useHabitHive(), { wrapper });

      act(() => {
        result.current.setHiveMembersError('Test error');
      });

      expect(result.current.state.errors.hiveMembers).toBe('Test error');
    });
  });

  describe('Hive operations', () => {
    it('should create hive successfully', async () => {
      const newHive = { name: 'New Hive', durationDays: 30 };
      const createdHive = { id: '1', ...newHive };

      (hivesApi.create as jest.Mock).mockResolvedValue({
        data: createdHive,
        error: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HabitHiveProvider>{children}</HabitHiveProvider>
      );

      const { result } = renderHook(() => useHabitHive(), { wrapper });

      let createResult: any;
      await act(async () => {
        createResult = await result.current.createHiveAsync(newHive as any);
      });

      expect(createResult?.success).toBe(true);
      expect(createResult?.data).toEqual(expect.objectContaining(createdHive));
      expect(createResult?.error).toBeUndefined();
    });

    it('should update hive successfully', async () => {
      const updatedHive = { id: '1', name: 'Updated Hive' };

      (hivesApi.update as jest.Mock).mockResolvedValue({
        data: updatedHive,
        error: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HabitHiveProvider>{children}</HabitHiveProvider>
      );

      const { result } = renderHook(() => useHabitHive(), { wrapper });

      let updateResult: any;
      await act(async () => {
        updateResult = await result.current.updateHiveAsync('1', {
          name: 'Updated Hive',
        });
      });

      expect(updateResult?.success).toBe(true);
      expect(updateResult?.data).toEqual(expect.objectContaining(updatedHive));
      expect(updateResult?.error).toBeUndefined();
    });

    it('should delete hive successfully', async () => {
      (hivesApi.delete as jest.Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HabitHiveProvider>{children}</HabitHiveProvider>
      );

      const { result } = renderHook(() => useHabitHive(), { wrapper });

      let deleteResult: any;
      await act(async () => {
        deleteResult = await result.current.deleteHiveAsync('1');
      });

      expect(deleteResult?.success).toBe(true);
      expect(deleteResult?.error).toBeUndefined();
    });
  });

  describe('Member operations', () => {
    it('should fetch hive members successfully', async () => {
      const mockMembers = [
        { id: '1', userId: 'user-1', hiveId: 'hive-1', role: 'member' },
      ];

      (hiveMembersApi.getAll as jest.Mock).mockResolvedValue({
        data: mockMembers,
        error: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HabitHiveProvider>{children}</HabitHiveProvider>
      );

      const { result } = renderHook(() => useHabitHive(), { wrapper });

      await act(async () => {
        await result.current.fetchHiveMembers();
      });

      await waitFor(() => {
        expect(result.current.state.hiveMembers).toEqual(mockMembers);
      });
    });

    it('should create hive member successfully', async () => {
      const newMember = { userId: 'user-1', hiveId: 'hive-1', role: 'member' };
      const createdMember = { id: '1', ...newMember };

      (hiveMembersApi.create as jest.Mock).mockResolvedValue({
        data: createdMember,
        error: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HabitHiveProvider>{children}</HabitHiveProvider>
      );

      const { result } = renderHook(() => useHabitHive(), { wrapper });

      let createResult: any;
      await act(async () => {
        createResult = await result.current.createHiveMemberAsync(
          newMember as any
        );
      });

      expect(createResult?.success).toBe(true);
      expect(createResult?.data).toEqual(
        expect.objectContaining(createdMember)
      );
      expect(createResult?.error).toBeUndefined();
    });

    it('should update hive member successfully', async () => {
      const updatedMember = { id: '1', role: 'moderator' };

      (hiveMembersApi.update as jest.Mock).mockResolvedValue({
        data: updatedMember,
        error: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HabitHiveProvider>{children}</HabitHiveProvider>
      );

      const { result } = renderHook(() => useHabitHive(), { wrapper });

      let updateResult: any;
      await act(async () => {
        updateResult = await result.current.updateHiveMemberAsync('1', {
          role: 'moderator',
        } as any);
      });

      expect(updateResult?.success).toBe(true);
      expect(updateResult?.data).toEqual(
        expect.objectContaining(updatedMember)
      );
      expect(updateResult?.error).toBeUndefined();
    });

    it('should delete hive member successfully', async () => {
      (hiveMembersApi.delete as jest.Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HabitHiveProvider>{children}</HabitHiveProvider>
      );

      const { result } = renderHook(() => useHabitHive(), { wrapper });

      let deleteResult: any;
      await act(async () => {
        deleteResult = await result.current.deleteHiveMemberAsync(
          'hive-1',
          'user-1'
        );
      });

      expect(deleteResult?.success).toBe(true);
      expect(deleteResult?.error).toBeUndefined();
    });
  });
});
