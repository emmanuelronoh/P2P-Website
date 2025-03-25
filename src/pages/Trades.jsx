import { Link } from "react-router-dom";
import "../styles/trades.css";

function Trades() {
    return (
        <div className="trades-wrapper">
            <div className="trades-navbar">
                <div className="trades-container">
                    <Link to="/p2p/buy" className="trade-btn">Buy Crypto</Link>
                    <Link to="/p2p/sell" className="trade-btn">Sell Crypto</Link>
                    <Link to="/p2p/orders" className="trade-btn">My Orders</Link>
                    <Link to="/p2p/post-trade" className="trade-btn">Post a Trade</Link>
                    <Link to="/p2p/faq" className="trade-btn">FAQs</Link>
                    <Link to="/p2p/support" className="trade-btn">Support</Link>
                </div>
            </div>
        </div>
    );
}

export default Trades;
