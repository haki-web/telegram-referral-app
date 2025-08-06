export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { name: 'Home', key: 'home' },
    { name: 'Balance', key: 'balance' },
    { name: 'Referral', key: 'referral' },
    { name: 'Earn', key: 'earn' },
  ];

  return (
    <div className="fixed bottom-0 w-full bg-gray-800 text-white flex justify-around py-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`flex-1 text-center p-2 ${activeTab === tab.key ? 'bg-gray-600' : ''}`}
        >
          {tab.name}
        </button>
      ))}
    </div>
  );
}
