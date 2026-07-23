import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);

export default router;
