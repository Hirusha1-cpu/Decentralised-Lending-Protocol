import { useState, useEffect } from 'react';
import { useWeb3 } from './useWeb3';
import { useContract } from './useContract';
import { ethers } from 'ethers';

export function usePosition() {
    const { account } = useWeb3();
    const { read } = useContract();
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPosition = async () => {
        if (!account) {
            setPosition(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const userData = await read('DataStorage', 'getUserData', account);
            const healthFactor = await read('HealthMonitor', 'getHealthFactor', account);
            const riskStatus = await read('HealthMonitor', 'getRiskStatusString', account);
            const isSafe = await read('HealthMonitor', 'isSafe', account);
            const maxBorrow = await read('BorrowEngine', 'getMaxBorrow', account);

            setPosition({
                collateral: userData ? userData.collateral : ethers.BigNumber.from(0),
                debt: userData ? userData.debt : ethers.BigNumber.from(0),
                collateralUSD: userData ? userData.collateralUSD : ethers.BigNumber.from(0),
                healthFactor: healthFactor || ethers.BigNumber.from(0),
                riskStatus: riskStatus || 'Unknown',
                isSafe: isSafe || false,
                maxBorrow: maxBorrow || ethers.BigNumber.from(0),
                lastUpdate: userData ? userData.lastUpdate : 0
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
    }, [account]);

    return { position, loading, error, fetchPosition };
}