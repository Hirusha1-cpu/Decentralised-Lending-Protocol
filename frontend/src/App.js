import React, { useState } from 'react';
import { useWeb3 } from './hooks/useWeb3';
import { useContracts } from './hooks/useContract';
import { usePosition } from './hooks/usePosition';
import Dashboard from './components/Dashboard';
import Deposit from './components/Deposit';
import Borrow from './components/Borrow';
import Repay from './components/Repay';
import Liquidate from './components/Liquidate';
import './App.css';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'deposit', label: 'Deposit' },
  { id: 'borrow', label: 'Borrow' },
  { id: 'repay', label: 'Repay' },
  { id: 'liquidate', label: 'Liquidate' },
];

function App() {
  const web3 = useWeb3();
  const contracts = useContracts(web3.signer, web3.provider);
  const { position, loading, error: positionError, refresh } = usePosition(contracts, web3.account);
  const [activeTab, setActiveTab] = useState('dashboard');

  const isConnected = web3.isConnected;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__mark">◆</span>
          <span>Lending Protocol</span>
        </div>
        {isConnected ? (
          <button className="btn btn--ghost btn--small" onClick={web3.disconnect}>
            Disconnect
          </button>
        ) : (
          <button className="btn btn--primary btn--small" onClick={web3.connect} disabled={web3.connecting}>
            {web3.connecting ? 'Connecting…' : 'Connect wallet'}
          </button>
        )}
      </header>

      {isConnected && (
        <nav className="tab-bar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-bar__item ${activeTab === tab.id ? 'tab-bar__item--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      <main className="app-main">
        {positionError && <div className="alert alert--danger">{positionError}</div>}

        {!isConnected && <Dashboard web3={web3} position={position} loading={loading} onRefresh={refresh} />}

        {isConnected && activeTab === 'dashboard' && (
          <Dashboard web3={web3} position={position} loading={loading} onRefresh={refresh} />
        )}
        {isConnected && activeTab === 'deposit' && (
          <Deposit contracts={contracts} position={position} account={web3.account} onSuccess={refresh} />
        )}
        {isConnected && activeTab === 'borrow' && (
          <Borrow contracts={contracts} position={position} onSuccess={refresh} />
        )}
        {isConnected && activeTab === 'repay' && (
          <Repay contracts={contracts} position={position} account={web3.account} onSuccess={refresh} />
        )}
        {isConnected && activeTab === 'liquidate' && (
          <Liquidate contracts={contracts} account={web3.account} onSuccess={refresh} />
        )}
      </main>
    </div>
  );
}

export default App;