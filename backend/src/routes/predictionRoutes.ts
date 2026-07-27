import { Router } from 'express';
import { generatePredictions, explainPrediction } from '../controllers/predictionController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Secure endpoints requiring authentication
router.post('/generate', authenticate, generatePredictions);
router.post('/explain', authenticate, explainPrediction);

export default router;
