import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TTL = '7d';
const REFRESH_TTL = '30d';

function normalizePem(value) {
  if (!value) return null;
  return value.replace(/\\n/g, '\n');
}

function getKeys() {
  const privateKey = normalizePem(process.env.JWT_PRIVATE_KEY);
  const publicKey = normalizePem(process.env.JWT_PUBLIC_KEY);
  if (!privateKey || !publicKey) {
    throw new Error('JWT_PRIVATE_KEY/JWT_PUBLIC_KEY missing for RS256');
  }
  return { privateKey, publicKey };
}

export const signAccessToken = (payload) => {
  const { privateKey } = getKeys();
  return jwt.sign({ ...payload, type: 'access' }, privateKey, {
    expiresIn: ACCESS_TTL,
    algorithm: 'RS256',
  });
};

export const signRefreshToken = (payload) => {
  const { privateKey } = getKeys();
  return jwt.sign({ ...payload, type: 'refresh' }, privateKey, {
    expiresIn: REFRESH_TTL,
    algorithm: 'RS256',
  });
};

// Compatibility alias used by existing routes
export const signToken = (payload, isRefresh = false) => {
  return isRefresh ? signRefreshToken(payload) : signAccessToken(payload);
};

export const generateTokens = (userId, role) => {
  return {
    accessToken: signAccessToken({ userId, role }),
    refreshToken: signRefreshToken({ userId, role }),
  };
};

export const verifyToken = (token, type = null) => {
  try {
    const { publicKey } = getKeys();
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    if (type && decoded.type !== type) throw new Error('Type de token invalide');
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
