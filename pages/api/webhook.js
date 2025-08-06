import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('OK');

  const body = req.body;

  // Telegram /start command
  if (body.message?.text?.startsWith('/start')) {
    const telegramId = body.message.from.id;
    const username = body.message.from.username || '';
    const parts = body.message.text.split(' ');
    const referralCode = parts[1] || null;

    // Check if user already exists
    let { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    // If user does not exist -> create new user
    if (!existingUser) {
      const newCode = Math.random().toString(36).substring(2, 8);

      // Insert new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          telegram_id: telegramId,
          username,
          referral_code: newCode,
          referred_by: referralCode
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert Error:', insertError);
        return res.status(200).json({
          method: 'sendMessage',
          chat_id: telegramId,
          text: 'Error creating user. Please try again later.'
        });
      }

      // Referral bonus (give 10 points to referrer)
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

      // Reply with Mini App button
      return res.status(200).json({
        method: 'sendMessage',
        chat_id: telegramId,
        text: 'Welcome to the bot! Referral system is active.\n\nOpen Mini App below:',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Open Mini App',
                web_app: {
                  url: 'https://telegram-referral-app.vercel.app'
                }
              }
            ]
          ]
        }
      });
    }

    // If user already exists
    return res.status(200).json({
      method: 'sendMessage',
      chat_id: telegramId,
      text: 'You are already registered!\n\nOpen Mini App below:',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Open Mini App',
              web_app: {
                url: 'https://telegram-referral-app.vercel.app'
              }
            }
          ]
        ]
      }
    });
  }

  // Default response for non-/start messages
  res.status(200).send('OK');
}
