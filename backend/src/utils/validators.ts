import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  fullName: z.string().min(2, 'Full name is required'),
  mobileNumber: z.string().optional(),
  captchaId: z.string().min(1, 'Captcha ID is required'),
  captchaText: z.string().min(1, 'Captcha Text is required'),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  captchaId: z.string().min(1, 'Captcha ID is required'),
  captchaText: z.string().min(1, 'Captcha Text is required'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').optional(),
  gender: z.enum(['Male', 'Female', 'Transgender', 'Other']).optional(),
  dateOfBirth: z.string().optional(),
  category: z.enum(['GEN', 'EWS', 'OBC', 'SC', 'ST']).optional(),
  pwdStatus: z.boolean().optional(),
  familyIncome: z.number().min(0, 'Income must be non-negative').optional(),
  homeState: z.string().optional(),
  domicileState: z.string().optional(),
  board12th: z.string().optional(),
  percentage12th: z.number().min(0).max(100).optional(),
  percentage10th: z.number().min(0).max(100).optional(),
  examsAppeared: z.array(z.any()).optional(),
  preferredBranches: z.array(z.string()).optional(),
  budgetMax: z.number().min(0).optional(),
});

export const collegeSearchQuerySchema = z.object({
  query: z.string().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10),
  state: z.string().optional(),
  type: z.string().optional(),
  maxFee: z.string().regex(/^\d+$/).transform(Number).optional(),
  branch: z.string().optional(),
});

export const predictionInputSchema = z.object({
  examName: z.enum(['JEE', 'MHT-CET', 'NEET']),
  rank: z.number().min(1, 'Rank must be a positive number'),
  category: z.enum(['GEN', 'EWS', 'OBC', 'SC', 'ST']),
  gender: z.enum(['Male', 'Female', 'Transgender', 'Other']),
  homeState: z.string().min(1, 'State is required'),
  pwdStatus: z.boolean().default(false),
  preferredBranch: z.string().optional(),
  budgetMax: z.number().optional(),
});
