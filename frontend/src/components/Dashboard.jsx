import React from 'react';
import { usePosition } from '../hooks/usePosition';
import { useWeb3 } from '../hooks/useWeb3';
import { formatEther, toUSD, getRiskColor } from '../utils/helpers';

function Dashboard() {
    const { account } = useWeb3();
    const { position, loading, error, fetchPosition } = usePosition();

    if (!account) {
        return (
            <div style={styles.empty}>
                <p>Please connect your wallet to view your position</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.empty}>
                <p>Loading position data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.empty}>
                <p style={{ color: '#ef4444' }}>Error: {error}</p>
                <button onClick={fetchPosition} style={styles.refreshBtn}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            <div style={styles.header}>
                <h2 style={styles.title}>📊 Dashboard</h2>
                <button onClick={fetchPosition} style={styles.refreshBtn}>
                    Refresh
                </button>
            </div>

            <div style={styles.cardGrid}>
                <div style={{...styles.card, borderTop: '4px solid #2563eb'}}>
                    <div style={styles.cardLabel}>Collateral</div>
                    <div style={styles.cardValue}>
                        {formatEther(position?.collateral)} ETH
                    </div>
                    <div style={styles.cardSub}>
                        {toUSD(position?.collateralUSD / 1e18)}
                    </div>
                </div>

                <div style={{...styles.card, borderTop: '4px solid #dc2626'}}>
                    <div style={styles.cardLabel}>Debt</div>
                    <div style={styles.cardValue}>
                        {formatEther(position?.debt)} USDC
                    </div>
                </div>

                <div style={{...styles.card, borderTop: `4px solid ${getRiskColor(position?.riskStatus)}`}}>
                    <div style={styles.cardLabel}>Health Factor</div>
                    <div style={styles.cardValue}>
                        {position?.healthFactor?.gt(0) ? 
                            (position.healthFactor / 1e18).toFixed(2) : 
                            '∞'
                        }
                    </div>
                    <div style={styles.cardSub}>{position?.riskStatus || 'Unknown'}</div>
                </div>

                <div style={{...styles.card, borderTop: '4px solid #8b5cf6'}}>
                    <div style={styles.cardLabel}>Max Borrow</div>
                    <div style={styles.cardValue}>
                        {formatEther(position?.maxBorrow)} USDC
                    </div>
                </div>
            </div>
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
    title: {
        fontSize: '20px',
        fontWeight: 'bold',
        margin: 0
    },
    refreshBtn: {
        backgroundColor: '#e5e7eb',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px'
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
    cardLabel: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '4px'
    },
    cardValue: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1f2937'
    },
    cardSub: {
        fontSize: '14px',
        color: '#6b7280',
        marginTop: '4px'
    },
    empty: {
        textAlign: 'center',
        padding: '40px 0',
        color: '#6b7280'
    }
};

export default Dashboard;