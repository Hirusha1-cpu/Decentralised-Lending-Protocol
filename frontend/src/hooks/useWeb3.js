import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { SUPPORTED_CHAINS } from '../utils/constants';

export function useWeb3() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const hasWallet = typeof window !== 'undefined' && window.ethereum;

  const connect = useCallback(async () => {
    if (!hasWallet) {
      setError('No wallet found. Install MetaMask or another injected wallet.');
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const browserProvider = new BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      const network = await browserProvider.getNetwork();
      const activeSigner = await browserProvider.getSigner();

      setProvider(browserProvider);
      setSigner(activeSigner);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
    } catch (err) {
      setError(err?.shortMessage || err?.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  }, [hasWallet]);

  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
  }, []);

  // Re-attach listeners for account/network changes
  useEffect(() => {
    if (!hasWallet) return undefined;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      // Simplest safe approach: reload provider state on chain switch
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [hasWallet, disconnect]);

  const chainName = chainId && SUPPORTED_CHAINS[chainId]
    ? SUPPORTED_CHAINS[chainId].name
    : chainId
      ? `Chain ${chainId}`
      : null;

  const isSupportedChain = chainId ? Boolean(SUPPORTED_CHAINS[chainId]) : false;

  return {
    provider,
    signer,
    account,
    chainId,
    chainName,
    isSupportedChain,
    connecting,
    error,
    hasWallet,
    isConnected: Boolean(account),
    connect,
    disconnect,
  };
}