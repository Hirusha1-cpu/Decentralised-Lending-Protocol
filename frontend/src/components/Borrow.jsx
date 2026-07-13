import React, { useState } from 'react';
import { parseToken, formatToken, shortenError } from '../utils/helpers';

export default function Borrow({ contracts, position, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const { borrowEngine } = contracts;
  const parsedAmount = amount ? parseToken(amount) : 0n;
  const withinMax = parsedAmount <= position.maxBorrow;
  const hasCollateral = position.collateral > 0n;
  const canSubmit = parsedAmount > 0n && withinMax && hasCollateral && borrowEngine;

  async function handleBorrow() {
    setError(null);
    setTxHash(null);
    setSubmitting(true);
    try {
      const tx = await borrowEngine.borrow(parsedAmount);
      setTxHash(tx.hash);
      await tx.wait();
      setAmount('');
      onSuccess?.();
    } catch (err) {
      setError(shortenError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="panel">
      <h2 className="panel__title">Borrow</h2>
      <p className="panel__subtitle">Borrow USDC against your deposited WETH collateral.</p>

      {!hasCollateral && (
        <div className="alert alert--warning">Deposit collateral first to unlock borrowing.</div>
      )}

      <div className="balance-row">
        <span>Available to borrow</span>
        <span>{formatToken(position.maxBorrow)} USDC</span>
      </div>
      <div className="balance-row">
        <span>Current debt</span>
        <span>{formatToken(position.debt)} USDC</span>
      </div>

      <label className="field-label" htmlFor="borrow-amount">Amount (USDC)</label>
      <div className="amount-input">
        <input
          id="borrow-amount"
          type="number"
          min="0"
          step="any"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={!hasCollateral}
        />
        <button
          type="button"
          className="btn-max"
          onClick={() => setAmount(formatToken(position.maxBorrow, 18))}
          disabled={!hasCollateral}
        >
          Max
        </button>
      </div>

      {amount && !withinMax && (
        <p className="form-error">Amount exceeds your max borrow limit.</p>
      )}

      <button
        className="btn btn--primary btn--full"
        disabled={!canSubmit || submitting}
        onClick={handleBorrow}
      >
        {submitting ? 'Borrowing…' : 'Borrow'}
      </button>

      {txHash && <p className="form-success">Submitted: {txHash.slice(0, 10)}…</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}