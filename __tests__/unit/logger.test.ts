import { Logger } from '../../src/services/logger';

describe('Logger Service Deep Sanitization Tests', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('masks Bearer JWT tokens in plain text string messages', () => {
    const fakeToken = 'Bearer eyJFAKE.JWT.HEADER_PAYLOAD_SIGNATURE';
    Logger.error(`Failed request with auth: ${fakeToken}`);

    expect(consoleErrorSpy).toHaveBeenCalled();
    const loggedOutput = consoleErrorSpy.mock.calls[0].join(' ');
    expect(loggedOutput).not.toContain('eyJFAKE.JWT.HEADER_PAYLOAD_SIGNATURE');
    expect(loggedOutput).toContain('Bearer [REDACTED_TOKEN]');
  });

  it('recursively redacts top-level and nested sensitive keys in objects', () => {
    const sensitivePayload = {
      user: 'test_user',
      access_token: 'secret-access-token-123',
      nested: {
        refresh_token: 'secret-refresh-token-456',
        jwt: 'secret-jwt-token-789',
        password: 'SuperSecretPassword123!',
      },
    };

    Logger.error('Auth payload error:', sensitivePayload);

    const loggedArg = consoleErrorSpy.mock.calls[0][1];
    expect(loggedArg.user).toBe('test_user');
    expect(loggedArg.access_token).toBe('[REDACTED]');
    expect(loggedArg.nested.refresh_token).toBe('[REDACTED]');
    expect(loggedArg.nested.jwt).toBe('[REDACTED]');
    expect(loggedArg.nested.password).toBe('[REDACTED]');
    expect(JSON.stringify(loggedArg)).not.toContain('secret-access-token-123');
    expect(JSON.stringify(loggedArg)).not.toContain('SuperSecretPassword123!');
  });

  it('sanitizes sensitive items inside arrays', () => {
    const arrayPayload = [
      { id: '1', apikey: 'secret-key-1' },
      { id: '2', private_key: 'secret-key-2' },
    ];

    Logger.error('API Keys list error', arrayPayload);

    const loggedArg = consoleErrorSpy.mock.calls[0][1];
    expect(loggedArg[0].apikey).toBe('[REDACTED]');
    expect(loggedArg[1].private_key).toBe('[REDACTED]');
  });

  it('sanitizes Error instances without throwing', () => {
    const authError = new Error('Auth failed for Bearer eyJFAKE.SECRET');
    Logger.error('System exception', authError);

    expect(consoleErrorSpy).toHaveBeenCalled();
    const loggedArg = consoleErrorSpy.mock.calls[0][1];
    expect(loggedArg.message).not.toContain('eyJFAKE.SECRET');
    expect(loggedArg.message).toContain('Bearer [REDACTED_TOKEN]');
  });
});
