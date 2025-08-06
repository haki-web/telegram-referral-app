import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      const initData = tg.initDataUnsafe.user;
      if (initData) {
        setUser(initData);

        fetch(`/api/user?telegram_id=${initData.id}`)
          .then(res => res.json())
          .then(data => {
            if (!data.error) {
              setPoints(data.points);
              setReferralCode(data.referral_code);
            }
          });
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      {activeTab === 'home' && (
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold">Welcome {user?.first_name || 'Guest'}</h1>
          <p className="mt-2">Start earning by referring friends!</p>
        </div>
      )}

      {activeTab === 'balance' && (
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold">Your Balance</h2>
          <p className="mt-2 text-3xl">{points} Points</p>
        </div>
      )}

      {activeTab === 'referral' && (
  <div className="p-4 text-center">
    <h2 className="text-xl font-bold">Referral</h2>
    <p className="mt-2">Share this link to invite friends:</p>

    {referralCode ? (
      <p className="mt-2 bg-white p-2 rounded border break-all">
        {`https://t.me/refer_93bot?start=${referralCode}`}
      </p>
    ) : (
      <p className="mt-2 text-gray-500">Loading referral code...</p>
    )}

    <button
      onClick={() => {
        navigator.clipboard.writeText(`https://t.me/refer_93bot?start=${referralCode}`);
        alert('Referral link copied!');
      }}
      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
    >
      Copy Link
    </button>
  </div>
)}

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
