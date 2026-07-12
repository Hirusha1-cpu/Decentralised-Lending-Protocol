import { useWeb3 } from './useWeb3';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../utils/constants';

export function useContract() {
    const { signer, provider } = useWeb3();

    const getContract = (contractName, withSigner = true) => {
        const address = CONTRACT_ADDRESSES[contractName];
        const abi = CONTRACT_ABIS[contractName];
        
        if (!address || !abi) {
            console.error(`Contract ${contractName} not found`);
            return null;
        }

        const providerOrSigner = withSigner ? signer : provider;
        if (!providerOrSigner) return null;

        return new ethers.Contract(address, abi, providerOrSigner);
    };

    const read = async (contractName, method, ...args) => {
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