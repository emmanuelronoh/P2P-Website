import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [state, setState] = useState({
    address: localStorage.getItem('walletAddress') || null,
    provider: null,
    signer: null,
    chainId: null,
    balance: "0.00",
    connectedWallets: JSON.parse(localStorage.getItem('connectedWallets')) || []
  });

  const fetchBalance = async (address, provider) => {
    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const balance = await ethersProvider.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      return "0.00";
    }
  };

  const connectWallet = async (walletType, address, provider) => {
    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      const network = await ethersProvider.getNetwork();
      const balance = await fetchBalance(address, provider);

      const newWallet = {
        id: `${walletType}-${address}`,
        type: walletType,
        address,
        chainId: network.chainId,
        connectedAt: new Date().toISOString()
      };

      const updatedState = {
        address,
        provider,
        signer,
        chainId: network.chainId,
        balance,
        connectedWallets: [...state.connectedWallets, newWallet]
      };

      setState(updatedState);
      localStorage.setItem('walletAddress', address);
      localStorage.setItem('connectedWallets', JSON.stringify(updatedState.connectedWallets));
      
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      return false;
    }
  };

  const disconnectWallet = () => {
    setState({
      address: null,
      provider: null,
      signer: null,
      chainId: null,
      balance: "0.00",
      connectedWallets: []
    });
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('connectedWallets');
  };

  useEffect(() => {
    const initializeWallet = async () => {
      if (state.address && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0 && accounts[0] === state.address) {
            const balance = await fetchBalance(state.address, window.ethereum);
            setState(prev => ({
              ...prev,
              balance,
              provider: window.ethereum
            }));
          }
        } catch (error) {
          console.error('Wallet initialization error:', error);
        }
      }
    };

    initializeWallet();
  }, []);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connectWallet,
        disconnectWallet,
        fetchBalance: (address) => fetchBalance(address, state.provider)
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);