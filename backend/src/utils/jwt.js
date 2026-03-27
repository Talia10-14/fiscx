import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateTokens = (userId, role) => {
  const payload = { userId, role, type: 'access' };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '7d',
    algorithm: 'HS256',
  });

  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '30d',
      algorithm: 'HS256',
    }
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token, type = 'access') => {
  try {
    const secret =
      type === 'refresh'
        ? process.env.JWT_REFRESH_SECRET
        : process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (decoded.type !== type) throw new Error('Type de token invalide');
    return decoded;
  } catch (err) {
    throw new Error(`Token invalide: ${err.message}`);
  }
};

export const extractToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
};
