import React, { useState } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { useContract } from '../hooks/useContract';
import { TOKEN_ADDRESSES, ERC20_ABI } from '../utils/constants';
import { ethers } from 'ethers';

function Deposit() {
    const { account, signer } = useWeb3();
    const { write } = useContract();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleDeposit = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setStatus('Please enter a valid amount');
            return;
        }

        setLoading(true);
        setStatus('');

        try {
            const amountWei = ethers.utils.parseEther(amount);
            
            // Step 1: Approve WETH spending
            setStatus('Approving WETH...');
            const wethContract = new ethers.Contract(
                TOKEN_ADDRESSES.WETH,
                ERC20_ABI,
                signer
            );
            
            const approveTx = await wethContract.approve(
                CONTRACT_ADDRESSES.CollateralManager,
                amountWei
            );
            await approveTx.wait();
            setStatus('Approved! Depositing...');

            // Step 2: Deposit collateral
            await write('CollateralManager', 'depositCollateral', amountWei);
            setStatus(`✅ Successfully deposited ${amount} ETH as collateral!`);
            setAmount('');
        } catch (error) {
            console.error('Deposit error:', error);
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

    return (
        <div>
            <h2 style={styles.title}>💰 Deposit Collateral</h2>
            <div style={styles.container}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Amount (ETH)</label>
                    <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.0"
                        style={styles.input}
                        disabled={loading}
                    />
                </div>
                <button
                    onClick={handleDeposit}
                    disabled={loading || !amount}
                    style={{
                        ...styles.button,
                        ...(loading || !amount ? styles.buttonDisabled : {})
                    }}
                >
                    {loading ? 'Processing...' : 'Deposit'}
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
        backgroundColor: '#2563eb',
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

export default Deposit;