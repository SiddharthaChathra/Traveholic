import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { requireAuth, optionalAuth, AuthRequest } from '../../middleware/auth';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  describe('requireAuth', () => {
    it('should return 401 if no authorization header is provided', () => {
      requireAuth(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token format is invalid (no Bearer)', () => {
      mockRequest.headers = { authorization: 'Basic sometoken' };

      requireAuth(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    });

    it('should call next and attach user data if token is valid', () => {
      mockRequest.headers = { authorization: 'Bearer valid_token' };
      const mockDecoded = { userId: '123', username: 'testuser', email: 'test@example.com', role: 'user' };
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      requireAuth(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(jwt.verify).toHaveBeenCalled();
      expect(mockRequest.userId).toBe('123');
      expect(mockRequest.userUsername).toBe('testuser');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should return 401 if token verification fails', () => {
      mockRequest.headers = { authorization: 'Bearer invalid_token' };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      requireAuth(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    });
  });

  describe('optionalAuth', () => {
    it('should call next even if no token is provided', () => {
      optionalAuth(mockRequest as AuthRequest, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.userId).toBeUndefined();
    });

    it('should attach user info and call next if token is valid', () => {
      mockRequest.headers = { authorization: 'Bearer valid_token' };
      const mockDecoded = { userId: '123' };
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      optionalAuth(mockRequest as AuthRequest, mockResponse as Response, nextFunction);
      
      expect(mockRequest.userId).toBe('123');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should not attach user info but call next if token is invalid', () => {
      mockRequest.headers = { authorization: 'Bearer invalid_token' };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      optionalAuth(mockRequest as AuthRequest, mockResponse as Response, nextFunction);
      
      expect(mockRequest.userId).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
