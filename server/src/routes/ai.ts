import { Router } from 'express';
import * as Controller from '../controllers/ai';

const router = Router();

// Placeholder routes based on backend.md
router.get('/', (req, res) => res.json({ message: 'ai module' }));

export default router;
