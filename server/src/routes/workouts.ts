import { Router } from 'express';
import * as Controller from '../controllers/workouts';

const router = Router();

// Placeholder routes based on backend.md
router.get('/', (req, res) => res.json({ message: 'workouts module' }));

export default router;
