/**
 * Unified App Error Taxonomy for Sabores 4.0
 * Distinguishes genuine failures (network, auth, server) from valid empty datasets.
 */

export type AppErrorType =
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'SERVER_ERROR'
  | 'EMPTY_DATA'
  | 'UNKNOWN';

export interface AppError {
  type: AppErrorType;
  message: string;
  retryable: boolean;
  originalError?: unknown;
}

export type Result<T> =
  | { ok: true; data: T; isFallback?: boolean }
  | { ok: false; error: AppError };

export const createSuccessResult = <T>(data: T, isFallback = false): Result<T> => ({
  ok: true,
  data,
  isFallback,
});

export const createErrorResult = <T>(
  type: AppErrorType,
  message: string,
  retryable = true,
  originalError?: unknown
): Result<T> => ({
  ok: false,
  error: {
    type,
    message,
    retryable,
    originalError,
  },
});

export const classifyError = (err: unknown): AppError => {
  if (err && typeof err === 'object' && 'type' in err && 'message' in err && typeof (err as any).type === 'string') {
    return err as AppError;
  }
  const msg = err instanceof Error ? err.message : String(err || '');

  if (
    msg.includes('FetchError') ||
    msg.includes('Network') ||
    msg.includes('network') ||
    msg.includes('offline') ||
    msg.includes('Failed to fetch') ||
    msg.includes('Connection')
  ) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Error de conexión a internet o red no disponible',
      retryable: true,
      originalError: err,
    };
  }

  if (
    msg.includes('JWT') ||
    msg.includes('auth') ||
    msg.includes('unauthorized') ||
    msg.includes('Permission denied') ||
    msg.includes('401') ||
    msg.includes('403') ||
    msg.includes('session')
  ) {
    return {
      type: 'AUTH_ERROR',
      message: 'Error de autenticación o permisos insuficientes',
      retryable: false,
      originalError: err,
    };
  }

  if (
    msg.includes('500') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('504') ||
    msg.includes('Server') ||
    msg.includes('server')
  ) {
    return {
      type: 'SERVER_ERROR',
      message: 'Error interno del servidor',
      retryable: true,
      originalError: err,
    };
  }

  return {
    type: 'UNKNOWN',
    message: msg || 'Error desconocido al procesar la solicitud',
    retryable: true,
    originalError: err,
  };
};

