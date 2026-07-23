import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/authRoutes';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    userSession: {
      create: jest.fn(),
    },
    studentProfile: {
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn((plain, hash) => plain + '!' !== hash),
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

const prisma = new PrismaClient();

describe('Auth API Integration Tests', () => {
  const testEmail = 'testuser_auth@example.com';
  const testPassword = 'Password123!';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fail to register with invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalidemail',
        password: testPassword,
        fullName: 'Test User'
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toContain('Validation failed');
  });

  it('should register a new user successfully', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (prisma.user.create as jest.Mock).mockResolvedValueOnce({
      id: 'mock-id',
      email: testEmail,
      fullName: 'Test User',
      passwordHash: 'hashed-password',
      role: 'student'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        fullName: 'Test User'
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.token).toBeDefined();
  });

  it('should fail to register an existing user', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'existing-id' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        fullName: 'Test User'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email already in use');
  });

  it('should login the user successfully', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'mock-id',
      email: testEmail,
      passwordHash: 'hashed-password',
      role: 'student',
      isVerified: true
    });

    jest.requireMock('bcryptjs').compare.mockResolvedValueOnce(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.token).toBeDefined();
  });

  it('should fail to login with wrong password', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'mock-id',
      email: testEmail,
      passwordHash: 'hashed-password',
      role: 'student',
      isVerified: true
    });

    jest.requireMock('bcryptjs').compare.mockResolvedValueOnce(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'WrongPassword!'
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });
});
