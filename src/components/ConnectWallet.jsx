
import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/ethereum-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { ethers } from "ethers";
import "../styles/ConnectWallet.css";

// Provider options
const providerOptions = {
    injected: {
        display: {
            name: "MetaMask",
            description: "Connect with MetaMask in your browser",
        },
        package: null,
    },
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            rpc: {
                56: "https://bsc-dataseed.binance.org/", // Binance Smart Chain
            },
        },
    },
    coinbasewallet: {
        package: CoinbaseWalletSDK,
        options: {
            appName: "MyDApp",
            rpc: "https://bsc-dataseed.binance.org/",
            chainId: 56,
        },
    },
};

// Initialize Web3Modal
let web3Modal;
if (typeof window !== "undefined") {
    web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions,
        theme: "dark",
    });
}

function ConnectWallet({ onWalletConnected }) {
    const [walletAddress, setWalletAddress] = useState(null);
    const [provider, setProvider] = useState(null);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const initWallet = async () => {
            try {
                if (web3Modal.cachedProvider) {
                    const providerInstance = await web3Modal.connect();
                    const ethersProvider = new ethers.BrowserProvider(providerInstance);
                    const signer = await ethersProvider.getSigner();
                    const address = await signer.getAddress();
                    
                    setWalletAddress(address);
                    setProvider(providerInstance);
                    onWalletConnected(address);
                }
            } catch (err) {
                console.error("Wallet initialization failed:", err);
            }
        };
        initWallet();
    }, [onWalletConnected]);

    const handleConnectClick = () => {
        if (walletAddress) {
            return; 
        }
        setShowModal(!showModal);
    };

    const connectWallet = async (providerType) => {
        try {
            setError(null);
            setShowModal(false); // Close modal when connection starts
            
            const providerInstance = await web3Modal.connectTo(providerType);
            const ethersProvider = new ethers.BrowserProvider(providerInstance);
            const signer = await ethersProvider.getSigner();
            const address = await signer.getAddress();

            setWalletAddress(address);
            setProvider(providerInstance);
            localStorage.setItem("walletAddress", address);
            onWalletConnected(address);
        } catch (error) {
            console.error("Wallet connection failed:", error);
            setError(error.message || "Failed to connect wallet. Please try again.");
            setShowModal(true);
        }
    };

    const disconnectWallet = async () => {
        if (provider?.disconnect) {
            await provider.disconnect();
        }
        await web3Modal.clearCachedProvider();
        setWalletAddress(null);
        setProvider(null);
        localStorage.removeItem("walletAddress");
        setShowModal(false);
    };

    return (
        <div className="wallet-connector">
            {walletAddress ? (
                <button className="btn disconnect-btn" onClick={disconnectWallet}>
                    Disconnect {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                </button>
            ) : (
                <>
                    <button className="btn connect-btn" onClick={handleConnectClick}>
                        Connect Wallet
                    </button>
                    {showModal && (
                        <div className="wallet-modal">
                            <div className="wallet-modal-content">
                                <h3>Connect Wallet</h3>
                                <button 
                                    className="wallet-option" 
                                    onClick={() => connectWallet("injected")}
                                >
                                    <span>MetaMask</span>
                                </button>
                                <button 
                                    className="wallet-option" 
                                    onClick={() => connectWallet("walletconnect")}
                                >
                                    <span>WalletConnect</span>
                                </button>
                                <button 
                                    className="wallet-option" 
                                    onClick={() => connectWallet("coinbasewallet")}
                                >
                                    <span>Coinbase Wallet</span>
                                </button>
                                <button 
                                    className="close-modal" 
                                    onClick={() => setShowModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
            {error && <div className="error-message">{error}</div>}
        </div>
    );
}

export default ConnectWallet;
