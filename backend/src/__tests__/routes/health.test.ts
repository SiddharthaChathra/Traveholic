import request from 'supertest';
import app from '../../index';

describe('Health Route', () => {
  it('should return 200 and status ok', async () => {
    const res = await request(app).get('/api/health');
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      message: 'Backend is running',
      version: '2.0.0'
    });
  });
});
