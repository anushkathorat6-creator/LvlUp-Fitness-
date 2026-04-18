import { Router } from 'express';
import * as Controller from '../controllers/tasks';

const router = Router();

// Placeholder routes based on backend.md
router.get('/', (req, res) => res.json({ message: 'tasks module' }));

export default router;
