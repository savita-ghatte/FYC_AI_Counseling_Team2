import { Router, Request, Response, NextFunction } from 'express';
import { getDashboardStats, getStudents, getCollegesAdmin } from '../controllers/adminController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// In a real app, uncomment this exact role check:
// const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
//   if ((req as any).user.role !== 'admin') {
//     return res.status(403).json({ error: 'Access denied. Admin only.' });
//   }
//   next();
// };

// For prototype per user agreement, we use basic authentication but bypass strict role check
router.use(authenticate);
// router.use(requireAdmin); 

router.get('/stats', getDashboardStats);
router.get('/students', getStudents);
router.get('/colleges', getCollegesAdmin);

export default router;
