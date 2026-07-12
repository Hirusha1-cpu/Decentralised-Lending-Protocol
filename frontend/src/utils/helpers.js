import { ethers } from 'ethers';

export const formatEther = (value) => {
    if (!value) return '0';
    return ethers.utils.formatEther(value);
};

export const formatUnits = (value, decimals = 18) => {
    if (!value) return '0';
    return ethers.utils.formatUnits(value, decimals);
};

export const parseEther = (value) => {
    if (!value) return ethers.BigNumber.from(0);
    return ethers.utils.parseEther(value);
};

export const parseUnits = (value, decimals = 18) => {
    if (!value) return ethers.BigNumber.from(0);
    return ethers.utils.parseUnits(value, decimals);
};

export const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const toUSD = (value) => {
    if (!value) return '$0.00';
    const num = Number(value);
    return `$${num.toFixed(2)}`;
};

export const getRiskColor = (status) => {
    switch (status) {
        case 'Safe': return '#22c55e';
        case 'Warning': return '#eab308';
        case 'Danger': return '#ef4444';
        case 'Liquidatable': return '#dc2626';
        default: return '#6b7280';
    }
};