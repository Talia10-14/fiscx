import express from 'express';

const router = express.Router();

// Placeholder routes for loan requests
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Demande de prêt créée — En développement' });
});

router.get('/', (req, res) => {
  res.json({ message: 'Prêts API — En développement' });
});

export default router;
