import { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';

export const getScoreSummary = async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('points, streak_count, current_level')
      .eq('id', userId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const handleEvent = async (req: Request, res: Response) => {
  const { userId, eventType } = req.body;
  
  const pointsMap: Record<string, number> = {
    'workout_complete': 50,
    'meal_log': 20,
    'daily_streak': 30
  };

  const pointsToAdd = pointsMap[eventType] || 0;

  try {
    const { data: profile } = await supabase.from('profiles').select('points').eq('id', userId).single();
    const newPoints = (profile?.points || 0) + pointsToAdd;

    await supabase.from('profiles').update({ points: newPoints }).eq('id', userId);
    
    res.json({ message: 'Score updated', pointsAdded: pointsToAdd, totalPoints: newPoints });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('fullName, points, current_level')
      .order('points', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
