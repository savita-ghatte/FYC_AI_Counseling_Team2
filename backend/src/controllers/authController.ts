import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { tokenService } from '../services/tokenService';
import { emailService } from '../services/emailService';
import crypto from 'crypto';
import { captchaService } from '../services/captchaService';

const prisma = new PrismaClient();

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, fullName, mobileNumber, captchaId, captchaText, termsAccepted } = req.body;

    if (!captchaService.verifyCaptcha(captchaId, captchaText)) {
      res.status(400).json({ status: 'error', message: 'Invalid or expired CAPTCHA' });
      return;
    }

    if (!termsAccepted) {
      res.status(400).json({ status: 'error', message: 'Terms and conditions must be accepted' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ status: 'error', message: 'User already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        email,
        phone: mobileNumber,
        passwordHash,
        isVerified: false,
        verificationToken,
        termsAccepted: true,
        studentProfile: {
          create: {
            fullName,
          }
        }
      },
    });

    emailService.sendVerificationEmail(email, verificationToken).catch(console.error);

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error) {
    next(error);
  }
};



export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, captchaId, captchaText } = req.body;

    if (!captchaService.verifyCaptcha(captchaId, captchaText)) {
      res.status(400).json({ status: 'error', message: 'Invalid or expired CAPTCHA' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      res.status(401).json({ status: 'error', message: 'Invalid email or password' });
      return;
    }

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      res.status(429).json({ status: 'error', message: 'Account locked due to too many failed attempts. Try again later.' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      const attempts = user.failedLoginAttempts + 1;
      const lockoutUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: attempts, lockoutUntil },
      });

      res.status(401).json({ status: 'error', message: 'Invalid email or password' });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ status: 'error', message: 'Please verify your email before logging in' });
      return;
    }

    const payload = { userId: user.id, role: user.role };
    const accessToken = tokenService.generateAccessToken(payload);
    const refreshToken = tokenService.generateRefreshToken(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lockoutUntil: null
      },
    });

    const ipAddress = req.ip || req.connection?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // Save session to DB (UserSession table)
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress,
        userAgent
      }
    });

    // Add audit log for login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: user.id,
        ipAddress,
        userAgent
      }
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      status: 'success',
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'admin' || !user.passwordHash) {
      res.status(401).json({ status: 'error', message: 'Invalid admin credentials' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ status: 'error', message: 'Invalid admin credentials' });
      return;
    }

    const payload = { userId: user.id, role: user.role };
    const accessToken = tokenService.generateAccessToken(payload);
    const refreshToken = tokenService.generateRefreshToken(payload);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      status: 'success',
      data: { accessToken }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const session = await prisma.userSession.findUnique({ where: { token: tokenHash } });
      
      if (session) {
        await prisma.auditLog.create({
          data: {
            userId: session.userId,
            action: 'USER_LOGOUT',
            entityType: 'User',
            entityId: session.userId,
            ipAddress: req.ip || req.connection?.remoteAddress || '',
            userAgent: req.headers['user-agent'] || ''
          }
        });
        
        await prisma.userSession.deleteMany({
          where: { token: tokenHash }
        });
      }
    }

    res.clearCookie('refreshToken');
    res.json({ status: 'success', message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ status: 'error', message: 'Refresh token not found' });
      return;
    }

    const decoded = tokenService.verifyRefreshToken(refreshToken);
    
    // Check if session exists in DB
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const session = await prisma.userSession.findUnique({ where: { token: tokenHash } });
    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({ status: 'error', message: 'Session expired or invalid' });
      return;
    }

    const payload = { userId: decoded.userId, role: decoded.role };
    const newAccessToken = tokenService.generateAccessToken(payload);

    res.json({ status: 'success', data: { accessToken: newAccessToken } });
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'Invalid refresh token' });
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Return success even if user not found for security (prevent email enumeration)
      res.json({ status: 'success', message: 'If the email exists, an OTP has been sent.' });
      return;
    }

    const otpCode = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiresAt },
    });

    emailService.sendOtpEmail(user.email, otpCode).catch(console.error);

    res.json({ status: 'success', message: 'If the email exists, an OTP has been sent.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, newPassword, otp } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ status: 'error', message: 'User not found' });
      return;
    }

    if (!user.otpCode || user.otpCode !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      res.status(400).json({ status: 'error', message: 'Invalid or expired OTP' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    // Invalidate all existing sessions
    await prisma.userSession.deleteMany({
      where: { userId: user.id }
    });

    res.json({ status: 'success', message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCaptcha = (req: Request, res: Response): void => {
  const captcha = captchaService.generateCaptcha();
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json({ status: 'success', data: captcha });
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ status: 'error', message: 'Token is required' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    });

    if (!user) {
      res.status(400).json({ status: 'error', message: 'Invalid or expired token' });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      }
    });

    res.json({ status: 'success', message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};
