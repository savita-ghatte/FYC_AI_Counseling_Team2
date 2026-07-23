import request from 'supertest';
import express from 'express';
import { Request, Response } from 'express';

const app = express();

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

describe('Health Check API', () => {
  it('should return 200 OK and a timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});
