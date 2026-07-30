import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { streamChat, getChatHistory } from '../controllers/aiController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Protect AI route against abuse
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per window
  message: { error: 'Too many requests to the AI Counsellor. Please try again later.' }
});

router.use(authenticate);

router.post('/chat', aiLimiter, streamChat);
router.get('/chat/:sessionId', getChatHistory);

export default router;
