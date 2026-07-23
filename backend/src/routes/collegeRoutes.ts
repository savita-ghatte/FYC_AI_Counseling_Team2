import { Router } from 'express';
import { getColleges, getCollegeById } from '../controllers/collegeController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Protect all college routes
router.use(authenticate);

router.get('/', getColleges);
router.get('/:id', getCollegeById);

export default router;
