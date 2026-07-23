import { Router } from 'express';
import { getProfile, updateProfile, getDocuments, uploadDocument } from '../controllers/studentController';
import { authenticate } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateMiddleware';
import { updateProfileSchema } from '../utils/validators';

const router = Router();

// All student routes require authentication
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', validateRequest(updateProfileSchema), updateProfile);

router.get('/documents', getDocuments);
router.post('/documents', uploadDocument);

export default router;
