import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export function useWeb3() {
    const [account, setAccount] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert('Please install MetaMask!');
            return;
        }

        try {
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const account = await signer.getAddress();
            const network = await provider.getNetwork();

            setProvider(provider);
            setSigner(signer);
            setAccount(account);
            setChainId(network.chainId);
            setIsConnected(true);

            if (network.chainId !== 11155111 && network.chainId !== 31337) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xaa36a7' }]
                    });
                } catch (error) {
                    console.log('Please switch to Sepolia network');
                }
            }
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        }
    };

    useEffect(() => {
        if (window.ethereum) {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length === 0) {
                    setAccount(null);
                    setIsConnected(false);
                } else {
                    setAccount(accounts[0]);
                    setIsConnected(true);
                }
            };

            const handleChainChanged = (chainId) => {
                setChainId(parseInt(chainId, 16));
                window.location.reload();
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            };
        }
    }, []);

    return { connectWallet, account, chainId, provider, signer, isConnected };
}