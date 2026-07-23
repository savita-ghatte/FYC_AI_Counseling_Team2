import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendMockEmail } from '../utils/mailer';

const prisma = new PrismaClient();

export const uploadDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true }
    });

    if (!user || !user.studentProfile) {
      res.status(404).json({ error: 'Student profile not found.' });
      return;
    }

    // Since templateId is mandatory, ensure a default "General" template exists
    let template = await prisma.documentTemplate.findFirst({
      where: { name: 'General Document' }
    });

    if (!template) {
      template = await prisma.documentTemplate.create({
        data: {
          name: 'General Document',
          category: 'General',
          isMandatory: false
        }
      });
    }

    // Save document record in DB
    const document = await prisma.studentDocument.create({
      data: {
        studentProfileId: user.studentProfile.id,
        templateId: template.id,
        fileUrl: `/uploads/${file.filename}`, // Local storage path
        fileName: file.originalname,
        status: 'uploaded'
      }
    });

    // Create an In-App Notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'document_upload',
        title: 'Document Uploaded',
        message: `Your document "${file.originalname}" has been successfully uploaded and is pending verification.`,
        status: 'unread'
      }
    });

    // Send Email Notification
    await sendMockEmail(
      user.email,
      'Document Uploaded Successfully',
      `<p>Hi ${user.studentProfile.fullName || 'Student'},</p><p>We received your document: <b>${file.originalname}</b>. It is currently under review.</p>`
    );

    res.status(201).json({
      status: 'success',
      data: document
    });
  } catch (error) {
    next(error);
  }
};

export const getDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true }
    });

    if (!user || !user.studentProfile) {
      res.status(404).json({ error: 'Student profile not found.' });
      return;
    }

    const documents = await prisma.studentDocument.findMany({
      where: { studentProfileId: user.studentProfile.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      status: 'success',
      data: documents
    });
  } catch (error) {
    next(error);
  }
};
