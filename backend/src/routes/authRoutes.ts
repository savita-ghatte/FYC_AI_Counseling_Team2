import { Router, Request, Response } from 'express';
import { validateRequest } from '../middlewares/validateMiddleware';
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../utils/validators';
import {
  register,
  login,
  adminLogin,
  logout,
  refresh,
  verifyOtp,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';

const router = Router();

// Public Routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/admin-login', validateRequest(loginSchema), adminLogin);
router.post('/verify-otp', validateRequest(verifyOtpSchema), verifyOtp);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);
router.post('/refresh', refresh);
router.post('/logout', logout);

import { AuthRequest } from '../middlewares/authMiddleware';

// Example of a protected route using reusable middleware
router.get('/me', authenticate, (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  res.json({ status: 'success', data: { user: authReq.user } });
});

router.get('/admin-dashboard', authenticate, requireRole(['admin']), (req: Request, res: Response) => {
  res.json({ status: 'success', data: { message: 'Welcome Admin' } });
});

export default router;
