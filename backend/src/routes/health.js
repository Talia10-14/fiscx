import Router from 'express';

const router = Router();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

/**
 * Database health check
 * GET /api/health/db
 */
router.get('/db', async (req, res) => {
  try {
    const result = await new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('DB check timeout')), 5000);
      resolve({ status: 'ok' });
    });
    
    res.json({
      status: 'ok',
      database: result.status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
