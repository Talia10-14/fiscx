import express from 'express';

const router = express.Router();

// Placeholder routes for credit scoring
router.get('/my-score', (req, res) => {
  res.json({ message: 'Credit score API — En développement' });
});

router.get('/breakdown', (req, res) => {
  res.json({ message: 'Score breakdown — En développement' });
});

export default router;
