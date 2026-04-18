import { Router } from 'express';
import * as OnboardingController from '../controllers/onboarding.js';

const router = Router();

router.post('/step/:stepNumber', OnboardingController.submitStep);
router.get('/status', OnboardingController.getStatus);
router.post('/complete', OnboardingController.completeOnboarding);

export default router;
