import { Router } from 'express';
import { getScholarships, getRecommendedScholarships } from '../controllers/scholarshipController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getScholarships);
router.get('/recommended', getRecommendedScholarships);

export default router;
