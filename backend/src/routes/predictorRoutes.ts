import { Router } from 'express';
import { predictColleges } from '../controllers/predictorController';
import { authenticate } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateMiddleware';
import { predictionInputSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.post('/predict', validateRequest(predictionInputSchema), predictColleges);

export default router;
