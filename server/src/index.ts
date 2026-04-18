import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import onboardingRoutes from './routes/onboarding.js';
import levelRoutes from './routes/levels.js';
import taskRoutes from './routes/tasks.js';
import scoreRoutes from './routes/score.js';
import workoutRoutes from './routes/workouts.js';
import dietRoutes from './routes/diet.js';
import dashboardRoutes from './routes/dashboard.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 LevelFit AI Backend running on port ${PORT}`);
});
