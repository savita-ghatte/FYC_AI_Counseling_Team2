import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

// Calculate profile completion percentage based on specific fields
const calculateCompletion = (profile: any): number => {
  if (!profile) return 0;
  let score = 0;
  const fields = ['fullName', 'gender', 'dateOfBirth', 'category', 'homeState', 'percentage12th', 'familyIncome'];
  
  fields.forEach(field => {
    if (profile[field] !== null && profile[field] !== undefined) score += 1;
  });
  
  return Math.round((score / fields.length) * 100);
};

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    let profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        studentDocuments: true
      }
    });

    if (!profile) {
      // Auto-create if it doesn't exist
      profile = await prisma.studentProfile.create({
        data: { userId },
        include: { studentDocuments: true }
      });
    }

    const completion = calculateCompletion(profile);

    res.json({
      status: 'success',
      data: {
        profile,
        completion
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const data = req.body;

    const updatedProfile = await prisma.studentProfile.upsert({
      where: { userId },
      update: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      },
      create: {
        userId,
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      },
    });

    res.json({ status: 'success', data: { profile: updatedProfile } });
  } catch (error) {
    next(error);
  }
};

export const getDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    
    if (!profile) {
      res.json({ status: 'success', data: { documents: [] } });
      return;
    }

    const documents = await prisma.studentDocument.findMany({
      where: { studentProfileId: profile.id }
    });

    res.json({ status: 'success', data: { documents } });
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { templateId, fileName } = req.body;
    
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) {
      res.status(404).json({ status: 'error', message: 'Profile not found' });
      return;
    }

    // Since we don't have S3 set up, we will mock the fileUrl
    const mockFileUrl = `https://mock-storage.local/${userId}/${fileName || 'document.pdf'}`;

    const document = await prisma.studentDocument.create({
      data: {
        studentProfileId: profile.id,
        templateId, // Assume valid UUID passed from frontend
        fileUrl: mockFileUrl,
        fileName: fileName || 'Unknown Document',
        status: 'uploaded'
      }
    });

    res.status(201).json({ status: 'success', data: { document } });
  } catch (error) {
    next(error);
  }
};
