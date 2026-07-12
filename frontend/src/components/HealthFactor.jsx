import React from 'react';
import { usePosition } from '../hooks/usePosition';
import { useWeb3 } from '../hooks/useWeb3';
import { formatEther, getRiskColor } from '../utils/helpers';

function HealthFactor() {
    const { account, isConnected } = useWeb3();
    const { position, loading, error, fetchPosition } = usePosition();

    if (!isConnected || !account) {
        return (
            <div style={styles.notConnected}>
                <p>🔌 Please connect your wallet</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.loading}>
                <p>⏳ Loading health factor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.error}>
                <p>❌ Error: {error}</p>
                <button onClick={fetchPosition} style={styles.retryBtn}>Retry</button>
            </div>
        );
    }

    const hf = position?.healthFactor;
    const riskStatus = position?.riskStatus || 'Unknown';
    const isSafe = position?.isSafe;
    const debt = position?.debt || 0;
    const collateral = position?.collateral || 0;

    const healthFactorValue = hf?.gt(0) ? hf / 1e18 : Infinity;
    const displayHF = healthFactorValue === Infinity ? '∞' : healthFactorValue.toFixed(2);
    const color = getRiskColor(riskStatus);

    const getStatusEmoji = (status) => {
        switch (status) {
            case 'Safe': return '🟢';
            case 'Warning': return '🟡';
            case 'Danger': return '🔴';
            case 'Liquidatable': return '💀';
            default: return '⚪';
        }
    };

    const getRecommendation = (status) => {
        switch (status) {
            case 'Safe': return '✅ Your position is healthy. Keep monitoring.';
            case 'Warning': return '⚠️ Consider adding more collateral or repaying some debt.';
            case 'Danger': return '🔴 Your position is at risk! Add collateral immediately!';
            case 'Liquidatable': return '💀 LIQUIDATION IMMINENT! Take action NOW!';
            default: return '📊 Monitor your position regularly.';
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3 style={styles.title}>🩺 Health Factor</h3>
                <button onClick={fetchPosition} style={styles.refreshBtn}>🔄</button>
            </div>

            <div style={styles.mainDisplay}>
                <div style={{...styles.hfCircle, borderColor: color}}>
                    <span style={{...styles.hfValue, color: color}}>{displayHF}</span>
                </div>
                <div style={styles.statusRow}>
                    <span style={styles.statusEmoji}>{getStatusEmoji(riskStatus)}</span>
                    <span style={{...styles.statusText, color: color}}>{riskStatus}</span>
                </div>
            </div>

            <div style={styles.details}>
                <div style={styles.detailRow}>
                    <span>💰 Collateral</span>
                    <span>{formatEther(collateral)} ETH</span>
                </div>
                <div style={styles.detailRow}>
                    <span>📊 Debt</span>
                    <span>{formatEther(debt)} USDC</span>
                </div>
                <div style={styles.detailRow}>
                    <span>🛡️ Safe</span>
                    <span>{isSafe ? '✅ Yes' : '⚠️ No'}</span>
                </div>
            </div>

            <div style={{...styles.recommendation, borderLeftColor: color}}>
                <p style={styles.recommendationText}>{getRecommendation(riskStatus)}</p>
            </div>

            <div style={styles.legend}>
                <div style={styles.legendItem}>
                    <span style={{...styles.legendDot, backgroundColor: '#22c55e'}}></span>
                    <span>Safe (≥ 1.5)</span>
                </div>
                <div style={styles.legendItem}>
                    <span style={{...styles.legendDot, backgroundColor: '#eab308'}}></span>
                    <span>Warning (1.2 - 1.5)</span>
                </div>
                <div style={styles.legendItem}>
                    <span style={{...styles.legendDot, backgroundColor: '#ef4444'}}></span>
                    <span>Danger (1.0 - 1.2)</span>
                </div>
                <div style={styles.legendItem}>
                    <span style={{...styles.legendDot, backgroundColor: '#dc2626'}}></span>
                    <span>Liquidatable (&lt; 1.0)</span>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        maxWidth: '400px',
        margin: '0 auto'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
    },
    title: { fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1f2937' },
    refreshBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '8px'
    },
    mainDisplay: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 0'
    },
    hfCircle: {
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        border: '6px solid #d1d5db',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px',
        transition: 'border-color 0.3s ease'
    },
    hfValue: {
        fontSize: '36px',
        fontWeight: 'bold',
        transition: 'color 0.3s ease'
    },
    statusRow: { display: 'flex', alignItems: 'center', gap: '8px' },
    statusEmoji: { fontSize: '24px' },
    statusText: { fontSize: '20px', fontWeight: 'bold' },
    details: {
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        padding: '12px',
        marginTop: '12px'
    },
    detailRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '6px 0',
        fontSize: '14px',
        color: '#4b5563',
        borderBottom: '1px solid #e5e7eb'
    },
    recommendation: {
        marginTop: '12px',
        padding: '12px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        borderLeft: '4px solid #d1d5db'
    },
    recommendationText: { margin: 0, fontSize: '14px', color: '#4b5563' },
    legend: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #e5e7eb'
    },
    legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' },
    legendDot: { width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' },
    notConnected: { textAlign: 'center', padding: '20px', color: '#6b7280' },
    loading: { textAlign: 'center', padding: '20px', color: '#6b7280' },
    error: { textAlign: 'center', padding: '20px', color: '#dc2626' },
    retryBtn: {
        backgroundColor: '#dc2626',
        color: 'white',
        padding: '6px 16px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginTop: '8px'
    }
};

export default HealthFactor;