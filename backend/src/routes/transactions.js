import express from 'express';
import { query } from '../db/pool.js';
import { AppError } from '../middleware/errorHandler.js';
import { v4 as uuid } from 'uuid';

const router = express.Router();

// ========== CREATE TRANSACTION ==========
router.post('/', async (req, res, next) => {
  try {
    const { type, category, description, amount, transaction_date } = req.body;
    const userId = req.userId;

    if (!['sale', 'expense'].includes(type) || !amount || !transaction_date) {
      throw new AppError('Paramètres invalides (type, amount, date requis)', 400);
    }

    const transactionId = uuid();
    const result = await query(
      `INSERT INTO fiscx.transactions 
       (id, user_id, type, category, description, amount, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [transactionId, userId, type, category || null, description || null, amount, transaction_date]
    );

    res.status(201).json({
      message: 'Transaction créée',
      transaction: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});

// ========== GET TRANSACTIONS ==========
router.get('/', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { type, start_date, end_date, limit = 50, offset = 0 } = req.query;

    let query_str = 'SELECT * FROM fiscx.transactions WHERE user_id = $1';
    const params = [userId];

    if (type) {
      query_str += ` AND type = $${params.length + 1}`;
      params.push(type);
    }

    if (start_date) {
      query_str += ` AND transaction_date >= $${params.length + 1}`;
      params.push(start_date);
    }

    if (end_date) {
      query_str += ` AND transaction_date <= $${params.length + 1}`;
      params.push(end_date);
    }

    query_str += ` ORDER BY transaction_date DESC LIMIT ${limit} OFFSET ${offset}`;

    const result = await query(query_str, params);

    res.json({
      transactions: result.rows,
      count: result.rows.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    next(err);
  }
});

// ========== GET TRANSACTION STATS ==========
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.userId;
    const { period = '30' } = req.query;

    const result = await query(
      `SELECT 
        SUM(CASE WHEN type = 'sale' THEN amount ELSE 0 END) as total_sales,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
        COUNT(*) as transaction_count
       FROM fiscx.transactions 
       WHERE user_id = $1 AND transaction_date >= CURRENT_DATE - INTERVAL '${period} days'`,
      [userId]
    );

    const stats = result.rows[0];
    res.json({
      period_days: parseInt(period),
      total_sales: stats.total_sales || 0,
      total_expenses: stats.total_expenses || 0,
      net_balance: (stats.total_sales || 0) - (stats.total_expenses || 0),
      transaction_count: stats.transaction_count || 0,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
