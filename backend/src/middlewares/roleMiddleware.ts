import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ status: 'error', message: 'Insufficient permissions' });
      return;
    }

    next();
  };
};
