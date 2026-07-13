import React from 'react';
import HealthFactor from './HealthFactor';
import { formatToken, formatUSD, truncateAddress } from '../utils/helpers';
import { PROTOCOL_PARAMS } from '../utils/constants';

export default function Dashboard({ web3, position, loading, onRefresh }) {
  const { account, isConnected, connect, connecting, hasWallet, error: web3Error, chainName, isSupportedChain } = web3;

  if (!isConnected) {
    return (
      <div className="panel panel--center">
        <h2 className="panel__title">Connect your wallet</h2>
        <p className="panel__subtitle">
          Connect to view your collateral, debt, and health factor on the lending protocol.
        </p>
        <button className="btn btn--primary" onClick={connect} disabled={connecting || !hasWallet}>
          {connecting ? 'Connecting…' : hasWallet ? 'Connect wallet' : 'No wallet detected'}
        </button>
        {web3Error && <p className="form-error">{web3Error}</p>}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <p className="dashboard__account">{truncateAddress(account)}</p>
          <p className={`dashboard__chain ${isSupportedChain ? '' : 'dashboard__chain--warn'}`}>
            {chainName || 'Unknown network'}
          </p>
        </div>
        <button className="btn btn--ghost" onClick={onRefresh} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-card__label">ETH Price</span>
          <span className="stat-card__value">{formatUSD(position.price)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Collateral</span>
          <span className="stat-card__value">{formatToken(position.collateral)} WETH</span>
          <span className="stat-card__sub">{formatUSD(position.collateralUSD)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Debt</span>
          <span className="stat-card__value">{formatToken(position.debt)} USDC</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Max Borrow</span>
          <span className="stat-card__value">{formatToken(position.maxBorrow)} USDC</span>
        </div>
      </div>

      <HealthFactor healthFactorRaw={position.healthFactorRaw} hasDebt={position.hasDebt} />

      {position.isLiquidatable && (
        <div className="alert alert--danger">
          This position is liquidatable. Repay debt or add collateral to avoid liquidation.
        </div>
      )}

      <div className="params-row">
        <span>Collateral ratio: {PROTOCOL_PARAMS.COLLATERAL_RATIO}%</span>
        <span>Liquidation penalty: {PROTOCOL_PARAMS.LIQUIDATION_PENALTY}%</span>
        <span>Interest rate: {PROTOCOL_PARAMS.INTEREST_RATE}% APY</span>
      </div>
    </div>
  );
}