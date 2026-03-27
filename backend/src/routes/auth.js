import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signToken, verifyToken } from '../utils/jwt.js';

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
    const accessToken = signToken({ userId: user.id, role: user.role });
    const refreshToken = signToken({ userId: user.id }, true);

    res.status(201).json({
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        businessName: user.merchant?.businessName,
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
    const accessToken = signToken({ userId: user.id, role: user.role });
    const refreshToken = signToken({ userId: user.id }, true);

    res.json({
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
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
router.get('/me', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

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

    const decoded = verifyToken(refreshToken, true);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = signToken({ userId: decoded.userId, role: decoded.role });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ error: 'Token refresh failed' });
  }
});

export default router;

// ========== REGISTER ==========
router.post('/register', async (req, res, next) => {
  try {
    const { email, phone, password, full_name, business_name, profile_type } = req.body;

    if (!email || !password || !profile_type) {
      throw new AppError('Email, mot de passe et type de profil requis', 400);
    }

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM fiscx.users WHERE email = $1',
      [email]
    );
    if (existingUser.rows.length > 0) {
      throw new AppError('Cet email est déjà utilisé', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuid();
    const result = await query(
      `INSERT INTO fiscx.users 
       (id, email, phone, password_hash, full_name, business_name, profile_type, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, profile_type`,
      [
        userId,
        email,
        phone || null,
        passwordHash,
        full_name || null,
        business_name || null,
        profile_type,
        profile_type,
      ]
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

// ========== LOGIN ==========
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email et mot de passe requis', 400);
    }

    const result = await query(
      `SELECT id, email, password_hash, role, profile_type, is_active 
       FROM fiscx.users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError('Identifiants invalides', 401);
    }

    const user = result.rows[0];

    if (!user.is_active) {
      throw new AppError('Compte inactif', 403);
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      throw new AppError('Identifiants invalides', 401);
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    res.json({
      message: 'Connexion réussie',
      tokens: { accessToken, refreshToken },
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile_type: user.profile_type,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ========== REFRESH TOKEN ==========
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token requis', 400);
    }

    // Verify refresh token
    const { userId, role } = require('../utils/jwt.js').verifyToken(refreshToken, 'refresh');

    // Generate new tokens
    const tokens = generateTokens(userId, role);

    res.json({
      message: 'Tokens renouvelés',
      tokens,
    });
  } catch (err) {
    next(err);
  }
});

// ========== LOGOUT ==========
router.post('/logout', (req, res) => {
  // Client side should delete tokens
  // Server could maintain blacklist if needed
  res.json({ message: 'Déconnecté' });
});

export default router;
