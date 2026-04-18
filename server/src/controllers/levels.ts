import { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';

export const getCurrentLevel = async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('current_level, points, streak_count')
      .eq('id', userId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllLevels = async (req: Request, res: Response) => {
  try {
    // Return the 21 level structure defined in backend.md
    const levels = Array.from({ length: 21 }, (_, i) => ({
      id: i + 1,
      title: `Level ${i + 1}`,
      tier: i < 5 ? 'Beginner' : i < 10 ? 'Fat Loss' : i < 16 ? 'Strength' : 'Elite',
      durationDays: 5
    }));
    res.json(levels);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const checkProgress = async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Logic: Check if tasks were completed for 5 consecutive days
    const { data: logs, error: logsError } = await supabase
      .from('daily_logs')
      .select('date, completed')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('date', { ascending: false })
      .limit(5);

    if (logsError) throw logsError;

    if (logs.length === 5) {
      // User is eligible for level up
      const { data: profile } = await supabase.from('profiles').select('current_level').eq('id', userId).single();
      const nextLevel = (profile?.current_level || 1) + 1;

      if (nextLevel <= 21) {
        await supabase.from('profiles').update({ current_level: nextLevel }).eq('id', userId);
        return res.json({ message: 'Level Up!', newLevel: nextLevel });
      }
    }

    res.json({ message: 'Keep going! More consistency needed.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLevelDetails = async (req: Request, res: Response) => {
  const { levelId } = req.params;
  // Fetch level content from database or static config
  res.json({ id: levelId, tasks: ['Workout', 'Diet Log', 'Water Target'] });
};
