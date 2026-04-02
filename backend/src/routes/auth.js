import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ── REGISTER (SMS OTP) ──
router.post('/register', async (req, res) => {
  try {
    const { phone, pin, businessName, businessType } = req.body;

    if (!phone || !pin) {
      return res.status(400).json({ error: 'Phone and PIN required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash PIN
    const hashedPin = bcrypt.hashSync(pin, 10);

    // Create user with merchant profile
    const user = await prisma.user.create({
      data: {
        phone,
        pin: hashedPin,
        role: 'MERCHANT',
        merchant: {
          create: {
            businessName: businessName || 'My Business',
            businessType: businessType || 'general',
            taxRegime: 'TS',
          },
        },
      },
      include: { merchant: true },
    });

    // Generate tokens
    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

    res.status(201).json({
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        businessName: user.merchant?.businessName,
        creditScore: user.merchant?.creditScore,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ── LOGIN ──
router.post('/login', async (req, res) => {
  try {
    const { phone, pin } = req.body;

    if (!phone || !pin) {
      return res.status(400).json({ error: 'Phone and PIN required' });
    }

    const user = await prisma.user.findUnique({
      where: { phone },
      include: { merchant: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify PIN
    const pinMatch = bcrypt.compareSync(pin, user.pin);
    if (!pinMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

    res.json({
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        businessName: user.merchant?.businessName,
        creditScore: user.merchant?.creditScore,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── GET ME ──
router.get('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { merchant: true, banker: true, admin: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      phone: user.phone,
      role: user.role,
      merchant: user.merchant,
      banker: user.banker,
      admin: user.admin,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ── REFRESH TOKEN ──
router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    let decoded;
    try {
      decoded = verifyToken(refreshToken, 'refresh');
    } catch {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = signAccessToken({
      userId: decoded.userId,
      role: decoded.role,
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ error: 'Token refresh failed' });
  }
});

export default router;
