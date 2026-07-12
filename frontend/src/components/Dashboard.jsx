import React from 'react';
import { usePosition } from '../hooks/usePosition';
import { useWeb3 } from '../hooks/useWeb3';
import { formatEther, toUSD, getRiskColor } from '../utils/helpers';
import HealthFactor from './HealthFactor';

function Dashboard() {
    const { account, isConnected, connectWallet } = useWeb3();
    const { position, loading, error, fetchPosition } = usePosition();

    if (!isConnected || !account) {
        return (
            <div style={styles.empty}>
                <p style={styles.emptyIcon}>🔌</p>
                <p style={styles.emptyTitle}>Wallet Not Connected</p>
                <p style={styles.emptyText}>Please connect your wallet</p>
                <button onClick={connectWallet} style={styles.connectBtn}>
                    Connect Wallet
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.empty}>
                <p style={styles.loadingText}>⏳ Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.empty}>
                <p style={styles.errorText}>❌ Error: {error}</p>
                <button onClick={fetchPosition} style={styles.retryBtn}>Retry</button>
            </div>
        );
    }

    const hasPosition = position && (position.collateral?.gt(0) || position.debt?.gt(0));

    return (
        <div>
            <div style={styles.header}>
                <h2 style={styles.title}>📊 Dashboard</h2>
                <button onClick={fetchPosition} style={styles.refreshBtn}>🔄 Refresh</button>
            </div>

            <div style={styles.healthFactorContainer}>
                <HealthFactor />
            </div>

            <div style={styles.divider}></div>

            {!hasPosition ? (
                <div style={styles.emptyPosition}>
                    <p style={styles.emptyIcon}>📭</p>
                    <p style={styles.emptyTitle}>No Active Position</p>
                    <p style={styles.emptyText}>Deposit collateral or borrow USDC</p>
                </div>
            ) : (
                <div style={styles.cardGrid}>
                    <div style={{...styles.card, borderTop: '4px solid #2563eb'}}>
                        <div style={styles.cardLabel}>💰 Collateral</div>
                        <div style={styles.cardValue}>{formatEther(position.collateral)} ETH</div>
                        <div style={styles.cardSub}>≈ {toUSD(position.collateralUSD / 1e18)}</div>
                    </div>
                    <div style={{...styles.card, borderTop: '4px solid #dc2626'}}>
                        <div style={styles.cardLabel}>📊 Debt</div>
                        <div style={styles.cardValue}>{formatEther(position.debt)} USDC</div>
                    </div>
                    <div style={{...styles.card, borderTop: `4px solid ${getRiskColor(position?.riskStatus)}`}}>
                        <div style={styles.cardLabel}>📈 Health Factor</div>
                        <div style={styles.cardValue}>
                            {position.healthFactor?.gt(0) ? (position.healthFactor / 1e18).toFixed(2) : '∞'}
                        </div>
                        <div style={{color: getRiskColor(position?.riskStatus)}}>{position?.riskStatus}</div>
                    </div>
                    <div style={{...styles.card, borderTop: '4px solid #8b5cf6'}}>
                        <div style={styles.cardLabel}>💳 Max Borrow</div>
                        <div style={styles.cardValue}>{formatEther(position.maxBorrow)} USDC</div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
    },
    title: { fontSize: '20px', fontWeight: 'bold', margin: 0 },
    refreshBtn: {
        backgroundColor: '#e5e7eb',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer'
    },
    healthFactorContainer: {
        marginBottom: '20px'
    },
    divider: {
        height: '1px',
        backgroundColor: '#e5e7eb',
        margin: '20px 0'
    },
    cardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
    },
    card: {
        backgroundColor: '#f9fafb',
        padding: '16px',
        borderRadius: '8px',
        borderTop: '4px solid #d1d5db'
    },
    cardLabel: { fontSize: '13px', color: '#6b7280', marginBottom: '4px' },
    cardValue: { fontSize: '22px', fontWeight: 'bold', color: '#1f2937' },
    cardSub: { fontSize: '13px', color: '#6b7280', marginTop: '4px' },
    empty: { textAlign: 'center', padding: '50px 20px', color: '#6b7280' },
    emptyIcon: { fontSize: '48px', marginBottom: '16px' },
    emptyTitle: { fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' },
    emptyText: { fontSize: '14px', color: '#6b7280', marginBottom: '20px' },
    connectBtn: {
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '10px 24px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    emptyPosition: { textAlign: 'center', padding: '40px 20px' },
    loadingText: { fontSize: '18px', color: '#1f2937' },
    errorText: { fontSize: '16px', color: '#dc2626' },
    retryBtn: {
        backgroundColor: '#dc2626',
        color: 'white',
        padding: '8px 20px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        marginTop: '12px'
    }
};

export default Dashboard;