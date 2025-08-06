import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  const { telegram_id } = req.query;

  if (!telegram_id) return res.status(400).json({ error: 'telegram_id required' });

  const { data: user } = await supabase
    .from('users')
    .select('points, referral_code')
    .eq('telegram_id', telegram_id)
    .single();

  if (!user) return res.status(404).json({ error: 'User not found' });

  res.status(200).json(user);
}
