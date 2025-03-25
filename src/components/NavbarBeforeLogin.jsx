import { useState } from "react";
import { Link } from "react-router-dom";
import { FaMoon, FaSun, FaUser, FaChevronDown, FaBars, FaTimes } from "react-icons/fa"; // Import icons
import "../styles/navbar-before.css";
import logo from "../assets/cheetah-logo.png";

function NavbarBeforeLogin({ toggleTheme, theme }) {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false); // Track menu state

    // Toggle dropdown function
    const handleDropdown = (menu) => {
        setActiveDropdown(menu);
    };

    // Close the menu when a link or button is clicked
    const closeMenu = () => {
        setMenuOpen(false);
    };

    return (
        <nav className="navbar-before">
            {/* Left: Logo */}
            <div className="logo">
                <Link to="/" onClick={closeMenu}>
                    <img src={logo} alt="P2P Trade Logo" className="logo-image" />
                </Link>
            </div>

            {/* Hamburger Menu Button (Mobile) */}
            <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <FaTimes /> : <FaBars />}
            </div>

            {/* Right: Navigation Links (Show/Hide on Mobile) */}
            <div className={`navbar-before-right ${menuOpen ? "show-menu" : ""}`}>
                {/* Market Dropdown */}
                <div
                    className="dropdown-menu"
                    onMouseEnter={() => handleDropdown("market")}
                    onMouseLeave={() => setActiveDropdown(null)}
                >
                    <Link to="/market" className="dropdown-link" onClick={closeMenu}>
                        Market <FaChevronDown className={activeDropdown === "market" ? "rotate" : ""} />
                    </Link>
                    <div className={`dropdown-content ${activeDropdown === "market" ? "show" : ""}`}>
                        <Link to="/stocks" onClick={closeMenu}>Stocks</Link>
                        <Link to="/crypto" onClick={closeMenu}>Crypto</Link>
                        <Link to="/forex" onClick={closeMenu}>Forex</Link>
                    </div>
                </div>

                {/* How It Works Dropdown */}
                <div
                    className="dropdown-menu"
                    onMouseEnter={() => handleDropdown("how-it-works")}
                    onMouseLeave={() => setActiveDropdown(null)}
                >
                    <Link to="/how-it-works" className="dropdown-link" onClick={closeMenu}>
                        How It Works <FaChevronDown className={activeDropdown === "how-it-works" ? "rotate" : ""} />
                    </Link>
                    <div className={`dropdown-content ${activeDropdown === "how-it-works" ? "show" : ""}`}>
                        <Link to="/faq" onClick={closeMenu}>FAQ</Link>
                        <Link to="/tutorials" onClick={closeMenu}>Tutorials</Link>
                    </div>
                </div>

                {/* Support Dropdown */}
                <div
                    className="dropdown-menu"
                    onMouseEnter={() => handleDropdown("support")}
                    onMouseLeave={() => setActiveDropdown(null)}
                >
                    <Link to="/support" className="dropdown-link" onClick={closeMenu}>
                        Support <FaChevronDown className={activeDropdown === "support" ? "rotate" : ""} />
                    </Link>
                    <div className={`dropdown-content ${activeDropdown === "support" ? "show" : ""}`}>
                        <Link to="/contact" onClick={closeMenu}>Contact Us</Link>
                        <Link to="/help-center" onClick={closeMenu}>Help Center</Link>
                    </div>
                </div>

                {/* Authentication Links */}
                <Link to="/login" className="btn btn-primary" onClick={closeMenu}>Sign In</Link>
                <Link to="/register" className="btn btn-secondary" onClick={closeMenu}>Register</Link>

                {/* Theme Toggle */}
                <span className="theme-toggle" onClick={toggleTheme}>
                    {theme === "light" ? <FaMoon /> : <FaSun />}
                </span>

            </div>
        </nav>
    );
}

export default NavbarBeforeLogin;