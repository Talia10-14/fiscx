import express from 'express';
import { PrismaClient } from '@prisma/client';
import { extractToken, verifyToken } from '../utils/jwt.js';

const router = express.Router();
const prisma = new PrismaClient();

const requireUser = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const decoded = verifyToken(token, 'access');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

router.get('/profile', requireUser, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        merchant: true,
        banker: true,
        admin: true,
        comptable: true,
      },
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { pin: _pin, ...safe } = user;
    res.json({ success: true, user: safe });
  } catch (err) {
    console.error('GET /users/profile', err);
    res.status(500).json({ success: false, message: 'Failed to load profile' });
  }
});

router.patch('/profile', requireUser, async (req, res) => {
  try {
    const { firstName, lastName, email, businessName } = req.body;
    const data = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (email !== undefined) data.email = email;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      include: { merchant: true },
    });

    if (businessName !== undefined && user.merchant) {
      await prisma.merchant.update({
        where: { userID: req.userId },
        data: { businessName },
      });
    }

    const fresh = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { merchant: true, banker: true, admin: true, comptable: true },
    });
    const { pin: _pin, ...safe } = fresh;
    res.json({ success: true, user: safe });
  } catch (err) {
    console.error('PATCH /users/profile', err);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

export default router;
