import { Router } from 'express';
import * as Controller from '../controllers/diet';

const router = Router();

// Placeholder routes based on backend.md
router.get('/', (req, res) => res.json({ message: 'diet module' }));

export default router;
