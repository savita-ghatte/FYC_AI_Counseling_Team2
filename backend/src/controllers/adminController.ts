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

// Admin Scholarship Management
export const createScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = req.body;
    // ensure date strings are converted to Date objects if provided
    if (data.deadline) data.deadline = new Date(data.deadline);
    if (data.applicationStart) data.applicationStart = new Date(data.applicationStart);

    const scholarship = await prisma.scholarship.create({ data });
    res.status(201).json({ status: 'success', data: scholarship });
  } catch (error) {
    next(error);
  }
};

export const updateScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    if (data.deadline) data.deadline = new Date(data.deadline);
    if (data.applicationStart) data.applicationStart = new Date(data.applicationStart);

    const scholarship = await prisma.scholarship.update({
      where: { id },
      data
    });
    res.json({ status: 'success', data: scholarship });
  } catch (error) {
    next(error);
  }
};

export const deleteScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.scholarship.delete({ where: { id } });
    res.json({ status: 'success', message: 'Scholarship deleted successfully' });
  } catch (error) {
    next(error);
  }
};
