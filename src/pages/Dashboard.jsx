import { useState } from "react";
import "../styles/dashboard.css"; // Ensure you create this file

function Dashboard() {
    const [theme, setTheme] = useState("light");

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    return (
        <div className={`dashboard ${theme}`}>
            <aside className="sidebar">
                <h2>P2P Dashboard</h2>
                <ul>
                    <li>🏠 Home</li>
                    <li>🔄 Trades</li>
                    <li>💼 Wallet</li>
                    <li>⚙️ Settings</li>
                </ul>
            </aside>

            <main className="content">
                <header className="header">
                    <h1>Welcome, User</h1>
                    <button onClick={toggleTheme}>
                        {theme === "light" ? "Dark Mode 🌙" : "Light Mode ☀️"}
                    </button>
                </header>

                <section className="main-content">
                    <h2>📊 Dashboard Overview</h2>
                    <p>Your recent transactions and trade activities will appear here.</p>
                </section>
            </main>
        </div>
    );
}

export default Dashboard;
