export interface JwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface JwtError extends Error {
  name: 'JsonWebTokenError' | 'TokenExpiredError' | 'NotBeforeError';
}

export function isJwtError(error: unknown): error is JwtError {
  return (
    error instanceof Error &&
    'name' in error &&
    (error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'NotBeforeError')
  );
}
