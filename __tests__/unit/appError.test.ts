import {
  classifyError,
  createSuccessResult,
  createErrorResult,
  AppError,
} from '../../src/services/errors/AppError';

describe('AppError Taxonomy & Classifier Unit Tests', () => {
  it('classifies network connection failure strings as NETWORK_ERROR', () => {
    const err = new Error('Failed to fetch from network endpoint');
    const appErr = classifyError(err);

    expect(appErr.type).toBe('NETWORK_ERROR');
    expect(appErr.retryable).toBe(true);
  });

  it('classifies auth/JWT/401/403 errors as AUTH_ERROR', () => {
    const err = new Error('JWT expired or unauthorized 401');
    const appErr = classifyError(err);

    expect(appErr.type).toBe('AUTH_ERROR');
    expect(appErr.retryable).toBe(false);
  });

  it('classifies 500/502/503 server errors as SERVER_ERROR', () => {
    const err = new Error('Supabase 500 Internal Server Error');
    const appErr = classifyError(err);

    expect(appErr.type).toBe('SERVER_ERROR');
    expect(appErr.retryable).toBe(true);
  });

  it('returns existing AppError object untouched if already classified', () => {
    const existing: AppError = {
      type: 'EMPTY_DATA',
      message: 'No data',
      retryable: false,
    };
    const appErr = classifyError(existing);
    expect(appErr).toBe(existing);
  });

  it('creates success and error results correctly', () => {
    const successRes = createSuccessResult([1, 2, 3]);
    expect(successRes.ok).toBe(true);
    if (successRes.ok) {
      expect(successRes.data).toEqual([1, 2, 3]);
    }

    const errorRes = createErrorResult<number[]>('NETWORK_ERROR', 'Offline');
    expect(errorRes.ok).toBe(false);
    if (!errorRes.ok) {
      expect(errorRes.error.type).toBe('NETWORK_ERROR');
      expect(errorRes.error.message).toBe('Offline');
    }
  });
});
