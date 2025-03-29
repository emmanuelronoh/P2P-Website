import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import "../styles/navbar-after.css";
import cheetahLogo from "../assets/cheetah-logo.png";
import axios from "axios";
import { IoMdChatbubbles } from "react-icons/io";
import ConnectWallet from "./ConnectWallet"; 

function NavbarAfterLogin() {
    const [walletAddress, setWalletAddress] = useState(null);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

// Update your ConnectWallet usage:
<ConnectWallet 
  onWalletConnected={(address) => {
    setWalletAddress(address);
    localStorage.setItem("walletAddress", address);
  }}
/>
    useEffect(() => {
        const storedAddress = localStorage.getItem("walletAddress");
        if (storedAddress) {
            setWalletAddress(storedAddress);
        }
        fetchUnreadMessages();
    }, []);

    const fetchUnreadMessages = async () => {
        try {
            const messages = [
                { id: 1, sender: "Alice", read: false },
                { id: 2, sender: "Bob", read: false },
            ];
            const unreadCount = messages.filter(msg => !msg.read).length;
            setUnreadMessages(unreadCount);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    const handleMessagesClick = () => {
        setUnreadMessages(0);
        navigate("/messages");
    };

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");

            await axios.post(
                "http://127.0.0.1:8000/api/auth/logout/",
                { refresh_token: refreshToken },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            localStorage.removeItem("walletAddress"); 

            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error.response?.data?.error || error);
            alert("Logout failed. Please try again.");
        }
    };

    // 🟢 FUNCTION TO SEND CRYPTO
    const sendCrypto = async () => {
        const recipient = prompt("Enter recipient wallet address:");
        const amount = prompt("Enter amount to send (ETH):");

        if (!recipient || !amount) {
            alert("Transaction canceled. Invalid input.");
            return;
        }

        try {
            const web3Modal = new Web3Modal();
            const provider = await web3Modal.connect();
            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const signer = ethersProvider.getSigner();

            const tx = await signer.sendTransaction({
                to: recipient,
                value: ethers.utils.parseEther(amount),
            });

            console.log("Transaction Sent:", tx.hash);
            alert(`Transaction Sent! Hash: ${tx.hash}`);
            await tx.wait();
            alert("Transaction Confirmed!");
        } catch (error) {
            console.error("Transaction failed:", error);
            alert("Transaction failed. Check console for details.");
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-left">
                    <Link to="/dashboard">
                        <img src={cheetahLogo} alt="Cheetah Logo" className="logo-img" />
                    </Link>
                </div>

                <div className="navbar-center">
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/market">Market</Link>
                    <Link to="/become-vendor">Become a Vendor</Link>
                    <Link to="/wallet">Wallet</Link>
                </div>

                <div className="navbar-right">
                    <button className="icon-btn">🔔</button>

                    <div className="message-icon-container" onClick={handleMessagesClick}>
                        <IoMdChatbubbles className="messages-icon" />
                        {unreadMessages > 0 && <span className="badge">{unreadMessages}</span>}
                    </div>

                    <button className="profile-btn" onClick={() => navigate(`/profile-details/${userId}`)}>
                        👤
                    </button>

                    {/* Connect Wallet Button */}
                    <ConnectWallet onWalletConnected={setWalletAddress} />


                    {/* Send Crypto Button */}
                    {walletAddress && (
                        <button className="btn send-btn" onClick={sendCrypto}>
                            💸 Send Crypto
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default NavbarAfterLogin;
