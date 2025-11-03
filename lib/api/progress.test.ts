import { progressApi, ProgressStatus } from './progress';

describe('progressApi', () => {
  const fetchMock = jest.fn();
  const originalFetch = global.fetch;
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const createResponse = (
    data?: unknown,
    overrides?: { ok?: boolean; status?: number; contentType?: string }
  ) =>
    ({
      ok: overrides?.ok ?? true,
      status: overrides?.status ?? 200,
      headers: new Headers({
        'content-type': overrides?.contentType ?? 'application/json',
      }),
      json: jest.fn().mockResolvedValue(data),
    }) as unknown as Response;

  beforeAll(() => {
    (global as any).fetch = fetchMock;
  });

  afterAll(() => {
    (global as any).fetch = originalFetch;
  });

  beforeEach(() => {
    fetchMock.mockReset();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
  });

  it('includes auth header when listing', async () => {
    fetchMock.mockResolvedValue(createResponse([{ id: 'p1' }]));

    const result = await progressApi.getAll(25, 5);

    expect(result.data).toEqual([{ id: 'p1' }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/progresses?limit=25&offset=5`);
    expect(options?.headers).toBeInstanceOf(Headers);
    expect((options?.headers as Headers).get('Authorization')).toBe(
      'Bearer test-token'
    );
  });

  it('creates progress with JSON payload when no file is provided', async () => {
    fetchMock.mockResolvedValue(createResponse({ id: 'progress-1' }));

    await progressApi.create({
      hiveId: 'h1',
      userId: 'u1',
      habitId: 'hb1',
      date: '2024-01-01',
      status: ProgressStatus.PENDING,
    });

    const [, options] = fetchMock.mock.calls[0];
    expect(options?.method).toBe('POST');
    expect(options?.headers).toBeInstanceOf(Headers);
    expect(typeof options?.body).toBe('string');
    expect((options?.headers as Headers).get('Content-Type')).toBe(
      'application/json'
    );
  });

  it('creates progress with FormData when evidence file is provided', async () => {
    fetchMock.mockResolvedValue(createResponse({ id: 'progress-2' }));

    const evidenceFile = new File(['proof'], 'proof.png', {
      type: 'image/png',
    });

    await progressApi.create({
      hiveId: 'h1',
      userId: 'u1',
      habitId: 'hb1',
      date: '2024-01-02',
      evidenceFile,
    });

    const [, options] = fetchMock.mock.calls[0];
    expect(options?.method).toBe('POST');
    expect(options?.body).toBeInstanceOf(FormData);
    expect((options?.headers as Headers).get('Content-Type')).toBeNull();
  });

  it('calls auxiliary endpoints with expected URLs and methods', async () => {
    fetchMock.mockResolvedValue(createResponse({}));

    await progressApi.getById('p-1');
    await progressApi.getByUser('u-1', 5, 2);
    await progressApi.getByHive('h-1', 3, 1);
    await progressApi.getByHabit('hb-1', 2, 0);
    await progressApi.getByUserAndHive('u-2', 'h-2', 4, 1);
    await progressApi.getUserStats('u-3');
    await progressApi.getHiveStats('h-3');
    await progressApi.getTodayByUser('u-4', 10, 0);
    await progressApi.getStreak('u-5', 'hb-5');
    await progressApi.delete('p-10');

    const calls = fetchMock.mock.calls;
    expect(calls.length).toBe(10);

    expect(calls[0][0]).toBe(`${BASE_URL}/progresses/p-1`);
    expect(calls[1][0]).toBe(
      `${BASE_URL}/progresses/user/u-1?limit=5&offset=2`
    );
    expect(calls[2][0]).toBe(
      `${BASE_URL}/progresses/hive/h-1?limit=3&offset=1`
    );
    expect(calls[3][0]).toBe(
      `${BASE_URL}/progresses/habit/hb-1?limit=2&offset=0`
    );
    expect(calls[4][0]).toBe(
      `${BASE_URL}/progresses/user/u-2/hive/h-2?limit=4&offset=1`
    );
    expect(calls[5][0]).toBe(`${BASE_URL}/progresses/stats/user/u-3`);
    expect(calls[6][0]).toBe(`${BASE_URL}/progresses/stats/hive/h-3`);
    expect(calls[7][0]).toBe(
      `${BASE_URL}/progresses/today/user/u-4?limit=10&offset=0`
    );
    expect(calls[8][0]).toBe(
      `${BASE_URL}/progresses/streak/user/u-5/habit/hb-5`
    );
    expect(calls[9][0]).toBe(`${BASE_URL}/progresses/p-10`);

    expect(calls[9][1]?.method).toBe('DELETE');
  });

  it('updates status and verify endpoints via PATCH', async () => {
    fetchMock.mockResolvedValue(createResponse({}));

    await progressApi.updateStatus('progress-3', ProgressStatus.COMPLETED);
    await progressApi.verify('progress-4', 'verifier-1');
    await progressApi.update('progress-5', { status: ProgressStatus.FAILED });

    const calls = fetchMock.mock.calls;
    expect(calls[0][0]).toBe(
      `${BASE_URL}/progresses/progress-3/status?status=completed`
    );
    expect(calls[0][1]?.method).toBe('PATCH');

    expect(calls[1][0]).toBe(
      `${BASE_URL}/progresses/progress-4/verify?verifiedBy=verifier-1`
    );
    expect(calls[1][1]?.method).toBe('PATCH');

    expect(calls[2][0]).toBe(`${BASE_URL}/progresses/progress-5`);
    expect(calls[2][1]?.method).toBe('PATCH');
  });

  it('returns error message when response is not ok', async () => {
    fetchMock.mockResolvedValue(
      createResponse({ message: 'Server error' }, { ok: false, status: 500 })
    );

    const result = await progressApi.getAll();

    expect(result.error).toBe('Server error');
  });

  it('gracefully handles non-JSON responses', async () => {
    fetchMock.mockResolvedValue(
      createResponse(undefined, { contentType: 'text/plain' })
    );

    const result = await progressApi.getById('no-json');

    expect(result.data).toBeUndefined();
  });

  it('handles fetch failures', async () => {
    fetchMock.mockRejectedValue(new Error('Network failure'));

    const result = await progressApi.getAll();

    expect(result.error).toBe('Network failure');
  });
});
