import { useState, useCallback, useEffect } from 'react';

const EMPTY_POSITION = {
  collateral: 0n,
  debt: 0n,
  collateralUSD: 0n,
  healthFactorRaw: 0n,
  hasDebt: false,
  maxBorrow: 0n,
  isLiquidatable: false,
  price: 0n,
  walletCollateralBalance: 0n,
  walletDebtBalance: 0n,
};

export function usePosition(contracts, account) {
  const [position, setPosition] = useState(EMPTY_POSITION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    dataStorage,
    priceOracle,
    borrowEngine,
    liquidationEngine,
    collateralToken,
    debtToken,
  } = contracts || {};

  const refresh = useCallback(async () => {
    if (!account || !dataStorage || !priceOracle) return;
    setLoading(true);
    setError(null);
    try {
      const [userData, price, maxBorrow, isLiquidatable, walletCollateralBalance, walletDebtBalance] =
        await Promise.all([
          dataStorage.getUserData(account),
          priceOracle.getLatestPrice(),
          borrowEngine ? borrowEngine.getMaxBorrow(account) : Promise.resolve(0n),
          liquidationEngine ? liquidationEngine.isLiquidatable(account) : Promise.resolve(false),
          collateralToken ? collateralToken.balanceOf(account) : Promise.resolve(0n),
          debtToken ? debtToken.balanceOf(account) : Promise.resolve(0n),
        ]);

      setPosition({
        collateral: userData.collateral,
        debt: userData.debt,
        collateralUSD: userData.collateralUSD,
        healthFactorRaw: userData.healthFactor,
        hasDebt: userData.debt > 0n,
        maxBorrow,
        isLiquidatable,
        price,
        walletCollateralBalance,
        walletDebtBalance,
      });
    } catch (err) {
        console.log("error",err);
        
      setError(err?.shortMessage || err?.message || 'Failed to load position');
    } finally {
      setLoading(false);
    }
  }, [account, dataStorage, priceOracle, borrowEngine, liquidationEngine, collateralToken, debtToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { position, loading, error, refresh };
}