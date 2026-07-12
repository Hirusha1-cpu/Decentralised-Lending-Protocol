import { useWeb3 } from './useWeb3';
import { ethers } from 'ethers';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES } from '../utils/constants';

export function useContract() {
    const { signer, provider, isConnected } = useWeb3();

    const getContract = (contractName, withSigner = true) => {
        const address = CONTRACT_ADDRESSES[contractName];
        const abi = CONTRACT_ABIS[contractName];
        
        if (!address || !abi) {
            console.error(`Contract ${contractName} not found`);
            return null;
        }

        if (withSigner && signer) {
            return new ethers.Contract(address, abi, signer);
        } else if (provider) {
            return new ethers.Contract(address, abi, provider);
        }
        
        return null;
    };

    const read = async (contractName, method, ...args) => {
        if (!provider) return null;
        const contract = getContract(contractName, false);
        if (!contract) return null;
        try {
            return await contract[method](...args);
        } catch (error) {
            console.error(`Error reading ${contractName}.${method}:`, error);
            return null;
        }
    };

    const write = async (contractName, method, ...args) => {
        if (!signer) throw new Error('Please connect your wallet');
        const contract = getContract(contractName, true);
        if (!contract) return null;
        try {
            const tx = await contract[method](...args);
            await tx.wait();
            return tx;
        } catch (error) {
            console.error(`Error writing ${contractName}.${method}:`, error);
            throw error;
        }
    };

    return { getContract, read, write };
}