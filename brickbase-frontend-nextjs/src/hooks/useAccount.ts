import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface AccountState {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chain: number | null;
  error: string | null;
}

export function useAccount() {
  const [state, setState] = useState<AccountState>({
    account: null,
    isConnected: false,
    isConnecting: false,
    chain: null,
    error: null
  });

  const connectWallet = async () => {
    if (!window.ethereum) {
      setState(prev => ({ 
        ...prev, 
        error: 'No Ethereum wallet was detected. Please install MetaMask.' 
      }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Request accounts from the wallet
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      
      setState({
        account: accounts[0],
        isConnected: true,
        isConnecting: false,
        chain: Number(network.chainId),
        error: null
      });
    } catch (error: any) {
      setState({
        account: null,
        isConnected: false,
        isConnecting: false,
        chain: null,
        error: error.message || 'Failed to connect wallet'
      });
    }
  };

  const disconnectWallet = () => {
    setState({
      account: null,
      isConnected: false,
      isConnecting: false,
      chain: null,
      error: null
    });
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum as any);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            const network = await provider.getNetwork();
            setState({
              account: accounts[0].address,
              isConnected: true,
              isConnecting: false,
              chain: Number(network.chainId),
              error: null
            });
          } else {
            // Ensure we clear any previously set account
            setState(prev => ({
              ...prev,
              account: null,
              isConnected: false
            }));
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
          // Ensure account is null on error
          setState(prev => ({
            ...prev,
            account: null,
            isConnected: false,
            error: 'Error checking wallet connection'
          }));
        }
      }
    };

    checkConnection();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setState({
          account: null,
          isConnected: false,
          isConnecting: false,
          chain: null,
          error: null
        });
      } else {
        setState(prev => ({
          ...prev,
          account: accounts[0],
          isConnected: true
        }));
      }
    };

    // Listen for chain changes
    const handleChainChanged = (chainId: string) => {
      setState(prev => ({
        ...prev,
        chain: parseInt(chainId, 16)
      }));
    };

    if (window.ethereum) {
      // Use "as any" to avoid TypeScript errors
      (window.ethereum as any).on('accountsChanged', handleAccountsChanged);
      (window.ethereum as any).on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        // Use "as any" to avoid TypeScript errors
        (window.ethereum as any).removeListener('accountsChanged', handleAccountsChanged);
        (window.ethereum as any).removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  return {
    ...state,
    connectWallet,
    disconnectWallet
  };
} 