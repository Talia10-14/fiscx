import { PrismaClient } from '@prisma/client';
import { extractToken, verifyToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

/**
 * JWT + chargement utilisateur (merchantId pour les commerçants).
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided',
      });
    }
    const decoded = verifyToken(token, 'access');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { merchant: true },
    });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = {
      id: user.id,
      role: user.role,
      merchantId: user.merchant?.id ?? null,
      phone: user.phone,
    };
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

// Alias expected by VIBE docs
export const authMiddleware = authenticate;

export const requireMerchant = (req, res, next) => {
  if (req.user?.role !== 'MERCHANT' || !req.user.merchantId) {
    return res.status(403).json({
      success: false,
      message: 'Merchant access required',
    });
  }
  next();
};

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: roles,
        current: req.user.role,
      });
    }
    next();
  };
