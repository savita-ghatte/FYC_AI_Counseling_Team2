import { Request, Response, NextFunction } from 'express';
import { predictionService, PredictionInput } from '../services/predictionService';

export const predictColleges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input: PredictionInput = req.body;
    
    // Some validation
    if (!input.examName || !input.scoreValue || !input.category) {
      res.status(400).json({ status: 'error', message: 'Missing required fields: examName, scoreValue, category' });
      return;
    }
    
    if ((req.body as any).preferredBranch) {
      input.preferredBranches = [(req.body as any).preferredBranch];
    }

    const predictions = await predictionService.generatePredictions(input);

    const grouped = {
      safe: [] as any[],
      moderate: [] as any[],
      reach: [] as any[],
      dream: [] as any[]
    };

    predictions.forEach(p => {
      if (p.status === 'Safe') grouped.safe.push(p);
      else if (p.status === 'Moderate') grouped.moderate.push(p);
      else if (p.status === 'Reach') grouped.reach.push(p);
      else if (p.status === 'Dream') grouped.dream.push(p);
    });

    const filterByBudget = (colleges: any[]) => {
      if (!input.budgetMax) return colleges;
      return colleges.filter(c => c.collegeDetails.fees <= input.budgetMax!);
    };

    res.json({
      status: 'success',
      data: {
        predictions: {
          safe: filterByBudget(grouped.safe),
          moderate: filterByBudget(grouped.moderate),
          reach: filterByBudget(grouped.reach),
          dream: filterByBudget(grouped.dream)
        },
        metadata: {
          analyzedScore: input.scoreValue,
          exam: input.examName,
          category: input.category
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
