import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export function useWeb3() {
    const [account, setAccount] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send('eth_requestAccounts', []);
                const signer = provider.getSigner();
                const account = await signer.getAddress();
                const network = await provider.getNetwork();

                setProvider(provider);
                setSigner(signer);
                setAccount(account);
                setChainId(network.chainId);

                // Try to switch to Sepolia if not on it
                if (network.chainId !== 11155111 && network.chainId !== 31337) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: '0xaa36a7' }] // 11155111 in hex
                        });
                    } catch (error) {
                        console.log('Please switch to Sepolia network manually');
                    }
                }
            } catch (error) {
                console.error('Failed to connect wallet:', error);
            }
        } else {
            alert('Please install MetaMask!');
        }
    };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                setAccount(accounts[0] || null);
            });
            window.ethereum.on('chainChanged', (chainId) => {
                setChainId(parseInt(chainId, 16));
            });
        }
    }, []);

    return { connectWallet, account, chainId, provider, signer };
}