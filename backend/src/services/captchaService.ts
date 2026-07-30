import svgCaptcha from 'svg-captcha';
import crypto from 'crypto';

interface CaptchaData {
  text: string;
  expiresAt: number;
}

export class CaptchaService {
  private store: Map<string, CaptchaData> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired captchas every 10 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  generateCaptcha(): { id: string; svg: string } {
    const captcha = svgCaptcha.create({
      size: 6,
      ignoreChars: '0o1il', // ignore confusing characters
      noise: 2,
      color: true,
      background: '#1e293b', // solid slate-800 background for visibility
    });

    const id = crypto.randomUUID();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    this.store.set(id, {
      text: captcha.text,
      expiresAt,
    });

    return { id, svg: captcha.data };
  }

  verifyCaptcha(id: string, text: string): boolean {
    const data = this.store.get(id);
    
    if (!data) return false;
    
    // Remove to prevent replay attacks
    this.store.delete(id);

    if (Date.now() > data.expiresAt) return false;
    
    // Case insensitive comparison
    return data.text.toLowerCase() === text.toLowerCase();
  }

  private cleanup() {
    const now = Date.now();
    for (const [id, data] of this.store.entries()) {
      if (now > data.expiresAt) {
        this.store.delete(id);
      }
    }
  }
}

export const captchaService = new CaptchaService();
