import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  console.warn('Redis rate-limit store error:', err.message);
});

redisClient.connect().catch((err) => {
  console.warn('Redis rate-limit connect error:', err.message);
});

export const rateLimitGlobal = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: 'rl:global:',
  }),
  message: {
    error: 'RATE_LIMITED',
    message: 'Trop de requetes, reessayez dans 1 minute.',
  },
});

export const rateLimitAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: 'rl:auth:',
  }),
  message: {
    error: 'RATE_LIMITED_AUTH',
    message: 'Trop de tentatives de connexion, reessayez plus tard.',
  },
});
