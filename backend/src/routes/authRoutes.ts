import { Router, Request, Response } from 'express';
import { validateRequest } from '../middlewares/validateMiddleware';
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../utils/validators';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  adminLogin,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  getCaptcha,
  verifyEmail,
} from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { status: 'error', message: 'Too many requests, please try again later.' }
});

// Public Routes
router.get('/captcha', getCaptcha);
router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/admin-login', authLimiter, validateRequest(loginSchema), adminLogin);
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), resetPassword);
router.post('/verify-email', authLimiter, verifyEmail);
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
