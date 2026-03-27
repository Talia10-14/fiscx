import express from 'express';

const router = express.Router();

// Placeholder routes for stock management
router.get('/', (req, res) => {
  res.json({ message: 'Stock management API — En développement' });
});

router.post('/', (req, res) => {
  res.status(201).json({ message: 'Stock créé — En développement' });
});

export default router;
