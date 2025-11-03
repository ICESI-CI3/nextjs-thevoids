import { apiClient, ApiResponse } from './client';
import { Transaction } from './transactions';

export interface CreatePaymentPayload {
  amount: number;
  currency: string;
  userId: string;
  customerEmail: string;
  hiveId?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentIntentSummary {
  id: string;
  clientSecret: string;
  status: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentResponse {
  transaction: Transaction;
  paymentIntent: PaymentIntentSummary;
}

export interface ConfirmPaymentPayload {
  paymentIntentId: string;
}

export interface RefundPaymentPayload {
  paymentIntentId: string;
  amount?: number;
}

export const paymentsApi = {
  create: async (
    payload: CreatePaymentPayload
  ): Promise<ApiResponse<CreatePaymentResponse>> => {
    return apiClient.post<CreatePaymentResponse>('/payments', payload);
  },

  confirm: async (
    payload: ConfirmPaymentPayload
  ): Promise<ApiResponse<{ paymentIntent: PaymentIntentSummary }>> => {
    return apiClient.post('/payments/confirm', payload);
  },

  retrieve: async (
    paymentIntentId: string
  ): Promise<ApiResponse<{ paymentIntent: PaymentIntentSummary }>> => {
    return apiClient.get(`/payments/${paymentIntentId}`);
  },

  cancel: async (
    paymentIntentId: string
  ): Promise<ApiResponse<{ paymentIntent: PaymentIntentSummary }>> => {
    return apiClient.post(`/payments/${paymentIntentId}/cancel`);
  },

  refund: async (
    payload: RefundPaymentPayload
  ): Promise<
    ApiResponse<{ refund: { id: string; status: string; amount: number } }>
  > => {
    return apiClient.post('/payments/refund', payload);
  },
};
