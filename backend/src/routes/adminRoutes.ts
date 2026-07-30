import { Router, Request, Response, NextFunction } from 'express';
import { 
  getDashboardStats, 
  getStudents, 
  getCollegesAdmin,
  createScholarship,
  updateScholarship,
  deleteScholarship
} from '../controllers/adminController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// For prototype, using basic auth
router.use(authenticate);

// Dashboard and other existing
router.get('/stats', getDashboardStats);
router.get('/students', getStudents);
router.get('/colleges', getCollegesAdmin);

// Admin Scholarships
router.post('/scholarships', createScholarship);
router.put('/scholarships/:id', updateScholarship);
router.delete('/scholarships/:id', deleteScholarship);

export default router;
