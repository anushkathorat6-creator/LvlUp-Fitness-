import { Router } from 'express';
import * as Controller from '../controllers/dashboard';

const router = Router();

// Placeholder routes based on backend.md
router.get('/', (req, res) => res.json({ message: 'dashboard module' }));

export default router;
