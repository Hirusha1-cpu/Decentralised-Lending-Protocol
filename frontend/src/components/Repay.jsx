import React, { useState } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { useContract } from '../hooks/useContract';
import { usePosition } from '../hooks/usePosition';
import { ethers } from 'ethers';
import { formatEther } from '../utils/helpers';

function Repay() {
    const { account, isConnected } = useWeb3();
    const { write } = useContract();
    const { position, fetchPosition } = usePosition();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleRepay = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setStatus('Please enter a valid amount');
            return;
        }

        if (!isConnected) {
            setStatus('Please connect your wallet');
            return;
        }

        setLoading(true);
        setStatus('');

        try {
            const amountWei = ethers.utils.parseEther(amount);
            await write('BorrowEngine', 'repay', amountWei);
            setStatus(`✅ Repaid ${amount} USDC!`);
            setAmount('');
            await fetchPosition();
        } catch (error) {
            setStatus(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRepayAll = async () => {
        if (!position?.debt || position.debt.eq(0)) {
            setStatus('No debt to repay');
            return;
        }

        if (!isConnected) {
            setStatus('Please connect your wallet');
            return;
        }

        setLoading(true);
        setStatus('');

        try {
            await write('BorrowEngine', 'repay', position.debt);
            setStatus('✅ Repaid all USDC!');
            setAmount('');
            await fetchPosition();
        } catch (error) {
            setStatus(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isConnected || !account) {
        return <div style={styles.center}>Please connect your wallet</div>;
    }

    const debt = position?.debt || ethers.BigNumber.from(0);

    return (
        <div>
            <h2 style={styles.title}>💰 Repay USDC</h2>
            <div style={styles.container}>
                <div style={styles.infoBox}>Debt: {formatEther(debt)} USDC</div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Amount (USDC)</label>
                    <input
                        type="number"
                        step="1"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.0"
                        style={styles.input}
                        disabled={loading}
                    />
                </div>
                <div style={styles.buttonGroup}>
                    <button
                        onClick={handleRepay}
                        disabled={loading || !amount}
                        style={{
                            ...styles.button,
                            ...(loading || !amount ? styles.buttonDisabled : {})
                        }}
                    >
                        {loading ? 'Processing...' : 'Repay'}
                    </button>
                    <button
                        onClick={handleRepayAll}
                        disabled={loading || debt.eq(0)}
                        style={{
                            ...styles.button,
                            ...styles.buttonSecondary,
                            ...(loading || debt.eq(0) ? styles.buttonDisabled : {})
                        }}
                    >
                        All
                    </button>
                </div>
                {status && <div style={styles.status}>{status}</div>}
            </div>
        </div>
    );
}

const styles = {
    center: { textAlign: 'center', padding: '40px 0', color: '#6b7280' },
    title: { fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' },
    container: { maxWidth: '400px' },
    infoBox: {
        backgroundColor: '#f3f4f6',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '14px'
    },
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
        backgroundColor: '#16a34a',
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
    }
};

export default Repay;