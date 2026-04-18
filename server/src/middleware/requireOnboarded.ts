import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate.js';
import { supabase } from '../lib/supabase.js';

export const requireOnboarded = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('id', req.user.id)
      .single();

    if (!profile?.onboarding_complete) {
      return res.status(403).json({
        error: 'Onboarding required',
        redirect: '/onboarding'
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
