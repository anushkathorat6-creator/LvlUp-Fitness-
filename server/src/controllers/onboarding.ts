import { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';

export const submitStep = async (req: Request, res: Response) => {
  const { stepNumber } = req.params;
  const data = req.body;
  const userId = req.headers['x-user-id']; // Simplified for demonstration

  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    // In a real app, we'd validate the data with Zod here
    const { error } = await supabase
      .from('onboarding_progress')
      .upsert({ 
        user_id: userId, 
        step: parseInt(stepNumber), 
        data: data,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    res.json({ message: `Step ${stepNumber} saved successfully` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    const { data, error } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .order('step', { ascending: false })
      .limit(1);

    if (error) throw error;

    res.json({ 
      lastCompletedStep: data[0]?.step || 0,
      isComplete: data[0]?.step === 6
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const completeOnboarding = async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'];
  const { experienceLevel } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    // Level Assignment Logic
    let assignedLevel = 1;
    switch (experienceLevel?.toLowerCase()) {
      case 'beginner': assignedLevel = 1; break;
      case 'intermediate': assignedLevel = 6; break;
      case 'advanced': assignedLevel = 11; break;
      case 'pro': assignedLevel = 17; break;
      default: assignedLevel = 1;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        onboarding_complete: true,
        current_level: assignedLevel,
        experience_level: experienceLevel
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    res.json({ 
      message: 'Onboarding completed', 
      assignedLevel 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
