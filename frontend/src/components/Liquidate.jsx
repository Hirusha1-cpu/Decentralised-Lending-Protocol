import React, { useState } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { useContract } from '../hooks/useContract';
import { formatEther } from '../utils/helpers';

function Liquidate() {
    const { account, isConnected } = useWeb3();
    const { write, read } = useContract();
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [positionInfo, setPositionInfo] = useState(null);

    const checkPosition = async () => {
        if (!address) {
            setStatus('Please enter an address');
            return;
        }

        if (!isConnected) {
            setStatus('Please connect your wallet');
            return;
        }

        setLoading(true);
        setStatus('');

        try {
            const [isLiquidatable, penalty, collateralToReceive] = await Promise.all([
                read('LiquidationEngine', 'isLiquidatable', address),
                read('LiquidationEngine', 'getPenalty', address),
                read('LiquidationEngine', 'getCollateralToReceive', address)
            ]);

            setPositionInfo({
                isLiquidatable: isLiquidatable || false,
                penalty: penalty || 0,
                collateralToReceive: collateralToReceive || 0
            });
            setStatus(isLiquidatable ? '⚠️ Liquidatable!' : '✅ Safe');
        } catch (error) {
            setStatus(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLiquidate = async () => {
        if (!address) {
            setStatus('Please enter an address');
            return;
        }

        if (!isConnected) {
            setStatus('Please connect your wallet');
            return;
        }

        setLoading(true);
        setStatus('');

        try {
            await write('LiquidationEngine', 'liquidate', address);
            setStatus('✅ Liquidated!');
            setPositionInfo(null);
            setAddress('');
        } catch (error) {
            setStatus(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isConnected || !account) {
        return <div style={styles.center}>Please connect your wallet</div>;
    }

    return (
        <div>
            <h2 style={styles.title}>💀 Liquidate</h2>
            <div style={styles.container}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>User Address</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="0x..."
                        style={styles.input}
                        disabled={loading}
                    />
                </div>
                <div style={styles.buttonGroup}>
                    <button
                        onClick={checkPosition}
                        disabled={loading || !address}
                        style={{...styles.button, ...styles.buttonSecondary}}
                    >
                        Check
                    </button>
                    <button
                        onClick={handleLiquidate}
                        disabled={loading || !address || !positionInfo?.isLiquidatable}
                        style={{
                            ...styles.button,
                            ...(loading || !address || !positionInfo?.isLiquidatable ? styles.buttonDisabled : {})
                        }}
                    >
                        {loading ? 'Processing...' : 'Liquidate'}
                    </button>
                </div>
                {status && <div style={styles.status}>{status}</div>}
                {positionInfo && (
                    <div style={styles.infoBox}>
                        <div>Liquidatable: {positionInfo.isLiquidatable ? '🔴 Yes' : '🟢 No'}</div>
                        <div>Penalty: {formatEther(positionInfo.penalty)} USDC</div>
                        <div>Collateral: {formatEther(positionInfo.collateralToReceive)} ETH</div>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    center: { textAlign: 'center', padding: '40px 0', color: '#6b7280' },
    title: { fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' },
    container: { maxWidth: '500px' },
    inputGroup: { marginBottom: '16px' },
    label: { display: 'block', marginBottom: '4px', fontWeight: '500' },
    input: {
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        fontSize: '16px'
    },
    buttonGroup: { display: 'flex', gap: '8px' },
    button: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#dc2626',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer'
    },
    buttonSecondary: { backgroundColor: '#6b7280' },
    buttonDisabled: { opacity: 0.5, cursor: 'not-allowed' },
    status: {
        marginTop: '12px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: '#f3f4f6',
        fontSize: '14px',
        wordBreak: 'break-word'
    },
    infoBox: {
        marginTop: '12px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: '#fef3c7',
        fontSize: '14px'
    }
};

export default Liquidate;