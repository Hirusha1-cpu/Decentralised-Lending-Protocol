import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { useContract } from './useContract';
import { ethers } from 'ethers';

export function usePosition() {
    const { account, isConnected } = useWeb3();
    const { read } = useContract();
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPosition = async () => {
        if (!account || !isConnected) {
            setPosition(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [userData, healthFactor, riskStatus, isSafe, maxBorrow] = await Promise.all([
                read('DataStorage', 'getUserData', account),
                read('HealthMonitor', 'getHealthFactor', account),
                read('HealthMonitor', 'getRiskStatusString', account),
                read('HealthMonitor', 'isSafe', account),
                read('BorrowEngine', 'getMaxBorrow', account)
            ]);

            let collateral = ethers.BigNumber.from(0);
            let debt = ethers.BigNumber.from(0);
            let collateralUSD = ethers.BigNumber.from(0);
            let lastUpdate = 0;

            if (userData) {
                collateral = userData.collateral || ethers.BigNumber.from(0);
                debt = userData.debt || ethers.BigNumber.from(0);
                collateralUSD = userData.collateralUSD || ethers.BigNumber.from(0);
                lastUpdate = userData.lastUpdate || 0;
            }

            setPosition({
                collateral,
                debt,
                collateralUSD,
                healthFactor: healthFactor || ethers.BigNumber.from(0),
                riskStatus: riskStatus || 'Unknown',
                isSafe: isSafe || false,
                maxBorrow: maxBorrow || ethers.BigNumber.from(0),
                lastUpdate
            });
        } catch (err) {
            console.error('Error fetching position:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosition();
    }, [account, isConnected]);

    return { position, loading, error, fetchPosition };
}