import { apiClient } from './client';

export enum TransactionType {
  ENTRY = 'entry',
  PAYOUT = 'payout',
  REFUND = 'refund',
}

export enum TransactionStatus {
  COMPLETED = 'completed',
  FAILED = 'failed',
  PENDING = 'pending',
}

export interface TransactionUserSummary {
  id: string;
  name: string;
  email: string;
}

export interface TransactionHiveSummary {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  userId: string;
  hiveId?: string;
  amount: number | string;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  paymentId?: string;
  externalReference?: string;
  preferenceId?: string;
  createdAt: string;
  user?: TransactionUserSummary;
  hive?: TransactionHiveSummary;
}

export interface TransactionStatsByKey {
  count: number;
  amount: number;
}

export interface UserTransactionStats {
  userId: string;
  total: number;
  totalAmount: number;
  byType: Record<TransactionType, TransactionStatsByKey>;
  byStatus: Record<TransactionStatus, TransactionStatsByKey>;
}

export interface HiveTransactionStats {
  hiveId: string;
  total: number;
  totalAmount: number;
  byType: Record<TransactionType, TransactionStatsByKey>;
  byStatus: Record<TransactionStatus, TransactionStatsByKey>;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

const buildQuery = (params?: PaginationParams) => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  if (params.limit !== undefined) {
    searchParams.append('limit', params.limit.toString());
  }
  if (params.offset !== undefined) {
    searchParams.append('offset', params.offset.toString());
  }
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const transactionsApi = {
  getAll: async (params?: PaginationParams) => {
    return apiClient.get<Transaction[]>(`/transactions${buildQuery(params)}`);
  },

  getByUser: async (userId: string, params?: PaginationParams) => {
    return apiClient.get<Transaction[]>(
      `/transactions/user/${userId}${buildQuery(params)}`
    );
  },

  getByHive: async (hiveId: string, params?: PaginationParams) => {
    return apiClient.get<Transaction[]>(
      `/transactions/hive/${hiveId}${buildQuery(params)}`
    );
  },

  getByUserAndHive: async (
    userId: string,
    hiveId: string,
    params?: PaginationParams
  ) => {
    return apiClient.get<Transaction[]>(
      `/transactions/user/${userId}/hive/${hiveId}${buildQuery(params)}`
    );
  },

  getStatsForUser: async (userId: string) => {
    return apiClient.get<UserTransactionStats>(
      `/transactions/stats/user/${userId}`
    );
  },

  getStatsForHive: async (hiveId: string) => {
    return apiClient.get<HiveTransactionStats>(
      `/transactions/stats/hive/${hiveId}`
    );
  },
};
