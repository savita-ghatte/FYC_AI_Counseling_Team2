import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getScholarships = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, category } = req.query;

    const whereClause: any = {
      isActive: true
    };

    if (type) {
      whereClause.type = type;
    }
    if (category) {
      whereClause.category = category;
    }

    const scholarships = await prisma.scholarship.findMany({
      where: whereClause,
      orderBy: { deadline: 'asc' }
    });

    res.json({
      status: 'success',
      data: scholarships
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendedScholarships = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    // Fetch the student profile to use for recommendations
    const profile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      res.status(404).json({ status: 'error', message: 'Student profile not found. Please complete your profile first.' });
      return;
    }

    // Recommendation logic:
    // In a production system, this would be a complex matching algorithm or AI model.
    // Here we simulate AI recommendations by filtering scholarships that match 
    // the student's category or home state, or general scholarships.
    
    const recommendations = await prisma.scholarship.findMany({
      where: {
        isActive: true,
        OR: [
          { category: profile.category || 'GEN' },
          { eligibilityCriteria: { contains: profile.homeState || '', mode: 'insensitive' } },
          { category: 'All' }
        ]
      },
      take: 10,
      orderBy: { amountMax: 'desc' }
    });

    // We can also insert ScholarshipMatch records here if we wanted to persist them.

    res.json({
      status: 'success',
      data: {
        matches: recommendations,
        profileDataUsed: {
          category: profile.category,
          income: profile.familyIncome,
          state: profile.homeState
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
