import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getScholarships = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { provider, category, status, type, search } = req.query;

    const whereClause: any = { isActive: true };

    if (provider) whereClause.provider = provider;
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { provider: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const scholarships = await prisma.scholarship.findMany({
      where: whereClause,
      orderBy: { deadline: 'asc' }
    });

    res.json({ status: 'success', data: scholarships });
  } catch (error) {
    next(error);
  }
};

export const getScholarshipById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const scholarship = await prisma.scholarship.findUnique({ where: { id } });

    if (!scholarship) {
      res.status(404).json({ status: 'error', message: 'Scholarship not found' });
      return;
    }

    res.json({ status: 'success', data: scholarship });
  } catch (error) {
    next(error);
  }
};

// AI Matcher (Algorithm based)
export const getRecommendedScholarships = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(404).json({ status: 'error', message: 'Student profile not found. Please complete your profile first.' });
      return;
    }

    const allScholarships = await prisma.scholarship.findMany({ where: { isActive: true } });

    const eligible: any[] = [];
    const partiallyEligible: any[] = [];

    allScholarships.forEach(scholarship => {
      let score = 100;
      let reasons: any = {};

      // 1. Income Check
      if (scholarship.incomeLimit && profile.familyIncome) {
        if (profile.familyIncome > scholarship.incomeLimit) {
          score -= 30;
          reasons.income = false;
        } else {
          reasons.income = true;
        }
      }

      // 2. State Check
      if (scholarship.stateEligibility && scholarship.stateEligibility.length > 0 && profile.homeState) {
        if (!scholarship.stateEligibility.includes(profile.homeState)) {
          score -= 40;
          reasons.state = false;
        } else {
          reasons.state = true;
        }
      }

      // 3. Caste Check
      if (scholarship.casteEligibility && scholarship.casteEligibility.length > 0 && profile.category) {
        if (!scholarship.casteEligibility.includes(profile.category)) {
          score -= 40;
          reasons.caste = false;
        } else {
          reasons.caste = true;
        }
      }

      // 4. Gender Check
      if (scholarship.genderEligibility && scholarship.genderEligibility !== 'All' && profile.gender) {
        if (scholarship.genderEligibility !== profile.gender) {
          score -= 50;
          reasons.gender = false;
        } else {
          reasons.gender = true;
        }
      }

      if (score >= 100) {
        eligible.push({ ...scholarship, matchScore: score, reasons });
      } else if (score >= 50) {
        partiallyEligible.push({ ...scholarship, matchScore: score, reasons });
      }
    });

    // Sort by highest amount and closest deadline
    eligible.sort((a, b) => (b.amountMax || 0) - (a.amountMax || 0));
    partiallyEligible.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      status: 'success',
      data: {
        eligible,
        partiallyEligible,
        profileDataUsed: {
          category: profile.category,
          income: profile.familyIncome,
          state: profile.homeState,
          gender: profile.gender
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const saveScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params; // scholarshipId

    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) {
       res.status(404).json({ status: 'error', message: 'Profile not found' });
       return;
    }

    const existing = await prisma.savedScholarship.findUnique({
      where: { studentProfileId_scholarshipId: { studentProfileId: profile.id, scholarshipId: id } }
    });

    if (existing) {
      await prisma.savedScholarship.delete({ where: { id: existing.id } });
      res.json({ status: 'success', message: 'Scholarship removed from saved list' });
    } else {
      await prisma.savedScholarship.create({
        data: { studentProfileId: profile.id, scholarshipId: id }
      });
      res.json({ status: 'success', message: 'Scholarship saved successfully' });
    }
  } catch (error) {
    next(error);
  }
};

export const getSavedScholarships = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    
    if (!profile) {
      res.status(404).json({ status: 'error', message: 'Profile not found' });
      return;
    }

    const saved = await prisma.savedScholarship.findMany({
      where: { studentProfileId: profile.id },
      include: { scholarship: true }
    });

    res.json({ status: 'success', data: saved.map(s => s.scholarship) });
  } catch (error) {
    next(error);
  }
};

export const applyForScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params; 
    const { applicationId, notes } = req.body;

    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    
    if (!profile) {
      res.status(404).json({ status: 'error', message: 'Profile not found' });
      return;
    }

    const application = await prisma.scholarshipApplication.upsert({
      where: { studentProfileId_scholarshipId: { studentProfileId: profile.id, scholarshipId: id } },
      update: { applicationId, notes, status: 'Submitted', appliedDate: new Date() },
      create: { studentProfileId: profile.id, scholarshipId: id, applicationId, notes, status: 'Submitted', appliedDate: new Date() }
    });

    res.json({ status: 'success', message: 'Application tracked successfully', data: application });
  } catch (error) {
    next(error);
  }
};

export const getScholarshipApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    
    if (!profile) {
      res.status(404).json({ status: 'error', message: 'Profile not found' });
      return;
    }

    const apps = await prisma.scholarshipApplication.findMany({
      where: { studentProfileId: profile.id },
      include: { scholarship: true }
    });

    res.json({ status: 'success', data: apps });
  } catch (error) {
    next(error);
  }
};
