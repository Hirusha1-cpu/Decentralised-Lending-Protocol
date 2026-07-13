import React, { useState } from 'react';
import { isAddress } from 'ethers';
import { formatToken, shortenError } from '../utils/helpers';
import { CONTRACT_ADDRESSES } from '../utils/constants';

export default function Liquidate({ contracts, account, onSuccess }) {
  const [targetAddress, setTargetAddress] = useState('');
  const [lookup, setLookup] = useState(null); // { debt, penalty, collateralToReceive, isLiquidatable }
  const [checking, setChecking] = useState(false);
  const [step, setStep] = useState('idle'); // idle | approving | liquidating
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const { liquidationEngine, dataStorage, debtToken } = contracts;
  const validAddress = isAddress(targetAddress);

  async function handleCheck() {
    setError(null);
    setLookup(null);
    if (!validAddress || !liquidationEngine || !dataStorage) return;
    setChecking(true);
    try {
      const [userData, isLiquidatable, penalty, collateralToReceive] = await Promise.all([
        dataStorage.getUserData(targetAddress),
        liquidationEngine.isLiquidatable(targetAddress),
        liquidationEngine.getPenalty(targetAddress),
        liquidationEngine.getCollateralToReceive(targetAddress),
      ]);
      setLookup({
        debt: userData.debt,
        isLiquidatable,
        penalty,
        collateralToReceive,
      });
    } catch (err) {
      setError(shortenError(err));
    } finally {
      setChecking(false);
    }
  }

  async function handleLiquidate() {
    if (!lookup) return;
    setError(null);
    setTxHash(null);
    try {
      const totalRepay = lookup.debt + lookup.penalty;
      const currentAllowance = await debtToken.allowance(account, CONTRACT_ADDRESSES.LIQUIDATION_ENGINE);
      if (currentAllowance < totalRepay) {
        setStep('approving');
        const approveTx = await debtToken.approve(CONTRACT_ADDRESSES.LIQUIDATION_ENGINE, totalRepay);
        await approveTx.wait();
      }

      setStep('liquidating');
      const tx = await liquidationEngine.liquidate(targetAddress);
      setTxHash(tx.hash);
      await tx.wait();

      setLookup(null);
      setTargetAddress('');
      onSuccess?.();
    } catch (err) {
      setError(shortenError(err));
    } finally {
      setStep('idle');
    }
  }

  return (
    <div className="panel">
      <h2 className="panel__title">Liquidate</h2>
      <p className="panel__subtitle">
        Check any position's health and liquidate it if it has fallen below the safety threshold.
      </p>

      <label className="field-label" htmlFor="target-address">Position address</label>
      <div className="amount-input">
        <input
          id="target-address"
          type="text"
          placeholder="0x…"
          value={targetAddress}
          onChange={(e) => setTargetAddress(e.target.value.trim())}
        />
        <button type="button" className="btn-max" onClick={handleCheck} disabled={!validAddress || checking}>
          {checking ? 'Checking…' : 'Check'}
        </button>
      </div>
      {targetAddress && !validAddress && <p className="form-error">Enter a valid address.</p>}

      {lookup && (
        <div className="lookup-result">
          <div className="balance-row">
            <span>Outstanding debt</span>
            <span>{formatToken(lookup.debt)} USDC</span>
          </div>
          <div className="balance-row">
            <span>Liquidation penalty</span>
            <span>{formatToken(lookup.penalty)} USDC</span>
          </div>
          <div className="balance-row">
            <span>Collateral you'd receive</span>
            <span>{formatToken(lookup.collateralToReceive)} WETH</span>
          </div>
          <div className="balance-row">
            <span>Status</span>
            <span className={lookup.isLiquidatable ? 'status-tag status-tag--danger' : 'status-tag status-tag--safe'}>
              {lookup.isLiquidatable ? 'Liquidatable' : 'Healthy'}
            </span>
          </div>

          <button
            className="btn btn--danger btn--full"
            disabled={!lookup.isLiquidatable || step !== 'idle'}
            onClick={handleLiquidate}
          >
            {step === 'approving' && 'Approving…'}
            {step === 'liquidating' && 'Liquidating…'}
            {step === 'idle' && 'Liquidate position'}
          </button>
        </div>
      )}

      {txHash && <p className="form-success">Submitted: {txHash.slice(0, 10)}…</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}