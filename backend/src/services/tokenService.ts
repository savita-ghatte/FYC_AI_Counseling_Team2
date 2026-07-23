import jwt from 'jsonwebtoken';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super_secret_access_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key';

export interface TokenPayload {
  userId: string;
  role: string;
}

export class TokenService {
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  }

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
  }

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  }
}

export const tokenService = new TokenService();
