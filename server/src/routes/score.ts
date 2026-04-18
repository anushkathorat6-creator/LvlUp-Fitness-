import { Router } from 'express';
import * as ScoreController from '../controllers/score.js';

const router = Router();

router.get('/summary', ScoreController.getScoreSummary);
router.post('/event', ScoreController.handleEvent);
router.get('/leaderboard', ScoreController.getLeaderboard);

export default router;
