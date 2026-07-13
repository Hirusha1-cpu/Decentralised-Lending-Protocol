import { formatUnits, parseUnits } from 'ethers';
import { RISK_THRESHOLDS, RISK_STATUS, TOKEN_DECIMALS } from './constants';

/**
 * Format a raw on-chain bigint/string amount into a human-readable string.
 */
export function formatToken(rawAmount, decimalsToShow = 4) {
  if (rawAmount === undefined || rawAmount === null) return '0';
  try {
    const value = Number(formatUnits(rawAmount, TOKEN_DECIMALS));
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimalsToShow,
    });
  } catch {
    return '0';
  }
}

/**
 * Parse a human-typed amount string into the raw on-chain unit (bigint).
 */
export function parseToken(amount) {
  if (!amount || Number.isNaN(Number(amount))) return 0n;
  return parseUnits(amount, TOKEN_DECIMALS);
}

/**
 * DataStorage/HealthMonitor return health factor as a fixed point value scaled by 1e18,
 * capped at 1e18 (i.e. "1.0" is the max reported value on-chain, everything above is safe).
 * We treat the raw value as: <1e18 => at-risk scale, ==1e18 (or debt==0) => fully safe.
 */
export function formatHealthFactor(rawHealthFactor, hasDebt = true) {
  if (!hasDebt) return '∞';
  try {
    const value = Number(formatUnits(rawHealthFactor, TOKEN_DECIMALS));
    return value.toFixed(2);
  } catch {
    return '0.00';
  }
}

export function getRiskInfo(healthFactorNumber) {
  if (healthFactorNumber >= RISK_THRESHOLDS.SAFE) {
    return { label: RISK_STATUS.SAFE, color: '#2DD4A6', bg: 'rgba(45, 212, 166, 0.12)' };
  }
  if (healthFactorNumber >= RISK_THRESHOLDS.WARNING) {
    return { label: RISK_STATUS.WARNING, color: '#F5A623', bg: 'rgba(245, 166, 35, 0.12)' };
  }
  if (healthFactorNumber >= RISK_THRESHOLDS.DANGER) {
    return { label: RISK_STATUS.DANGER, color: '#F5A623', bg: 'rgba(245, 166, 35, 0.12)' };
  }
  return { label: RISK_STATUS.LIQUIDATABLE, color: '#EF4B4B', bg: 'rgba(239, 75, 75, 0.14)' };
}

export function truncateAddress(address, chars = 4) {
  if (!address) return '';
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`;
}

export function formatUSD(rawAmount) {
  if (rawAmount === undefined || rawAmount === null) return '$0.00';
  try {
    const value = Number(formatUnits(rawAmount, TOKEN_DECIMALS));
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } catch {
    return '$0.00';
  }
}

export function shortenError(error) {
  if (!error) return '';
  const msg = error?.reason || error?.shortMessage || error?.message || String(error);
  // Strip long hex data / stack noise that RPC errors tend to include
  const match = msg.match(/reason="([^"]+)"/);
  if (match) return match[1];
  return msg.split('\n')[0].slice(0, 160);
}