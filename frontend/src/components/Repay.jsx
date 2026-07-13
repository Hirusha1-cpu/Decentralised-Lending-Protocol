import React, { useState } from 'react';
import { parseToken, formatToken, shortenError } from '../utils/helpers';
import { CONTRACT_ADDRESSES } from '../utils/constants';

export default function Repay({ contracts, position, account, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState('idle'); // idle | approving | repaying
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const { borrowEngine, debtToken } = contracts;
  const parsedAmount = amount ? parseToken(amount) : 0n;
  const hasWalletBalance = position.walletDebtBalance >= parsedAmount;
  const withinDebt = parsedAmount <= position.debt;
  const canSubmit = parsedAmount > 0n && hasWalletBalance && withinDebt && borrowEngine && debtToken;

  async function handleRepay() {
    setError(null);
    setTxHash(null);
    try {
      const currentAllowance = await debtToken.allowance(account, CONTRACT_ADDRESSES.BORROW_ENGINE);
      if (currentAllowance < parsedAmount) {
        setStep('approving');
        const approveTx = await debtToken.approve(CONTRACT_ADDRESSES.BORROW_ENGINE, parsedAmount);
        await approveTx.wait();
      }

      setStep('repaying');
      const repayTx = await borrowEngine.repay(parsedAmount);
      setTxHash(repayTx.hash);
      await repayTx.wait();

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
      <h2 className="panel__title">Repay</h2>
      <p className="panel__subtitle">Repay outstanding USDC debt to improve your health factor.</p>

      <div className="balance-row">
        <span>Current debt</span>
        <span>{formatToken(position.debt)} USDC</span>
      </div>
      <div className="balance-row">
        <span>Wallet balance</span>
        <span>{formatToken(position.walletDebtBalance)} USDC</span>
      </div>

      <label className="field-label" htmlFor="repay-amount">Amount (USDC)</label>
      <div className="amount-input">
        <input
          id="repay-amount"
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
          onClick={() => {
            const max = position.debt < position.walletDebtBalance ? position.debt : position.walletDebtBalance;
            setAmount(formatToken(max, 18));
          }}
        >
          Max
        </button>
      </div>

      {amount && !hasWalletBalance && <p className="form-error">Amount exceeds your wallet balance.</p>}
      {amount && hasWalletBalance && !withinDebt && <p className="form-error">Amount exceeds your current debt.</p>}

      <button
        className="btn btn--primary btn--full"
        disabled={!canSubmit || step !== 'idle'}
        onClick={handleRepay}
      >
        {step === 'approving' && 'Approving…'}
        {step === 'repaying' && 'Repaying…'}
        {step === 'idle' && 'Repay'}
      </button>

      {txHash && <p className="form-success">Submitted: {txHash.slice(0, 10)}…</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}