import { Router } from 'express';
import { 
  getScholarships, 
  getRecommendedScholarships, 
  getScholarshipById,
  saveScholarship,
  getSavedScholarships,
  applyForScholarship,
  getScholarshipApplications
} from '../controllers/scholarshipController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/student/saved', getSavedScholarships);
router.get('/student/applications', getScholarshipApplications);
router.get('/recommended', getRecommendedScholarships);
router.get('/', getScholarships);
router.get('/:id', getScholarshipById);
router.post('/:id/save', saveScholarship);
router.post('/:id/apply', applyForScholarship);

export default router;
