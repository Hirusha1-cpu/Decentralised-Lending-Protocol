import { useMemo } from 'react';
import { Contract } from 'ethers';
import { CONTRACT_ADDRESSES } from '../utils/constants';
import ABIS, { ERC20_ABI } from '../utils/abi';

/**
 * Builds a contract instance bound to a signer (for writes) when available,
 * falling back to the read-only provider.
 */
function buildContract(address, abi, signerOrProvider) {
  if (!address || !signerOrProvider) return null;
  try {
    return new Contract(address, abi, signerOrProvider);
  } catch {
    return null;
  }
}

export function useContracts(signer, provider) {
  const runner = signer || provider;

  return useMemo(() => ({
    dataStorage: buildContract(CONTRACT_ADDRESSES.DATA_STORAGE, ABIS.DataStorage, runner),
    priceOracle: buildContract(CONTRACT_ADDRESSES.PRICE_ORACLE, ABIS.PriceOracle, runner),
    collateralManager: buildContract(CONTRACT_ADDRESSES.COLLATERAL_MANAGER, ABIS.CollateralManager, runner),
    borrowEngine: buildContract(CONTRACT_ADDRESSES.BORROW_ENGINE, ABIS.BorrowEngine, runner),
    liquidationEngine: buildContract(CONTRACT_ADDRESSES.LIQUIDATION_ENGINE, ABIS.LiquidationEngine, runner),
    healthMonitor: buildContract(CONTRACT_ADDRESSES.HEALTH_MONITOR, ABIS.HealthMonitor, runner),
    collateralToken: buildContract(CONTRACT_ADDRESSES.COLLATERAL_TOKEN, ERC20_ABI, runner),
    debtToken: buildContract(CONTRACT_ADDRESSES.DEBT_TOKEN, ERC20_ABI, runner),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [runner]);
}