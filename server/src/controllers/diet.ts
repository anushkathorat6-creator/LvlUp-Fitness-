import { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';

export const getSummary = async (req: Request, res: Response) => {
  res.json({ message: 'diet summary' });
};
