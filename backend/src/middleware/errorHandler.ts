import { Request, Response, NextFunction } from 'express';

/**
 * Centralized error handler middleware.
 * Catches unhandled errors and returns consistent JSON responses.
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message || err);

  // Prisma known errors
  if (err.code === 'P2002') {
    res.status(409).json({ error: 'A record with this value already exists' });
    return;
  }
  if (err.code === 'P2025') {
    res.status(404).json({ error: 'Record not found' });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ error: 'Token expired' });
    return;
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal server error'
  });
}
