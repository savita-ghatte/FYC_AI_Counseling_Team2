import { Request, Response, NextFunction } from 'express';
import { predictionService, PredictionInput } from '../services/predictionService';
import { geminiService } from '../services/geminiService';

export const generatePredictions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input: PredictionInput = req.body.input;
    const weights = req.body.weights;

    if (!input || !input.examName || !input.category) {
      res.status(400).json({ status: 'error', message: 'Missing required prediction inputs (examName, category)' });
      return;
    }

    if ((input as any).preferredBranch) {
      input.preferredBranches = [(input as any).preferredBranch];
    }

    const predictions = await predictionService.generatePredictions(input, weights);

    res.json({
      status: 'success',
      data: {
        totalResults: predictions.length,
        predictions
      }
    });
  } catch (error) {
    next(error);
  }
};

export const explainPrediction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { predictionData, userProfile } = req.body;

    if (!predictionData || !userProfile) {
      res.status(400).json({ status: 'error', message: 'Missing predictionData or userProfile' });
      return;
    }

    const explanation = await geminiService.explainPrediction(predictionData, userProfile);

    res.json({
      status: 'success',
      data: { explanation }
    });
  } catch (error) {
    next(error);
  }
};
