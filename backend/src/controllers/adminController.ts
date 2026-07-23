import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const totalColleges = await prisma.college.count();
    const totalScholarships = await prisma.scholarship.count();
    const verifiedUsers = await prisma.user.count({ where: { isVerified: true } });

    res.json({
      status: 'success',
      data: {
        totalUsers,
        totalColleges,
        totalScholarships,
        verifiedUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'student' },
      include: {
        studentProfile: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit for prototype
    });

    res.json({
      status: 'success',
      data: students
    });
  } catch (error) {
    next(error);
  }
};

export const getCollegesAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const colleges = await prisma.college.findMany({
      orderBy: { name: 'asc' },
      take: 50 // Limit for prototype
    });

    res.json({
      status: 'success',
      data: colleges
    });
  } catch (error) {
    next(error);
  }
};
