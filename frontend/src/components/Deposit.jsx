import React, { useState } from 'react';
import { parseToken, formatToken, shortenError } from '../utils/helpers';
import { CONTRACT_ADDRESSES } from '../utils/constants';

export default function Deposit({ contracts, position, account, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState('idle'); // idle | approving | depositing
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);

  // get the collateralManager and collateralToken from the contract
  const { collateralManager, collateralToken } = contracts;
  // get the input amount
  const parsedAmount = amount ? parseToken(amount) : 0n;
  // check whether collaterlmanager wallet balance is more than parsed amount
  const hasWalletBalance = position.walletCollateralBalance >= parsedAmount;
  // can submit only if parsed amount is more than 0, and hasWalletBalance, collateralManager, collateralToken is available.
  const canSubmit = parsedAmount > 0n && hasWalletBalance && collateralManager && collateralToken;

  async function handleDeposit() {
    setError(null);
    setTxHash(null);
    try {
      // Check current allowance; only send an approve tx if needed
      // check the allowance
      const currentAllowance = await collateralToken.allowance(account, CONTRACT_ADDRESSES.COLLATERAL_MANAGER);
      if (currentAllowance < parsedAmount) {
        setStep('approving');
        const approveTx = await collateralToken.approve(CONTRACT_ADDRESSES.COLLATERAL_MANAGER, parsedAmount);
        await approveTx.wait();
      }

      setStep('depositing');
      const depositTx = await collateralManager.depositCollateral(parsedAmount);
      setTxHash(depositTx.hash);
      await depositTx.wait();

      setAmount('');
      onSuccess?.();
    } catch (err) {
      setError(shortenError(err));
    } finally {
      setStep('idle');
    }
  }

  return (
    <div className="panel">
      <h2 className="panel__title">Deposit collateral</h2>
      <p className="panel__subtitle">Deposit WETH to back your borrowing power.</p>

      <div className="balance-row">
        <span>Wallet balance</span>
        <span>{formatToken(position.walletCollateralBalance)} WETH</span>
      </div>

      <label className="field-label" htmlFor="deposit-amount">Amount (WETH)</label>
      <div className="amount-input">
        <input
          id="deposit-amount"
          type="number"
          min="0"
          step="any"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          type="button"
          className="btn-max"
          onClick={() => setAmount(formatToken(position.walletCollateralBalance, 18))}
        >
          Max
        </button>
      </div>

      {amount && !hasWalletBalance && (
        <p className="form-error">Amount exceeds your wallet balance.</p>
      )}

      <button
        className="btn btn--primary btn--full"
        disabled={!canSubmit || step !== 'idle'}
        onClick={handleDeposit}
      >
        {step === 'approving' && 'Approving…'}
        {step === 'depositing' && 'Depositing…'}
        {step === 'idle' && 'Deposit'}
      </button>

      {txHash && <p className="form-success">Submitted: {txHash.slice(0, 10)}…</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}