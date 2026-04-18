import { Router } from 'express';
import * as LevelController from '../controllers/levels.js';

const router = Router();

router.get('/current', LevelController.getCurrentLevel);
router.get('/all', LevelController.getAllLevels);
router.post('/check-progress', LevelController.checkProgress);
router.get('/:levelId', LevelController.getLevelDetails);

export default router;
