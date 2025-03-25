import React from "react";
import "uikit/dist/css/uikit.min.css";

function Navbar() {
    return (
        <nav className="uk-navbar-container" uk-navbar="true">
            <div className="uk-navbar-left">
                <a className="uk-navbar-item uk-logo" href="/">P2P</a>
            </div>
            <div className="uk-navbar-right">
                <a href="/dashboard" className="uk-button uk-button-primary">Dashboard</a>
            </div>
        </nav>
    );
}

export default Navbar;
