import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'travora_super_secret_jwt_key_12345';

export interface AuthRequest extends Request {
  userId?: string;
  userUsername?: string;
  userEmail?: string;
  userRole?: string;
}

/**
 * Required auth middleware — returns 401 if no valid token.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userUsername = decoded.username;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;
    next();
  } catch (error: any) {
    console.error('JWT Verify Error:', error.message, 'Token:', req.headers.authorization);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional auth middleware — attaches user info if token exists, but doesn't block.
 * Useful for endpoints where auth enhances the response but isn't required.
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
      req.userUsername = decoded.username;
      req.userEmail = decoded.email;
      req.userRole = decoded.role;
    } catch (error) {
      // Token invalid — proceed without auth
    }
  }
  next();
}
