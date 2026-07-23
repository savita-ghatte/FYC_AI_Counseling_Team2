import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const predictColleges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { examName, rank, category, gender, homeState, pwdStatus, preferredBranch, budgetMax } = req.body;

    // This is the core logic. In a real system, we query Cutoff table and compare.
    // For this prototype, we'll implement a mock predictive algorithm that returns
    // structured Safe, Moderate, and Dream colleges based on the rank ranges, as
    // actual cutoff data isn't seeded yet.

    const safe = [
      { id: '3', name: 'VIT Pune', branch: preferredBranch || 'Computer Science', probability: 95, fees: 180000, type: 'Private' },
      { id: '4', name: 'PICT Pune', branch: preferredBranch || 'Information Technology', probability: 88, fees: 140000, type: 'Private' }
    ];

    const moderate = [
      { id: '2', name: 'Delhi Technological University', branch: preferredBranch || 'Software Engineering', probability: 65, fees: 160000, type: 'Government' },
      { id: '5', name: 'NIT Trichy', branch: 'Mechanical', probability: 55, fees: 120000, type: 'Government' }
    ];

    const dream = [
      { id: '1', name: 'IIT Bombay', branch: preferredBranch || 'Computer Science', probability: 15, fees: 200000, type: 'Government' },
      { id: '6', name: 'IIT Delhi', branch: 'Mathematics and Computing', probability: 25, fees: 210000, type: 'Government' }
    ];

    // Filter by budget if provided
    const filterByBudget = (colleges: any[]) => {
      if (!budgetMax) return colleges;
      return colleges.filter(c => c.fees <= budgetMax);
    };

    res.json({
      status: 'success',
      data: {
        predictions: {
          safe: filterByBudget(safe),
          moderate: filterByBudget(moderate),
          dream: filterByBudget(dream)
        },
        metadata: {
          analyzedRank: rank,
          exam: examName,
          category
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
