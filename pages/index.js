import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    let telegramId = null;

    // --- Telegram SDK Detect ---
    if (tg) {
      tg.ready();
      console.log("Telegram SDK Detected:", tg);

      const initData = tg.initDataUnsafe?.user;
      console.log("Telegram initDataUnsafe.user:", initData);

      if (initData) {
        telegramId = initData.id;
        setUser(initData);
      }
    } else {
      console.warn("Telegram WebApp not detected. Using fallback...");
    }

    // --- Fallback via URL Param ---
    const urlParams = new URLSearchParams(window.location.search);
    if (!telegramId && urlParams.get("telegram_id")) {
      telegramId = urlParams.get("telegram_id");
      console.log("Fallback telegram_id from URL param:", telegramId);
    }

    // --- Fetch User Data ---
    if (telegramId) {
      fetch(`/api/user?telegram_id=${telegramId}`)
        .then(res => res.json())
        .then(data => {
          console.log("API /api/user response:", data);

          if (!data.error) {
            setPoints(data.points || 0);
            setReferralCode(data.referral_code || '');
          } else {
            console.error("API Error:", data.error);
          }
        })
        .catch(err => console.error("Fetch failed:", err));
    } else {
      console.error("No Telegram ID found from SDK or URL param.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      {/* Home Tab */}
      {activeTab === 'home' && (
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold">
            Welcome {user?.first_name || 'Guest'}
          </h1>
          <p className="mt-2">Start earning by referring friends!</p>
        </div>
      )}

      {/* Balance Tab */}
      {activeTab === 'balance' && (
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold">Your Balance</h2>
          <p className="mt-2 text-3xl">{points} Points</p>
        </div>
      )}

      {/* Referral Tab */}
      {activeTab === 'referral' && (
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold">Referral</h2>
          <p className="mt-2">Share this link to invite friends:</p>

          <p className="mt-2 bg-white p-2 rounded border break-all">
            {referralCode
              ? `https://t.me/refer_93bot?start=${referralCode}`
              : 'Generating referral link...'}
          </p>

          <button
            disabled={!referralCode}
            onClick={() => {
              navigator.clipboard.writeText(`https://t.me/refer_93bot?start=${referralCode}`);
              alert('Referral link copied!');
            }}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            Copy Link
          </button>
        </div>
      )}

      {/* Earn Tab */}
      {activeTab === 'earn' && (
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold">Earn Points</h2>
          <p className="mt-2">Complete tasks to earn more points (coming soon)</p>
        </div>
      )}

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
        }
