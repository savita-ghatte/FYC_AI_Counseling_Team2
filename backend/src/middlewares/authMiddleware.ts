import { Request, Response, NextFunction } from 'express';
import { tokenService, TokenPayload } from '../services/tokenService';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = tokenService.verifyAccessToken(token);
    
    req.user = {
      ...decoded,
      id: decoded.userId // FIX: Controllers use req.user.id, but JWT payload uses userId
    } as any;
    
    next();
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
};
