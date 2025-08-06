import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('OK');

  const body = req.body;

  if (body.message?.text?.startsWith('/start')) {
    const telegramId = body.message.from.id;
    const username = body.message.from.username || '';
    const parts = body.message.text.split(' ');
    const referralCode = parts[1] || null;

    // Check if user exists
    let { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (!existingUser) {
      // Generate new referral code
      const newCode = Math.random().toString(36).substring(2, 8);

      // Insert user
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          telegram_id: telegramId,
          username,
          referral_code: newCode,
          referred_by: referralCode
        })
        .select()
        .single();

      // Referral bonus
      if (referralCode) {
        const { data: referrer } = await supabase
          .from('users')
          .select('*')
          .eq('referral_code', referralCode)
          .single();

        if (referrer) {
          await supabase
            .from('users')
            .update({ points: referrer.points + 10 })
            .eq('id', referrer.id);
        }
      }

      return res.status(200).json({
        method: 'sendMessage',
        chat_id: telegramId,
        text: 'Welcome to the bot! Referral system is active.'
      });
    } else {
      return res.status(200).json({
        method: 'sendMessage',
        chat_id: telegramId,
        text: 'You are already registered!'
      });
    }
  }

  res.status(200).send('OK');
}
