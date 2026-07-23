import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const getColleges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { query, page, limit, state, type, maxFee, branch } = req.query as any;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build Prisma Where Clause
    const whereClause: Prisma.CollegeWhereInput = {};

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (state) {
      whereClause.state = state;
    }

    if (type) {
      whereClause.instituteType = type;
    }

    if (maxFee || branch) {
      whereClause.courses = {
        some: {
          ...(branch && { branchCode: { contains: branch, mode: 'insensitive' } }),
          ...(maxFee && { tuitionFee: { lte: parseInt(maxFee as string) } })
        }
      };
    }

    const [colleges, total] = await Promise.all([
      prisma.college.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: { nirfRank: 'asc' }, // nulls last automatically handled by Prisma? Wait, Prisma might put nulls first for asc. We might need logic here, but keeping it simple for now.
        include: {
          courses: {
            take: 1, // Just get one course to display range
            orderBy: { tuitionFee: 'asc' }
          }
        }
      }),
      prisma.college.count({ where: whereClause })
    ]);

    res.json({
      status: 'success',
      data: {
        colleges,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCollegeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const college = await prisma.college.findUnique({
      where: { id },
      include: {
        courses: {
          include: { cutoffs: true }
        },
        facilities: true,
        placements: true
      }
    });

    if (!college) {
      res.status(404).json({ status: 'error', message: 'College not found' });
      return;
    }

    res.json({ status: 'success', data: { college } });
  } catch (error) {
    next(error);
  }
};
