import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Deposit from './components/Deposit';
import Borrow from './components/Borrow';
import Repay from './components/Repay';
import Liquidate from './components/Liquidate';
import { useWeb3 } from './hooks/useWeb3';

function App() {
    const { connectWallet, account, chainId, isConnected } = useWeb3();
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div style={styles.container}>
            <nav style={styles.navbar}>
                <div style={styles.navContent}>
                    <h1 style={styles.logo}>🏦 LEND Protocol</h1>
                    <div style={styles.navRight}>
                        {account ? (
                            <div style={styles.accountInfo}>
                                <span style={styles.accountText}>
                                    {account.slice(0, 6)}...{account.slice(-4)}
                                </span>
                                <span style={styles.chainBadge}>
                                    {chainId === 11155111 ? 'Sepolia' : 
                                     chainId === 31337 ? 'Localhost' : 'Unknown'}
                                </span>
                            </div>
                        ) : (
                            <button onClick={connectWallet} style={styles.connectBtn}>
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <div style={styles.mainContent}>
                <div style={styles.tabContainer}>
                    {['dashboard', 'deposit', 'borrow', 'repay', 'liquidate'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                ...styles.tabButton,
                                ...(activeTab === tab ? styles.tabActive : {})
                            }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div style={styles.contentBox}>
                    {activeTab === 'dashboard' && <Dashboard />}
                    {activeTab === 'deposit' && <Deposit />}
                    {activeTab === 'borrow' && <Borrow />}
                    {activeTab === 'repay' && <Repay />}
                    {activeTab === 'liquidate' && <Liquidate />}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        fontFamily: 'sans-serif'
    },
    navbar: {
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        padding: '16px 24px'
    },
    navContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    logo: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2563eb',
        margin: 0
    },
    navRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    accountInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    accountText: {
        backgroundColor: '#e5e7eb',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1f2937'
    },
    chainBadge: {
        backgroundColor: '#dbeafe',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        color: '#1e40af'
    },
    connectBtn: {
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '8px 20px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    },
    mainContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px'
    },
    tabContainer: {
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap'
    },
    tabButton: {
        padding: '10px 20px',
        backgroundColor: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: '#6b7280',
        transition: 'all 0.2s'
    },
    tabActive: {
        backgroundColor: '#2563eb',
        color: 'white'
    },
    contentBox: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        minHeight: '400px'
    }
};

export default App;