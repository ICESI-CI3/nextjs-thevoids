import { paymentsApi, CreatePaymentPayload } from './payments';
import { apiClient } from './client';

jest.mock('./client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('paymentsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a payment intent', async () => {
    const payload: CreatePaymentPayload = {
      amount: 1000,
      currency: 'usd',
      userId: 'user-1',
      customerEmail: 'user@example.com',
    };

    (apiClient.post as jest.Mock).mockResolvedValue({ status: 201 });

    await paymentsApi.create(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/payments', payload);
  });

  it('confirms a payment', async () => {
    const confirmPayload = { paymentIntentId: 'pi_1' };
    (apiClient.post as jest.Mock).mockResolvedValue({ status: 200 });

    await paymentsApi.confirm(confirmPayload);

    expect(apiClient.post).toHaveBeenCalledWith(
      '/payments/confirm',
      confirmPayload
    );
  });

  it('retrieves a payment intent', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ status: 200 });

    await paymentsApi.retrieve('pi_123');

    expect(apiClient.get).toHaveBeenCalledWith('/payments/pi_123');
  });

  it('cancels a payment intent', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ status: 200 });

    await paymentsApi.cancel('pi_cancel');

    expect(apiClient.post).toHaveBeenCalledWith('/payments/pi_cancel/cancel');
  });

  it('processes a refund', async () => {
    const refundPayload = { paymentIntentId: 'pi_refund', amount: 500 };
    (apiClient.post as jest.Mock).mockResolvedValue({ status: 200 });

    await paymentsApi.refund(refundPayload);

    expect(apiClient.post).toHaveBeenCalledWith(
      '/payments/refund',
      refundPayload
    );
  });
});
