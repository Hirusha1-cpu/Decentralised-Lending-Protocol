import React, { useState } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { useContract } from '../hooks/useContract';
import { usePosition } from '../hooks/usePosition';
import { ethers } from 'ethers';
import { formatEther } from '../utils/helpers';

function Borrow() {
    const { account } = useWeb3();
    const { write } = useContract();
    const { position, fetchPosition } = usePosition();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleBorrow = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setStatus('Please enter a valid amount');
            return;
        }

        setLoading(true);
        setStatus('');

        try {
            const amountWei = ethers.utils.parseEther(amount);
            
            setStatus('Borrowing USDC...');
            await write('BorrowEngine', 'borrow', amountWei);
            
            setStatus(`✅ Successfully borrowed ${amount} USDC!`);
            setAmount('');
            await fetchPosition();
        } catch (error) {
            console.error('Borrow error:', error);
            setStatus(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!account) {
        return (
            <div style={styles.center}>
                <p>Please connect your wallet</p>
            </div>
        );
    }

    const maxBorrow = position?.maxBorrow || ethers.BigNumber.from(0);

    return (
        <div>
            <h2 style={styles.title}>📊 Borrow USDC</h2>
            <div style={styles.container}>
                <div style={styles.infoBox}>
                    <span>Max Borrow: {formatEther(maxBorrow)} USDC</span>
                </div>
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
                <button
                    onClick={handleBorrow}
                    disabled={loading || !amount}
                    style={{
                        ...styles.button,
                        ...(loading || !amount ? styles.buttonDisabled : {})
                    }}
                >
                    {loading ? 'Processing...' : 'Borrow'}
                </button>
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
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#dc2626',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer'
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
    },
    status: {
        marginTop: '12px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: '#f3f4f6',
        fontSize: '14px'
    }
};

export default Borrow;